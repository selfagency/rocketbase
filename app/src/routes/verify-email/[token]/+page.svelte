<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import * as m from '$lib/paraglide/messages.js';
	import { CircleAlert, CircleCheck } from '@lucide/svelte';

	let { data } = $props();
</script>

<div class="flex min-h-screen items-center justify-center px-4">
	<Card class="w-full max-w-md">
		<CardHeader>
			<CardTitle>{m['verify.email_title']()}</CardTitle>
			<CardDescription>{m['verify.email_description']()}</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			{#if data.error}
				<Alert variant="destructive">
					<CircleAlert class="h-4 w-4" />
					<AlertTitle>{m['verify.email_failed_title']()}</AlertTitle>
					<AlertDescription>{data.error}</AlertDescription>
				</Alert>
				<Button onclick={() => goto(resolve('/account'))} class="w-full">
					{m['common.back_to_account']()}
				</Button>
			{:else}
				<Alert>
					<CircleCheck class="h-4 w-4" />
					<AlertTitle>{m['verify.email_success_title']()}</AlertTitle>
					<AlertDescription>{m['verify.email_success_message']()}</AlertDescription>
				</Alert>
				<Button onclick={() => goto(resolve('/account'))} class="w-full">
					{m['common.back_to_account']()}
				</Button>
			{/if}
		</CardContent>
	</Card>
</div>
