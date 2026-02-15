<script lang="ts">
  import CodeXmlIcon from '@lucide/svelte/icons/code-xml';
  import ImagePlusIcon from '@lucide/svelte/icons/image-plus';

  let {
    onOpenHtml,
    onOpenMedia,
  }: {
    onOpenHtml: () => void;
    onOpenMedia: () => void;
  } = $props();
</script>

<button type="button" class="tipex-html-fab" aria-label="Edit raw HTML" onclick={onOpenHtml}>
  <CodeXmlIcon class="size-4" aria-hidden="true" />
  <span class="hidden sm:inline">HTML</span>
</button>

<button type="button" class="tipex-media-fab" aria-label="Insert media" onclick={onOpenMedia}>
  <ImagePlusIcon class="size-4" aria-hidden="true" />
  <span class="hidden sm:inline">Media</span>
</button>

<style>
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
</style>
