<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '$lib/stores/auth-store';
  import { page } from '$app/stores';
  
  // Use $derived to create reactive values from the store
  let isAuthenticated = $derived($authStore.isAuthenticated);
  let user = $derived($authStore.user);
  
  // Initialize auth state from SSR data
  onMount(async () => {
    // If we have auth data from SSR, use it
    if ($page.data.user) {
      await authStore.initFromCookies($page.data.token, $page.data.user);
    } else {
      // Otherwise, check auth status
      const response = await fetch('/api/auth/check');
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          await authStore.initFromCookies(null, data.user);
        }
      }
    }
  });
</script>

<slot />
