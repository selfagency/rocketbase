<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { env } from '$env/dynamic/public';
  import * as Avatar from '$lib/components/ui/avatar';
  import { Button } from '$lib/components/ui/button';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import * as NavigationMenu from '$lib/components/ui/navigation-menu';
  import { navigationMenuTriggerStyle } from '$lib/components/ui/navigation-menu/navigation-menu-trigger.svelte';
  import * as m from '$lib/paraglide/messages';
  import { isMobile } from '$lib/stores/screen';
  import type { NavItem } from '$lib/types';
  import { getDisplayName, getPocketBaseAvatarUrl, getUserInitials } from '$lib/utils/user-profile';
  import CirclePlusIcon from '@lucide/svelte/icons/circle-plus';

  let { navItems = [] }: { navItems?: NavItem[] } = $props();
  const hasFaqNavItem = $derived(navItems.some(item => item.slug === 'faqs'));

  let logoutFormRef = $state<HTMLFormElement | null>(null);
</script>

<nav
  aria-label="Primary"
  class="fixed inset-x-0 top-0 z-40 border-b border-border/70 bg-background/85 shadow-sm backdrop-blur-lg"
>
  <div class="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
    <NavigationMenu.Root viewport={$isMobile}>
      <NavigationMenu.List class="flex items-center">
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/" class={navigationMenuTriggerStyle()}>
            {m['nav.brand']()}
          </NavigationMenu.Link>
        </NavigationMenu.Item>

        {#if !hasFaqNavItem}
          <NavigationMenu.Item>
            <NavigationMenu.Link href="/faqs" class={navigationMenuTriggerStyle()}>FAQs</NavigationMenu.Link>
          </NavigationMenu.Item>
        {/if}

        {#each navItems as item (item.id)}
          {#if item.children && item.children.length > 0}
            <!-- Menu with children -->
            <NavigationMenu.Item>
              <NavigationMenu.Trigger href="/{item.slug}">
                {item.title || item.slug}
              </NavigationMenu.Trigger>
              <NavigationMenu.Content>
                <ul class="grid w-75 gap-4 p-2">
                  <li>
                    {#each item.children as childItem (childItem.id)}
                      <NavigationMenu.Link href="/{childItem?.slug}">
                        <div class="font-medium">
                          {childItem?.title || childItem?.slug}
                        </div>
                        {#if childItem?.summary}
                          <div class="text-muted-foreground">
                            {childItem.summary}
                          </div>
                        {/if}
                      </NavigationMenu.Link>
                    {/each}
                  </li>
                </ul>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          {:else}
            <!-- Simple link without children -->
            <NavigationMenu.Item>
              <NavigationMenu.Link href="/{item.slug}" class={navigationMenuTriggerStyle()}>
                {item.title || item.slug}
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          {/if}
        {/each}

        <!-- Admin menu appended as its own top-level item so it doesn't appear inside other menus -->
        {#if page?.data?.user && (page?.data?.user?.role === 'admin' || page?.data?.user?.role === 'editor' || page?.data?.user?.role === 'contributor')}
          <NavigationMenu.Item>
            <NavigationMenu.Trigger class={navigationMenuTriggerStyle()} href="/admin">
              {m['nav.admin'] ? m['nav.admin']() : 'Admin'}
            </NavigationMenu.Trigger>
            <NavigationMenu.Content>
              <ul class="grid w-56 gap-2 p-2">
                <li>
                  <NavigationMenu.Link href="/admin">
                    <div class="font-medium">
                      {m['nav.admin_dashboard'] ? m['nav.admin_dashboard']() : 'Dashboard'}
                    </div>
                  </NavigationMenu.Link>
                </li>
                {#if page?.data?.user?.role === 'admin' || page?.data?.user?.role === 'editor'}
                  <li>
                    <NavigationMenu.Link href="/admin/pages">
                      <div class="font-medium">{m['nav.pages'] ? m['nav.pages']() : 'Pages'}</div>
                    </NavigationMenu.Link>
                  </li>
                  <li>
                    <NavigationMenu.Link href="/admin/posts">
                      <div class="font-medium">Posts</div>
                    </NavigationMenu.Link>
                  </li>
                  <li>
                    <NavigationMenu.Link href="/admin/faqs">
                      <div class="font-medium">FAQs</div>
                    </NavigationMenu.Link>
                  </li>
                  <li>
                    <NavigationMenu.Link href="/admin/portfolio">
                      <div class="font-medium">Portfolio</div>
                    </NavigationMenu.Link>
                  </li>
                {/if}
              </ul>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        {/if}
      </NavigationMenu.List>
    </NavigationMenu.Root>

    <div class="flex items-center gap-3">
      {#if page?.data?.user}
        {#if page?.data?.user?.role === 'admin' || page?.data?.user?.role === 'editor' || page?.data?.user?.role === 'contributor'}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger
              aria-label="Create new content"
              class="inline-flex items-center gap-2 rounded-md border border-transparent bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <CirclePlusIcon class="h-4 w-4" aria-hidden="true" />
              <span>New</span>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content align="end" class="w-40 border-border/60 shadow-md">
              {#if page?.data?.user?.role === 'admin' || page?.data?.user?.role === 'editor'}
                <DropdownMenu.Item
                  onSelect={() => {
                    goto('/admin/pages/new');
                  }}
                >
                  Page
                </DropdownMenu.Item>
              {/if}
              <DropdownMenu.Item
                onSelect={() => {
                  goto('/admin/posts/new');
                }}
              >
                Post
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => {
                  goto('/admin/portfolio/new');
                }}
              >
                Portfolio Item
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        {/if}

        <form method="POST" action="/logout" bind:this={logoutFormRef} class="hidden"></form>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger
            aria-label={m['nav.user_menu']()}
            class="rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Avatar.Root>
              <Avatar.Image
                src={getPocketBaseAvatarUrl(page?.data?.user, env.PUBLIC_POCKETBASE_URL) || undefined}
                alt={getDisplayName(page?.data?.user, m['common.user_fallback']())}
              />
              <Avatar.Fallback>
                {getUserInitials(page?.data?.user, m['common.user_fallback']())}
              </Avatar.Fallback>
            </Avatar.Root>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content align="end" class="w-48 border-border/60 shadow-md">
            <DropdownMenu.Label>{m['nav.account_label']()}</DropdownMenu.Label>
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              onSelect={() => {
                goto('/account');
              }}
            >
              {m['nav.account_settings']()}
            </DropdownMenu.Item>

            <DropdownMenu.Separator />
            <DropdownMenu.Item
              variant="destructive"
              onSelect={() => {
                logoutFormRef?.requestSubmit();
              }}
            >
              {m['nav.logout']()}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      {:else}
        <Button href="/login">{m['nav.login']()}</Button>
      {/if}
    </div>
  </div>
</nav>
