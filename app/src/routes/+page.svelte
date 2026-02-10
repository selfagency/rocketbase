<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader } from '$lib/components/ui/card';
	import * as m from '$lib/paraglide/messages';
	import { toast } from '$lib/stores/toast';

	let { data } = $props();

	// Show success toast if user just logged in via MFA
	$effect(() => {
		if (page.url.searchParams.get('login') === 'success') {
			toast(m['auth.login.success'](), 'success');
			// Clean up URL without reload
			window.history.replaceState({}, '', '/');
		}
	});
</script>

<div class="container mx-auto max-w-2xl px-4 py-16">
	<Card>
		<CardHeader>
			<h1 class="text-2xl leading-none font-semibold">
				{m['home.title']()}
			</h1>
			<CardDescription>{m['home.description']()}</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			{#if data.user}
				<div class="space-y-2">
					<p class="text-lg">
						{m['home.greeting']({
							name: data.user.name || data.user.email
						})}
					</p>
					<p class="text-muted-foreground">
						{m['home.logged_in_message']()}
					</p>
				</div>

				<div class="flex gap-2">
					<Button href="/account" variant="outline">Account Settings</Button>
					<form method="POST" action="/logout">
						<Button type="submit" variant="outline" data-testid="logout-button"
							>{m['home.logout_button']()}</Button
						>
					</form>
				</div>
			{:else}
				<div class="space-y-2">
					<p class="text-lg">{m['home.not_logged_in']()}</p>
					<p class="text-muted-foreground">
						{m['home.get_started_message']()}
					</p>
				</div>

				<div class="flex gap-2">
					<Button href="/login">{m['home.login_button']()}</Button>
					<Button href="/register" variant="outline">{m['home.register_button']()}</Button>
				</div>
			{/if}

			<div class="mt-6 border-t pt-4">
				<p class="text-sm text-muted-foreground">
					{@html m['home.docs_link_text']({
						link: `<a href="https://${m['home.docs_link']()}" class="text-primary hover:underline">${m['home.docs_link']()}</a>`
					})}
				</p>
			</div>
		</CardContent>
	</Card>
</div>
