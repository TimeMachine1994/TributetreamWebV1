<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  
  // State
  let isLoggingOut = $state(false);
  
  // Check if user is logged in client-side
  onMount(() => {
    const user = document.cookie.includes('jwt_token=');
    if (!user) {
      goto('/login');
    }
  });
  // Handle logout
  async function handleLogout() {
    if (isLoggingOut) return;
    
    isLoggingOut = true;
    
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        goto('/login');
      } else {
        console.error('Logout failed');
        isLoggingOut = false;
      }
    } catch (error) {
      console.error('Logout error:', error);
      isLoggingOut = false;
    }
  }
</script>

<div class="admin-layout">
  <header class="bg-primary text-white p-4 flex justify-between items-center">
    <h1 class="text-2xl font-bold">Tributestream Admin</h1>
    <button
      on:click={handleLogout}
      disabled={isLoggingOut}
      class="bg-white text-primary px-4 py-2 rounded hover:bg-gray-100 disabled:opacity-50"
    >
      {isLoggingOut ? 'Logging out...' : 'Logout'}
    </button>
  </header>
  
  <div class="flex">
    <aside class="w-64 bg-gray-100 min-h-screen p-4">
      <nav>
        <ul>
          <li class="mb-2"><a href="/admin" class="block p-2 hover:bg-gray-200 rounded">Dashboard</a></li>
          <li class="mb-2"><a href="/admin/tribute-editor" class="block p-2 hover:bg-gray-200 rounded">Tribute Editor</a></li>
        </ul>
      </nav>
    </aside>
    
    <main class="flex-1 p-6">
      <slot />
    </main>
  </div>
</div>