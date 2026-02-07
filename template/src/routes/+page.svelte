<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();
</script>

<div class="container mx-auto max-w-2xl px-4 py-16">
	<Card>
		<CardHeader>
			<CardTitle>{m['home.title']()}</CardTitle>
			<CardDescription>{m['home.description']()}</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			{#if data.user}
				<div class="space-y-2">
					<p class="text-lg">{m['home.greeting']({ name: data.user.name || data.user.email })}</p>
					<p class="text-muted-foreground">{m['home.logged_in_message']()}</p>
				</div>

				<div class="flex gap-2">
					<Button href="/account" variant="outline">Account Settings</Button>
					<form method="POST" action="/logout">
						<Button type="submit" variant="outline">{m['home.logout_button']()}</Button>
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

			<div class="border-t pt-4 mt-6">
				<p class="text-sm text-muted-foreground">
					{@html m['home.docs_link_text']({
						link: `<a href="https://${m['home.docs_link']()}" class="text-primary hover:underline">${m['home.docs_link']()}</a>`
					})}
				</p>
			</div>
		</CardContent>
	</Card>
</div>
