<script lang="ts">
  import { cn } from '$lib/utils/cn';
  
  interface AlertTitleProps {
    class?: string;
    [key: string]: any;
  }
  
  let props = $props();
  
  let className = props.class ?? '';
  
  // Forward all other props
  const { class: _, ...rest } = props;
</script>

<h5
  class={cn('mb-1 font-medium leading-none tracking-tight', className)}
  {...rest}
>
  <slot />
</h5>