<script lang="ts">
  import { toastStore, type Toast } from '$lib/stores/toast-store';
  import ToastComponent from './toast.svelte';

  /**
   * Toast container component
   * Displays all active toast notifications
   */
  
  // Position of the toast container
  export let position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center' = 'top-right';
  
  // Maximum number of toasts to show at once
  export let maxToasts = 5;
  
  // Get toasts from store
  let toasts: Toast[] = [];
  
  // Subscribe to toast store
  toastStore.subscribe((value: Toast[]) => {
    // Limit the number of toasts
    toasts = value.slice(0, maxToasts);
  });
  
  // Handle toast close
  function handleClose(event: CustomEvent<{ id: string }>) {
    const { id } = event.detail;
    toastStore.remove(id);
  }
  
  // Position classes
  const positionClasses = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'top-center': 'top-0 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2'
  };
</script>

<div class="toast-container {positionClasses[position]}">
  {#each toasts as toast (toast.id)}
    <ToastComponent
      id={toast.id as any}
      type={toast.type}
      title={toast.title}
      message={toast.message}
      duration={toast.duration}
      showClose={toast.showClose}
      on:close={handleClose}
    />
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    z-index: 9999;
    pointer-events: none;
    max-width: 100%;
  }
  
  .toast-container :global(.toast-container) {
    pointer-events: auto;
  }
</style>