<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import DataTable from '$lib/components/admin/data-table.svelte';
  import { auditLogService } from '$lib/services/audit-log-service';
  import type { Tribute } from '$lib/types/wp-models';
  
  // State
  let tributes: Tribute[] = [];
  let loading = true;
  let error: string | null = null;
  
  // Fetch tributes
  onMount(async () => {
    await fetchTributes();
  });
  
  // Fetch tributes from API
  async function fetchTributes() {
    try {
      loading = true;
      error = null;
      
      // Fetch tributes from API
      const response = await fetch('/api/tributes?per_page=100', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tributes: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch tributes');
      }
      
      tributes = result.tributes || [];
      loading = false;
    } catch (err) {
      console.error('Error fetching tributes:', err);
      error = err instanceof Error ? err.message : 'An unexpected error occurred';
      loading = false;
    }
  }
  
  // Update tribute status
  async function updateTributeStatus(tributeId: number, status: string) {
    try {
      // Find tribute
      const tribute = tributes.find(t => (t as any).tribute_id === tributeId || t.id === tributeId);
      if (!tribute) {
        throw new Error(`Tribute with ID ${tributeId} not found`);
      }
      
      // Get original status for audit log
      const originalStatus = tribute.status;
      
      // Update tribute in API
      const response = await fetch(`/api/tributes/${tributeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update tribute: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update tribute');
      }
      
      // Update local state
      tributes = tributes.map(t => {
        if ((t as any).tribute_id === tributeId || t.id === tributeId) {
          return { ...t, status };
        }
        return t;
      });
      
      // Log audit
      await auditLogService.logAction(
        'update',
        'tribute',
        tributeId,
        { status: { from: originalStatus, to: status } }
      );
      
      return true;
    } catch (err) {
      console.error(`Error updating tribute status:`, err);
      alert(`Failed to update tribute: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return false;
    }
  }
  
  // Delete tribute
  async function deleteTribute(tributeId: number) {
    if (!confirm('Are you sure you want to delete this tribute? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Find tribute for audit log
      const tribute = tributes.find(t => (t as any).tribute_id === tributeId || t.id === tributeId);
      if (!tribute) {
        throw new Error(`Tribute with ID ${tributeId} not found`);
      }
      
      // Delete tribute in API
      const response = await fetch(`/api/tributes/${tributeId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete tribute: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to delete tribute');
      }
      
      // Remove tribute from local state
      tributes = tributes.filter(t => (t as any).tribute_id !== tributeId && t.id !== tributeId);
      
      // Log audit
      await auditLogService.logAction(
        'delete',
        'tribute',
        tributeId,
        { tribute: { from: tribute, to: null } }
      );
    } catch (err) {
      console.error('Error deleting tribute:', err);
      alert(`Failed to delete tribute: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
  
  // Format date
  function formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (err) {
      return dateString;
    }
  }
  
  // Get tribute ID (handles both tribute_id and id properties)
  function getTributeId(tribute: Tribute): number {
    return (tribute as any).tribute_id || tribute.id;
  }
  
  // Table columns
  const columns = [
    {
      key: 'loved_one_name',
      label: 'Loved One Name',
      sortable: true,
      formatter: (value: string, tribute: Tribute) => {
        return `
          <div class="tribute-cell">
            <div class="tribute-name">${value}</div>
            <div class="tribute-id">ID: ${getTributeId(tribute)}</div>
          </div>
        `;
      }
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      formatter: (value: string) => formatDate(value)
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      formatter: (value: string) => {
        const status = value || 'draft';
        return `<span class="status-badge status-${status}">${status}</span>`;
      }
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      formatter: (value: string) => formatDate(value || '')
    },
    {
      key: 'updated_at',
      label: 'Updated',
      sortable: true,
      formatter: (value: string) => formatDate(value || '')
    }
  ];
  
  // Table actions
  const actions = [
    {
      label: 'View',
      onClick: (tribute: Tribute) => {
        const tributeId = getTributeId(tribute);
        window.open(`/celebration-of-life-for-${tribute.slug || tributeId}`, '_blank');
      }
    },
    {
      label: 'Edit',
      onClick: (tribute: Tribute) => {
        const tributeId = getTributeId(tribute);
        goto(`/dashboard/admin/tributes/${tributeId}/edit`);
      }
    },
    {
      label: 'Edit HTML',
      onClick: (tribute: Tribute) => {
        const tributeId = getTributeId(tribute);
        goto(`/dashboard/admin/tributes/${tributeId}/html`);
      }
    },
    {
      label: 'Publish',
      variant: 'primary' as const,
      onClick: (tribute: Tribute) => {
        const tributeId = getTributeId(tribute);
        updateTributeStatus(tributeId, 'published');
      },
      disabled: (tribute: Tribute) => tribute.status === 'published'
    },
    {
      label: 'Unpublish',
      variant: 'secondary' as const,
      onClick: (tribute: Tribute) => {
        const tributeId = getTributeId(tribute);
        updateTributeStatus(tributeId, 'draft');
      },
      disabled: (tribute: Tribute) => tribute.status !== 'published'
    },
    {
      label: 'Delete',
      variant: 'danger' as const,
      onClick: (tribute: Tribute) => {
        const tributeId = getTributeId(tribute);
        deleteTribute(tributeId);
      }
    }
  ];
</script>

<svelte:head>
  <title>Tribute Management | TributeStream Admin</title>
  <meta name="description" content="Manage tributes" />
</svelte:head>

<div class="tributes-page">
  <div class="page-header">
    <h1>Tribute Management</h1>
    <button class="create-button" on:click={() => goto('/dashboard/tributes/new')}>
      Create New Tribute
    </button>
  </div>
  
  <div class="tributes-table">
    <DataTable
      data={tributes}
      {columns}
      {actions}
      {loading}
      sortable={true}
      filterable={true}
      paginated={true}
      itemsPerPage={20}
      emptyMessage="No tributes found."
    />
  </div>
</div>

<style>
  .tributes-page {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  h1 {
    font-size: 1.75rem;
    font-weight: 600;
    color: #2d3748;
    margin: 0;
  }
  
  .create-button {
    padding: 0.5rem 1rem;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 0.25rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .create-button:hover {
    background-color: #3a80d2;
  }
  
  .tributes-table {
    margin-bottom: 2rem;
  }
  
  /* Tribute cell styling */
  :global(.tribute-cell) {
    display: flex;
    flex-direction: column;
  }
  
  :global(.tribute-id) {
    font-size: 0.75rem;
    color: #718096;
  }
  
  :global(.status-badge) {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: capitalize;
  }
  
  :global(.status-published) {
    background-color: #c6f6d5;
    color: #2f855a;
  }
  
  :global(.status-draft) {
    background-color: #e2e8f0;
    color: #4a5568;
  }
  
  :global(.status-pending) {
    background-color: #feebc8;
    color: #c05621;
  }
</style>