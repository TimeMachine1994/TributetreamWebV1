<script lang="ts">
  import { cn } from '$lib/utils/cn';
  
  interface CardProps {
    class?: string;
    children?: () => any;
    [key: string]: any;
  }
  
  let { children = () => null, class: className = '', ...rest } = $props();
</script>

<div
  class={cn(
    'rounded-lg border bg-card text-card-foreground shadow-sm',
    className
  )}
  {...rest}
>
  {@render children()}
</div>