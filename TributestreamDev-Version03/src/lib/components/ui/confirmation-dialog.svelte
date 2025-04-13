<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  /**
   * Confirmation dialog component
   * Used for confirming destructive actions
   */
  
  // Props
  export let title = 'Confirm Action';
  export let message = 'Are you sure you want to proceed?';
  export let confirmText = 'Confirm';
  export let cancelText = 'Cancel';
  export let type: 'danger' | 'warning' | 'info' = 'danger';
  export let open = false;
  
  // Event dispatcher
  const dispatch = createEventDispatcher<{
    confirm: void;
    cancel: void;
  }>();
  
  // Handle confirm
  function handleConfirm() {
    dispatch('confirm');
    open = false;
  }
  
  // Handle cancel
  function handleCancel() {
    dispatch('cancel');
    open = false;
  }
  
  // Handle click outside
  function handleClickOutside(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      handleCancel();
    }
  }
  
  // Handle escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleCancel();
    } else if (event.key === 'Enter') {
      handleConfirm();
    }
  }
  
  // Focus trap
  let dialogElement: HTMLDivElement;
  let focusableElements: HTMLElement[];
  let firstFocusable: HTMLElement;
  let lastFocusable: HTMLElement;
  
  onMount(() => {
    if (open) {
      setupFocusTrap();
    }
  });
  
  // Set up focus trap when dialog opens
  $: if (open && dialogElement) {
    setTimeout(() => {
      setupFocusTrap();
      firstFocusable?.focus();
    }, 50);
  }
  
  // Set up focus trap
  function setupFocusTrap() {
    if (!dialogElement) return;
    
    focusableElements = Array.from(
      dialogElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[];
    
    firstFocusable = focusableElements[0];
    lastFocusable = focusableElements[focusableElements.length - 1];
  }
  
  // Handle tab key for focus trap
  function handleTabKey(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;
    
    if (event.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        event.preventDefault();
      }
    }
  }
</script>

<svelte:window on:keydown={open ? handleKeydown : null} />

{#if open}
  <div 
    class="dialog-overlay"
    on:click={handleClickOutside}
    transition:fade={{ duration: 200 }}
  >
    <div 
      class="dialog-content {type}"
      bind:this={dialogElement}
      on:keydown={handleTabKey}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div class="dialog-header">
        <h2 id="dialog-title">{title}</h2>
      </div>
      
      <div class="dialog-body">
        <p>{message}</p>
      </div>
      
      <div class="dialog-footer">
        <button 
          type="button" 
          class="cancel-button" 
          on:click={handleCancel}
        >
          {cancelText}
        </button>
        
        <button 
          type="button" 
          class="confirm-button {type}" 
          on:click={handleConfirm}
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }
  
  .dialog-content {
    background-color: white;
    border-radius: 0.5rem;
    width: 100%;
    max-width: 28rem;
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  
  .dialog-content.danger {
    border-top: 4px solid #f56565;
  }
  
  .dialog-content.warning {
    border-top: 4px solid #ed8936;
  }
  
  .dialog-content.info {
    border-top: 4px solid #4299e1;
  }
  
  .dialog-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .dialog-header h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2d3748;
    margin: 0;
  }
  
  .dialog-body {
    padding: 1.5rem;
  }
  
  .dialog-body p {
    margin: 0;
    color: #4a5568;
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid #e2e8f0;
    background-color: #f8f9fa;
  }
  
  .cancel-button,
  .confirm-button {
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .cancel-button {
    background-color: #e2e8f0;
    color: #4a5568;
    border: none;
  }
  
  .confirm-button {
    border: none;
    color: white;
  }
  
  .confirm-button.danger {
    background-color: #f56565;
  }
  
  .confirm-button.warning {
    background-color: #ed8936;
  }
  
  .confirm-button.info {
    background-color: #4299e1;
  }
  
  .cancel-button:hover {
    background-color: #cbd5e0;
  }
  
  .confirm-button.danger:hover {
    background-color: #e53e3e;
  }
  
  .confirm-button.warning:hover {
    background-color: #dd6b20;
  }
  
  .confirm-button.info:hover {
    background-color: #3182ce;
  }
</style>