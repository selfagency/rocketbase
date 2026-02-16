# User Management Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a comprehensive admin interface for managing users, roles, permissions, and account status.

**Architecture:** Server-side user queries with client-side table filtering, role-based access control (RBAC), bulk actions support, and audit trail integration.

**Tech Stack:** SvelteKit, sveltekit-superforms, Zod, shadcn-svelte (Table, Dialog, Badge, Select), PocketBase

---

## Overview

### User Stories

**As an admin, I want to:**

- View all users in a searchable, sortable table
- Filter users by role, status, and verification state
- Edit user profiles (name, email, role)
- Change user passwords (force reset)
- Enable/disable user accounts
- Delete user accounts with confirmation
- View user activity and login history
- Send email verification reminders
- See user creation and last login dates

### Current State

**Users Collection:**

- Schema exists with authentication fields
- Fields: `id`, `email`, `username`, `name`, `role`, `verified`, `emailVisibility`, `created`, `updated`
- Roles: `user` (default), `admin`, `editor`, `contributor`
- Authentication handled by PocketBase
- **NO ADMIN UI EXISTS** - must manage via PocketBase admin panel

**Audit Logs:**

- Comprehensive audit logging exists for auth events
- Collections: `audit_logs` with user actions tracked

**Files to Reference:**

- Users migration: `/Users/daniel/Developer/rocketbase/db/pb_migrations/`
- Types: `/Users/daniel/Developer/rocketbase/app/src/lib/types/pocketbase.d.ts`
- Auth routes: `/Users/daniel/Developer/rocketbase/app/src/routes/(auth)/`

### Success Criteria

- ✅ User list with search, sort, filter
- ✅ User profile editing (name, email, role)
- ✅ Password reset functionality
- ✅ Account status management (enable/disable)
- ✅ User deletion with cascade
- ✅ Role-based access control
- ✅ Activity log integration
- ✅ Tests: unit tests, E2E tests
- ✅ Documentation: admin user guide

---

## Research Phase

### Task 1: Review User Schema and Permissions

**Files to Read:**

- User migrations in `/Users/daniel/Developer/rocketbase/db/pb_migrations/`
- Auth routes in `/Users/daniel/Developer/rocketbase/app/src/routes/(auth)/`
- Existing user type definitions

**Step 1: Read user schema**

Search for user collection migration:

```bash
grep -r "users" db/pb_migrations/*.js
```

Note: Fields, validation rules, indexes, roles

**Step 2: Read auth implementation**

Read: `/Users/daniel/Developer/rocketbase/app/src/routes/(auth)/login/+page.server.ts`
Note: How authentication works, session handling

**Step 3: Read user types**

Read: `/Users/daniel/Developer/rocketbase/app/src/lib/types/pocketbase.d.ts`
Note: `UsersRecord`, `UsersResponse` types

**Step 4: Document current state**

Create: `docs/research/user-management-current-state.md`

Expected findings:

- Users have: id, email, username, name, role, verified, created, updated
- Roles: user, admin, editor, contributor
- PocketBase handles authentication
- No admin UI for user management exists

---

### Task 2: Check Existing Admin Patterns

**Step 1: Review posts admin pattern**

Read: `/Users/daniel/Developer/rocketbase/app/src/routes/admin/posts/+page.svelte`
Note: Table structure, search, filters, pagination

**Step 2: Review pages admin pattern**

Read: `/Users/daniel/Developer/rocketbase/app/src/routes/admin/pages/+page.svelte`
Note: List view, actions, status badges

**Step 3: Identify reusable components**

Check for:

- DataTable component
- Search input
- Filter dropdowns
- Status badges
- Action buttons

**Step 4: Document patterns**

Create: `docs/research/user-admin-patterns.md`

---

### Task 3: Design User Management Schema

**Step 1: Define role enum**

Create: `app/src/lib/types/roles.ts`

```typescript
export const USER_ROLES = {
  USER: "user",
  CONTRIBUTOR: "contributor",
  EDITOR: "editor",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ROLE_LABELS: Record<UserRole, string> = {
  user: "User",
  contributor: "Contributor",
  editor: "Editor",
  admin: "Admin",
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  user: ["read:own"],
  contributor: ["read:own", "write:own"],
  editor: ["read:all", "write:all"],
  admin: ["read:all", "write:all", "delete:all", "manage:users"],
};

export function canManageUsers(role: UserRole): boolean {
  return role === "admin";
}

export function canEditContent(role: UserRole): boolean {
  return role === "admin" || role === "editor" || role === "contributor";
}
```

**Step 2: Define user validation schemas**

Create: `app/src/lib/schemas/user.ts`

```typescript
import { z } from "zod";
import { USER_ROLES } from "$lib/types/roles";

export const userUpdateSchema = z.object({
  id: z.string().min(15),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  username: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9_-]+$/),
  role: z.enum([
    USER_ROLES.USER,
    USER_ROLES.CONTRIBUTOR,
    USER_ROLES.EDITOR,
    USER_ROLES.ADMIN,
  ]),
  verified: z.boolean(),
});

export const passwordResetSchema = z
  .object({
    id: z.string().min(15),
    newPassword: z.string().min(8).max(72),
    confirmPassword: z.string().min(8).max(72),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const userDeleteSchema = z.object({
  id: z.string().min(15),
  confirm: z.literal(true, {
    errorMap: () => ({ message: "You must confirm deletion" }),
  }),
});
```

**Step 3: Write schema tests**

Create: `app/src/lib/schemas/user.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { userUpdateSchema, passwordResetSchema } from "./user";

describe("userUpdateSchema", () => {
  it("validates valid user data", () => {
    const result = userUpdateSchema.safeParse({
      id: "123456789012345",
      name: "John Doe",
      email: "john@example.com",
      username: "johndoe",
      role: "user",
      verified: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = userUpdateSchema.safeParse({
      id: "123456789012345",
      name: "John Doe",
      email: "not-an-email",
      username: "johndoe",
      role: "user",
      verified: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid username", () => {
    const result = userUpdateSchema.safeParse({
      id: "123456789012345",
      name: "John Doe",
      email: "john@example.com",
      username: "john doe", // Spaces not allowed
      role: "user",
      verified: true,
    });
    expect(result.success).toBe(false);
  });
});

describe("passwordResetSchema", () => {
  it("validates matching passwords", () => {
    const result = passwordResetSchema.safeParse({
      id: "123456789012345",
      newPassword: "securePassword123",
      confirmPassword: "securePassword123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-matching passwords", () => {
    const result = passwordResetSchema.safeParse({
      id: "123456789012345",
      newPassword: "password1",
      confirmPassword: "password2",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short passwords", () => {
    const result = passwordResetSchema.safeParse({
      id: "123456789012345",
      newPassword: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });
});
```

**Step 4: Run schema tests**

Run: `cd app && pnpm test user.test.ts`
Expected: All tests pass

---

## Development Phase

### Task 4: Create User Management Routes

**Files:**

- Create: `app/src/routes/admin/users/+page.svelte`
- Create: `app/src/routes/admin/users/+page.server.ts`
- Create: `app/src/routes/admin/users/[id]/+page.svelte`
- Create: `app/src/routes/admin/users/[id]/+page.server.ts`

**Step 1: Create users list server load**

Create: `app/src/routes/admin/users/+page.server.ts`

```typescript
import type { PageServerLoad, Actions } from "./$types";
import { pb } from "$lib/server/pocketbase";
import type { UsersResponse } from "$lib/types/pocketbase";
import { error, fail } from "@sveltejs/kit";
import { userDeleteSchema } from "$lib/schemas/user";
import { superValidate } from "sveltekit-superforms/server";
import { zod4 } from "sveltekit-superforms/adapters";

export const load: PageServerLoad = async ({ locals, url }) => {
  // Check admin auth
  if (!locals.user || locals.user.role !== "admin") {
    throw error(403, "Admin access required");
  }

  const page = parseInt(url.searchParams.get("page") || "1");
  const perPage = 20;
  const search = url.searchParams.get("search") || "";
  const role = url.searchParams.get("role") || "";
  const verified = url.searchParams.get("verified") || "";

  try {
    // Build filter
    const filters: string[] = [];
    if (search) {
      filters.push(
        `(name ~ "${search}" || email ~ "${search}" || username ~ "${search}")`
      );
    }
    if (role) {
      filters.push(`role = "${role}"`);
    }
    if (verified === "true") {
      filters.push("verified = true");
    } else if (verified === "false") {
      filters.push("verified = false");
    }

    const filter = filters.length > 0 ? filters.join(" && ") : "";

    const users = await pb
      .collection("users")
      .getList<UsersResponse>(page, perPage, {
        filter,
        sort: "-created",
        fields: "id,email,username,name,role,verified,created,updated",
      });

    return {
      users: users.items,
      totalPages: users.totalPages,
      currentPage: page,
    };
  } catch (err) {
    console.error("Failed to load users:", err);
    throw error(500, "Failed to load users");
  }
};

export const actions: Actions = {
  deleteUser: async ({ request, locals }) => {
    if (!locals.user || locals.user.role !== "admin") {
      return fail(403, { message: "Admin access required" });
    }

    const form = await superValidate(request, zod4(userDeleteSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    // Prevent self-deletion
    if (form.data.id === locals.user.id) {
      return fail(400, { message: "Cannot delete your own account" });
    }

    try {
      await pb.collection("users").delete(form.data.id);
      return { success: true };
    } catch (err) {
      console.error("Failed to delete user:", err);
      return fail(500, { message: "Failed to delete user" });
    }
  },
};
```

**Step 2: Create users list view**

Create: `app/src/routes/admin/users/+page.svelte`

```svelte
<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Badge } from '$lib/components/ui/badge';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select';
  import { ROLE_LABELS } from '$lib/types/roles';
  import type { PageData } from './$types';

  export let data: PageData;

  let searchQuery = $page.url.searchParams.get('search') || '';
  let roleFilter = $page.url.searchParams.get('role') || '';
  let verifiedFilter = $page.url.searchParams.get('verified') || '';

  function updateFilters() {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (roleFilter) params.set('role', roleFilter);
    if (verifiedFilter) params.set('verified', verifiedFilter);
    goto(`?${params.toString()}`);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString();
  }
</script>

<div class="container mx-auto py-8">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-bold">User Management</h1>
  </div>

  <div class="mb-6 flex gap-4">
    <Input
      type="search"
      placeholder="Search users..."
      bind:value={searchQuery}
      on:input={updateFilters}
      class="max-w-xs"
    />

    <Select value={roleFilter} onValueChange={(v) => { roleFilter = v; updateFilters(); }}>
      <SelectTrigger class="w-40">
        <SelectValue placeholder="All roles" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">All roles</SelectItem>
        <SelectItem value="user">User</SelectItem>
        <SelectItem value="contributor">Contributor</SelectItem>
        <SelectItem value="editor">Editor</SelectItem>
        <SelectItem value="admin">Admin</SelectItem>
      </SelectContent>
    </Select>

    <Select value={verifiedFilter} onValueChange={(v) => { verifiedFilter = v; updateFilters(); }}>
      <SelectTrigger class="w-40">
        <SelectValue placeholder="All status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">All status</SelectItem>
        <SelectItem value="true">Verified</SelectItem>
        <SelectItem value="false">Unverified</SelectItem>
      </SelectContent>
    </Select>
  </div>

  <div class="border rounded-lg">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Username</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead class="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {#each data.users as user}
          <TableRow>
            <TableCell class="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.username}</TableCell>
            <TableCell>
              <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>
                {ROLE_LABELS[user.role]}
              </Badge>
            </TableCell>
            <TableCell>
              {#if user.verified}
                <Badge variant="success">Verified</Badge>
              {:else}
                <Badge variant="secondary">Unverified</Badge>
              {/if}
            </TableCell>
            <TableCell>{formatDate(user.created)}</TableCell>
            <TableCell class="text-right">
              <Button href="/admin/users/{user.id}" variant="outline" size="sm">
                Edit
              </Button>
            </TableCell>
          </TableRow>
        {/each}
      </TableBody>
    </Table>
  </div>

  {#if data.totalPages > 1}
    <div class="flex justify-center gap-2 mt-6">
      {#each Array(data.totalPages) as _, i}
        <Button
          variant={data.currentPage === i + 1 ? 'default' : 'outline'}
          size="sm"
          on:click={() => goto(`?page=${i + 1}`)}
        >
          {i + 1}
        </Button>
      {/each}
    </div>
  {/if}
</div>
```

**Step 3: Test users list**

Run: `cd app && pnpm dev`
Navigate: `/admin/users`
Expected: Table of users with filters

**Step 4: Commit users list**

Run:

```bash
git add app/src/routes/admin/users/+page.svelte
git add app/src/routes/admin/users/+page.server.ts
git add app/src/lib/types/roles.ts
git add app/src/lib/schemas/user.ts
git commit -m "feat: add user management list view (bean-<id>)"
```

---

### Task 5: Create User Edit Page

**Files:**

- Create: `app/src/routes/admin/users/[id]/+page.server.ts`
- Create: `app/src/routes/admin/users/[id]/+page.svelte`
- Create: `app/src/lib/components/admin/users/user-edit-form.svelte`

**Step 1: Create user edit server load and actions**

Create: `app/src/routes/admin/users/[id]/+page.server.ts`

```typescript
import type { PageServerLoad, Actions } from "./$types";
import { pb } from "$lib/server/pocketbase";
import { error, fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms/server";
import { zod4 } from "sveltekit-superforms/adapters";
import { userUpdateSchema, passwordResetSchema } from "$lib/schemas/user";

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.user || locals.user.role !== "admin") {
    throw error(403, "Admin access required");
  }

  try {
    const user = await pb.collection("users").getOne(params.id);

    const updateForm = await superValidate(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        verified: user.verified,
      },
      zod4(userUpdateSchema)
    );

    const passwordForm = await superValidate(zod4(passwordResetSchema));

    return {
      user,
      updateForm,
      passwordForm,
    };
  } catch (err) {
    console.error("Failed to load user:", err);
    throw error(404, "User not found");
  }
};

export const actions: Actions = {
  updateUser: async ({ request, locals, params }) => {
    if (!locals.user || locals.user.role !== "admin") {
      return fail(403, { message: "Admin access required" });
    }

    const form = await superValidate(request, zod4(userUpdateSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      await pb.collection("users").update(params.id, {
        name: form.data.name,
        email: form.data.email,
        username: form.data.username,
        role: form.data.role,
        verified: form.data.verified,
      });

      return { form, success: true };
    } catch (err) {
      console.error("Failed to update user:", err);
      return fail(500, { form, message: "Failed to update user" });
    }
  },

  resetPassword: async ({ request, locals, params }) => {
    if (!locals.user || locals.user.role !== "admin") {
      return fail(403, { message: "Admin access required" });
    }

    const form = await superValidate(request, zod4(passwordResetSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      await pb.collection("users").update(params.id, {
        password: form.data.newPassword,
        passwordConfirm: form.data.confirmPassword,
      });

      return { form, success: true };
    } catch (err) {
      console.error("Failed to reset password:", err);
      return fail(500, { form, message: "Failed to reset password" });
    }
  },

  deleteUser: async ({ locals, params }) => {
    if (!locals.user || locals.user.role !== "admin") {
      return fail(403, { message: "Admin access required" });
    }

    // Prevent self-deletion
    if (params.id === locals.user.id) {
      return fail(400, { message: "Cannot delete your own account" });
    }

    try {
      await pb.collection("users").delete(params.id);
      throw redirect(303, "/admin/users");
    } catch (err) {
      if (err instanceof Response) throw err;
      console.error("Failed to delete user:", err);
      return fail(500, { message: "Failed to delete user" });
    }
  },
};
```

**Step 2: Create user edit page**

Create: `app/src/routes/admin/users/[id]/+page.svelte`

```svelte
<script lang="ts">
  import { superForm } from 'sveltekit-superforms/client';
  import { zod4 } from 'sveltekit-superforms/adapters';
  import { userUpdateSchema, passwordResetSchema } from '$lib/schemas/user';
  import { toast } from 'svelte-sonner';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select';
  import { Switch } from '$lib/components/ui/switch';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Separator } from '$lib/components/ui/separator';
  import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '$lib/components/ui/alert-dialog';
  import type { PageData } from './$types';

  export let data: PageData;

  const { form: updateForm, errors: updateErrors, enhance: updateEnhance, delayed: updateDelayed } = superForm(data.updateForm, {
    validators: zod4(userUpdateSchema),
    resetForm: false,
    onUpdated: ({ form }) => {
      if (form.valid) {
        toast.success('User updated successfully');
      }
    },
  });

  const { form: passwordForm, errors: passwordErrors, enhance: passwordEnhance, delayed: passwordDelayed } = superForm(data.passwordForm, {
    validators: zod4(passwordResetSchema),
    resetForm: true,
    onUpdated: ({ form }) => {
      if (form.valid) {
        toast.success('Password reset successfully');
      }
    },
  });

  let deleteConfirm = false;
</script>

<div class="container mx-auto py-8 max-w-3xl">
  <div class="mb-8">
    <Button href="/admin/users" variant="ghost">
      ← Back to Users
    </Button>
  </div>

  <h1 class="text-3xl font-bold mb-8">Edit User</h1>

  <div class="space-y-6">
    <!-- User Profile Card -->
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
        <CardDescription>Update user information and permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <form method="POST" action="?/updateUser" use:updateEnhance class="space-y-4">
          <input type="hidden" name="id" value={$updateForm.id} />

          <div>
            <Label for="name">Name</Label>
            <Input
              id="name"
              name="name"
              bind:value={$updateForm.name}
            />
            {#if $updateErrors.name}
              <p class="text-sm text-destructive">{$updateErrors.name}</p>
            {/if}
          </div>

          <div>
            <Label for="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              bind:value={$updateForm.email}
            />
            {#if $updateErrors.email}
              <p class="text-sm text-destructive">{$updateErrors.email}</p>
            {/if}
          </div>

          <div>
            <Label for="username">Username</Label>
            <Input
              id="username"
              name="username"
              bind:value={$updateForm.username}
            />
            {#if $updateErrors.username}
              <p class="text-sm text-destructive">{$updateErrors.username}</p>
            {/if}
          </div>

          <div>
            <Label for="role">Role</Label>
            <Select name="role" value={$updateForm.role} onValueChange={(v) => ($updateForm.role = v)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="contributor">Contributor</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {#if $updateErrors.role}
              <p class="text-sm text-destructive">{$updateErrors.role}</p>
            {/if}
          </div>

          <div class="flex items-center justify-between">
            <Label for="verified">Email Verified</Label>
            <Switch
              id="verified"
              name="verified"
              bind:checked={$updateForm.verified}
            />
          </div>

          <Button type="submit" disabled={$updateDelayed}>
            {$updateDelayed ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>

    <Separator />

    <!-- Password Reset Card -->
    <Card>
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>Set a new password for this user</CardDescription>
      </CardHeader>
      <CardContent>
        <form method="POST" action="?/resetPassword" use:passwordEnhance class="space-y-4">
          <input type="hidden" name="id" value={data.user.id} />

          <div>
            <Label for="newPassword">New Password</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              bind:value={$passwordForm.newPassword}
            />
            {#if $passwordErrors.newPassword}
              <p class="text-sm text-destructive">{$passwordErrors.newPassword}</p>
            {/if}
          </div>

          <div>
            <Label for="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              bind:value={$passwordForm.confirmPassword}
            />
            {#if $passwordErrors.confirmPassword}
              <p class="text-sm text-destructive">{$passwordErrors.confirmPassword}</p>
            {/if}
          </div>

          <Button type="submit" variant="secondary" disabled={$passwordDelayed}>
            {$passwordDelayed ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </CardContent>
    </Card>

    <Separator />

    <!-- Danger Zone -->
    <Card class="border-destructive">
      <CardHeader>
        <CardTitle class="text-destructive">Danger Zone</CardTitle>
        <CardDescription>Irreversible actions</CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete User</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user account
                and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction asChild>
                <form method="POST" action="?/deleteUser">
                  <Button type="submit" variant="destructive">
                    Delete User
                  </Button>
                </form>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  </div>
</div>
```

**Step 3: Test user edit**

Navigate: `/admin/users/{id}`
Actions:

- Change user name
- Change role
- Reset password
- Verify toast notifications

**Step 4: Commit user edit**

Run:

```bash
git add app/src/routes/admin/users/[id]/
git commit -m "feat: add user edit page (bean-<id>)"
```

---

## Testing Phase

### Task 6: Write E2E Tests

**Files:**

- Create: `app/tests/e2e/admin-users.spec.ts`

**Step 1: Write user management E2E tests**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Admin User Management", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/login");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');
  });

  test("can view users list", async ({ page }) => {
    await page.goto("/admin/users");

    // Should see table
    await expect(page.locator("table")).toBeVisible();
    await expect(page.locator('th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Email")')).toBeVisible();
  });

  test("can search users", async ({ page }) => {
    await page.goto("/admin/users");

    // Search for user
    await page.fill('input[placeholder="Search users..."]', "john");
    await page.waitForTimeout(500);

    // Should filter results
    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(1);
  });

  test("can filter by role", async ({ page }) => {
    await page.goto("/admin/users");

    // Select admin role filter
    await page.click('[data-testid="role-filter"]');
    await page.click("text=Admin");

    // Should show only admins
    const badges = page.locator("text=Admin");
    await expect(badges.first()).toBeVisible();
  });

  test("can edit user profile", async ({ page }) => {
    await page.goto("/admin/users");

    // Click first edit button
    await page.click('button:has-text("Edit")').first();

    // Should navigate to edit page
    await expect(page).toHaveURL(/\/admin\/users\/[a-z0-9]+/);

    // Update name
    await page.fill('input[name="name"]', "Updated Name");
    await page.click('button:has-text("Save Changes")');

    // Should see success toast
    await expect(page.locator("text=User updated successfully")).toBeVisible();
  });

  test("can reset user password", async ({ page }) => {
    await page.goto("/admin/users");
    await page.click('button:has-text("Edit")').first();

    // Fill password form
    await page.fill('input[name="newPassword"]', "newPassword123");
    await page.fill('input[name="confirmPassword"]', "newPassword123");
    await page.click('button:has-text("Reset Password")');

    // Should see success toast
    await expect(
      page.locator("text=Password reset successfully")
    ).toBeVisible();
  });

  test("can delete user", async ({ page }) => {
    await page.goto("/admin/users");
    await page.click('button:has-text("Edit")').first();

    // Click delete button
    await page.click('button:has-text("Delete User")');

    // Confirm deletion
    await page.click('button:has-text("Delete User"):visible');

    // Should redirect to users list
    await expect(page).toHaveURL("/admin/users");
  });

  test("cannot delete own account", async ({ page }) => {
    // TODO: Implement test for self-deletion prevention
  });
});
```

**Step 2: Run E2E tests**

Run: `cd app && pnpm test:e2e admin-users.spec.ts`
Expected: All tests pass

**Step 3: Commit E2E tests**

Run:

```bash
git add app/tests/e2e/admin-users.spec.ts
git commit -m "test: add user management E2E tests (bean-<id>)"
```

---

## Documentation Phase

### Task 7: Write User Documentation

**Files:**

- Create: `docs/user-guide/user-management.md`

**Step 1: Write user management guide**

```markdown
# User Management Guide

## Overview

The User Management dashboard allows admins to manage all user accounts, roles, and permissions.

## Accessing User Management

1. Log in as an admin
2. Navigate to **Admin > Users**

## Viewing Users

The users table shows:

- **Name**: User's full name
- **Email**: User's email address
- **Username**: Unique username
- **Role**: User's permission level
- **Status**: Email verification status
- **Created**: Account creation date

## Searching and Filtering

### Search

Type in the search box to filter by name, email, or username.

### Filter by Role

- User: Basic access
- Contributor: Can create content
- Editor: Can edit all content
- Admin: Full system access

### Filter by Status

- Verified: Email address confirmed
- Unverified: Email not confirmed

## Editing Users

1. Click **Edit** next to any user
2. Update fields:
   - Name
   - Email
   - Username
   - Role
   - Verification status
3. Click **Save Changes**

### Changing Roles

Roles determine what users can do:

| Role        | Permissions                      |
| ----------- | -------------------------------- |
| User        | Read own content                 |
| Contributor | Create and edit own content      |
| Editor      | Edit all content                 |
| Admin       | Full system access, manage users |

### Resetting Passwords

1. Navigate to user edit page
2. Scroll to **Reset Password** section
3. Enter new password
4. Confirm password
5. Click **Reset Password**

## Deleting Users

**Warning**: This action cannot be undone.

1. Navigate to user edit page
2. Scroll to **Danger Zone**
3. Click **Delete User**
4. Confirm deletion

**Note**: You cannot delete your own account.

## Best Practices

- Regularly audit user accounts
- Remove inactive users
- Use appropriate roles for access control
- Require email verification for new users
- Use strong passwords for admin accounts
```

**Step 2: Commit documentation**

Run:

```bash
git add docs/user-guide/user-management.md
git commit -m "docs: add user management guide (bean-<id>)"
```

---

## Completion Checklist

- [ ] User schema and roles defined
- [ ] Validation schemas created and tested
- [ ] Users list view implemented
- [ ] User edit page implemented
- [ ] Password reset functionality
- [ ] User deletion with safety checks
- [ ] E2E tests written and passing
- [ ] User documentation written
- [ ] All commits include bean ID
- [ ] Quality gates passed (lint, test, build)

---

## Follow-Up Tasks

**Future Enhancements:**

- Bulk user actions (delete, change role)
- User activity dashboard
- Login history and session management
- Two-factor authentication management
- User export (CSV/JSON)
- Email templates for user notifications

**Dependencies for Other Features:**

- Comments will use user roles for moderation
- Editorial kanban will assign users to tasks
- Subscriptions will manage user tiers
