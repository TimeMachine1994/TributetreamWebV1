<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/services/auth-service';
  import { get } from 'svelte/store';
  import type { User } from '$lib/utils/cookie-auth';
  
  // Define interfaces for the dashboard data
  interface AuditLogEntry {
    id: number;
    user_id: number;
    user_name: string;
    action: 'create' | 'update' | 'delete' | string;
    entity_type: string;
    entity_id: number;
    changes: Record<string, { from: any; to: any }>;
    timestamp: string;
  }
  
  // State
  let loading = true;
  let error: string | null = null;
  let stats = {
    tributes: {
      total: 0,
      published: 0,
      draft: 0
    },
    users: {
      total: 0,
      active: 0,
      inactive: 0
    },
    recentActivity: [] as AuditLogEntry[]
  };
  
  // Fetch dashboard stats
  onMount(async () => {
    await fetchDashboardStats();
  });
  
  // Fetch dashboard stats from API
  async function fetchDashboardStats() {
    try {
      loading = true;
      error = null;
      
      // Fetch tributes count
      const tributesResponse = await fetch('/api/tributes?count_only=true', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!tributesResponse.ok) {
        throw new Error(`Failed to fetch tributes: ${tributesResponse.status}`);
      }
      
      const tributesResult = await tributesResponse.json();
      
      if (tributesResult.success) {
        stats.tributes.total = tributesResult.total || 0;
        stats.tributes.published = tributesResult.published || 0;
        stats.tributes.draft = tributesResult.draft || 0;
      }
      
      // Fetch users count
      const usersResponse = await fetch('/api/users?count_only=true', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!usersResponse.ok) {
        throw new Error(`Failed to fetch users: ${usersResponse.status}`);
      }
      
      const usersResult = await usersResponse.json();
      
      if (usersResult.success) {
        stats.users.total = usersResult.total || 0;
        stats.users.active = usersResult.active || 0;
        stats.users.inactive = usersResult.inactive || 0;
      }
      
      // Fetch recent activity
      const activityResponse = await fetch('/api/audit-logs?limit=5', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!activityResponse.ok) {
        throw new Error(`Failed to fetch activity: ${activityResponse.status}`);
      }
      
      const activityResult = await activityResponse.json();
      
      if (activityResult.success) {
        stats.recentActivity = activityResult.logs || [];
      }
      
      loading = false;
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      error = err instanceof Error ? err.message : 'An unexpected error occurred';
      loading = false;
    }
  }
  
  // Format date
  function formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (err) {
      return dateString;
    }
  }
  
  // Get current user
  const authState = get(authStore);
  const currentUser = authState.user;
</script>

<svelte:head>
  <title>Admin Dashboard | TributeStream</title>
  <meta name="description" content="TributeStream Admin Dashboard" />
</svelte:head>

<div class="admin-dashboard">
  <div class="dashboard-header">
    <h1>Admin Dashboard</h1>
    <p class="welcome-message">
      Welcome back, {currentUser?.display_name || currentUser?.name || (currentUser as any)?.username || 'Admin'}!
    </p>
  </div>
  
  {#if error}
    <div class="error-message">
      <p>{error}</p>
    </div>
  {/if}
  
  <div class="stats-grid">
    <!-- Tributes Stats -->
    <div class="stats-card">
      <div class="stats-header">
        <h2>Tributes</h2>
        <button class="view-all-button" on:click={() => goto('/dashboard/admin/tributes')}>
          View All
        </button>
      </div>
      
      {#if loading}
        <div class="loading-indicator">Loading...</div>
      {:else}
        <div class="stats-content">
          <div class="stat-item">
            <span class="stat-label">Total</span>
            <span class="stat-value">{stats.tributes.total}</span>
          </div>
          
          <div class="stat-item">
            <span class="stat-label">Published</span>
            <span class="stat-value">{stats.tributes.published}</span>
          </div>
          
          <div class="stat-item">
            <span class="stat-label">Draft</span>
            <span class="stat-value">{stats.tributes.draft}</span>
          </div>
        </div>
        
        <div class="stats-actions">
          <button class="action-button" on:click={() => goto('/dashboard/tributes/new')}>
            Create New Tribute
          </button>
        </div>
      {/if}
    </div>
    
    <!-- Users Stats -->
    <div class="stats-card">
      <div class="stats-header">
        <h2>Users</h2>
        <button class="view-all-button" on:click={() => goto('/dashboard/admin/users')}>
          View All
        </button>
      </div>
      
      {#if loading}
        <div class="loading-indicator">Loading...</div>
      {:else}
        <div class="stats-content">
          <div class="stat-item">
            <span class="stat-label">Total</span>
            <span class="stat-value">{stats.users.total}</span>
          </div>
          
          <div class="stat-item">
            <span class="stat-label">Active</span>
            <span class="stat-value">{stats.users.active}</span>
          </div>
          
          <div class="stat-item">
            <span class="stat-label">Inactive</span>
            <span class="stat-value">{stats.users.inactive}</span>
          </div>
        </div>
        
        <div class="stats-actions">
          <button 
            class="action-button" 
            on:click={() => {
              const modal = document.querySelector('.users-page .create-button');
              if (modal) {
                goto('/dashboard/admin/users');
                setTimeout(() => {
                  (modal as HTMLElement).click();
                }, 500);
              } else {
                goto('/dashboard/admin/users');
              }
            }}
          >
            Create New User
          </button>
        </div>
      {/if}
    </div>
  </div>
  
  <!-- Recent Activity -->
  <div class="activity-section">
    <div class="section-header">
      <h2>Recent Activity</h2>
      <button class="view-all-button" on:click={() => goto('/dashboard/admin/audit-logs')}>
        View All
      </button>
    </div>
    
    {#if loading}
      <div class="loading-indicator">Loading...</div>
    {:else if stats.recentActivity.length === 0}
      <div class="empty-message">No recent activity</div>
    {:else}
      <div class="activity-list">
        {#each stats.recentActivity as activity}
          <div class="activity-item">
            <div class="activity-icon">
              {#if activity.action === 'create'}
                <span class="icon-create">+</span>
              {:else if activity.action === 'update'}
                <span class="icon-update">↻</span>
              {:else if activity.action === 'delete'}
                <span class="icon-delete">×</span>
              {:else}
                <span class="icon-default">•</span>
              {/if}
            </div>
            
            <div class="activity-details">
              <p class="activity-message">
                <strong>{activity.user_name || 'Unknown user'}</strong> 
                {activity.action}d 
                {activity.entity_type} 
                {#if activity.entity_id}
                  <span class="entity-id">#{activity.entity_id}</span>
                {/if}
              </p>
              
              <p class="activity-time">{formatDate(activity.timestamp)}</p>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
  
  <!-- Quick Links -->
  <div class="quick-links-section">
    <h2>Quick Links</h2>
    
    <div class="quick-links-grid">
      <a href="/dashboard/admin/tributes" class="quick-link-card">
        <div class="quick-link-icon">🕯️</div>
        <h3>Manage Tributes</h3>
        <p>View, edit, and manage all tributes</p>
      </a>
      
      <a href="/dashboard/admin/users" class="quick-link-card">
        <div class="quick-link-icon">👥</div>
        <h3>Manage Users</h3>
        <p>View, edit, and manage user accounts</p>
      </a>
      
      <a href="/dashboard/admin/audit-logs" class="quick-link-card">
        <div class="quick-link-icon">📝</div>
        <h3>Audit Logs</h3>
        <p>View activity logs and audit trail</p>
      </a>
      
      <a href="/dashboard" class="quick-link-card">
        <div class="quick-link-icon">🏠</div>
        <h3>Main Dashboard</h3>
        <p>Return to the main dashboard</p>
      </a>
    </div>
  </div>
</div>

<style>
  .admin-dashboard {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .dashboard-header {
    margin-bottom: 2rem;
  }
  
  h1 {
    font-size: 1.75rem;
    font-weight: 600;
    color: #2d3748;
    margin: 0 0 0.5rem 0;
  }
  
  .welcome-message {
    color: #718096;
    margin: 0;
  }
  
  .error-message {
    padding: 0.75rem 1rem;
    background-color: #fed7d7;
    color: #c53030;
    border-radius: 0.25rem;
    margin-bottom: 1.5rem;
  }
  
  .error-message p {
    margin: 0;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .stats-card {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
  }
  
  .stats-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .stats-header h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2d3748;
    margin: 0;
  }
  
  .view-all-button {
    background: none;
    border: none;
    color: #4a90e2;
    font-size: 0.875rem;
    cursor: pointer;
  }
  
  .loading-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px;
    color: #a0aec0;
  }
  
  .stats-content {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .stat-label {
    font-size: 0.875rem;
    color: #718096;
    margin-bottom: 0.25rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2d3748;
  }
  
  .stats-actions {
    display: flex;
    justify-content: center;
  }
  
  .action-button {
    padding: 0.5rem 1rem;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 0.25rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .action-button:hover {
    background-color: #3a80d2;
  }
  
  .activity-section,
  .quick-links-section {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .section-header h2,
  .quick-links-section h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2d3748;
    margin: 0;
  }
  
  .empty-message {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px;
    color: #a0aec0;
  }
  
  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .activity-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .activity-item:last-child {
    padding-bottom: 0;
    border-bottom: none;
  }
  
  .activity-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background-color: #f7fafc;
    flex-shrink: 0;
  }
  
  .icon-create {
    color: #48bb78;
  }
  
  .icon-update {
    color: #4a90e2;
  }
  
  .icon-delete {
    color: #f56565;
  }
  
  .icon-default {
    color: #a0aec0;
  }
  
  .activity-details {
    flex-grow: 1;
  }
  
  .activity-message {
    margin: 0 0 0.25rem 0;
    color: #2d3748;
  }
  
  .entity-id {
    color: #718096;
    font-size: 0.875rem;
  }
  
  .activity-time {
    margin: 0;
    font-size: 0.875rem;
    color: #a0aec0;
  }
  
  .quick-links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
  }
  
  .quick-link-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1.5rem;
    background-color: #f7fafc;
    border-radius: 0.5rem;
    text-decoration: none;
    transition: background-color 0.2s;
  }
  
  .quick-link-card:hover {
    background-color: #edf2f7;
  }
  
  .quick-link-icon {
    font-size: 2rem;
    margin-bottom: 0.75rem;
  }
  
  .quick-link-card h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #2d3748;
    margin: 0 0 0.5rem 0;
  }
  
  .quick-link-card p {
    font-size: 0.875rem;
    color: #718096;
    margin: 0;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
    
    .stats-content {
      grid-template-columns: 1fr 1fr 1fr;
    }
    
    .quick-links-grid {
      grid-template-columns: 1fr 1fr;
    }
  }
  
  @media (max-width: 480px) {
    .stats-content {
      grid-template-columns: 1fr;
    }
    
    .quick-links-grid {
      grid-template-columns: 1fr;
    }
  }
</style>