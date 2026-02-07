# Authentication Implementation

This document describes the authentication system implemented in this template.

## Overview

Complete PocketBase authentication integration with SvelteKit using shadcn-svelte form components and sveltekit-superforms for validation.

## Features Implemented

### 1. Server-Side Auth Handling (`src/hooks.server.ts`)

- Initializes PocketBase client on every request
- Loads auth state from cookies
- Automatically refreshes auth tokens
- Clears invalid auth sessions
- Exports updated auth state back to cookies
- Makes `locals.pb` and `locals.user` available throughout the app

### 2. PocketBase Client Utility (`src/lib/pocketbase.ts`)

- Factory function to create PocketBase instances
- Uses `PUBLIC_POCKETBASE_URL` environment variable
- Defaults to `http://127.0.0.1:8090`

### 3. Type Definitions (`src/app.d.ts`)

- Extended `App.Locals` with:
  - `pb: PocketBase` - PocketBase client instance
  - `user: RecordModel | null` - Current authenticated user

## Routes

### Login (`/login`)

- **Form fields**: email, password
- **Validation**: Email format, minimum 8 character password
- **Success**: Redirects to home page
- **Error**: Shows "Invalid email or password" message
- **Redirects**: Already authenticated users to home page

### Register (`/register`)

- **Form fields**: name, email, password, passwordConfirm
- **Validation**:
  - Email format
  - Name minimum 2 characters
  - Password minimum 8 characters
  - Password confirmation must match
- **Success**: Creates account and auto-logs in, then redirects to home
- **Error**: Shows registration error message
- **Redirects**: Already authenticated users to home page

### Forgot Password (`/forgot-password`)

- **Form fields**: email
- **Validation**: Email format
- **Success**: Shows success message (always, for security)
- **Behavior**: Sends password reset email via PocketBase
- **Security**: Doesn't reveal whether email exists in database

### Logout (`/logout`)

- **Method**: POST only (form action)
- **Behavior**: Clears auth store and redirects to login
- **Redirects**: GET requests to home page

## Home Page (`/`)

Updated to display:
- Welcome message with user name/email when logged in
- Logout button for authenticated users
- Login and Register buttons for guests

## Usage Examples

### Accessing User Data in Pages

```typescript
// +page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Check if user is authenticated
	if (!locals.user) {
		redirect(303, '/login');
	}

	// Access user data
	const userName = locals.user.name;
	const userEmail = locals.user.email;

	return { user: locals.user };
};
```

### Using PocketBase in Server Code

```typescript
// +page.server.ts
export const actions: Actions = {
	default: async ({ locals }) => {
		// PocketBase client is available
		const records = await locals.pb.collection('posts').getFullList();
		return { records };
	}
};
```

### Protecting Routes

```typescript
// +page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(303, '/login');
	}
	// Protected route content
};
```

## Environment Variables

Add to `.env`:

```env
PUBLIC_POCKETBASE_URL="http://127.0.0.1:8090"
API_ENDPOINT="http://localhost:8090"
```

## PocketBase Setup

Ensure PocketBase is configured with a `users` collection that includes:
- `email` field (required, unique)
- `password` field (required)
- `name` field (optional)

The default PocketBase setup includes this collection.

## Form Components Used

All forms use shadcn-svelte components:
- `Form` - Form wrapper with validation
- `FormField` - Individual field wrapper
- `FormControl` - Field control wrapper
- `FormLabel` - Accessible label
- `FormFieldErrors` - Error display
- `Input` - Text input
- `Button` - Submit button
- `Card` - Container layout
- `Alert` - Success message display

## Known Issues

- Svelte 5 slot type inference causes some type warnings in form components
- These warnings don't affect runtime functionality
- Types will be resolved in future shadcn-svelte updates

## Testing

To test the authentication system:

1. Start PocketBase: `pnpm pb`
2. Start dev server: `pnpm dev`
3. Navigate to http://localhost:5173
4. Click "Create Account" to register
5. Fill out the registration form
6. Verify you're redirected and logged in
7. Test logout functionality
8. Test login with created credentials
9. Test forgot password flow

## Security Considerations

- Passwords are hashed by PocketBase (bcrypt)
- Auth tokens are stored in httpOnly cookies (configurable)
- Password reset doesn't reveal email existence
- Auth state is validated on every request
- Failed auth sessions are automatically cleared
