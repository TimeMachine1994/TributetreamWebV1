<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import HtmlEditor from '$lib/components/admin/html-editor.svelte';
  import { auditLogService } from '$lib/services/audit-log-service';
  import type { Tribute } from '$lib/types/wp-models';
  
  // State
  let tribute: Tribute | null = null;
  let htmlContent = '';
  let originalHtmlContent = '';
  let loading = true;
  let saving = false;
  let error: string | null = null;
  let successMessage: string | null = null;
  
  // Get tribute ID from URL
  const tributeId = $page.params.id;
  
  // Fetch tribute
  onMount(async () => {
    await fetchTribute();
  });
  
  // Fetch tribute from API
  async function fetchTribute() {
    try {
      loading = true;
      error = null;
      
      // Fetch tribute from API
      const response = await fetch(`/api/tributes/${tributeId}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tribute: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch tribute');
      }
      
      tribute = result.tribute;
      htmlContent = tribute ? (tribute as any).content || '' : '';
      originalHtmlContent = htmlContent;
      loading = false;
    } catch (err) {
      console.error('Error fetching tribute:', err);
      error = err instanceof Error ? err.message : 'An unexpected error occurred';
      loading = false;
    }
  }
  
  // Save HTML content
  async function saveHtmlContent() {
    if (!tribute) return;
    
    try {
      saving = true;
      error = null;
      successMessage = null;
      
      // Update tribute in API
      const response = await fetch(`/api/tributes/${tributeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: htmlContent }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update tribute: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update tribute');
      }
      
      // Log audit
      await auditLogService.logAction(
        'update',
        'tribute',
        parseInt(tributeId),
        { content: { from: '(HTML content)', to: '(HTML content updated)' } }
      );
      
      originalHtmlContent = htmlContent;
      successMessage = 'HTML content saved successfully';
      saving = false;
    } catch (err) {
      console.error('Error saving HTML content:', err);
      error = err instanceof Error ? err.message : 'An unexpected error occurred';
      saving = false;
    }
  }
  
  // Check if content has changed
  $: contentChanged = htmlContent !== originalHtmlContent;
  
  // Handle before unload
  function handleBeforeUnload(event: BeforeUnloadEvent) {
    if (contentChanged) {
      event.preventDefault();
      return (event.returnValue = 'You have unsaved changes. Are you sure you want to leave?');
    }
  }
  
  // Add beforeunload event listener
  onMount(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  });
  
  // Preview tribute
  function previewTribute() {
    if (!tribute) return;
    
    window.open(`/celebration-of-life-for-${tribute.slug || tributeId}`, '_blank');
  }
</script>

<svelte:head>
  <title>Edit HTML | TributeStream Admin</title>
  <meta name="description" content="Edit tribute HTML content" />
</svelte:head>

<div class="html-editor-page">
  <div class="page-header">
    <div class="header-left">
      <button class="back-button" on:click={() => goto('/dashboard/admin/tributes')}>
        ← Back to Tributes
      </button>
      <h1>{tribute ? `Edit HTML: ${tribute.loved_one_name}` : 'Edit HTML'}</h1>
    </div>
    
    <div class="header-actions">
      <button 
        class="preview-button" 
        on:click={previewTribute}
        disabled={loading || !tribute}
      >
        Preview
      </button>
      
      <button 
        class="save-button" 
        on:click={saveHtmlContent}
        disabled={loading || saving || !contentChanged}
      >
        {#if saving}
          Saving...
        {:else}
          Save Changes
        {/if}
      </button>
    </div>
  </div>
  
  {#if error}
    <div class="error-message">
      <p>{error}</p>
    </div>
  {/if}
  
  {#if successMessage}
    <div class="success-message">
      <p>{successMessage}</p>
    </div>
  {/if}
  
  <div class="editor-container">
    {#if loading}
      <div class="loading-indicator">
        <p>Loading tribute content...</p>
      </div>
    {:else}
      <HtmlEditor 
        bind:value={htmlContent}
        height={600}
        plugins="code table lists link image media preview searchreplace visualblocks fullscreen"
        toolbar="undo redo | formatselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media | removeformat | code fullscreen"
      />
    {/if}
  </div>
  
  <div class="editor-footer">
    <p class="help-text">
      Use the editor toolbar to format text, add images, links, and more. Click the "Code" button to edit the HTML directly.
    </p>
  </div>
</div>

<style>
  .html-editor-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .header-left {
    display: flex;
    flex-direction: column;
  }
  
  .back-button {
    background: none;
    border: none;
    color: #4a90e2;
    font-size: 0.875rem;
    padding: 0;
    margin-bottom: 0.5rem;
    cursor: pointer;
    text-align: left;
  }
  
  h1 {
    font-size: 1.75rem;
    font-weight: 600;
    color: #2d3748;
    margin: 0;
  }
  
  .header-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .preview-button {
    padding: 0.5rem 1rem;
    background-color: #e2e8f0;
    color: #4a5568;
    border: none;
    border-radius: 0.25rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .save-button {
    padding: 0.5rem 1rem;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 0.25rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .preview-button:hover:not(:disabled) {
    background-color: #cbd5e0;
  }
  
  .save-button:hover:not(:disabled) {
    background-color: #3a80d2;
  }
  
  .preview-button:disabled,
  .save-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .error-message {
    padding: 0.75rem 1rem;
    background-color: #fed7d7;
    color: #c53030;
    border-radius: 0.25rem;
    margin-bottom: 1rem;
  }
  
  .success-message {
    padding: 0.75rem 1rem;
    background-color: #c6f6d5;
    color: #2f855a;
    border-radius: 0.25rem;
    margin-bottom: 1rem;
  }
  
  .error-message p,
  .success-message p {
    margin: 0;
  }
  
  .editor-container {
    margin-bottom: 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.25rem;
    overflow: hidden;
  }
  
  .loading-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 600px;
    background-color: #f8f9fa;
    color: #718096;
  }
  
  .editor-footer {
    margin-top: 1rem;
  }
  
  .help-text {
    font-size: 0.875rem;
    color: #718096;
    margin: 0;
  }
</style>