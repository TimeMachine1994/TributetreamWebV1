<script lang="ts">
  import { cn } from '$lib/utils/cn';
  
  interface InputProps {
    type?: string;
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    readonly?: boolean;
    class?: string;
    id?: string;
    name?: string;
    autocomplete?: string;
    [key: string]: any;
  }
  
  let props = $props();
  
  let type = props.type ?? 'text';
  let value = props.value ?? '';
  let className = props.class ?? '';
  
  // Forward all other props
  const { class: _, type: __, value: ___, ...rest } = props;
</script>

<input
  {type}
  bind:value
  class={cn(
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    className
  )}
  {...rest}
  on:blur
  on:change
  on:click
  on:focus
  on:input
  on:keydown
  on:keypress
  on:keyup
  on:mouseover
  on:mouseenter
  on:mouseleave
/>