<script lang="ts">
  import { cn } from '$lib/utils/cn';
  
  interface CardContentProps {
    class?: string;
    children?: () => any;
    [key: string]: any;
  }
  
  let { children = () => null, class: className = '', ...rest } = $props();
</script>

<div
  class={cn('p-6 pt-0', className)}
  {...rest}
>
  {@render children()}
</div>