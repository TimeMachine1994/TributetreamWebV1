<script lang="ts">
  /**
   * Reusable data table component for the admin interface
   * Supports sorting, filtering, and pagination
   */
  
  // Props
  export let data: any[] = [];
  export let columns: {
    key: string;
    label: string;
    sortable?: boolean;
    filterable?: boolean;
    formatter?: (value: any, row: any) => string;
    width?: string;
  }[] = [];
  export let actions: {
    label: string;
    icon?: string;
    onClick: (row: any) => void;
    disabled?: (row: any) => boolean;
    variant?: 'primary' | 'secondary' | 'danger';
  }[] = [];
  export let batchActions: {
    label: string;
    icon?: string;
    onClick: (rows: any[]) => void;
    disabled?: (rows: any[]) => boolean;
    variant?: 'primary' | 'secondary' | 'danger';
  }[] = [];
  export let sortable = true;
  export let filterable = true;
  export let paginated = true;
  export let selectable = false;
  export let itemsPerPage = 10;
  export let loading = false;
  export let emptyMessage = 'No data available';
  export let idField = 'id';
  
  // Internal state
  let sortField = '';
  let sortDirection: 'asc' | 'desc' = 'asc';
  let filters: Record<string, string> = {};
  let advancedFilters: {
    field: string;
    operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between' | 'in';
    value: any;
    value2?: any; // For 'between' operator
  }[] = [];
  let currentPage = 1;
  let searchQuery = '';
  let selectedRows: Record<string | number, boolean> = {};
  let allSelected = false;
  let showFilterPanel = false;
  let filterPresets: {
    name: string;
    filters: typeof advancedFilters;
  }[] = [
    {
      name: 'Active Users',
      filters: [{ field: 'status', operator: 'equals', value: 'active' }]
    },
    {
      name: 'Inactive Users',
      filters: [{ field: 'status', operator: 'equals', value: 'inactive' }]
    }
  ];
  
  // New filter being created
  let newFilter = {
    field: '',
    operator: 'equals' as const,
    value: '',
    value2: ''
  };
  
  // Reset pagination when data changes
  $: if (data) {
    currentPage = 1;
  }
  
  // Apply filters to data
  $: filteredData = applyFilters(data, filters, searchQuery, advancedFilters);
  
  // Apply sorting to filtered data
  $: sortedData = applySort(filteredData, sortField, sortDirection);
  
  // Apply pagination to sorted data
  $: paginatedData = applyPagination(sortedData, currentPage, itemsPerPage);
  
  // Calculate total pages
  $: totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  // Calculate page numbers to display
  $: pageNumbers = getPageNumbers(currentPage, totalPages);
  
  // Calculate selected rows
  $: selectedRowsArray = selectable ?
    filteredData.filter(row => selectedRows[row[idField]]) : [];
  
  // Calculate if all rows on current page are selected
  $: {
    if (paginatedData.length > 0 && selectable) {
      allSelected = paginatedData.every(row => selectedRows[row[idField]]);
    } else {
      allSelected = false;
    }
  }
  
  /**
   * Apply filters to data
   */
  function applyFilters(
    data: any[],
    filters: Record<string, string>,
    searchQuery: string,
    advancedFilters: typeof advancedFilters
  ): any[] {
    if (!data) return [];
    
    let result = [...data];
    
    // Apply column filters
    if (filterable && Object.keys(filters).length > 0) {
      result = result.filter(row => {
        return Object.entries(filters).every(([key, value]) => {
          if (!value) return true;
          
          const rowValue = getNestedValue(row, key);
          if (rowValue === undefined || rowValue === null) return false;
          
          return String(rowValue).toLowerCase().includes(value.toLowerCase());
        });
      });
    }
    
    // Apply global search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(row => {
        return columns.some(column => {
          const value = getNestedValue(row, column.key);
          if (value === undefined || value === null) return false;
          return String(value).toLowerCase().includes(query);
        });
      });
    }
    
    // Apply advanced filters
    if (advancedFilters.length > 0) {
      result = result.filter(row => {
        return advancedFilters.every(filter => {
          const value = getNestedValue(row, filter.field);
          
          if (value === undefined || value === null) {
            return false;
          }
          
          switch (filter.operator) {
            case 'equals':
              return String(value) === String(filter.value);
            case 'contains':
              return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
            case 'startsWith':
              return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase());
            case 'endsWith':
              return String(value).toLowerCase().endsWith(String(filter.value).toLowerCase());
            case 'greaterThan':
              return Number(value) > Number(filter.value);
            case 'lessThan':
              return Number(value) < Number(filter.value);
            case 'between':
              return Number(value) >= Number(filter.value) && Number(value) <= Number(filter.value2);
            case 'in':
              return filter.value.split(',').map((v: string) => v.trim()).includes(String(value));
            default:
              return true;
          }
        });
      });
    }
    
    return result;
  }
  
  /**
   * Apply sorting to data
   */
  function applySort(data: any[], field: string, direction: 'asc' | 'desc'): any[] {
    if (!data || !field || !sortable) return data;
    
    return [...data].sort((a, b) => {
      const aValue = getNestedValue(a, field);
      const bValue = getNestedValue(b, field);
      
      // Handle undefined or null values
      if (aValue === undefined || aValue === null) return direction === 'asc' ? -1 : 1;
      if (bValue === undefined || bValue === null) return direction === 'asc' ? 1 : -1;
      
      // Compare dates
      if (aValue instanceof Date && bValue instanceof Date) {
        return direction === 'asc' 
          ? aValue.getTime() - bValue.getTime() 
          : bValue.getTime() - aValue.getTime();
      }
      
      // Compare strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      // Compare numbers
      return direction === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }
  
  /**
   * Apply pagination to data
   */
  function applyPagination(data: any[], page: number, itemsPerPage: number): any[] {
    if (!data || !paginated) return data;
    
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    
    return data.slice(start, end);
  }
  
  /**
   * Handle sort click
   */
  function handleSort(column: typeof columns[0]) {
    if (!sortable || !column.sortable) return;
    
    if (sortField === column.key) {
      // Toggle direction if already sorting by this field
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new sort field and default to ascending
      sortField = column.key;
      sortDirection = 'asc';
    }
  }
  
  /**
   * Handle filter change
   */
  function handleFilterChange(column: typeof columns[0], value: string) {
    if (!filterable || !column.filterable) return;
    
    if (value) {
      filters = { ...filters, [column.key]: value };
    } else {
      const { [column.key]: _, ...rest } = filters;
      filters = rest;
    }
    
    // Reset to first page when filter changes
    currentPage = 1;
  }
  
  /**
   * Handle search query change
   */
  function handleSearchChange() {
    // Reset to first page when search changes
    currentPage = 1;
  }
  
  /**
   * Go to a specific page
   */
  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
  }
  
  /**
   * Get page numbers to display
   */
  function getPageNumbers(current: number, total: number): number[] {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    
    if (current <= 3) {
      return [1, 2, 3, 4, 5, -1, total];
    }
    
    if (current >= total - 2) {
      return [1, -1, total - 4, total - 3, total - 2, total - 1, total];
    }
    
    return [1, -1, current - 1, current, current + 1, -1, total];
  }
  
  /**
   * Get nested value from object
   */
  function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : null;
    }, obj);
  }
  
  /**
   * Add a new advanced filter
   */
  function addAdvancedFilter() {
    if (!newFilter.field || !newFilter.value) {
      return;
    }
    
    advancedFilters = [
      ...advancedFilters,
      {
        field: newFilter.field,
        operator: newFilter.operator,
        value: newFilter.value,
        value2: newFilter.operator === 'between' ? newFilter.value2 : undefined
      }
    ];
    
    // Reset form
    newFilter = {
      field: '',
      operator: 'equals',
      value: '',
      value2: ''
    };
    
    // Reset to first page
    currentPage = 1;
  }
  
  /**
   * Remove an advanced filter
   */
  function removeAdvancedFilter(index: number) {
    advancedFilters = advancedFilters.filter((_, i) => i !== index);
    
    // Reset to first page
    currentPage = 1;
  }
  
  /**
   * Clear all advanced filters
   */
  function clearAdvancedFilters() {
    advancedFilters = [];
    
    // Reset to first page
    currentPage = 1;
  }
  
  /**
   * Apply a filter preset
   */
  function applyFilterPreset(preset: typeof filterPresets[0]) {
    advancedFilters = [...preset.filters];
    
    // Reset to first page
    currentPage = 1;
  }
  
  /**
   * Format cell value
   */
  function formatCellValue(row: any, column: typeof columns[0]): string {
    const value = getNestedValue(row, column.key);
    
    if (column.formatter) {
      return column.formatter(value, row);
    }
    
    if (value === undefined || value === null) {
      return '';
    }
    
    if (value instanceof Date) {
      return value.toLocaleString();
    }
    
    return String(value);
  }
  
  /**
   * Toggle selection of a single row
   */
  function toggleRowSelection(row: any) {
    if (!selectable) return;
    
    const id = row[idField];
    selectedRows = {
      ...selectedRows,
      [id]: !selectedRows[id]
    };
  }
  
  /**
   * Toggle selection of all rows on current page
   */
  function toggleAllSelection() {
    if (!selectable) return;
    
    if (allSelected) {
      // Deselect all rows on current page
      const newSelectedRows = { ...selectedRows };
      paginatedData.forEach(row => {
        delete newSelectedRows[row[idField]];
      });
      selectedRows = newSelectedRows;
    } else {
      // Select all rows on current page
      const newSelectedRows = { ...selectedRows };
      paginatedData.forEach(row => {
        newSelectedRows[row[idField]] = true;
      });
      selectedRows = newSelectedRows;
    }
  }
  
  /**
   * Clear all selections
   */
  function clearSelection() {
    selectedRows = {};
  }
  
  /**
   * Execute a batch action
   */
  function executeBatchAction(action: typeof batchActions[0]) {
    if (action.disabled && action.disabled(selectedRowsArray)) {
      return;
    }
    
    action.onClick(selectedRowsArray);
    
    // Optionally clear selection after action
    // clearSelection();
  }
</script>

<div class="data-table-container">
  <div class="table-header">
    <div class="table-actions">
      {#if filterable}
        <div class="search-box">
          <input
            type="text"
            placeholder="Search..."
            bind:value={searchQuery}
            on:input={handleSearchChange}
          />
        </div>
        
        <button
          class="filter-button"
          class:active={showFilterPanel}
          on:click={() => showFilterPanel = !showFilterPanel}
        >
          <span class="filter-icon">🔍</span>
          Advanced Filters
          {#if advancedFilters.length > 0}
            <span class="filter-count">{advancedFilters.length}</span>
          {/if}
        </button>
      {/if}
    </div>
    
    {#if selectable && selectedRowsArray.length > 0 && batchActions.length > 0}
      <div class="batch-actions">
        <span class="selected-count">{selectedRowsArray.length} item{selectedRowsArray.length !== 1 ? 's' : ''} selected</span>
        {#each batchActions as action}
          <button
            class="batch-action-button"
            class:primary={action.variant === 'primary'}
            class:secondary={action.variant === 'secondary' || !action.variant}
            class:danger={action.variant === 'danger'}
            disabled={action.disabled ? action.disabled(selectedRowsArray) : false}
            on:click={() => executeBatchAction(action)}
          >
            {#if action.icon}
              <span class="action-icon">{action.icon}</span>
            {/if}
            {action.label}
          </button>
        {/each}
        <button
          class="clear-selection-button"
          on:click={clearSelection}
        >
          Clear selection
        </button>
      </div>
    {/if}
  </div>
  
  {#if showFilterPanel}
    <div class="filter-panel">
      <div class="filter-panel-header">
        <h3>Advanced Filters</h3>
        
        {#if advancedFilters.length > 0}
          <button class="clear-filters-button" on:click={clearAdvancedFilters}>
            Clear All Filters
          </button>
        {/if}
      </div>
      
      {#if filterPresets.length > 0}
        <div class="filter-presets">
          <h4>Presets</h4>
          <div class="preset-buttons">
            {#each filterPresets as preset}
              <button
                class="preset-button"
                on:click={() => applyFilterPreset(preset)}
              >
                {preset.name}
              </button>
            {/each}
          </div>
        </div>
      {/if}
      
      <div class="active-filters">
        {#if advancedFilters.length > 0}
          <h4>Active Filters</h4>
          <div class="filter-list">
            {#each advancedFilters as filter, i}
              <div class="filter-item">
                <span class="filter-text">
                  <strong>{filter.field}</strong>
                  {#if filter.operator === 'equals'}
                    equals
                  {:else if filter.operator === 'contains'}
                    contains
                  {:else if filter.operator === 'startsWith'}
                    starts with
                  {:else if filter.operator === 'endsWith'}
                    ends with
                  {:else if filter.operator === 'greaterThan'}
                    greater than
                  {:else if filter.operator === 'lessThan'}
                    less than
                  {:else if filter.operator === 'between'}
                    between
                  {:else if filter.operator === 'in'}
                    in
                  {/if}
                  <strong>{filter.value}</strong>
                  {#if filter.operator === 'between' && filter.value2}
                    and <strong>{filter.value2}</strong>
                  {/if}
                </span>
                <button
                  class="remove-filter-button"
                  on:click={() => removeAdvancedFilter(i)}
                >
                  ×
                </button>
              </div>
            {/each}
          </div>
        {:else}
          <p class="no-filters">No active filters</p>
        {/if}
      </div>
      
      <div class="add-filter">
        <h4>Add Filter</h4>
        <div class="filter-form">
          <div class="filter-form-row">
            <div class="filter-form-field">
              <label for="filter-field">Field</label>
              <select id="filter-field" bind:value={newFilter.field}>
                <option value="">Select field</option>
                {#each columns as column}
                  <option value={column.key}>{column.label}</option>
                {/each}
              </select>
            </div>
            
            <div class="filter-form-field">
              <label for="filter-operator">Operator</label>
              <select id="filter-operator" bind:value={newFilter.operator}>
                <option value="equals">Equals</option>
                <option value="contains">Contains</option>
                <option value="startsWith">Starts with</option>
                <option value="endsWith">Ends with</option>
                <option value="greaterThan">Greater than</option>
                <option value="lessThan">Less than</option>
                <option value="between">Between</option>
                <option value="in">In (comma separated)</option>
              </select>
            </div>
          </div>
          
          <div class="filter-form-row">
            <div class="filter-form-field">
              <label for="filter-value">Value</label>
              <input
                type="text"
                id="filter-value"
                bind:value={newFilter.value}
                placeholder="Enter value"
              />
            </div>
            
            {#if newFilter.operator === 'between'}
              <div class="filter-form-field">
                <label for="filter-value2">Second Value</label>
                <input
                  type="text"
                  id="filter-value2"
                  bind:value={newFilter.value2}
                  placeholder="Enter second value"
                />
              </div>
            {/if}
          </div>
          
          <div class="filter-form-actions">
            <button
              class="add-filter-button"
              disabled={!newFilter.field || !newFilter.value}
              on:click={addAdvancedFilter}
            >
              Add Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
  
  <div class="table-wrapper">
    <table class="data-table">
      <thead>
        <tr>
          {#if selectable}
            <th class="selection-column">
              <input
                type="checkbox"
                checked={allSelected}
                on:change={toggleAllSelection}
              />
            </th>
          {/if}
          {#each columns as column}
            <th
              class:sortable={sortable && column.sortable}
              class:sorted={sortField === column.key}
              style={column.width ? `width: ${column.width}` : ''}
              on:click={() => handleSort(column)}
            >
              <div class="th-content">
                <span>{column.label}</span>
                {#if sortable && column.sortable}
                  <span class="sort-indicator">
                    {#if sortField === column.key}
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    {:else}
                      <span class="sort-icon">⇅</span>
                    {/if}
                  </span>
                {/if}
              </div>
              
              {#if filterable && column.filterable}
                <div class="column-filter">
                  <input 
                    type="text" 
                    placeholder="Filter..." 
                    value={filters[column.key] || ''}
                    on:input={(e) => handleFilterChange(column, e.currentTarget.value)}
                  />
                </div>
              {/if}
            </th>
          {/each}
          
          {#if actions.length > 0}
            <th class="actions-column">Actions</th>
          {/if}
        </tr>
      </thead>
      
      <tbody>
        {#if loading}
          <tr class="loading-row">
            <td colspan={columns.length + (actions.length > 0 ? 1 : 0)}>
              <div class="loading-indicator">Loading data...</div>
            </td>
          </tr>
        {:else if paginatedData.length === 0}
          <tr class="empty-row">
            <td colspan={columns.length + (actions.length > 0 ? 1 : 0)}>
              <div class="empty-message">{emptyMessage}</div>
            </td>
          </tr>
        {:else}
          {#each paginatedData as row, i (row[idField] || i)}
            <tr class:selected={selectable && selectedRows[row[idField]]}>
              {#if selectable}
                <td class="selection-cell">
                  <input
                    type="checkbox"
                    checked={selectedRows[row[idField]] || false}
                    on:change={() => toggleRowSelection(row)}
                  />
                </td>
              {/if}
              {#each columns as column}
                <td>{formatCellValue(row, column)}</td>
              {/each}
              
              {#if actions.length > 0}
                <td class="actions-cell">
                  {#each actions as action}
                    <button 
                      class="action-button"
                      class:primary={action.variant === 'primary'}
                      class:secondary={action.variant === 'secondary' || !action.variant}
                      class:danger={action.variant === 'danger'}
                      disabled={action.disabled ? action.disabled(row) : false}
                      on:click={() => action.onClick(row)}
                    >
                      {#if action.icon}
                        <span class="action-icon">{action.icon}</span>
                      {/if}
                      {action.label}
                    </button>
                  {/each}
                </td>
              {/if}
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
  
  {#if paginated && totalPages > 1}
    <div class="pagination">
      <button 
        class="pagination-button"
        disabled={currentPage === 1}
        on:click={() => goToPage(currentPage - 1)}
      >
        Previous
      </button>
      
      {#each pageNumbers as pageNum}
        {#if pageNum === -1}
          <span class="pagination-ellipsis">...</span>
        {:else}
          <button 
            class="pagination-button"
            class:active={currentPage === pageNum}
            on:click={() => goToPage(pageNum)}
          >
            {pageNum}
          </button>
        {/if}
      {/each}
      
      <button 
        class="pagination-button"
        disabled={currentPage === totalPages}
        on:click={() => goToPage(currentPage + 1)}
      >
        Next
      </button>
    </div>
  {/if}
</div>

<style>
  .data-table-container {
    width: 100%;
    overflow: hidden;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    background-color: white;
  }
  
  .table-header {
    padding: 1rem;
    background-color: #f8f9fa;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .batch-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.5rem;
    background-color: #ebf8ff;
    border-radius: 0.25rem;
    border: 1px solid #bee3f8;
  }
  
  .selected-count {
    font-weight: 500;
    color: #2b6cb0;
    margin-right: 0.5rem;
  }
  
  .batch-action-button {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.5rem;
    border: none;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .batch-action-button.primary {
    background-color: #4a90e2;
    color: white;
  }
  
  .batch-action-button.secondary {
    background-color: #e2e8f0;
    color: #4a5568;
  }
  
  .batch-action-button.danger {
    background-color: #f56565;
    color: white;
  }
  
  .batch-action-button:hover:not(:disabled) {
    opacity: 0.9;
  }
  
  .batch-action-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .clear-selection-button {
    margin-left: auto;
    background: none;
    border: none;
    color: #4a5568;
    font-size: 0.75rem;
    cursor: pointer;
    text-decoration: underline;
  }
  
  .clear-selection-button:hover {
    color: #2d3748;
  }
  
  /* Filter panel styles */
  .filter-panel {
    background-color: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-bottom: 1rem;
    padding: 1rem;
  }
  
  .filter-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .filter-panel-header h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #2d3748;
    margin: 0;
  }
  
  .clear-filters-button {
    background: none;
    border: none;
    color: #e53e3e;
    font-size: 0.875rem;
    cursor: pointer;
    text-decoration: underline;
  }
  
  .filter-presets {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .filter-presets h4 {
    font-size: 0.875rem;
    font-weight: 600;
    color: #4a5568;
    margin: 0 0 0.5rem 0;
  }
  
  .preset-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .preset-button {
    padding: 0.25rem 0.5rem;
    background-color: #edf2f7;
    border: 1px solid #e2e8f0;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    color: #4a5568;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .preset-button:hover {
    background-color: #e2e8f0;
  }
  
  .active-filters {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .active-filters h4 {
    font-size: 0.875rem;
    font-weight: 600;
    color: #4a5568;
    margin: 0 0 0.5rem 0;
  }
  
  .no-filters {
    font-size: 0.875rem;
    color: #a0aec0;
    font-style: italic;
    margin: 0;
  }
  
  .filter-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .filter-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem;
    background-color: #ebf8ff;
    border: 1px solid #bee3f8;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    color: #2b6cb0;
  }
  
  .filter-text {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  .remove-filter-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    background-color: #bee3f8;
    border: none;
    border-radius: 50%;
    font-size: 0.75rem;
    font-weight: 600;
    color: #2b6cb0;
    cursor: pointer;
  }
  
  .add-filter h4 {
    font-size: 0.875rem;
    font-weight: 600;
    color: #4a5568;
    margin: 0 0 0.5rem 0;
  }
  
  .filter-form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .filter-form-row {
    display: flex;
    gap: 0.75rem;
  }
  
  .filter-form-field {
    flex: 1;
    min-width: 0;
  }
  
  .filter-form-field label {
    display: block;
    font-size: 0.75rem;
    font-weight: 500;
    color: #4a5568;
    margin-bottom: 0.25rem;
  }
  
  .filter-form-field select,
  .filter-form-field input {
    width: 100%;
    padding: 0.375rem 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.25rem;
    font-size: 0.875rem;
  }
  
  .filter-form-actions {
    display: flex;
    justify-content: flex-end;
  }
  
  .add-filter-button {
    padding: 0.375rem 0.75rem;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .add-filter-button:hover:not(:disabled) {
    background-color: #3a80d2;
  }
  
  .add-filter-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .table-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  
  .search-box {
    flex: 1;
    min-width: 200px;
  }
  
  .search-box input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.25rem;
    font-size: 0.875rem;
  }
  
  .filter-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background-color: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #4a5568;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .filter-button:hover {
    background-color: #e2e8f0;
  }
  
  .filter-button.active {
    background-color: #ebf8ff;
    border-color: #bee3f8;
    color: #2b6cb0;
  }
  
  .filter-icon {
    font-size: 0.875rem;
  }
  
  .filter-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    background-color: #4a90e2;
    color: white;
    border-radius: 50%;
    font-size: 0.75rem;
    font-weight: 600;
  }
  
  .table-wrapper {
    overflow-x: auto;
  }
  
  .data-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
  }
  
  th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #4a5568;
    position: relative;
  }
  
  th.sortable {
    cursor: pointer;
  }
  
  th.sortable:hover {
    background-color: #edf2f7;
  }
  
  th.sorted {
    background-color: #ebf4ff;
  }
  
  .th-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .sort-indicator {
    margin-left: 0.5rem;
    font-size: 0.75rem;
  }
  
  .sort-icon {
    opacity: 0.5;
  }
  
  .column-filter {
    margin-top: 0.5rem;
  }
  
  .column-filter input {
    width: 100%;
    padding: 0.25rem 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.25rem;
    font-size: 0.75rem;
  }
  
  tr:hover {
    background-color: #f8f9fa;
  }
  
  tr.selected {
    background-color: #ebf8ff;
  }
  
  tr.selected:hover {
    background-color: #e6f6ff;
  }
  
  .selection-column {
    width: 40px;
    text-align: center;
  }
  
  .selection-cell {
    text-align: center;
  }
  
  .loading-row, .empty-row {
    height: 200px;
  }
  
  .loading-indicator, .empty-message {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #a0aec0;
  }
  
  .actions-column {
    width: 1%;
    white-space: nowrap;
  }
  
  .actions-cell {
    display: flex;
    gap: 0.5rem;
    white-space: nowrap;
  }
  
  .action-button {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.5rem;
    border: none;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .action-button.primary {
    background-color: #4a90e2;
    color: white;
  }
  
  .action-button.secondary {
    background-color: #e2e8f0;
    color: #4a5568;
  }
  
  .action-button.danger {
    background-color: #f56565;
    color: white;
  }
  
  .action-button:hover {
    opacity: 0.9;
  }
  
  .action-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .action-icon {
    margin-right: 0.25rem;
  }
  
  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background-color: #f8f9fa;
    border-top: 1px solid #e2e8f0;
  }
  
  .pagination-button {
    padding: 0.25rem 0.5rem;
    margin: 0 0.25rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.25rem;
    background-color: white;
    color: #4a5568;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .pagination-button:hover:not(:disabled) {
    background-color: #edf2f7;
  }
  
  .pagination-button.active {
    background-color: #4a90e2;
    color: white;
    border-color: #4a90e2;
  }
  
  .pagination-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .pagination-ellipsis {
    margin: 0 0.25rem;
    color: #a0aec0;
  }
</style>