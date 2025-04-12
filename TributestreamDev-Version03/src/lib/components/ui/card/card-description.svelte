<script lang="ts">
  import { cn } from '$lib/utils/cn';
  
  interface CardDescriptionProps {
    class?: string;
    children?: () => any;
    [key: string]: any;
  }
  
  let { children = () => null, class: className = '', ...rest } = $props();
</script>

<p
  class={cn('text-sm text-muted-foreground', className)}
  {...rest}
>
  {@render children()}
</p>