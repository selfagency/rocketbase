<script lang="ts">
  let {
    title,
    id,
  }: {
    title: string;
    id: string;
  } = $props();
</script>

<a href={`/admin/posts/${id}`} class="font-medium hover:underline">{title || 'Untitled'}</a>
