<script lang="ts">
  import { cn } from '$lib/utils/cn';
  
  interface CardTitleProps {
    class?: string;
    children?: () => any;
    [key: string]: any;
  }
  
  let { children = () => null, class: className = '', ...rest } = $props();
</script>

<h3
  class={cn('text-lg font-semibold leading-none tracking-tight', className)}
  {...rest}
>
  {@render children()}
</h3>