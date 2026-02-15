<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as ScrollArea from '$lib/components/ui/scroll-area';
  import type { RevisionHistoryEntry } from '$lib/types/revision-history';
  import SvelteDiffMatchPatch from '@humanspeak/svelte-diff-match-patch';

  type DiffField = {
    key: string;
    label: string;
  };

  type DiffItem = {
    key: string;
    label: string;
    originalText: string;
    modifiedText: string;
  };

  let {
    revisions,
    restoreAction = '?/restoreRevision',
    diffFields = [],
  }: {
    revisions: RevisionHistoryEntry[];
    restoreAction?: string;
    diffFields?: DiffField[];
  } = $props();

  let open = $state(false);
  let selectedRevisionId = $state<string | null>(null);

  const revisionDiffCounts = $derived.by(() => {
    return new Map(
      revisions.map(revision => {
        const counts = getRevisionCharCounts(revision);
        return [revision.id, counts] as const;
      })
    );
  });

  const visibleRevisions = $derived.by(() => {
    return revisions.filter(revision => {
      const counts = revisionDiffCounts.get(revision.id) ?? { added: 0, removed: 0 };
      const isNoChange = counts.added === 0 && counts.removed === 0;
      return !(isSystemAuthor(revision) && isNoChange);
    });
  });

  const selectedRevision = $derived.by(() => {
    const selected = visibleRevisions.find(revision => revision.id === selectedRevisionId);
    return selected ?? null;
  });

  const selectedDiffItems = $derived.by(() => {
    if (!selectedRevision) return [];
    return getDiffItems(selectedRevision);
  });

  function formatTimestamp(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'medium',
    }).format(date);
  }

  function toDiffText(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);

    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return '';
    }
  }

  function getDiffItems(revision: RevisionHistoryEntry): DiffItem[] {
    return diffFields
      .map(field => {
        const originalText = toDiffText(revision.before?.[field.key]);
        const modifiedText = toDiffText(revision.after?.[field.key]);

        return {
          key: field.key,
          label: field.label,
          originalText,
          modifiedText,
        };
      })
      .filter(diff => diff.originalText !== diff.modifiedText);
  }

  function getRevisionCharCounts(revision: RevisionHistoryEntry): { added: number; removed: number } {
    const diffItems = getDiffItems(revision);
    let added = 0;
    let removed = 0;

    for (const item of diffItems) {
      const { added: addedCount, removed: removedCount } = getCharDiffCounts(item.originalText, item.modifiedText);
      added += addedCount;
      removed += removedCount;
    }

    return { added, removed };
  }

  function getCharDiffCounts(original: string, modified: string): { added: number; removed: number } {
    if (original === modified) return { added: 0, removed: 0 };

    const n = original.length;
    const m = modified.length;

    if (n === 0) return { added: m, removed: 0 };
    if (m === 0) return { added: 0, removed: n };

    const previous = new Uint16Array(m + 1);
    const current = new Uint16Array(m + 1);

    for (let i = 1; i <= n; i += 1) {
      for (let j = 1; j <= m; j += 1) {
        if (original.charCodeAt(i - 1) === modified.charCodeAt(j - 1)) {
          current[j] = previous[j - 1] + 1;
        } else {
          current[j] = current[j - 1] > previous[j] ? current[j - 1] : previous[j];
        }
      }

      previous.set(current);
      current.fill(0);
    }

    const lcsLength = previous[m];
    return {
      added: m - lcsLength,
      removed: n - lcsLength,
    };
  }

  function isSystemAuthor(revision: RevisionHistoryEntry): boolean {
    const name = revision.authorName?.trim().toLowerCase() ?? '';
    return name === 'system';
  }
</script>

<Dialog.Root bind:open>
  <section class="space-y-3">
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
          {#if visibleRevisions.length === 0}
            <tr>
              <td colspan="4" class="h-40 px-3 py-2 text-center align-middle text-sm text-muted-foreground">
                No revisions found.
              </td>
            </tr>
          {:else}
            {#each visibleRevisions as revision (revision.id)}
              {@const counts = revisionDiffCounts.get(revision.id) ?? { added: 0, removed: 0 }}
              <tr
                role="button"
                tabindex="0"
                class="cursor-pointer border-t border-border/40 transition-colors hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:outline-none"
                onclick={() => {
                  selectedRevisionId = revision.id;
                  open = true;
                }}
                onkeydown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    selectedRevisionId = revision.id;
                    open = true;
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

  <Dialog.Content class="max-h-[85vh] w-[95vw] max-w-6xl p-0 sm:w-[90vw]">
    {#if selectedRevision}
      <section class="min-w-0 p-4 md:p-6">
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
          <Button
            type="button"
            variant="outline"
            onclick={() => {
              selectedRevisionId = null;
              open = false;
            }}
          >
            Cancel
          </Button>
        </div>
      </section>
    {/if}
  </Dialog.Content>
</Dialog.Root>

<style>
  :global(.revision-diff-remove) {
    background-color: color-mix(in oklab, var(--color-destructive) 20%, transparent);
    text-decoration: line-through;
  }

  :global(.revision-diff-insert) {
    background-color: color-mix(in oklab, var(--color-chart-2) 24%, transparent);
  }
</style>
