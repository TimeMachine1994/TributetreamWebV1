<script lang="ts">
  /**
   * Inline editing component for the admin interface
   * Supports different input types and handles saving changes
   */
  
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  
  // Props
  export let value: any = '';
  export let type: 'text' | 'textarea' | 'select' | 'number' | 'date' | 'email' | 'password' = 'text';
  export let options: { value: any; label: string }[] = [];
  export let placeholder = '';
  export let disabled = false;
  export let loading = false;
  export let saveOnBlur = true;
  export let rows = 3; // For textarea
  export let maxLength: number | undefined = undefined;
  export let minLength: number | undefined = undefined;
  export let min: number | undefined = undefined; // For number input
  export let max: number | undefined = undefined; // For number input
  export let step: number | undefined = undefined; // For number input
  export let required = false;
  export let pattern: string | undefined = undefined; // For text input
  export let autoFocus = true;
  
  // Internal state
  let editing = false;
  let editValue = value;
  let error: string | null = null;
  let inputElement: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  
  // Event dispatcher
  const dispatch = createEventDispatcher<{
    edit: { value: any };
    save: { value: any; oldValue: any };
    cancel: { value: any };
    error: { error: string };
  }>();
  
  // Watch for external value changes
  $: if (!editing && value !== editValue) {
    editValue = value;
  }
  
  /**
   * Start editing
   */
  function startEdit() {
    if (disabled || loading) return;
    
    editing = true;
    editValue = value;
    error = null;
    
    // Focus the input after it's rendered
    if (autoFocus) {
      setTimeout(() => {
        if (inputElement) {
          inputElement.focus();
          
          // Select all text for text inputs
          if (type === 'text' || type === 'email' || type === 'number') {
            (inputElement as HTMLInputElement).select();
          }
        }
      }, 0);
    }
    
    dispatch('edit', { value });
  }
  
  /**
   * Cancel editing
   */
  function cancelEdit() {
    editing = false;
    editValue = value;
    error = null;
    
    dispatch('cancel', { value });
  }
  
  /**
   * Save changes
   */
  async function saveEdit() {
    if (disabled || loading) return;
    
    // Validate
    if (required && (editValue === null || editValue === undefined || editValue === '')) {
      error = 'This field is required';
      dispatch('error', { error });
      return;
    }
    
    if (type === 'text' || type === 'email' || type === 'password') {
      if (minLength !== undefined && editValue.length < minLength) {
        error = `Minimum length is ${minLength} characters`;
        dispatch('error', { error });
        return;
      }
      
      if (maxLength !== undefined && editValue.length > maxLength) {
        error = `Maximum length is ${maxLength} characters`;
        dispatch('error', { error });
        return;
      }
      
      if (pattern && !new RegExp(pattern).test(editValue)) {
        error = 'Invalid format';
        dispatch('error', { error });
        return;
      }
    }
    
    if (type === 'number') {
      const numValue = Number(editValue);
      
      if (isNaN(numValue)) {
        error = 'Please enter a valid number';
        dispatch('error', { error });
        return;
      }
      
      if (min !== undefined && numValue < min) {
        error = `Minimum value is ${min}`;
        dispatch('error', { error });
        return;
      }
      
      if (max !== undefined && numValue > max) {
        error = `Maximum value is ${max}`;
        dispatch('error', { error });
        return;
      }
    }
    
    // Dispatch save event
    const oldValue = value;
    dispatch('save', { value: editValue, oldValue });
    
    // Exit edit mode
    editing = false;
    error = null;
  }
  
  /**
   * Handle key press
   */
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      cancelEdit();
    } else if (event.key === 'Enter' && type !== 'textarea') {
      saveEdit();
    }
  }
  
  /**
   * Handle blur
   */
  function handleBlur() {
    if (saveOnBlur) {
      saveEdit();
    }
  }
  
  /**
   * Format display value
   */
  function formatDisplayValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    if (type === 'select') {
      const option = options.find(opt => opt.value === value);
      return option ? option.label : '';
    }
    
    if (type === 'date' && value instanceof Date) {
      return value.toLocaleDateString();
    }
    
    if (type === 'password') {
      return '••••••••';
    }
    
    return String(value);
  }
</script>

<div class="inline-edit" class:disabled class:editing>
  {#if editing}
    <div class="edit-container" transition:fade={{ duration: 150 }}>
      {#if type === 'textarea'}
        <textarea
          bind:this={inputElement}
          bind:value={editValue}
          {placeholder}
          {rows}
          maxlength={maxLength}
          minlength={minLength}
          {required}
          {disabled}
          on:keydown={handleKeyDown}
          on:blur={handleBlur}
        ></textarea>
      {:else if type === 'select'}
        <select
          bind:this={inputElement}
          bind:value={editValue}
          {required}
          {disabled}
          on:change={saveEdit}
          on:blur={handleBlur}
        >
          {#each options as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      {:else}
        <input
          bind:this={inputElement}
          type={type}
          bind:value={editValue}
          {placeholder}
          maxlength={maxLength}
          minlength={minLength}
          {required}
          {pattern}
          {disabled}
          min={min !== undefined ? min : null}
          max={max !== undefined ? max : null}
          step={step !== undefined ? step : null}
          on:keydown={handleKeyDown}
          on:blur={handleBlur}
        />
      {/if}
      
      {#if !saveOnBlur}
        <div class="edit-actions">
          <button 
            type="button" 
            class="save-button" 
            on:click={saveEdit}
            disabled={disabled || loading}
          >
            {#if loading}
              <span class="loading-indicator"></span>
            {:else}
              ✓
            {/if}
          </button>
          <button 
            type="button" 
            class="cancel-button" 
            on:click={cancelEdit}
            disabled={disabled || loading}
          >
            ✕
          </button>
        </div>
      {/if}
      
      {#if error}
        <div class="error-message">{error}</div>
      {/if}
    </div>
  {:else}
    <div 
      class="display-value" 
      class:empty={!value} 
      on:click={startEdit}
      on:keydown={(e) => e.key === 'Enter' && startEdit()}
      tabindex={disabled ? -1 : 0}
      role="button"
      aria-label="Edit value"
    >
      {#if value}
        {formatDisplayValue(value)}
      {:else}
        <span class="placeholder">{placeholder || 'Click to edit'}</span>
      {/if}
    </div>
  {/if}
</div>

<style>
  .inline-edit {
    position: relative;
    width: 100%;
  }
  
  .inline-edit.disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .display-value {
    padding: 0.5rem;
    min-height: 1.5rem;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .display-value:hover {
    background-color: #f7fafc;
  }
  
  .display-value:focus {
    outline: 2px solid #4a90e2;
    outline-offset: 2px;
  }
  
  .display-value.empty {
    color: #a0aec0;
    font-style: italic;
  }
  
  .placeholder {
    color: #a0aec0;
    font-style: italic;
  }
  
  .edit-container {
    position: relative;
  }
  
  input, textarea, select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.25rem;
    font-size: 1rem;
    background-color: white;
  }
  
  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
  }
  
  textarea {
    resize: vertical;
    min-height: 5rem;
  }
  
  .edit-actions {
    display: flex;
    gap: 0.25rem;
    margin-top: 0.5rem;
  }
  
  .save-button, .cancel-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .save-button {
    background-color: #48bb78;
    color: white;
  }
  
  .cancel-button {
    background-color: #f56565;
    color: white;
  }
  
  .save-button:hover {
    background-color: #38a169;
  }
  
  .cancel-button:hover {
    background-color: #e53e3e;
  }
  
  .save-button:disabled, .cancel-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .error-message {
    margin-top: 0.25rem;
    color: #e53e3e;
    font-size: 0.75rem;
  }
  
  .loading-indicator {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>