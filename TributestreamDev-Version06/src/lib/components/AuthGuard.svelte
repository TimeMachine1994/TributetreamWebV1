<script lang="ts">
  import { isAuthenticated } from '$lib/stores/auth.store.svelte';
  import { goto } from '$app/navigation';

  interface Props {
    children?: any;
    redirectTo?: string;
  }

  let { children, redirectTo = '/login' }: Props = $props();
  
  let authenticated = $derived(isAuthenticated());

  $effect(() => {
    console.log('Auth state:', authenticated); // Debug log
    if (!authenticated) {
      console.log('Not authenticated, redirecting to:', redirectTo); // Debug log
      goto(redirectTo);
    }
  });
</script>

{#if authenticated}
  {@render children?.()}
{/if}