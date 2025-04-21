<script lang="ts">
  import { cn } from '$lib/utils/cn';
  
  export let type = 'text';
  export let value = '';
  export let placeholder = '';
  export let disabled = false;
  export let required = false;
  export let name = '';
  export let id = '';
  export let className = '';
  export let error = false;
  
  let inputClass: string;
  
  $: {
    inputClass = cn(
      'flex h-10 w-full rounded-md border px-3 py-2',
      'bg-white text-sm text-gray-900 transition-colors',
      'placeholder:text-gray-400',
      'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400',
      error ? 'border-red-500' : 'border-gray-300',
      disabled ? 'opacity-50 cursor-not-allowed' : '',
      className
    );
  }
</script>

<input
  {type}
  bind:value
  {placeholder}
  {disabled}
  {required}
  {name}
  {id}
  class={inputClass}
  aria-invalid={error}
  on:blur
  on:focus
  on:input
  on:change
  {...$$restProps}
/>