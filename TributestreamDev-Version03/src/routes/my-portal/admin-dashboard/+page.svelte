<script lang="ts">
  import { setTributeStoreContext } from '$lib/stores/tribute-store.svelte';
  import DataTable from '$lib/components/admin/data-table.svelte';
  import HtmlEditor from '$lib/components/admin/html-editor.svelte';
  import { fade } from 'svelte/transition';
  import { onMount } from 'svelte';
  
  // Initialize tribute store
  const tributeStore = setTributeStoreContext();
  
  // State
  let view = $state('list');
  let selectedTributeId = $state<number | null>(null);
  let htmlContent = $state('');
  let isLoading = $state(false);
  let isSaving = $state(false);
  let errorMessage = $state('');
  let successMessage = $state('');
  let showPreview = $state(false);
  let showConfirmDialog = $state(false);
  let selectedTributeName = $state('');
  
  // Table columns
  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'loved_one_name', label: 'Name', sortable: true, filterable: true },
    { key: 'date', label: 'Created', sortable: true },
    { key: 'modified', label: 'Updated', sortable: true }
  ];
  
  // Table actions
  const actions = [
    {
      label: 'Edit HTML',
      variant: 'primary' as const,
      onClick: (row: any) => {
        console.log('[admin-dashboard] Edit HTML clicked for row:', row);
        console.log('[admin-dashboard] Row ID:', row.id);
        console.log('[admin-dashboard] Row tribute_id:', row.tribute_id);
        console.log('[admin-dashboard] Row properties:', Object.keys(row));
        
        // Check which ID field is available
        const tributeId = row.id !== undefined ? row.id : row.tribute_id;
        console.log('[admin-dashboard] Using tribute ID:', tributeId);
        
        selectedTributeId = tributeId;
        loadHtmlContent(tributeId);
        view = 'edit';
      }
    }
  ];
  // Load tributes on mount
  onMount(async () => {
    console.log('[admin-dashboard] onMount called, fetching tributes');
    try {
      const result = await tributeStore.getTributes();
      console.log('[admin-dashboard] getTributes result:', result);
      console.log('[admin-dashboard] tributeStore.searchResults after getTributes:', tributeStore.searchResults);
      console.log('[admin-dashboard] Tributes length:', tributeStore.searchResults.tributes?.length || 0);
      
      // Log the first tribute with all its properties
      if (result.tributes && result.tributes.length > 0) {
        console.log('[admin-dashboard] First tribute:', result.tributes[0]);
        console.log('[admin-dashboard] First tribute ID:', result.tributes[0].id);
        console.log('[admin-dashboard] First tribute tribute_id:', result.tributes[0].tribute_id);
        console.log('[admin-dashboard] First tribute properties:', Object.keys(result.tributes[0]));
        
        // Check if there's a tribute_id property instead of id
        if (result.tributes[0].tribute_id !== undefined) {
          console.log('[admin-dashboard] Found tribute_id property:', result.tributes[0].tribute_id);
        }
      } else {
        console.log('[admin-dashboard] No tributes found');
      }
    } catch (error) {
      console.error('[admin-dashboard] Error fetching tributes:', error);
    }
  });
  
  // Load HTML content for a tribute
  async function loadHtmlContent(tributeId: number | string) {
    isLoading = true;
    errorMessage = '';
    
    console.log('[admin-dashboard] loadHtmlContent called with tributeId:', tributeId);
    console.log('[admin-dashboard] tributeId type:', typeof tributeId);
    
    try {
      // Fetch the tribute
      console.log('[admin-dashboard] Calling tributeStore.fetchTribute with ID:', tributeId);
      const tribute = await tributeStore.fetchTribute(tributeId);
      console.log('[admin-dashboard] Fetch tribute result:', tribute);
      
      if (tribute) {
        // Handle both v1 and v2 API field names
        htmlContent = tribute.custom_html || tribute.page_html || '';
        selectedTributeName = tribute.loved_one_name || tribute.loved_ones_name || '';
      } else {
        errorMessage = 'Failed to load tribute';
      }
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'An error occurred while loading tribute';
      console.error(error);
    } finally {
      isLoading = false;
    }
  }
  
  // Show confirmation dialog before saving
  function confirmSave() {
    showConfirmDialog = true;
  }
  
  // Save HTML content
  async function saveHtmlContent() {
    if (!selectedTributeId) return;
    
    // Close confirmation dialog if open
    showConfirmDialog = false;
    
    isSaving = true;
    errorMessage = '';
    successMessage = '';
    
    try {
      // Update the tribute
      // Include both field names for compatibility with v1 and v2 APIs
      const result = await tributeStore.updateTribute(selectedTributeId, {
        custom_html: htmlContent,
        page_html: htmlContent // v2 API field name
      });
      
      if (result) {
        successMessage = 'HTML content saved successfully';
      } else {
        errorMessage = 'Failed to save HTML content';
      }
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'An error occurred while saving HTML content';
      console.error(error);
    } finally {
      isSaving = false;
    }
  }
  
  // Go back to list view
  function goBack() {
    if (htmlContent.trim() !== '') {
      showConfirmDialog = true;
    } else {
      resetAndGoBack();
    }
  }
  
  // Reset state and go back to list view
  function resetAndGoBack() {
    showConfirmDialog = false;
    view = 'list';
    selectedTributeId = null;
    htmlContent = '';
    errorMessage = '';
    successMessage = '';
    selectedTributeName = '';
  }
</script>

<div class="admin-dashboard">
  <header class="dashboard-header">
    <h1>Tribute Management</h1>
  </header>
  
  <main class="dashboard-content">
    {#if view === 'list'}
      <div class="list-view">
        <h2>Tributes</h2>
        {#if tributeStore.isLoading}
          <div class="loading-indicator">Loading tributes...</div>
        {:else}
          <div class="debug-info">
            <p>Tributes count: {tributeStore.searchResults.tributes?.length || 0}</p>
            <p>Loading state: {tributeStore.isLoading ? 'Loading' : 'Not loading'}</p>
            <p>Store state: {tributeStore.state}</p>
            <p>Error: {tributeStore.error || 'None'}</p>
          </div>
          <DataTable
            data={tributeStore.searchResults.tributes || []}
            {columns}
            {actions}
            loading={tributeStore.isLoading}
            emptyMessage="No tributes found"
          />
        {/if}
      </div>
    {:else if view === 'edit' && selectedTributeId}
      <div class="edit-view">
        <div class="edit-header">
          <h2>Edit Tribute HTML</h2>
          <div class="actions">
            <button class="back-button" on:click={goBack}>Back to List</button>
            <button
              class="preview-button"
              on:click={() => showPreview = !showPreview}
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            <button class="save-button" on:click={confirmSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
        
        {#if errorMessage}
          <div class="error-message">{errorMessage}</div>
        {/if}
        
        {#if successMessage}
          <div class="success-message">{successMessage}</div>
        {/if}
        
        <div class="editor-container">
          {#if isLoading}
            <div class="loading">Loading content...</div>
          {:else if showPreview}
            <div class="preview-container">
              <h3 class="preview-title">Preview</h3>
              <div class="preview-content">
                {@html htmlContent}
              </div>
            </div>
          {:else}
            <HtmlEditor
              bind:value={htmlContent}
              height={600}
              plugins="code table lists link image media preview"
              toolbar="undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link image media | code preview"
            />
          {/if}
        </div>
        
        <!-- Confirmation Dialog -->
        {#if showConfirmDialog}
          <div class="overlay" transition:fade={{ duration: 150 }}>
            <div class="confirm-dialog" transition:fade={{ duration: 200 }}>
              <h3 class="confirm-title">Confirm Action</h3>
              <p class="confirm-message">
                {view === 'edit'
                  ? `Are you sure you want to save changes to "${selectedTributeName}"?`
                  : `You have unsaved changes. Are you sure you want to go back?`}
              </p>
              <div class="confirm-actions">
                <button class="cancel-button" on:click={() => showConfirmDialog = false}>
                  Cancel
                </button>
                {#if view === 'edit'}
                  <button class="confirm-button" on:click={saveHtmlContent}>
                    Save Changes
                  </button>
                {:else}
                  <button class="confirm-button" on:click={resetAndGoBack}>
                    Discard Changes
                  </button>
                {/if}
              </div>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </main>
</div>

<style>
  .admin-dashboard {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  
  .dashboard-header {
    background-color: #2c3e50;
    color: white;
    padding: 1rem 2rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .dashboard-header h1 {
    margin: 0;
    font-size: 1.5rem;
  }
  
  .dashboard-content {
    flex: 1;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }
  
  .list-view, .edit-view {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
  }
  
  .edit-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .actions {
    display: flex;
    gap: 0.75rem;
  }
  
  .back-button {
    padding: 0.5rem 1rem;
    background-color: #e2e8f0;
    color: #4a5568;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .back-button:hover {
    background-color: #cbd5e0;
  }
  
  .preview-button {
    padding: 0.5rem 1rem;
    background-color: #edf2f7;
    color: #4a5568;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .preview-button:hover {
    background-color: #e2e8f0;
  }
  
  .save-button {
    padding: 0.5rem 1rem;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .save-button:hover:not(:disabled) {
    background-color: #3a80d2;
  }
  
  .save-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .error-message {
    padding: 0.75rem;
    background-color: #fed7d7;
    color: #c53030;
    border-radius: 0.25rem;
    margin-bottom: 1rem;
  }
  
  .success-message {
    padding: 0.75rem;
    background-color: #c6f6d5;
    color: #2f855a;
    border-radius: 0.25rem;
    margin-bottom: 1rem;
  }
  
  .editor-container {
    border: 1px solid #e2e8f0;
    border-radius: 0.25rem;
  }
  
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 400px;
    background-color: #f8f9fa;
    color: #a0aec0;
  }
  
  .preview-container {
    padding: 1.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.25rem;
    background-color: white;
  }
  
  .preview-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-top: 0;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .preview-content {
    min-height: 400px;
    overflow-y: auto;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 0.25rem;
  }
  
  /* Confirmation Dialog Styles */
  .overlay {
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
  }
  
  .confirm-dialog {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
    width: 90%;
    max-width: 500px;
    padding: 1.5rem;
  }
  
  .confirm-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-top: 0;
    margin-bottom: 1rem;
  }
  
  .confirm-message {
    margin-bottom: 1.5rem;
    color: #4a5568;
  }
  
  .confirm-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }
  
  .cancel-button {
    padding: 0.5rem 1rem;
    background-color: #e2e8f0;
    color: #4a5568;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .cancel-button:hover {
    background-color: #cbd5e0;
  }
  
  .confirm-button {
    padding: 0.5rem 1rem;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .confirm-button:hover {
    background-color: #3a80d2;
  }
</style>