<script lang="ts">
  import * as Tooltip from '$lib/components/ui/tooltip';

  let {
    component,
    props = {},
  }: {
    component: any;
    props?: Record<string, unknown>;
  } = $props();

  const Component = component;
</script>

<Tooltip.Provider>
  <Component {...props} />
</Tooltip.Provider>
