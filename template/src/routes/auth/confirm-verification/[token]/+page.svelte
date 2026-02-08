<script lang="ts">
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { AlertCircle, CheckCircle } from '@lucide/svelte';

	let { data } = $props();
</script>

<div class="flex min-h-screen items-center justify-center px-4">
	<Card class="w-full max-w-md">
		<CardHeader>
			<CardTitle>Email Verification</CardTitle>
			<CardDescription>Verifying your email address</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			{#if data.error}
				<Alert variant="destructive">
					<AlertCircle class="h-4 w-4" />
					<AlertTitle>Verification Failed</AlertTitle>
					<AlertDescription>{data.error}</AlertDescription>
				</Alert>
				<Button onclick={() => (window.location.href = '/account')} class="w-full">
					Back to Account
				</Button>
			{:else}
				<Alert>
					<CheckCircle class="h-4 w-4" />
					<AlertTitle>Email Verified</AlertTitle>
					<AlertDescription>Your email address has been successfully verified!</AlertDescription>
				</Alert>
				<Button onclick={() => (window.location.href = '/account')} class="w-full">
					Back to Account
				</Button>
			{/if}
		</CardContent>
	</Card>
</div>
