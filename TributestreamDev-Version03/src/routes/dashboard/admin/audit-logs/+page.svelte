<script lang="ts">
  import { onMount } from 'svelte';
  import { auditLogService, type AuditLogEntry } from '$lib/services/audit-log-service';
  import DataTable from '$lib/components/admin/data-table.svelte';
  
  // State
  let auditLogs: AuditLogEntry[] = [];
  let loading = true;
  let error: string | null = null;
  
  // Filter state
  let entityType = '';
  let userId = '';
  let action = '';
  let startDate = '';
  let endDate = '';
  
  // Fetch audit logs
  onMount(async () => {
    await fetchAuditLogs();
  });
  
  // Fetch audit logs with filters
  async function fetchAuditLogs() {
    try {
      loading = true;
      error = null;
      
      // Build query parameters
      const params: Record<string, any> = {
        page: 1,
        per_page: 100 // Get a large number for client-side pagination
      };
      
      // Add filters if they exist
      if (entityType) params.entity_type = entityType;
      if (userId) params.user_id = userId;
      if (action) params.action = action;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      // Fetch audit logs
      auditLogs = await auditLogService.getAuditLogs(params);
      
      loading = false;
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      error = err instanceof Error ? err.message : 'An unexpected error occurred';
      loading = false;
    }
  }
  
  // Handle filter change
  function handleFilterChange() {
    fetchAuditLogs();
  }
  
  // Clear filters
  function clearFilters() {
    entityType = '';
    userId = '';
    action = '';
    startDate = '';
    endDate = '';
    fetchAuditLogs();
  }
  
  // Format timestamp
  function formatTimestamp(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (err) {
      return timestamp;
    }
  }
  
  // Format changes
  function formatChanges(changes: Record<string, { from: any; to: any }>): string {
    try {
      const changesList = Object.entries(changes).map(([key, { from, to }]) => {
        return `${key}: ${from} → ${to}`;
      });
      
      return changesList.join(', ');
    } catch (err) {
      return JSON.stringify(changes);
    }
  }
  
  // Table columns
  const columns = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      formatter: (value: string) => formatTimestamp(value)
    },
    {
      key: 'user_name',
      label: 'User',
      sortable: true
    },
    {
      key: 'action',
      label: 'Action',
      sortable: true
    },
    {
      key: 'entity_type',
      label: 'Entity Type',
      sortable: true
    },
    {
      key: 'entity_id',
      label: 'Entity ID',
      sortable: true
    },
    {
      key: 'changes',
      label: 'Changes',
      sortable: false,
      formatter: (value: Record<string, { from: any; to: any }>) => formatChanges(value)
    }
  ];
  
  // Table actions
  const actions = [
    {
      label: 'View Details',
      onClick: (log: AuditLogEntry) => {
        // Show details in a modal or navigate to details page
        alert(`Audit Log Details:\n${JSON.stringify(log, null, 2)}`);
      }
    }
  ];
</script>

<svelte:head>
  <title>Audit Logs | TributeStream Admin</title>
  <meta name="description" content="View audit logs of administrative actions" />
</svelte:head>

<div class="audit-logs-page">
  <div class="page-header">
    <h1>Audit Logs</h1>
    <p class="description">
      View a record of all administrative actions performed in the system.
    </p>
  </div>
  
  <div class="filters">
    <div class="filter-group">
      <label for="entity-type">Entity Type</label>
      <select id="entity-type" bind:value={entityType} on:change={handleFilterChange}>
        <option value="">All</option>
        <option value="user">User</option>
        <option value="tribute">Tribute</option>
      </select>
    </div>
    
    <div class="filter-group">
      <label for="action">Action</label>
      <select id="action" bind:value={action} on:change={handleFilterChange}>
        <option value="">All</option>
        <option value="create">Create</option>
        <option value="update">Update</option>
        <option value="delete">Delete</option>
      </select>
    </div>
    
    <div class="filter-group">
      <label for="start-date">Start Date</label>
      <input 
        type="date" 
        id="start-date" 
        bind:value={startDate} 
        on:change={handleFilterChange}
      />
    </div>
    
    <div class="filter-group">
      <label for="end-date">End Date</label>
      <input 
        type="date" 
        id="end-date" 
        bind:value={endDate} 
        on:change={handleFilterChange}
      />
    </div>
    
    <button class="clear-button" on:click={clearFilters}>Clear Filters</button>
  </div>
  
  <div class="audit-logs-table">
    <DataTable
      data={auditLogs}
      {columns}
      {actions}
      {loading}
      sortable={true}
      filterable={true}
      paginated={true}
      itemsPerPage={20}
      emptyMessage="No audit logs found. Try adjusting your filters."
    />
  </div>
</div>

<style>
  .audit-logs-page {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .page-header {
    margin-bottom: 1.5rem;
  }
  
  h1 {
    font-size: 1.75rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 0.5rem;
  }
  
  .description {
    color: #718096;
    margin-bottom: 1.5rem;
  }
  
  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 0.5rem;
  }
  
  .filter-group {
    display: flex;
    flex-direction: column;
    min-width: 200px;
  }
  
  .filter-group label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #4a5568;
    margin-bottom: 0.25rem;
  }
  
  .filter-group select,
  .filter-group input {
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.25rem;
    font-size: 0.875rem;
  }
  
  .clear-button {
    align-self: flex-end;
    padding: 0.5rem 1rem;
    background-color: #e2e8f0;
    color: #4a5568;
    border: none;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .clear-button:hover {
    background-color: #cbd5e0;
  }
  
  .audit-logs-table {
    margin-bottom: 2rem;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .filters {
      flex-direction: column;
    }
    
    .filter-group {
      width: 100%;
    }
  }
</style>