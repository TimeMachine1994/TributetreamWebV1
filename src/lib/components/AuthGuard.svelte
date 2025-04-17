<!-- src/lib/components/AuthGuard.svelte -->
<script lang="ts">
  import { authStore } from '$lib/stores/auth-store';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  export let redirect = '/login';
  
  // Use $derived to create reactive values from the store
  let isAuthenticated = $derived($authStore.isAuthenticated);
  let isLoading = $state(true);
  
  $effect(() => {
    // Wait for auth store to initialize
    if (isAuthenticated === false && !isLoading) {
      goto(redirect);
    }
  });
  
  onMount(() => {
    // Set loading to false after a short delay
    setTimeout(() => {
      isLoading = false;
    }, 100);
  });
</script>

{#if isLoading}
  <p>Loading...</p>
{:else if isAuthenticated}
  <slot />
{:else}
  <p>Redirecting to login...</p>
{/if}
