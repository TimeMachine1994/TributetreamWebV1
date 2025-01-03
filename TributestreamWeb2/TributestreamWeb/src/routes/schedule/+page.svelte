
// src/schedule/+page.svelte
<script>
let { data } = $props();

// Derive welcome message
let welcomeMessage = $derived(
  data.user ? `Welcome, ${data.user.displayName}!` : 'Please log in'
);
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-6">{welcomeMessage}</h1>
  
  {#if data.user}
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">Your Profile</h2>
      <div class="space-y-2">
        <p><span class="font-medium">Display Name:</span> {data.user.displayName}</p>
        <p><span class="font-medium">Email:</span> {data.user.email}</p>
        <p><span class="font-medium">Username:</span> {data.user.nicename}</p>
      </div>
    </div>
  {/if}
</div>