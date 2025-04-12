<script lang="ts">
  import { cn } from '$lib/utils/cn';
  
  interface AlertDescriptionProps {
    class?: string;
    [key: string]: any;
  }
  
  let props = $props();
  
  let className = props.class ?? '';
  
  // Forward all other props
  const { class: _, ...rest } = props;
</script>

<div
  class={cn('text-sm [&_p]:leading-relaxed', className)}
  {...rest}
>
  <slot />
</div>