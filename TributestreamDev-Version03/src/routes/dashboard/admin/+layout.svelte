<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { accessControlService } from '$lib/services/access-control-service';
  import { authStore } from '$lib/services/auth-service';
  import { get } from 'svelte/store';
  import ToastContainer from '$lib/components/ui/toast-container.svelte';
  
  // State
  let loading = true;
  let error: string | null = null;
  let currentUser: any = null;
  let isAdmin = false;
  
  // Navigation items
  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard/admin',
      icon: '📊'
    },
    {
      label: 'Tributes',
      path: '/dashboard/admin/tributes',
      icon: '🕯️'
    },
    {
      label: 'Users',
      path: '/dashboard/admin/users',
      icon: '👥'
    },
    {
      label: 'Audit Logs',
      path: '/dashboard/admin/audit-logs',
      icon: '📝'
    }
  ];
  
  // Check if user is admin
  onMount(async () => {
    try {
      loading = true;
      
      // Check if user is authenticated
      const authSuccess = await authStore.checkAuth();
      if (!authSuccess) {
        goto('/login');
        return;
      }
      
      // Get current user from auth store
      const authState = get(authStore);
      currentUser = authState.user;
      
      // Check if user has admin role
      isAdmin = accessControlService.hasAdminAccess();
      
      if (!isAdmin) {
        // Redirect to dashboard if not admin
        goto('/dashboard');
        return;
      }
      
      loading = false;
    } catch (err) {
      console.error('Error checking admin access:', err);
      error = err instanceof Error ? err.message : 'An unexpected error occurred';
      loading = false;
      
      // Redirect to login if not authenticated
      goto('/login');
    }
  });
  
  // Check if current path matches nav item
  function isActive(path: string): boolean {
    return $page.url.pathname === path || $page.url.pathname.startsWith(`${path}/`);
  }
  
  // Handle logout
  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      goto('/login');
    } catch (err) {
      console.error('Error logging out:', err);
      alert('Failed to log out. Please try again.');
    }
  }
</script>

<div class="admin-layout">
  {#if loading}
    <div class="loading-screen">
      <p>Loading...</p>
    </div>
  {:else if error}
    <div class="error-screen">
      <p>{error}</p>
      <button on:click={() => goto('/login')}>Go to Login</button>
    </div>
  {:else if !isAdmin}
    <div class="unauthorized-screen">
      <p>You do not have permission to access this area.</p>
      <button on:click={() => goto('/dashboard')}>Go to Dashboard</button>
    </div>
  {:else}
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1>Admin Panel</h1>
      </div>
      
      <nav class="sidebar-nav">
        <ul>
          {#each navItems as item}
            <li>
              <a 
                href={item.path} 
                class="nav-link" 
                class:active={isActive(item.path)}
              >
                <span class="nav-icon">{item.icon}</span>
                <span class="nav-label">{item.label}</span>
              </a>
            </li>
          {/each}
        </ul>
      </nav>
      
      <div class="sidebar-footer">
        <div class="user-info">
          <p class="user-name">{currentUser?.display_name || currentUser?.name || currentUser?.username || 'Admin User'}</p>
          <p class="user-role">Administrator</p>
        </div>
        
        <div class="footer-actions">
          <a href="/dashboard" class="back-link">
            <span class="back-icon">🏠</span>
            <span>Main Dashboard</span>
          </a>
          
          <button class="logout-button" on:click={handleLogout}>
            <span class="logout-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
    
    <!-- Toast container for notifications -->
    <ToastContainer position="top-right" />
    
    <main class="content">
      <slot />
    </main>
  {/if}
</div>

<style>
  .admin-layout {
    display: flex;
    min-height: 100vh;
    background-color: #f8f9fa;
  }
  
  .loading-screen,
  .error-screen,
  .unauthorized-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    width: 100%;
    padding: 2rem;
    text-align: center;
  }
  
  .error-screen button,
  .unauthorized-screen button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 0.25rem;
    font-weight: 500;
    cursor: pointer;
  }
  
  .sidebar {
    width: 250px;
    background-color: #2d3748;
    color: white;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }
  
  .sidebar-header {
    padding: 1.5rem;
    border-bottom: 1px solid #4a5568;
  }
  
  .sidebar-header h1 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
  }
  
  .sidebar-nav {
    flex-grow: 1;
    padding: 1rem 0;
  }
  
  .sidebar-nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .nav-link {
    display: flex;
    align-items: center;
    padding: 0.75rem 1.5rem;
    color: #cbd5e0;
    text-decoration: none;
    transition: background-color 0.2s;
  }
  
  .nav-link:hover {
    background-color: #4a5568;
    color: white;
  }
  
  .nav-link.active {
    background-color: #4a90e2;
    color: white;
  }
  
  .nav-icon {
    margin-right: 0.75rem;
    font-size: 1.25rem;
  }
  
  .sidebar-footer {
    padding: 1.5rem;
    border-top: 1px solid #4a5568;
  }
  
  .user-info {
    margin-bottom: 1rem;
  }
  
  .user-name {
    font-weight: 600;
    margin: 0 0 0.25rem 0;
  }
  
  .user-role {
    font-size: 0.875rem;
    color: #a0aec0;
    margin: 0;
  }
  
  .footer-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .back-link,
  .logout-button {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    text-decoration: none;
    transition: background-color 0.2s;
  }
  
  .back-link {
    color: #cbd5e0;
    background-color: transparent;
  }
  
  .logout-button {
    color: #cbd5e0;
    background-color: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
    font-family: inherit;
  }
  
  .back-link:hover,
  .logout-button:hover {
    background-color: #4a5568;
    color: white;
  }
  
  .back-icon,
  .logout-icon {
    margin-right: 0.5rem;
  }
  
  .content {
    flex-grow: 1;
    padding: 2rem;
    overflow-y: auto;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .admin-layout {
      flex-direction: column;
    }
    
    .sidebar {
      width: 100%;
      height: auto;
    }
    
    .content {
      padding: 1rem;
    }
  }
</style>