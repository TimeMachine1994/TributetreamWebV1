<script lang="ts">
  import { cn } from '$lib/utils/cn';
  
  interface CardFooterProps {
    class?: string;
    children?: () => any;
    [key: string]: any;
  }
  
  let { children = () => null, class: className = '', ...rest } = $props();
</script>

<div
  class={cn('flex items-center p-6 pt-0', className)}
  {...rest}
>
  {@render children()}
</div>