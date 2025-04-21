<script lang="ts">
  import { page } from '$app/state';
  
  let user = $derived(page.data.user);
  let isAdmin = $derived(user?.role?.type === 'admin');
  let isAuthenticated = $derived(!!user);
  
  // Helper function to check user permissions
  function hasRole(roleName: string): boolean {
    return user?.role?.name === roleName;
  }
</script>

<nav>
  <ul>
    <li><a href="/">Home</a></li>
    
    <!-- Public routes -->
    <li><a href="/about">About</a></li>
    <li><a href="/contact">Contact</a></li>
    
    {#if isAuthenticated}
      <!-- User is logged in -->
      <li><a href="/profile">My Profile</a></li>
      
      {#if isAdmin}
        <!-- Admin-only links -->
        <li><a href="/admin/dashboard">Admin Dashboard</a></li>
        <li><a href="/admin/users">Manage Users</a></li>
        <li><a href="/admin/content">Manage Content</a></li>
      {/if}
      
      {#if hasRole('editor')}
        <!-- Editor-specific links -->
        <li><a href="/editor/content">Edit Content</a></li>
      {/if}
      
      <!-- Logout option -->
      <li><a href="/logout">Logout</a></li>
    {:else}
      <!-- Not logged in -->
      <li><a href="/login">Login</a></li>
      <li><a href="/register">Register</a></li>
    {/if}
  </ul>
</nav>

<style>
  nav {
    background-color: #f8f8f8;
    border-bottom: 1px solid #eee;
    padding: 1rem 2rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  a {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    transition: color 0.2s;
  }

  a:hover {
    color: #ff3e00;
  }
</style>
