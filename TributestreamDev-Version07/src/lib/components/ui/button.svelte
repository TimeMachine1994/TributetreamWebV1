<script lang="ts">
  import { cn } from '$lib/utils/cn';
  
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let variant: 'default' | 'primary' | 'outline' | 'ghost' | 'link' = 'default';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let disabled = false;
  export let className = '';
  
  let buttonClass: string;
  
  $: {
    const variantClass = {
      default: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      outline: 'border border-gray-300 hover:bg-gray-100 text-gray-800',
      ghost: 'hover:bg-gray-100 text-gray-800',
      link: 'text-blue-600 hover:underline p-0 height-auto'
    }[variant];
    
    const sizeClass = {
      sm: 'py-1 px-3 text-sm',
      md: 'py-2 px-4',
      lg: 'py-3 px-6 text-lg'
    }[size];
    
    buttonClass = cn(
      'inline-flex items-center justify-center rounded-md font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
      'disabled:opacity-50 disabled:pointer-events-none',
      variantClass,
      sizeClass,
      className
    );
  }
</script>

<button 
  {type} 
  class={buttonClass} 
  {disabled} 
  on:click 
  {...$$restProps}
>
  <slot />
</button>