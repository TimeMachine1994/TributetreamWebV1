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

// Explicitly keep track of which values we want to trigger persistence
let lastPersistenceCheck = $state(Date.now());

// Helper function to manually trigger a persistence check
function schedulePersistence() {
    lastPersistenceCheck = Date.now();
}

// Separate the effect from onMount to avoid nesting reactivity
$effect(() => {
    // This will only run when explicitly triggered by schedulePersistence
    const _ = lastPersistenceCheck; // Read the value to create dependency
    
    // Skip if a save is already in progress to prevent circular updates
    if (typeof window !== 'undefined' && !saveInProgress) {
        saveInProgress = true;
        console.log('Coordinated store persistence');
        
        // Serial persistence to avoid conflicts
        masterStore.saveToLocalStorage();
        tributeStore.saveToLocalStorage();
        
        // Reset the flag after a longer delay to avoid re-triggering
        setTimeout(() => {
            saveInProgress = false;
            console.log('Persistence complete');
        }, 200);
    }
});

// Set up interval-based persistence rather than reactive persistence
onMount(() => {
    // Set up a periodic save interval instead of relying on reactivity
    const persistenceInterval = setInterval(() => {
        schedulePersistence();
    }, 5000); // Save every 5 seconds
    
    return () => {
        clearInterval(persistenceInterval);
    };
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

