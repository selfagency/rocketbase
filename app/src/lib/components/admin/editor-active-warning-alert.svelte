<script lang="ts">
  import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';

  let {
    activeEditorCount,
  }: {
    activeEditorCount: number;
  } = $props();
</script>

<Alert class="surface-enter border-blue-400/60 bg-blue-50/80 text-blue-900 dark:bg-blue-950/40 dark:text-blue-100">
  <AlertTitle>Another editor is active</AlertTitle>
  <AlertDescription>
    {activeEditorCount === 1
      ? 'Someone else is actively editing this record right now.'
      : `${activeEditorCount} other editors are currently active on this record.`}
  </AlertDescription>
</Alert>
