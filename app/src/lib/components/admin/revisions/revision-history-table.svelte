<script lang="ts">
  import * as ScrollArea from '$lib/components/ui/scroll-area';
  import type { RevisionHistoryEntry } from '$lib/types/revision-history';
  import type { CharCounts } from '$lib/utils/admin/revision-diff-utils';

  let {
    revisions,
    revisionDiffCounts,
    formatTimestamp,
    onSelect,
  }: {
    revisions: RevisionHistoryEntry[];
    revisionDiffCounts: Map<string, CharCounts>;
    formatTimestamp: (value: string) => string;
    onSelect: (revisionId: string) => void;
  } = $props();
</script>

<section class="surface-enter space-y-3">
  <h3 class="text-sm font-semibold">Revision history</h3>

  <ScrollArea.Root class="h-60 rounded-md border border-border bg-card shadow-sm">
    <table class="w-full min-w-160 text-sm">
      <thead class="bg-muted/40 text-left text-xs tracking-wide text-muted-foreground uppercase">
        <tr>
          <th class="px-3 py-2 font-medium">Date</th>
          <th class="px-3 py-2 font-medium">Author</th>
          <th class="px-3 py-2 font-medium">Type</th>
          <th class="px-3 py-2 font-medium">Δ chars</th>
        </tr>
      </thead>
      <tbody>
        {#if revisions.length === 0}
          <tr>
            <td colspan="4" class="h-40 px-3 py-2 text-center align-middle text-sm text-muted-foreground">
              No revisions found.
            </td>
          </tr>
        {:else}
          {#each revisions as revision (revision.id)}
            {@const counts = revisionDiffCounts.get(revision.id) ?? { added: 0, removed: 0 }}
            <tr
              role="button"
              tabindex="0"
              class="cursor-pointer border-t border-border/40 transition-colors hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset"
              onclick={() => {
                onSelect(revision.id);
              }}
              onkeydown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelect(revision.id);
                }
              }}
              aria-label={`Open revision from ${formatTimestamp(revision.timestamp)} by ${revision.authorName}`}
            >
              <td class="px-3 py-2">{formatTimestamp(revision.timestamp)}</td>
              <td class="px-3 py-2">{revision.authorName}</td>
              <td class="px-3 py-2 capitalize">{revision.eventType}</td>
              <td class="px-3 py-2 whitespace-nowrap tabular-nums">
                <span class="text-emerald-600 dark:text-emerald-400">+{counts.added}</span>
                <span class="mx-1 text-muted-foreground">/</span>
                <span class="text-red-600 dark:text-red-400">-{counts.removed}</span>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </ScrollArea.Root>
</section>
