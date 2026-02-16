<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import * as ScrollArea from '$lib/components/ui/scroll-area';
  import type { RevisionHistoryEntry } from '$lib/types/revision-history';
  import type { DiffItem } from '$lib/utils/admin/revision-diff-utils';
  import SvelteDiffMatchPatch from '@humanspeak/svelte-diff-match-patch';

  let {
    selectedRevision,
    selectedDiffItems,
    restoreAction,
    formatTimestamp,
    onCancel,
  }: {
    selectedRevision: RevisionHistoryEntry | null;
    selectedDiffItems: DiffItem[];
    restoreAction: string;
    formatTimestamp: (value: string) => string;
    onCancel: () => void;
  } = $props();
</script>

{#if selectedRevision}
  <section class="surface-enter min-w-0 p-4 md:p-6">
    <div class="mb-4 space-y-1 border-b pb-4">
      <p class="text-sm text-muted-foreground">
        <span class="font-medium text-foreground">Author:</span>
        {selectedRevision.authorName}
        {#if selectedRevision.authorEmail}
          ({selectedRevision.authorEmail})
        {/if}
      </p>
      <p class="text-sm text-muted-foreground">
        <span class="font-medium text-foreground">Date:</span>
        {formatTimestamp(selectedRevision.timestamp)}
      </p>
    </div>

    {#if selectedDiffItems.length === 0}
      <p class="mb-6 rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
        No tracked text differences were detected for this revision.
      </p>
    {:else}
      <ScrollArea.Root class="mb-6 h-[45vh] rounded-md border p-3 pr-2">
        <div class="space-y-4">
          {#each selectedDiffItems as diff (diff.key)}
            <section class="space-y-2 rounded-md border p-3">
              <h4 class="text-sm font-semibold">{diff.label}</h4>
              <div class="rounded-md bg-muted/30 p-3 text-sm leading-relaxed wrap-break-word whitespace-pre-wrap">
                <SvelteDiffMatchPatch
                  originalText={diff.originalText}
                  modifiedText={diff.modifiedText}
                  cleanupSemantic={true}
                  cleanupEfficiency={4}
                  timeout={1}
                  rendererClasses={{
                    remove: 'revision-diff-remove',
                    insert: 'revision-diff-insert',
                    equal: 'revision-diff-equal',
                  }}
                />
              </div>
            </section>
          {/each}
        </div>
      </ScrollArea.Root>
    {/if}

    <div class="flex flex-wrap gap-3 border-t pt-4">
      <form method="POST" action={restoreAction}>
        <input type="hidden" name="revisionId" value={selectedRevision.id} />
        <Button type="submit" variant="destructive">Restore</Button>
      </form>
      <Button type="button" variant="outline" onclick={onCancel}>Cancel</Button>
    </div>
  </section>
{/if}

<style>
  :global(.revision-diff-remove) {
    background-color: color-mix(in oklab, var(--color-destructive) 20%, transparent);
    text-decoration: line-through;
  }

  :global(.revision-diff-insert) {
    background-color: color-mix(in oklab, var(--color-chart-2) 24%, transparent);
  }
</style>
