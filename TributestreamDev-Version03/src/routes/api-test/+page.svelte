<script lang="ts">
    import { onMount } from 'svelte';
    
    // State variables
    let searchTerm = $state('');
    let apiResponse = $state<any>(null);
    let isLoading = $state(false);
    let error = $state<string | null>(null);
    
    // Function to call the API directly
    async function testApi() {
        if (!searchTerm.trim()) {
            error = 'Please enter a search term';
            return;
        }
        
        error = null;
        isLoading = true;
        
        try {
            // Call the API directly
            const response = await fetch(`/api/tributes?search=${encodeURIComponent(searchTerm.trim())}&page=1`);
            
            if (!response.ok) {
                throw new Error(`API returned status ${response.status}`);
            }
            
            // Get the raw response
            const data = await response.json();
            apiResponse = data;
        } catch (err) {
            error = err instanceof Error ? err.message : 'An unknown error occurred';
            console.error('API test error:', err);
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="container mx-auto p-4 max-w-3xl">
    <h1 class="text-2xl font-bold mb-4">Tributes API Test</h1>
    
    <div class="mb-6 p-4 bg-gray-100 rounded-lg">
        <div class="flex gap-2 mb-4">
            <input
                type="text"
                bind:value={searchTerm}
                placeholder="Enter search term"
                class="flex-1 px-4 py-2 border rounded-md"
            />
            <button
                on:click={testApi}
                disabled={isLoading}
                class="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
            >
                {isLoading ? 'Loading...' : 'Test API'}
            </button>
        </div>
        
        {#if error}
            <div class="p-3 bg-red-100 text-red-700 rounded-md mb-4">
                {error}
            </div>
        {/if}
    </div>
    
    {#if apiResponse !== null}
        <div class="mb-6">
            <h2 class="text-xl font-semibold mb-2">API Response Structure</h2>
            <div class="p-3 bg-gray-100 rounded-md overflow-x-auto">
                <pre class="text-sm">{JSON.stringify(Object.keys(apiResponse), null, 2)}</pre>
            </div>
        </div>
        
        <div class="mb-6">
            <h2 class="text-xl font-semibold mb-2">Has tributes array?</h2>
            <div class="p-3 bg-gray-100 rounded-md">
                {Array.isArray(apiResponse.tributes) ? 'Yes' : 'No'}
            </div>
        </div>
        
        <div class="mb-6">
            <h2 class="text-xl font-semibold mb-2">Tributes length</h2>
            <div class="p-3 bg-gray-100 rounded-md">
                {Array.isArray(apiResponse.tributes) ? apiResponse.tributes.length : 'N/A'}
            </div>
        </div>
        
        <div>
            <h2 class="text-xl font-semibold mb-2">Full API Response</h2>
            <div class="p-3 bg-gray-100 rounded-md overflow-x-auto">
                <pre class="text-sm">{JSON.stringify(apiResponse, null, 2)}</pre>
            </div>
        </div>
    {/if}
</div>