<script lang="ts">
import Navbar from '$lib/Navbar.svelte';
import Footer from '$lib/Footer.svelte';
import { setMasterStoreContext } from '$lib/stores/master-store.svelte';
import { setTributePageStoreContext } from '$lib/stores/tribute-page-store.svelte';
import { onMount } from 'svelte';

let { data, children } = $props();

// Initialize stores
const masterStore = setMasterStoreContext();
const tributeStore = setTributePageStoreContext();

// Load data from localStorage on mount (client-side only)
onMount(() => {
    // Load data from localStorage for both stores
    masterStore.loadFromLocalStorage();
    
    // Set up auth token from cookies if available
    if (data.user && data.token) {
        tributeStore.setAuthToken(data.token);
    }
    
    // Set up effect to persist store data when it changes
    $effect(() => {
        if (typeof window !== 'undefined') {
            masterStore.saveToLocalStorage();
        }
    });
});
</script>

<style>
    :global(body) {
        background-color: white;
        color: black;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        margin: 0;
        padding: 0;
        min-height: 100vh;
    }

    :global(*) {
        color: inherit;
    }
</style>

<Navbar />

{@render children()}

<Footer />

