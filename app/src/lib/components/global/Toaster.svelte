<script lang="ts">
  import { Toaster } from '$lib/components/ui/sonner';
  import { toasts } from '$lib/stores/toast';
  import { toast } from 'svelte-sonner';
  import { SvelteSet } from 'svelte/reactivity';

  const shownKeys = new SvelteSet<string>();
  const getToastKey = (toastData: { timestamp: Date | string | number; message: string; type: string }) => {
    const timestamp =
      toastData.timestamp instanceof Date ? toastData.timestamp.getTime() : new Date(toastData.timestamp).getTime();

    return `${toastData.type}:${toastData.message}:${Number.isNaN(timestamp) ? 0 : timestamp}`;
  };

  $effect(() => {
    while (toasts.current.length > 0) {
      const toastData = toasts.current.shift()!;
      const key = getToastKey(toastData);
      if (!shownKeys.has(key)) {
        shownKeys.add(key);
        toast[toastData.type](toastData.message);
      }
    }
    shownKeys.clear();
  });
</script>

<Toaster />
