<script lang="ts">
  import { cn } from '$lib/utils/cn';
  
  interface LabelProps {
    for?: string;
    class?: string;
    [key: string]: any;
  }
  
  let props = $props();
  
  let className = props.class ?? '';
  let htmlFor = props.for;
  
  // Forward all other props
  const { class: _, for: __, ...rest } = props;
</script>

<label
  {htmlFor}
  class={cn(
    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
    className
  )}
  {...rest}
>
  <slot />
</label>