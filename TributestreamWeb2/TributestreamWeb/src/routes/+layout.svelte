<script>import "../app.css";
console.log('💡 [Layout Client] <script> loaded.');

// Props in Svelte 5
let { data, children } = $props();
console.log('💡 [Layout Client] data from server load:', data);

// Global state for tributes
let tributes = $state([]);
let currentTribute = $state(null);
let isLoading = $state(false);
let apiError = $state(null);  // renamed from 'error' to avoid conflicts

// User state
let user = $state(data.user || null);
let isLoggedIn = $derived(!!user);

// Computed tribute values
let tributeCount = $derived(tributes.length);
let sortedTributes = $derived(
  [...tributes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
);

// Effect to load tributes on mount
$effect(() => {
  loadTributes();
});

async function loadTributes() {
  isLoading = true;
  apiError = null;
  try {
    const response = await fetch('/api/wordpress');
    if (!response.ok) throw new Error('Failed to fetch tributes');
    tributes = await response.json();
  } catch (e) {
    apiError = e.message;
    console.error('Failed to load tributes:', e);
  } finally {
    isLoading = false;
  }
}

async function updateTributeHtml(tributeId, customHtml) {
  isLoading = true;
  apiError = null;
  try {
    const response = await fetch(`/api/wordpress/${tributeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ custom_html: customHtml })
    });
    
    if (!response.ok) throw new Error('Failed to update tribute');
    const updatedTribute = await response.json();
    
    tributes = tributes.map(t => 
      t.id === tributeId ? { ...t, custom_html: customHtml } : t
    );
    
    return updatedTribute;
  } catch (e) {
    apiError = e.message;
    console.error('Failed to update tribute:', e);
    throw e;
  } finally {
    isLoading = false;
  }
}</script>// src/routes/+layout.svelte


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

{#if isLoading}
  <div class="p-4">Loading...</div>
{/if}

{#if apiError}
  <div class="p-4 text-red-500">Error: {apiError}</div>
{/if}

<!-- Render the current route's content -->
{@render children()}
