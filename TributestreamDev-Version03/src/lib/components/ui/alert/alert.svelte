<script lang="ts">
  import { cn } from '$lib/utils/cn';
  
  interface AlertProps {
    variant?: 'default' | 'destructive';
    class?: string;
    [key: string]: any;
  }
  
  let props = $props();
  
  let variant = props.variant ?? 'default';
  let className = props.class ?? '';
  
  // Forward all other props
  const { class: _, variant: __, ...rest } = props;
  
  const variantStyles: Record<string, string> = {
    default: 'bg-background text-foreground',
    destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive'
  };
</script>

<div
  class={cn(
    'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
    variantStyles[variant],
    className
  )}
  role="alert"
  {...rest}
>
  <slot />
</div>