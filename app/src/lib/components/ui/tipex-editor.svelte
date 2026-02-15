<script lang="ts">
  import { browser } from '$app/environment';
  import { Button } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';
  import TipexMediaModal, { type TipexMediaItem } from '$lib/components/ui/tipex-media-modal.svelte';
  import { cn } from '$lib/utils';
  import { Tipex } from '@friendofsvelte/tipex';
  import '@friendofsvelte/tipex/styles/index.css';
  import CodeXmlIcon from '@lucide/svelte/icons/code-xml';
  import ImagePlusIcon from '@lucide/svelte/icons/image-plus';

  type CodeJarInstance = {
    onUpdate: (callback: (code: string) => void) => void;
    updateCode: (code: string) => void;
    destroy: () => void;
  };

  type CodeJarFactory = (
    editor: HTMLElement,
    highlighter: (editor: HTMLElement) => void,
    options?: {
      tab?: string;
      spellcheck?: boolean;
    }
  ) => CodeJarInstance;

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
  let htmlDraft = $state('');
  let htmlError = $state('');
  let htmlEditorElement = $state<HTMLElement | null>(null);
  let htmlJar = $state<CodeJarInstance | null>(null);

  function ensureAttachment(id: string) {
    if (!id) return;
    const current = Array.isArray(attachments) ? attachments : [];
    if (!current.includes(id)) {
      attachments = [...current, id];
    }
  }

  function escapeHtml(input: string): string {
    return input
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function buildAttribution(media: TipexMediaItem): string {
    if (media.source !== 'pexels') return '';

    const photographer = media.attribution?.photographer || 'Pexels contributor';
    const photographerUrl = media.attribution?.photographerUrl;
    const photoUrl = media.attribution?.photoUrl || media.sourceUrl;

    const photographerPart = photographerUrl
      ? `<a href="${escapeHtml(photographerUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(photographer)}</a>`
      : escapeHtml(photographer);

    const pexelsPart = photoUrl
      ? `<a href="${escapeHtml(photoUrl)}" target="_blank" rel="noopener noreferrer">Pexels</a>`
      : 'Pexels';

    return `Photo by ${photographerPart} on ${pexelsPart}`;
  }

  function insertSelectedMedia(media: TipexMediaItem) {
    if (!editor) return;

    const altText = escapeHtml(media.altText || '');
    const caption = media.caption ? escapeHtml(media.caption) : '';
    const attribution = buildAttribution(media);
    const captionText = [caption, attribution].filter(Boolean).join(' · ');

    const imageHtml = `<img src="${escapeHtml(media.url)}" alt="${altText}" />`;
    const html = captionText ? `<figure>${imageHtml}<figcaption>${captionText}</figcaption></figure>` : imageHtml;

    editor.chain().focus().insertContent(html).run();
    ensureAttachment(media.id);
  }

  function openHtmlEditor() {
    htmlDraft = editor?.getHTML?.() || value || '';
    htmlError = '';
    htmlEditorOpen = true;
  }

  function normalizeHtml(content: string | undefined | null): string {
    if (!content || content === '<p></p>') return '';
    return content;
  }

  function escapeCode(source: string): string {
    return source
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function highlightTag(tagSource: string): string {
    const tagMatch = tagSource.match(/^<(\/)?\s*([^\s/>]+)([\s\S]*?)(\/?)>$/);
    if (!tagMatch) {
      return `<span class="tipex-codejar-token-comment">${escapeCode(tagSource)}</span>`;
    }

    const [, closingSlash, tagName, rawAttributes, selfClosingSlash] = tagMatch;
    const attributes = rawAttributes || '';

    let attributesHtml = '';
    const attributeRegex = /([^\s=/>]+)(\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?/g;
    let attrMatch: RegExpExecArray | null;

    while ((attrMatch = attributeRegex.exec(attributes)) !== null) {
      const [full, name, valuePart] = attrMatch;
      const prefix = full.match(/^\s*/)?.[0] || '';

      attributesHtml += escapeCode(prefix);
      attributesHtml += `<span class="tipex-codejar-token-attr">${escapeCode(name)}</span>`;

      if (valuePart) {
        const eqMatch = valuePart.match(/^(\s*=\s*)([\s\S]+)$/);
        if (eqMatch) {
          const [, eq, value] = eqMatch;
          attributesHtml += `<span class="tipex-codejar-token-punc">${escapeCode(eq)}</span>`;
          attributesHtml += `<span class="tipex-codejar-token-value">${escapeCode(value)}</span>`;
        }
      }
    }

    const open = closingSlash ? '</' : '<';
    const close = selfClosingSlash ? '/>' : '>';

    return [
      `<span class="tipex-codejar-token-punc">${escapeCode(open)}</span>`,
      `<span class="tipex-codejar-token-tag">${escapeCode(tagName)}</span>`,
      attributesHtml,
      `<span class="tipex-codejar-token-punc">${escapeCode(close)}</span>`,
    ].join('');
  }

  function highlightHtmlCode(source: string): string {
    const tokenRegex = /<!--[\s\S]*?-->|<[^>]+>/g;
    let result = '';
    let cursor = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(source)) !== null) {
      const token = match[0];
      const index = match.index;

      if (index > cursor) {
        result += escapeCode(source.slice(cursor, index));
      }

      if (token.startsWith('<!--')) {
        result += `<span class="tipex-codejar-token-comment">${escapeCode(token)}</span>`;
      } else {
        result += highlightTag(token);
      }

      cursor = index + token.length;
    }

    if (cursor < source.length) {
      result += escapeCode(source.slice(cursor));
    }

    const lines = result.split('\n');

    return lines.map(line => `<span class="tipex-codejar-line">${line.length > 0 ? line : '&nbsp;'}</span>`).join('');
  }

  function applyHtmlChanges() {
    if (!editor) return;

    try {
      editor.commands.setContent(htmlDraft || '', true);
      value = htmlDraft;
      htmlEditorOpen = false;
      htmlError = '';
    } catch (error_) {
      htmlError = error_ instanceof Error ? error_.message : 'Unable to apply HTML changes.';
    }
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

  $effect(() => {
    if (!browser || !htmlEditorOpen || !htmlEditorElement) return;

    let disposed = false;
    let jar: CodeJarInstance | null = null;

    const highlight = (node: HTMLElement) => {
      const source = node.textContent || '';
      node.innerHTML = highlightHtmlCode(source);
    };

    const initializeCodeJar = async () => {
      try {
        const module = await import('codejar');
        const createJar = module.CodeJar as CodeJarFactory;

        if (disposed || !htmlEditorElement) return;

        jar = createJar(htmlEditorElement, highlight, {
          tab: '  ',
          spellcheck: false,
        });

        jar.onUpdate(code => {
          htmlDraft = code;
        });

        jar.updateCode(htmlDraft || '');
        htmlJar = jar;
      } catch (error_) {
        htmlError = error_ instanceof Error ? error_.message : 'Failed to load CodeJar.';
      }
    };

    void initializeCodeJar();

    return () => {
      disposed = true;
      if (jar) {
        jar.destroy();
      }

      if (htmlJar === jar) {
        htmlJar = null;
      }
    };
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
  <button type="button" class="tipex-html-fab" aria-label="Edit raw HTML" onclick={openHtmlEditor}>
    <CodeXmlIcon class="size-4" aria-hidden="true" />
    <span class="hidden sm:inline">HTML</span>
  </button>

  <button
    type="button"
    class="tipex-media-fab"
    aria-label="Insert media"
    onclick={() => {
      mediaModalOpen = true;
    }}
  >
    <ImagePlusIcon class="size-4" aria-hidden="true" />
    <span class="hidden sm:inline">Media</span>
  </button>
</div>

<TipexMediaModal
  bind:open={mediaModalOpen}
  bind:attachments
  {entityType}
  {entityId}
  {pexelsEnabled}
  onInsert={insertSelectedMedia}
/>

<Dialog.Root bind:open={htmlEditorOpen}>
  <Dialog.Content class="max-h-[80vh] max-w-3xl overflow-hidden">
    <Dialog.Header>
      <Dialog.Title>Edit raw HTML</Dialog.Title>
      <Dialog.Description>Review and edit the source HTML for this editor content.</Dialog.Description>
    </Dialog.Header>

    <div
      bind:this={htmlEditorElement}
      class="tipex-html-source"
      role="textbox"
      aria-multiline="true"
      spellcheck="false"
      aria-label="Raw HTML source"
      tabindex="0"
    ></div>

    {#if htmlError}
      <p class="text-sm text-destructive">{htmlError}</p>
    {/if}

    <div class="flex justify-end gap-2">
      <Button type="button" variant="outline" onclick={() => (htmlEditorOpen = false)}>Cancel</Button>
      <Button type="button" onclick={applyHtmlChanges}>Apply HTML</Button>
    </div>
  </Dialog.Content>
</Dialog.Root>

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

  .tipex-media-fab,
  .tipex-html-fab {
    position: absolute;
    top: 0.5rem;
    z-index: 5;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    border-radius: 9999px;
    border: 1px solid hsl(var(--border));
    background: hsl(var(--background));
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: hsl(var(--foreground));
  }

  .tipex-media-fab {
    right: 0.5rem;
  }

  .tipex-html-fab {
    right: 4.9rem;
  }

  .tipex-media-fab:hover,
  .tipex-html-fab:hover {
    background: hsl(var(--accent));
    color: hsl(var(--accent-foreground));
  }

  .tipex-media-fab:focus-visible,
  .tipex-html-fab:focus-visible {
    outline: 2px solid hsl(var(--ring));
    outline-offset: 2px;
  }

  .tipex-html-source {
    counter-reset: codejar-line;
    min-height: 300px;
    max-height: 80vh;
    width: 100%;
    resize: vertical;
    overflow: auto;
    border-radius: 0.5rem;
    border: 1px solid hsl(var(--input));
    background: hsl(var(--background));
    padding: 0.75rem 0.75rem 0.75rem 0;
    font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
    font-size: 0.875rem;
    line-height: 1.45;
    tab-size: 2;
    white-space: pre;
  }

  .tipex-html-source :global(.tipex-codejar-line) {
    counter-increment: codejar-line;
    display: block;
    position: relative;
    padding-left: 3.75rem;
    min-height: 1.45em;
  }

  .tipex-html-source :global(.tipex-codejar-line::before) {
    content: counter(codejar-line);
    position: absolute;
    left: 0;
    width: 3rem;
    text-align: right;
    color: hsl(var(--muted-foreground));
    opacity: 0.75;
    padding-right: 0.75rem;
    border-right: 1px solid hsl(var(--border));
    user-select: none;
  }

  .tipex-html-source :global(.tipex-codejar-token-tag) {
    color: oklch(0.61 0.18 268);
    font-weight: 600;
  }

  .tipex-html-source :global(.tipex-codejar-token-attr) {
    color: oklch(0.57 0.16 39);
  }

  .tipex-html-source :global(.tipex-codejar-token-value) {
    color: oklch(0.56 0.14 153);
  }

  .tipex-html-source :global(.tipex-codejar-token-comment) {
    color: hsl(var(--muted-foreground));
    font-style: italic;
  }

  .tipex-html-source :global(.tipex-codejar-token-punc) {
    color: hsl(var(--foreground));
    opacity: 0.85;
  }

  :global(.dark) .tipex-html-source :global(.tipex-codejar-token-tag) {
    color: oklch(0.76 0.17 268);
  }

  :global(.dark) .tipex-html-source :global(.tipex-codejar-token-attr) {
    color: oklch(0.78 0.14 95);
  }

  :global(.dark) .tipex-html-source :global(.tipex-codejar-token-value) {
    color: oklch(0.78 0.12 154);
  }

  .tipex-html-source:focus-visible {
    outline: 2px solid hsl(var(--ring));
    outline-offset: 2px;
  }
</style>
