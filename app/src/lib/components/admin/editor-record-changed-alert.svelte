<script lang="ts">
  import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';

  let {
    recordChangedAt,
  }: {
    recordChangedAt: string | null;
  } = $props();
</script>

<Alert variant="destructive" class="surface-enter">
  <AlertTitle>This record changed while you were editing</AlertTitle>
  <AlertDescription>
    Another update was detected {recordChangedAt ? `at ${recordChangedAt}` : 'in a parallel session'}. Review carefully
    before saving to avoid overwriting someone else's changes.
  </AlertDescription>
</Alert>
