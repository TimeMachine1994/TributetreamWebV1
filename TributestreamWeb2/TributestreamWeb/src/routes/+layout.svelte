<script>
    console.log('💡 [Layout Client] <script> loaded.');
  
    // Get both data and children from props in Svelte 5
    let { data, children } = $props();
    console.log('💡 [Layout Client] data from server load:', data);
  
    // User state management
    let user = $state(data.user || null);
    let isLoggedIn = $derived(!!user);
  </script>
  
  <!-- Base layout structure -->
  <nav class="border-b border-gray-200 p-2">
    <a href="/">Home</a> |
    <a href="/dashboard">Dashboard</a>
  
    <span class="ml-2">
      {#if isLoggedIn}
        ✅ Logged in as: {user.displayName || 'Unknown User'}
      {:else}
        ❌ Not logged in
      {/if}
    </span>
  </nav>
  
  <!-- Render the current route's content -->
  {@render children()}