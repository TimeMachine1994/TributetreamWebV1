<script lang="ts">
import Navbar from '$lib/Navbar.svelte';
import Footer from '$lib/Footer.svelte';
import { setUnifiedStoreContext } from '$lib/stores/unified-store.svelte';
import { onMount } from 'svelte';

let { data, children } = $props();

// Initialize unified store
const store = setUnifiedStoreContext();

// State flags to prevent reactivity loops
let storeInitialized = $state(false);
let saveInProgress = $state(false);

// Load data from localStorage on mount (client-side only)
onMount(() => {
    // Only initialize once to prevent reactivity loops
    if (!storeInitialized) {
        console.log('Initializing unified store from localStorage');
        
        // Load data from localStorage (will handle migration from legacy stores)
        store.loadFromLocalStorage();
        
        // Set up auth token from cookies if available
        if (data.user && data.token) {
            store.setAuthToken(data.token);
        }
        
        storeInitialized = true;
    }
});

// Explicitly keep track of which values we want to trigger persistence
let lastPersistenceCheck = $state(Date.now());

// Track the last saved values to prevent persistence loops
let lastStoreSnapshot = $state('');

// Helper function to manually trigger a persistence check
function schedulePersistence() {
    // Only update timestamp if we're not already in progress
    if (!saveInProgress) {
        lastPersistenceCheck = Date.now();
    }
}

// Helper function to create content snapshot for comparison
function createStoreSnapshot(): string {
    // Select relevant properties for comparison
    const snapshotObj = {
        directorInfo: store.directorInfo,
        lovedOneInfo: store.lovedOneInfo,
        userInfo: store.userInfo,
        memorialInfo: store.memorialInfo,
        liveStreamInfo: store.liveStreamInfo,
        packageInfo: store.packageInfo,
        billingInfo: store.billingInfo,
        scheduleDays: store.scheduleDays,
        currentTribute: store.currentTribute,
        recentTributes: store.recentTributes
    };
    
    // Create a hash/string representation for comparison
    return JSON.stringify(snapshotObj);
}

// Separate the effect from onMount to avoid nesting reactivity
$effect(() => {
    // This will only run when explicitly triggered by schedulePersistence
    const _ = lastPersistenceCheck; // Read the value to create dependency
    
    // Skip if a save is already in progress to prevent circular updates
    if (typeof window !== 'undefined' && !saveInProgress) {
        // Create snapshot to check if store has changed
        const storeSnapshot = createStoreSnapshot();
        
        // Only save if something has actually changed
        if (storeSnapshot !== lastStoreSnapshot) {
            saveInProgress = true;
            console.log('Unified store persistence - detected changes');
            
            // Save to localStorage
            store.saveToLocalStorage();
            lastStoreSnapshot = storeSnapshot;
            
            // Reset the flag after a delay to avoid re-triggering
            setTimeout(() => {
                saveInProgress = false;
                console.log('Persistence complete');
            }, 300);
        }
    }
});

// Initialize the snapshot after loading from localStorage
$effect(() => {
    if (storeInitialized) {
        lastStoreSnapshot = createStoreSnapshot();
    }
});

// Set up interval-based persistence rather than reactive persistence
onMount(() => {
    // Set up a periodic save interval instead of relying on reactivity
    const persistenceInterval = setInterval(() => {
        schedulePersistence();
    }, 10000); // Save every 10 seconds
    
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
