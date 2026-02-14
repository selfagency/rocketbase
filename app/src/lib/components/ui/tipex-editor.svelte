<script lang="ts">
  import { Tipex } from '@friendofsvelte/tipex';
  import '@friendofsvelte/tipex/styles/index.css';

  let {
    value = $bindable(),
    placeholder = '',
    ...props
  }: {
    value?: string;
    placeholder?: string;
    [key: string]: any;
  } = $props();

  // Tipex editor instance
  let editor = $state<any>();

  // Sync editor content back to the bound value
  $effect(() => {
    if (editor) {
      const html = editor.getHTML();
      // Only update if there's actual content or if it differs from current value
      if (html !== '<p></p>' && html !== value) {
        value = html;
      } else if (html === '<p></p>' && value) {
        value = '';
      }
    }
  });

  // Initialize editor with existing value
  $effect(() => {
    if (editor && value && editor.getHTML() === '<p></p>') {
      editor.commands.setContent(value);
    }
  });
</script>

<div class="tipex-wrapper rounded-md border border-input bg-background" data-placeholder={placeholder} {...props}>
  <Tipex bind:tipex={editor} floating focal />
</div>

<style>
  .tipex-wrapper {
    overflow: hidden;
  }

  /* Ensure all Tipex internal wrappers inherit border radius */
  .tipex-wrapper :global(> *) {
    border-radius: inherit;
  }

  .tipex-wrapper :global(.ProseMirror) {
    min-height: 200px;
    padding: 0.75rem;
    outline: none;
    border-radius: 0.375rem; /* md radius */
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
