<!-- src/lib/components/LogoutButton.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import { authStore } from '$lib/stores/auth-store';
  
  let isLoggingOut = $state(false);
</script>

<form method="POST" action="/logout" use:enhance={() => {
  isLoggingOut = true;
  
  // Update local state immediately
  authStore.logout();
  
  return () => {
    isLoggingOut = false;
  };
}}>
  <button type="submit" disabled={isLoggingOut}>
    {isLoggingOut ? 'Logging out...' : 'Log out'}
  </button>
</form>

<style>
  button {
    background-color: #cc0000;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
  
  button:disabled {
    background-color: #999;
    cursor: not-allowed;
  }
</style>
