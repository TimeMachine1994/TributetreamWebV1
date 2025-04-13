<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  /**
   * Toast notification component
   * Displays a message with optional title, type, and auto-dismiss
   */
  
  // Props
  export let type: 'success' | 'error' | 'info' | 'warning' = 'info';
  export let title: string | undefined = undefined;
  export let message: string;
  export let duration = 5000; // Auto-dismiss after 5 seconds by default
  export let showClose = true;
  export let id = crypto.randomUUID();
  
  // Event dispatcher
  const dispatch = createEventDispatcher<{
    close: { id: string };
  }>();
  
  // Auto-dismiss timer
  let timer: ReturnType<typeof setTimeout> | null = null;
  
  // Set up auto-dismiss
  if (duration > 0) {
    timer = setTimeout(() => {
      closeToast();
    }, duration);
  }
  
  // Close toast
  function closeToast() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    
    dispatch('close', { id });
  }
  
  // Icons for different toast types
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  };
  
  // Clean up on component destruction
  import { onDestroy } from 'svelte';
  
  onDestroy(() => {
    if (timer) {
      clearTimeout(timer);
    }
  });
</script>

<div 
  class="toast-container {type}"
  in:fly={{ y: 20, duration: 300 }}
  out:fade={{ duration: 200 }}
  role="alert"
>
  <div class="toast-icon">
    {icons[type]}
  </div>
  
  <div class="toast-content">
    {#if title}
      <div class="toast-title">{title}</div>
    {/if}
    <div class="toast-message">{message}</div>
  </div>
  
  {#if showClose}
    <button 
      class="toast-close" 
      on:click={closeToast}
      aria-label="Close notification"
    >
      ✕
    </button>
  {/if}
</div>

<style>
  .toast-container {
    display: flex;
    align-items: flex-start;
    padding: 1rem;
    border-radius: 0.375rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-bottom: 0.75rem;
    width: 100%;
    max-width: 24rem;
    background-color: white;
    border-left: 4px solid;
  }
  
  .toast-container.success {
    border-left-color: #48bb78;
  }
  
  .toast-container.error {
    border-left-color: #f56565;
  }
  
  .toast-container.info {
    border-left-color: #4299e1;
  }
  
  .toast-container.warning {
    border-left-color: #ed8936;
  }
  
  .toast-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    margin-right: 0.75rem;
    flex-shrink: 0;
    font-weight: bold;
  }
  
  .success .toast-icon {
    background-color: #c6f6d5;
    color: #2f855a;
  }
  
  .error .toast-icon {
    background-color: #fed7d7;
    color: #c53030;
  }
  
  .info .toast-icon {
    background-color: #bee3f8;
    color: #2b6cb0;
  }
  
  .warning .toast-icon {
    background-color: #feebc8;
    color: #c05621;
  }
  
  .toast-content {
    flex-grow: 1;
    margin-right: 0.5rem;
  }
  
  .toast-title {
    font-weight: 600;
    margin-bottom: 0.25rem;
    color: #2d3748;
  }
  
  .toast-message {
    color: #4a5568;
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
  
  .toast-close {
    background: none;
    border: none;
    color: #a0aec0;
    cursor: pointer;
    padding: 0;
    font-size: 1rem;
    line-height: 1;
    transition: color 0.2s;
  }
  
  .toast-close:hover {
    color: #4a5568;
  }
</style>