<script lang="ts">
  import { setUser } from '$lib/stores/auth.store.svelte';
  import { page } from '$app/state';

  let { children } = $props();
</script>

 {@render children()}