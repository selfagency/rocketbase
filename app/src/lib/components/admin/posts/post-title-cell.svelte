<script lang="ts">
  let {
    title,
    id,
  }: {
    title: string;
    id: string;
  } = $props();
</script>

<a
  href={`/admin/posts/${id}`}
  class="rounded-sm font-medium underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
>
  {title || 'Untitled'}
</a>
