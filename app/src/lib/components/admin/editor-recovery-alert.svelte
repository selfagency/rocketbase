<script lang="ts">
  import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
  import { Button } from '$lib/components/ui/button';

  let {
    snapshotTimestamp,
    onRestore,
    onDismiss,
  }: {
    snapshotTimestamp: string | null;
    onRestore: () => void;
    onDismiss: () => void;
  } = $props();
</script>

<Alert class="border-amber-400/60 bg-amber-50/80 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
  <AlertTitle>Recovered unsaved draft available</AlertTitle>
  <AlertDescription>
    {#if snapshotTimestamp}
      We found unsaved work from {snapshotTimestamp}.
    {:else}
      We found unsaved work from a previous session.
    {/if}
    <div class="mt-2 flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        class="border-amber-500/60 bg-amber-100/80 text-amber-950 hover:bg-amber-200 dark:border-amber-300/40 dark:bg-amber-900/50 dark:text-amber-100"
        onclick={onRestore}
      >
        Restore draft
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        class="text-amber-900 hover:bg-amber-100 dark:text-amber-100 dark:hover:bg-amber-900/30"
        onclick={onDismiss}
      >
        Dismiss
      </Button>
    </div>
  </AlertDescription>
</Alert>
