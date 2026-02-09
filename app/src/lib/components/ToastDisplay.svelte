<script lang="ts">
	import { toastQueue, type ToastMessage } from '$lib/stores/toast';
	import { CircleAlert, CircleCheck, Info, TriangleAlert } from '@lucide/svelte';

	let current: ToastMessage | null = $state(null);

	$effect(() => {
		toastQueue.subscribe((state) => {
			current = state.current;
		})();
	});

	const getIcon = (type: string) => {
		switch (type) {
			case 'success':
				return CircleCheck;
			case 'error':
				return CircleAlert;
			case 'warning':
				return TriangleAlert;
			case 'info':
			default:
				return Info;
		}
	};

	const getClasses = (type: string) => {
		const baseClasses =
			'fixed bottom-4 right-4 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-bottom-4 duration-300';
		switch (type) {
			case 'success':
				return `${baseClasses} bg-green-50 border border-green-200 text-green-800`;
			case 'error':
				return `${baseClasses} bg-red-50 border border-red-200 text-red-800`;
			case 'warning':
				return `${baseClasses} bg-yellow-50 border border-yellow-200 text-yellow-800`;
			case 'info':
			default:
				return `${baseClasses} bg-blue-50 border border-blue-200 text-blue-800`;
		}
	};
</script>

{#if current}
	<div class={getClasses(current.type)} role="alert" aria-live="polite">
		<svelte:component this={getIcon(current.type)} class="h-5 w-5 flex-shrink-0" />
		<span class="text-sm font-medium">{current.message}</span>
		<button
			class="ml-2 flex-shrink-0 text-current opacity-70 hover:opacity-100"
			aria-label="Close notification"
			onclick={() => toastQueue.remove(current?.id || '')}
		>
			<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
				<path
					fill-rule="evenodd"
					d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
					clip-rule="evenodd"
				/>
			</svg>
		</button>
	</div>
{/if}

<style>
	@keyframes slide-in-from-bottom-4 {
		from {
			opacity: 0;
			transform: translateY(1rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-in {
		animation: slide-in-from-bottom-4 0.3s ease-out;
	}

	.slide-in-from-bottom-4 {
		animation-name: slide-in-from-bottom-4;
	}

	.duration-300 {
		animation-duration: 300ms;
	}
</style>
