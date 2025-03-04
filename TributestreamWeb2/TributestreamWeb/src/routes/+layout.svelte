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

// State flags to prevent reactivity loops
let storesInitialized = $state(false);
let saveInProgress = $state(false);

// Load data from localStorage on mount (client-side only)
onMount(() => {
    // Only initialize once to prevent reactivity loops
    if (!storesInitialized) {
        console.log('Initializing stores from localStorage');
        // Load data from localStorage for both stores
        masterStore.loadFromLocalStorage();
        
        // Set up auth token from cookies if available
        if (data.user && data.token) {
            tributeStore.setAuthToken(data.token);
        }
        
        storesInitialized = true;
    }
});

// Separate the effect from onMount to avoid nesting reactivity
$effect(() => {
    // Skip if a save is already in progress to prevent circular updates
    if (typeof window !== 'undefined' && !saveInProgress) {
        saveInProgress = true;
        console.log('Saving masterStore to localStorage');
        masterStore.saveToLocalStorage();
        
        // Reset the flag after a small delay to avoid immediate re-triggering
        setTimeout(() => {
            saveInProgress = false;
        }, 100);
    }
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

