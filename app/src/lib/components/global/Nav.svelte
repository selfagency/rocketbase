<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as NavigationMenu from '$lib/components/ui/navigation-menu';
	import { navigationMenuTriggerStyle } from '$lib/components/ui/navigation-menu/navigation-menu-trigger.svelte';
	import * as m from '$lib/paraglide/messages';

	let logoutFormRef = $state<HTMLFormElement | null>(null);

	const getDisplayName = (user?: { name?: string | null; email?: string | null }) => {
		return user?.name || user?.email || m['common.user_fallback']();
	};

	const getInitials = (user?: { name?: string | null; email?: string | null }) => {
		const display = getDisplayName(user).trim();
		const parts = display.split(/\s+/).filter(Boolean);
		if (parts.length === 0) return 'U';
		if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	};

	const getAvatarUrl = (user?: { id?: string | null; avatar?: string | null }) => {
		if (!user?.id || !user.avatar) return null;
		const baseUrl = PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
		return `${baseUrl}/api/files/_pb_users_auth_/${user.id}/${user.avatar}`;
	};
</script>

<nav
	aria-label="Primary"
	class="fixed top-0 left-0 z-40 w-screen border border-border/60 bg-background/80 shadow-md backdrop-blur-md"
>
	<div class="flex items-center justify-between gap-4 px-4 py-2">
		<NavigationMenu.Root>
			<NavigationMenu.List>
				<NavigationMenu.Item>
					<NavigationMenu.Link>
						{#snippet child()}
							<a href="/" class={navigationMenuTriggerStyle()}>{m['nav.brand']()}</a>
						{/snippet}
					</NavigationMenu.Link>
				</NavigationMenu.Item>
			</NavigationMenu.List>
		</NavigationMenu.Root>

		<div class="flex items-center gap-3">
			{#if page?.data?.user}
				<form method="POST" action="/logout" bind:this={logoutFormRef} class="hidden"></form>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger
						aria-label={m['nav.user_menu']()}
						class="rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
					>
						<Avatar.Root>
							<Avatar.Image
								src={getAvatarUrl(page?.data?.user) || undefined}
								alt={getDisplayName(page?.data?.user)}
							/>
							<Avatar.Fallback>{getInitials(page?.data?.user)}</Avatar.Fallback>
						</Avatar.Root>
					</DropdownMenu.Trigger>

					<DropdownMenu.Content align="end" class="w-48">
						<DropdownMenu.Label>{m['nav.account_label']()}</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.Item onSelect={() => goto('/account')}>
							{m['nav.account_settings']()}
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item
							variant="destructive"
							onSelect={() => logoutFormRef?.requestSubmit()}
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
