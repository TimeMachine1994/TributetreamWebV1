<script lang="ts">
  import { cn } from '$lib/utils/cn';
  
  interface CardHeaderProps {
    class?: string;
    children?: () => any;
    [key: string]: any;
  }
  
  let { children = () => null, class: className = '', ...rest } = $props();
</script>

<div
  class={cn('flex flex-col space-y-1.5 p-6', className)}
  {...rest}
>
  {@render children()}
</div>