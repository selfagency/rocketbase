<script lang="ts">
  import RevisionDetailPanel from '$lib/components/admin/revisions/revision-detail-panel.svelte';
  import RevisionHistoryTable from '$lib/components/admin/revisions/revision-history-table.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import type { RevisionHistoryEntry } from '$lib/types/revision-history';
  import {
    formatRevisionTimestamp,
    getDiffItems,
    getRevisionDiffCounts,
    getVisibleRevisions,
    type DiffField,
  } from '$lib/utils/admin/revision-diff-utils';

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
    return getRevisionDiffCounts(revisions, diffFields);
  });

  const visibleRevisions = $derived.by(() => {
    return getVisibleRevisions(revisions, revisionDiffCounts);
  });

  const selectedRevision = $derived.by(() => {
    const selected = visibleRevisions.find(revision => revision.id === selectedRevisionId);
    return selected ?? null;
  });

  const selectedDiffItems = $derived.by(() => {
    if (!selectedRevision) return [];
    return getDiffItems(selectedRevision, diffFields);
  });

  function openRevision(revisionId: string): void {
    selectedRevisionId = revisionId;
    open = true;
  }

  function closeRevisionDialog(): void {
    selectedRevisionId = null;
    open = false;
  }
</script>

<Dialog.Root bind:open>
  <RevisionHistoryTable
    revisions={visibleRevisions}
    {revisionDiffCounts}
    formatTimestamp={formatRevisionTimestamp}
    onSelect={openRevision}
  />

  <Dialog.Content class="max-h-[85vh] w-[95vw] max-w-6xl p-0 sm:w-[90vw]">
    <RevisionDetailPanel
      {selectedRevision}
      {selectedDiffItems}
      {restoreAction}
      formatTimestamp={formatRevisionTimestamp}
      onCancel={closeRevisionDialog}
    />
  </Dialog.Content>
</Dialog.Root>
