<!-- src/routes/my-portal/dashboard/+page.svelte -->
<script lang="ts">
  import AuthGuard from '$lib/components/AuthGuard.svelte';
  import LogoutButton from '$lib/components/LogoutButton.svelte';
  import { authStore } from '$lib/stores/auth-store';
  
  // Use $derived to create reactive values from the store
  let user = $derived($authStore.user);
</script>

<AuthGuard>
  <div class="dashboard">
    <header>
      <h1>Welcome, {user?.display_name || 'User'}</h1>
      <LogoutButton />
    </header>
    
    <main>
      <div class="dashboard-content">
        <h2>Your Dashboard</h2>
        <p>This is a protected page that only authenticated users can access.</p>
        
        <div class="user-info">
          <h3>Your Account Information</h3>
          {#if user}
            <ul>
              <li><strong>ID:</strong> {user.id}</li>
              <li><strong>Email:</strong> {user.email}</li>
              <li><strong>Display Name:</strong> {user.display_name}</li>
              {#if user.roles}
                <li>
                  <strong>Roles:</strong>
                  <ul>
                    {#each user.roles as role}
                      <li>{role}</li>
                    {/each}
                  </ul>
                </li>
              {/if}
            </ul>
          {:else}
            <p>Loading user information...</p>
          {/if}
        </div>
      </div>
    </main>
  </div>
</AuthGuard>

<style>
  .dashboard {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
  }
  
  .dashboard-content {
    background-color: #f9f9f9;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .user-info {
    margin-top: 2rem;
    padding: 1rem;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  ul {
    list-style-type: none;
    padding-left: 0;
  }
  
  li {
    margin-bottom: 0.5rem;
  }
  
  li ul {
    padding-left: 1rem;
    margin-top: 0.5rem;
  }
</style>
