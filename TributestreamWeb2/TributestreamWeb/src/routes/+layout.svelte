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

// Track the last saved values to prevent persistence loops
let lastMasterStoreSnapshot = $state('');
let lastTributeStoreSnapshot = $state('');

// Helper function to manually trigger a persistence check
function schedulePersistence() {
    // Only update timestamp if we're not already in progress
    if (!saveInProgress) {
        lastPersistenceCheck = Date.now();
    }
}

// Helper function to create content snapshot for comparison
function createStoreSnapshot(store: any): string {
    // Select relevant properties for comparison
    const snapshotObj = {
        masterStore: store === masterStore ? {
            directorInfo: masterStore.directorInfo,
            lovedOneInfo: masterStore.lovedOneInfo,
            userInfo: masterStore.userInfo,
            memorialInfo: masterStore.memorialInfo,
            liveStreamInfo: masterStore.liveStreamInfo,
            packageInfo: masterStore.packageInfo,
            billingInfo: masterStore.billingInfo,
            scheduleDays: masterStore.scheduleDays
        } : null,
        tributeStore: store === tributeStore ? {
            currentTribute: tributeStore.currentTribute,
            recentTributes: tributeStore.recentTributes
        } : null
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
        // Create snapshots to check if stores have changed
        const masterSnapshot = createStoreSnapshot(masterStore);
        const tributeSnapshot = createStoreSnapshot(tributeStore);
        
        // Only save if something has actually changed
        const masterChanged = masterSnapshot !== lastMasterStoreSnapshot;
        const tributeChanged = tributeSnapshot !== lastTributeStoreSnapshot;
        
        if (masterChanged || tributeChanged) {
            saveInProgress = true;
            console.log('Coordinated store persistence - detected changes');
            
            // Serial persistence to avoid conflicts
            if (masterChanged) {
                masterStore.saveToLocalStorage();
                lastMasterStoreSnapshot = masterSnapshot;
            }
            
            if (tributeChanged) {
                tributeStore.saveToLocalStorage();
                lastTributeStoreSnapshot = tributeSnapshot;
            }
            
            // Reset the flag after a longer delay to avoid re-triggering
            setTimeout(() => {
                saveInProgress = false;
                console.log('Persistence complete');
            }, 300);
        }
    }
});

// Initialize the snapshots after loading from localStorage
$effect(() => {
    if (storesInitialized) {
        lastMasterStoreSnapshot = createStoreSnapshot(masterStore);
        lastTributeStoreSnapshot = createStoreSnapshot(tributeStore);
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

