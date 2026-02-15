<script lang="ts">
  import TipexEditorFabControls from '$lib/components/ui/tipex-editor-fab-controls.svelte';
  import TipexHtmlCodeEditorDialog from '$lib/components/ui/tipex-html-code-editor-dialog.svelte';
  import TipexMediaModal from '$lib/components/ui/tipex-media-modal.svelte';
  import type { TipexMediaItem } from '$lib/components/ui/tipex-media-modal.types';
  import { cn } from '$lib/utils';
  import { buildAttribution, buildFigureHtml } from '$lib/utils/media-attribution';
  import { Tipex } from '@friendofsvelte/tipex';
  import '@friendofsvelte/tipex/styles/index.css';

  let {
    value = $bindable(),
    attachments = $bindable<string[]>(),
    entityType,
    entityId,
    pexelsEnabled = false,
    placeholder = '',
    class: className,
    ...props
  }: {
    value?: string;
    attachments?: string[];
    entityType?: 'post' | 'page';
    entityId?: string;
    pexelsEnabled?: boolean;
    placeholder?: string;
    [key: string]: any;
  } = $props();

  // Tipex editor instance
  let editor = $state<any>();
  let mediaModalOpen = $state(false);
  let htmlEditorOpen = $state(false);

  function ensureAttachment(id: string) {
    if (!id) return;
    const current = Array.isArray(attachments) ? attachments : [];
    if (!current.includes(id)) {
      attachments = [...current, id];
    }
  }

  function insertSelectedMedia(media: TipexMediaItem) {
    if (!editor) return;

    const altText = media.altText || '';
    const caption = media.caption || '';
    const attribution = buildAttribution(media);
    const html = buildFigureHtml(media.url, altText, caption, attribution);

    editor.chain().focus().insertContent(html).run();
    ensureAttachment(media.id);
  }

  function openHtmlEditor() {
    htmlEditorOpen = true;
  }

  function normalizeHtml(content: string | undefined | null): string {
    if (!content || content === '<p></p>') return '';
    return content;
  }

  function applyHtmlChanges(nextHtml: string) {
    if (!editor) return;

    editor.commands.setContent(nextHtml || '', true);
    value = nextHtml;
  }

  // Reconcile external value changes (e.g. snapshot restore) back into editor content.
  $effect(() => {
    if (!editor || typeof editor.getHTML !== 'function') return;

    const editorHtml = normalizeHtml(editor.getHTML());
    const modelHtml = normalizeHtml(value);

    if (editorHtml !== modelHtml) {
      editor.commands?.setContent?.(modelHtml || '', true);
    }
  });
</script>

<div
  class={cn(
    'tipex-wrapper flex w-full flex-col rounded-md border border-input bg-[oklch(0.985_0_0)] shadow-xs ring-offset-background transition-[color,box-shadow] outline-none dark:bg-input/30',
    'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
    'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
    className
  )}
  data-placeholder={placeholder}
  {...props}
>
  <Tipex bind:tipex={editor} body={value} floating focal onupdate={() => (value = normalizeHtml(editor?.getHTML()))} />
  <TipexEditorFabControls onOpenHtml={openHtmlEditor} onOpenMedia={() => (mediaModalOpen = true)} />
</div>

<TipexMediaModal
  bind:open={mediaModalOpen}
  bind:attachments
  {entityType}
  {entityId}
  {pexelsEnabled}
  onInsert={insertSelectedMedia}
/>

<TipexHtmlCodeEditorDialog
  bind:open={htmlEditorOpen}
  initialHtml={editor?.getHTML?.() || value || ''}
  onApply={applyHtmlChanges}
/>

<style>
  .tipex-wrapper {
    position: relative;
    overflow: hidden;
    --tipex-toolbar-divider: oklch(0.84 0 0);
  }

  .tipex-wrapper :global(.tipex-editor) {
    display: flex;
    flex-direction: column;
    border: 0;
    box-shadow: none;
    border-radius: 0;
    background: transparent;
    backdrop-filter: none;
    min-height: 0;
  }

  .tipex-wrapper :global(> *),
  .tipex-wrapper :global(.tipex-editor-wrap),
  .tipex-wrapper :global(.tipex-editor-section) {
    border-radius: inherit;
  }

  .tipex-wrapper :global(.tipex-editor-section) {
    height: 340px;
    min-height: 260px;
    max-height: 80vh;
    resize: vertical;
    overflow-y: auto;
    padding: 0.75rem;
  }

  .tipex-wrapper :global(.ProseMirror) {
    min-height: 260px;
    outline: none;
    border: none;
    background: transparent;
  }

  .tipex-wrapper :global(.tipex-controller),
  .tipex-wrapper :global(.tipex-controls),
  .tipex-wrapper :global(.tipex-toolbar) {
    position: relative;
    border-top: none;
    border-radius: 0;
    background: hsl(var(--muted));
    backdrop-filter: none;
  }

  .tipex-wrapper :global(.tipex-controller)::before,
  .tipex-wrapper :global(.tipex-controls)::before,
  .tipex-wrapper :global(.tipex-toolbar)::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 0.5px;
    background: var(--tipex-toolbar-divider);
    opacity: 0.9;
    pointer-events: none;
  }

  :global(.dark) .tipex-wrapper {
    --tipex-toolbar-divider: oklch(0.46 0 0);
  }

  .tipex-wrapper :global(.tipex-edit-button) {
    color: hsl(var(--muted-foreground));
  }

  .tipex-wrapper :global(.tipex-edit-button:hover),
  .tipex-wrapper :global(.tipex-edit-button.active) {
    background: hsl(var(--accent));
    color: hsl(var(--accent-foreground));
  }

  .tipex-wrapper :global(.ProseMirror:focus) {
    outline: none;
  }

  .tipex-wrapper[data-placeholder] :global(.ProseMirror p.is-editor-empty:first-child::before) {
    color: hsl(var(--muted-foreground));
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }

  .tipex-wrapper :global(.ProseMirror > * + *) {
    margin-top: 0.75em;
  }

  .tipex-wrapper :global(.ProseMirror h1) {
    font-size: 1.875rem;
    font-weight: 700;
    line-height: 2.25rem;
  }

  .tipex-wrapper :global(.ProseMirror h2) {
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 2rem;
  }

  .tipex-wrapper :global(.ProseMirror h3) {
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.75rem;
  }

  .tipex-wrapper :global(.ProseMirror ul),
  .tipex-wrapper :global(.ProseMirror ol) {
    padding-left: 1.5rem;
  }

  .tipex-wrapper :global(.ProseMirror code) {
    background-color: hsl(var(--muted));
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
  }

  .tipex-wrapper :global(.ProseMirror pre) {
    background-color: hsl(var(--muted));
    padding: 0.75rem;
    border-radius: 0.375rem;
    overflow-x: auto;
  }

  .tipex-wrapper :global(.ProseMirror blockquote) {
    border-left: 3px solid hsl(var(--border));
    padding-left: 1rem;
    font-style: italic;
  }
</style>
