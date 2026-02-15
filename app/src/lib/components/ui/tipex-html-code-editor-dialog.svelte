<script lang="ts">
  import { browser } from '$app/environment';
  import { Button } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';
  import { highlightHtmlCode } from '$lib/utils/html-highlighter';

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
    open = $bindable(false),
    initialHtml = '',
    onApply,
  }: {
    open?: boolean;
    initialHtml?: string;
    onApply: (html: string) => void;
  } = $props();

  let htmlDraft = $state('');
  let htmlError = $state('');
  let htmlEditorElement = $state<HTMLElement | null>(null);
  let htmlJar = $state<CodeJarInstance | null>(null);

  function applyHtmlChanges() {
    try {
      onApply(htmlDraft || '');
      open = false;
      htmlError = '';
    } catch (error_) {
      htmlError = error_ instanceof Error ? error_.message : 'Unable to apply HTML changes.';
    }
  }

  $effect(() => {
    if (!open) return;
    htmlDraft = initialHtml;
    htmlError = '';
  });

  $effect(() => {
    if (!browser || !open || !htmlEditorElement) return;

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

<Dialog.Root bind:open>
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
      <Button type="button" variant="outline" onclick={() => (open = false)}>Cancel</Button>
      <Button type="button" onclick={applyHtmlChanges}>Apply HTML</Button>
    </div>
  </Dialog.Content>
</Dialog.Root>

<style>
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
