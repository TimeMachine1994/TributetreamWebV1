<script lang="ts">
  import { isAuthenticated } from '$lib/stores/auth.store.svelte';
  import { goto } from '$app/navigation';
  let { children } = $props();

  let { redirectTo = '/login' } = $props<{ redirectTo?: string }>();
  
  // Redirect to login if not authenticated
  $effect(() => {
    if (!isAuthenticated()) {
      goto(redirectTo);
    }
  });
</script>

{#if isAuthenticated()}
  <slot />
{/if}