<script lang="ts">
  /** @type {import('./$types').PageProps} */
  let { data } = $props();
  
  let user = $derived(data.user);
</script>

<div class="admin-dashboard">
  <h1>Admin Dashboard</h1>
  
  <div class="welcome-section">
    <h2>Welcome, {user.username}!</h2>
    <p>You are logged in as an admin with role: <strong>{user.role.name}</strong></p>
  </div>
  
  <div class="dashboard-grid">
    <div class="card">
      <h3>User Management</h3>
      <p>Manage users, roles and permissions</p>
      <a href="/admin/users" class="card-link">View Users</a>
    </div>
    
    <div class="card">
      <h3>Content Management</h3>
      <p>Create and edit website content</p>
      <a href="/admin/content" class="card-link">Manage Content</a>
    </div>
    
    <div class="card">
      <h3>System Settings</h3>
      <p>Configure system-wide settings</p>
      <a href="/admin/settings" class="card-link">Settings</a>
    </div>
    
    <div class="card">
      <h3>Analytics</h3>
      <p>View site analytics and metrics</p>
      <a href="/admin/analytics" class="card-link">View Reports</a>
    </div>
  </div>
</div>

<style>
  .admin-dashboard {
    padding: 1rem;
  }
  
  h1 {
    font-size: 2rem;
    margin-bottom: 1.5rem;
    color: #333;
  }
  
  .welcome-section {
    background-color: #f5f5f5;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
  }
  
  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  .card {
    background-color: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .card h3 {
    color: #ff3e00;
    margin-top: 0;
    margin-bottom: 0.75rem;
  }
  
  .card p {
    color: #666;
    margin-bottom: 1.5rem;
  }
  
  .card-link {
    display: inline-block;
    background-color: #ff3e00;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 500;
    transition: background-color 0.2s;
  }
  
  .card-link:hover {
    background-color: #e63700;
  }
  
  @media (max-width: 768px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
