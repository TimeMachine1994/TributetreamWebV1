<script>
  /** @type {import('./$types').PageProps} */
  let { data } = $props();
  
  let user = $derived(data.user);
</script>

<div class="profile-container">
  <h1>User Profile</h1>
  
  <div class="user-info">
    <h2>{user.username}</h2>
    <p>Email: {user.email}</p>
    <p>Role: <strong>{user.role.name}</strong></p>
    
    <h3>Account Details</h3>
    <ul>
      <li>ID: {user.id}</li>
      <li>Created: {new Date(user.createdAt).toLocaleDateString()}</li>
      <li>Last updated: {new Date(user.updatedAt).toLocaleDateString()}</li>
    </ul>
    
    <div class="actions">
      <a href="/logout" class="logout-btn">Logout</a>
    </div>
  </div>
</div>

<style>
  .profile-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .user-info {
    background-color: #f5f5f5;
    border-radius: 8px;
    padding: 1.5rem;
    margin-top: 1.5rem;
  }
  
  h1 {
    color: #333;
    border-bottom: 2px solid #eee;
    padding-bottom: 0.5rem;
  }
  
  h2 {
    color: #444;
    margin-bottom: 1rem;
  }
  
  h3 {
    margin-top: 1.5rem;
    color: #555;
  }
  
  ul {
    list-style: none;
    padding-left: 0;
  }
  
  li {
    padding: 0.5rem 0;
    border-bottom: 1px solid #eee;
  }
  
  .actions {
    margin-top: 2rem;
    display: flex;
    gap: 1rem;
  }
  
  .logout-btn {
    display: inline-block;
    background-color: #ff3e00;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    text-decoration: none;
    font-weight: bold;
    transition: background-color 0.2s;
  }
  
  .logout-btn:hover {
    background-color: #e63700;
  }
</style>
