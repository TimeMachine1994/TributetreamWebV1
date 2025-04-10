<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  
  onMount(() => {
    // Redirect to tribute editor
    goto('/admin/tribute-editor');
  });
</script>

<div class="container mx-auto p-6">
  <h1 class="text-2xl font-bold mb-4">Admin Dashboard</h1>
  <p>Redirecting to Tribute Editor...</p>
</div>