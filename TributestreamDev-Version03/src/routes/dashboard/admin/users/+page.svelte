<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import DataTable from '$lib/components/admin/data-table.svelte';
  import InlineEdit from '$lib/components/admin/inline-edit.svelte';
  import { auditLogService } from '$lib/services/audit-log-service';
  import ConfirmationDialog from '$lib/components/ui/confirmation-dialog.svelte';
  import { toastStore } from '$lib/stores/toast-store';
  
  // Define User interface
  interface User {
    id: number;
    username: string;
    email: string;
    name: string;
    display_name: string;
    roles: string[];
    status: 'active' | 'inactive' | 'pending';
    created_at: string;
    last_login?: string;
  }
  
  // State
  let users: User[] = [];
  let loading = true;
  let error: string | null = null;
  let showCreateModal = false;
  let showDeleteConfirmation = false;
  let userToDelete: User | null = null;
  let usersToDelete: User[] = [];
  let showBatchDeleteConfirmation = false;
  let newUser = {
    username: '',
    email: '',
    name: '',
    display_name: '',
    roles: ['subscriber'],
    password: ''
  };
  
  // Fetch users
  onMount(async () => {
    await fetchUsers();
  });
  
  // Fetch users from API
  async function fetchUsers() {
    try {
      loading = true;
      error = null;
      
      // Fetch users from API
      const response = await fetch('/api/users', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch users');
      }
      
      users = result.users || [];
      loading = false;
    } catch (err) {
      console.error('Error fetching users:', err);
      error = err instanceof Error ? err.message : 'An unexpected error occurred';
      loading = false;
    }
  }
  
  // Update user field
  async function updateUserField(userId: number, field: string, value: any) {
    try {
      // Find user
      const user = users.find(u => u.id === userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
      
      // Get original value for audit log
      const originalValue = user[field as keyof User];
      
      // Update user in API
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [field]: value }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update user');
      }
      
      // Update local state
      users = users.map(u => {
        if (u.id === userId) {
          return { ...u, [field]: value };
        }
        return u;
      });
      
      // Log audit
      await auditLogService.logAction(
        'update',
        'user',
        userId,
        { [field]: { from: originalValue, to: value } }
      );
      
      return true;
    } catch (err) {
      console.error(`Error updating user field ${field}:`, err);
      alert(`Failed to update user: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return false;
    }
  }
  
  // Create user
  async function createUser() {
    try {
      // Validate required fields
      if (!newUser.username || !newUser.email || !newUser.password) {
        alert('Username, email, and password are required');
        return;
      }
      
      // Create user in API
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create user: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to create user');
      }
      
      // Add new user to local state
      users = [...users, result.user];
      
      // Log audit
      await auditLogService.logAction(
        'create',
        'user',
        result.user.id,
        { user: { from: null, to: result.user } }
      );
      
      // Reset form and close modal
      newUser = {
        username: '',
        email: '',
        name: '',
        display_name: '',
        roles: ['subscriber'],
        password: ''
      };
      showCreateModal = false;
      
      // Refresh users list
      await fetchUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      alert(`Failed to create user: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
  
  // Delete user with confirmation
  function confirmDeleteUser(user: User) {
    userToDelete = user;
    showDeleteConfirmation = true;
  }
  
  // Delete user
  async function deleteUser() {
    if (!userToDelete) return;
    
    try {
      const userId = userToDelete.id;
      
      // Delete user in API
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to delete user');
      }
      
      // Remove user from local state
      users = users.filter(u => u.id !== userId);
      
      // Log audit
      await auditLogService.logAction(
        'delete',
        'user',
        userId,
        { user: { from: userToDelete, to: null } }
      );
      
      // Show success toast
      toastStore.success(`User ${userToDelete.username} deleted successfully`);
      
      // Reset state
      userToDelete = null;
      showDeleteConfirmation = false;
    } catch (err) {
      console.error('Error deleting user:', err);
      toastStore.error(`Failed to delete user: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
  
  // Batch delete users
  function confirmBatchDeleteUsers(selectedUsers: User[]) {
    usersToDelete = selectedUsers;
    showBatchDeleteConfirmation = true;
  }
  
  // Delete multiple users
  async function batchDeleteUsers() {
    if (usersToDelete.length === 0) return;
    
    try {
      let successCount = 0;
      let errorCount = 0;
      
      // Delete each user
      for (const user of usersToDelete) {
        try {
          const response = await fetch(`/api/users/${user.id}`, {
            method: 'DELETE',
            credentials: 'include'
          });
          
          if (!response.ok) {
            throw new Error(`Failed to delete user: ${response.status}`);
          }
          
          const result = await response.json();
          
          if (!result.success) {
            throw new Error(result.message || 'Failed to delete user');
          }
          
          // Log audit
          await auditLogService.logAction(
            'delete',
            'user',
            user.id,
            { user: { from: user, to: null } }
          );
          
          successCount++;
        } catch (err) {
          console.error(`Error deleting user ${user.id}:`, err);
          errorCount++;
        }
      }
      
      // Update local state - remove all successfully deleted users
      users = users.filter(u => !usersToDelete.some(du => du.id === u.id));
      
      // Show toast with results
      if (successCount > 0 && errorCount === 0) {
        toastStore.success(`Successfully deleted ${successCount} users`);
      } else if (successCount > 0 && errorCount > 0) {
        toastStore.warning(`Deleted ${successCount} users, but failed to delete ${errorCount} users`);
      } else {
        toastStore.error(`Failed to delete any users`);
      }
      
      // Reset state
      usersToDelete = [];
      showBatchDeleteConfirmation = false;
    } catch (err) {
      console.error('Error in batch delete:', err);
      toastStore.error(`Batch delete operation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
  
  // Reset password
  async function resetPassword(userId: number) {
    const newPassword = prompt('Enter new password (minimum 8 characters):');
    
    if (!newPassword) {
      return;
    }
    
    if (newPassword.length < 8) {
      toastStore.error('Password must be at least 8 characters long');
      return;
    }
    
    try {
      // Update password in API
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: newPassword }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to reset password: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to reset password');
      }
      
      // Log audit (don't log the actual password)
      await auditLogService.logAction(
        'update',
        'user',
        userId,
        { password: { from: '********', to: '********' } }
      );
      
      toastStore.success('Password reset successfully');
    } catch (err) {
      console.error('Error resetting password:', err);
      toastStore.error(`Failed to reset password: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
  
  // Batch reset status
  async function batchUpdateStatus(users: User[], newStatus: 'active' | 'inactive' | 'pending') {
    try {
      let successCount = 0;
      let errorCount = 0;
      
      // Update each user
      for (const user of users) {
        try {
          // Skip if already has the target status
          if (user.status === newStatus) {
            continue;
          }
          
          const originalStatus = user.status;
          
          // Update user in API
          const response = await fetch(`/api/users/${user.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus }),
            credentials: 'include'
          });
          
          if (!response.ok) {
            throw new Error(`Failed to update user: ${response.status}`);
          }
          
          const result = await response.json();
          
          if (!result.success) {
            throw new Error(result.message || 'Failed to update user');
          }
          
          // Log audit
          await auditLogService.logAction(
            'update',
            'user',
            user.id,
            { status: { from: originalStatus, to: newStatus } }
          );
          
          successCount++;
        } catch (err) {
          console.error(`Error updating user ${user.id}:`, err);
          errorCount++;
        }
      }
      
      // Update local state
      if (successCount > 0) {
        users = users.map(u => {
          if (users.some(selectedUser => selectedUser.id === u.id)) {
            return { ...u, status: newStatus };
          }
          return u;
        });
      }
      
      // Show toast with results
      if (successCount > 0 && errorCount === 0) {
        toastStore.success(`Successfully updated ${successCount} users to ${newStatus}`);
      } else if (successCount > 0 && errorCount > 0) {
        toastStore.warning(`Updated ${successCount} users, but failed to update ${errorCount} users`);
      } else {
        toastStore.error(`Failed to update any users`);
      }
      
      // Refresh users list
      await fetchUsers();
    } catch (err) {
      console.error('Error in batch update:', err);
      toastStore.error(`Batch update operation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
  
  // Format date
  function formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Never';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (err) {
      return dateString;
    }
  }
  
  // Table columns
  const columns = [
    {
      key: 'username',
      label: 'Username',
      sortable: true,
      formatter: (value: string, user: User) => {
        return `
          <div class="user-cell">
            <div class="username">${value}</div>
            <div class="user-id">ID: ${user.id}</div>
          </div>
        `;
      }
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      formatter: (value: string, user: User) => {
        return `
          <div>
            <div>${user.name || '-'}</div>
            <div class="secondary-text">${user.display_name || ''}</div>
          </div>
        `;
      }
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true
    },
    {
      key: 'roles',
      label: 'Roles',
      sortable: true,
      formatter: (value: string[]) => {
        return value.join(', ');
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      formatter: (value: string) => {
        return `<span class="status-badge status-${value}">${value}</span>`;
      }
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      formatter: (value: string) => formatDate(value)
    },
    {
      key: 'last_login',
      label: 'Last Login',
      sortable: true,
      formatter: (value: string) => formatDate(value)
    }
  ];
  
  // Table actions
  const actions = [
    {
      label: 'Edit',
      onClick: (user: User) => {
        goto(`/dashboard/admin/users/${user.id}/edit`);
      }
    },
    {
      label: 'Reset Password',
      onClick: (user: User) => {
        resetPassword(user.id);
      }
    },
    {
      label: 'Delete',
      variant: 'danger' as const,
      onClick: (user: User) => {
        confirmDeleteUser(user);
      }
    }
  ];
  
  // Batch actions
  const batchActions = [
    {
      label: 'Set Active',
      icon: '✓',
      onClick: (selectedUsers: User[]) => {
        batchUpdateStatus(selectedUsers, 'active');
      }
    },
    {
      label: 'Set Inactive',
      icon: '✕',
      onClick: (selectedUsers: User[]) => {
        batchUpdateStatus(selectedUsers, 'inactive');
      }
    },
    {
      label: 'Delete Selected',
      icon: '🗑️',
      variant: 'danger' as const,
      onClick: (selectedUsers: User[]) => {
        confirmBatchDeleteUsers(selectedUsers);
      }
    }
  ];
</script>

<svelte:head>
  <title>User Management | TributeStream Admin</title>
  <meta name="description" content="Manage user accounts" />
</svelte:head>

<div class="users-page">
  <div class="page-header">
    <h1>User Management</h1>
    <button class="create-button" on:click={() => showCreateModal = true}>
      Create New User
    </button>
  </div>
  
  <div class="users-table">
    <DataTable
      data={users}
      {columns}
      {actions}
      {batchActions}
      {loading}
      sortable={true}
      filterable={true}
      paginated={true}
      selectable={true}
      itemsPerPage={20}
      idField="id"
      emptyMessage="No users found."
    />
  </div>
  
  {#if showCreateModal}
    <div class="modal-overlay" on:click={() => showCreateModal = false}>
      <div class="modal-content" on:click|stopPropagation>
        <div class="modal-header">
          <h2>Create New User</h2>
          <button class="close-button" on:click={() => showCreateModal = false}>×</button>
        </div>
        
        <div class="modal-body">
          <form on:submit|preventDefault={createUser}>
            <div class="form-group">
              <label for="username">Username *</label>
              <input 
                type="text" 
                id="username" 
                bind:value={newUser.username} 
                required
              />
            </div>
            
            <div class="form-group">
              <label for="email">Email *</label>
              <input 
                type="email" 
                id="email" 
                bind:value={newUser.email} 
                required
              />
            </div>
            
            <div class="form-group">
              <label for="password">Password *</label>
              <input 
                type="password" 
                id="password" 
                bind:value={newUser.password} 
                required
                minlength="8"
              />
              <div class="help-text">Minimum 8 characters</div>
            </div>
            
            <div class="form-group">
              <label for="name">Full Name</label>
              <input 
                type="text" 
                id="name" 
                bind:value={newUser.name}
              />
            </div>
            
            <div class="form-group">
              <label for="display_name">Display Name</label>
              <input 
                type="text" 
                id="display_name" 
                bind:value={newUser.display_name}
              />
            </div>
            
            <div class="form-group">
              <label for="roles">Role</label>
              <select id="roles" bind:value={newUser.roles[0]}>
                <option value="subscriber">Subscriber</option>
                <option value="contributor">Contributor</option>
                <option value="author">Author</option>
                <option value="editor">Editor</option>
                <option value="administrator">Administrator</option>
              </select>
            </div>
            
            <div class="form-actions">
              <button type="button" class="cancel-button" on:click={() => showCreateModal = false}>
                Cancel
              </button>
              <button type="submit" class="submit-button">
                Create User
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- Delete confirmation dialog -->
  {#if showDeleteConfirmation && userToDelete}
    <ConfirmationDialog
      title="Delete User"
      message={`Are you sure you want to delete the user "${userToDelete.username}"? This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      type="danger"
      open={showDeleteConfirmation}
      on:confirm={deleteUser}
      on:cancel={() => { showDeleteConfirmation = false; userToDelete = null; }}
    />
  {/if}
  
  <!-- Batch delete confirmation dialog -->
  {#if showBatchDeleteConfirmation && usersToDelete.length > 0}
    <ConfirmationDialog
      title="Delete Multiple Users"
      message={`Are you sure you want to delete ${usersToDelete.length} selected users? This action cannot be undone.`}
      confirmText="Delete All"
      cancelText="Cancel"
      type="danger"
      open={showBatchDeleteConfirmation}
      on:confirm={batchDeleteUsers}
      on:cancel={() => { showBatchDeleteConfirmation = false; usersToDelete = []; }}
    />
  {/if}
</div>

<style>
  .users-page {
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
  
  .users-table {
    margin-bottom: 2rem;
  }
  
  /* User cell styling */
  :global(.user-cell) {
    display: flex;
    flex-direction: column;
  }
  
  :global(.user-id) {
    font-size: 0.75rem;
    color: #718096;
  }
  
  :global(.secondary-text) {
    font-size: 0.875rem;
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
  
  :global(.status-active) {
    background-color: #c6f6d5;
    color: #2f855a;
  }
  
  :global(.status-inactive) {
    background-color: #fed7d7;
    color: #c53030;
  }
  
  :global(.status-pending) {
    background-color: #feebc8;
    color: #c05621;
  }
  
  /* Modal styles */
  .modal-overlay {
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
  
  .modal-content {
    background-color: white;
    border-radius: 0.5rem;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .modal-header h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2d3748;
    margin: 0;
  }
  
  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #718096;
    cursor: pointer;
  }
  
  .modal-body {
    padding: 1.5rem;
  }
  
  /* Form styles */
  .form-group {
    margin-bottom: 1rem;
  }
  
  .form-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #4a5568;
    margin-bottom: 0.25rem;
  }
  
  .form-group input,
  .form-group select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.25rem;
    font-size: 0.875rem;
  }
  
  .help-text {
    font-size: 0.75rem;
    color: #718096;
    margin-top: 0.25rem;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1.5rem;
  }
  
  .cancel-button {
    padding: 0.5rem 1rem;
    background-color: #e2e8f0;
    color: #4a5568;
    border: none;
    border-radius: 0.25rem;
    font-weight: 500;
    cursor: pointer;
  }
  
  .submit-button {
    padding: 0.5rem 1rem;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 0.25rem;
    font-weight: 500;
    cursor: pointer;
  }
  
  .cancel-button:hover {
    background-color: #cbd5e0;
  }
  
  .submit-button:hover {
    background-color: #3a80d2;
  }
</style>