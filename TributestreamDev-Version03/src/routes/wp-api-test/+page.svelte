<script lang="ts">
    import { onMount } from 'svelte';
    
    // State variables
    let searchTerm = $state('');
    let apiResponse = $state<any>(null);
    let isLoading = $state(false);
    let error = $state<string | null>(null);
    
    // WordPress API base URL
    const WP_API_BASE = 'https://wp.tributestream.com/wp-json/funeral/v2';
    
    // Function to call the WordPress API directly
    async function testDirectWpApi() {
        if (!searchTerm.trim()) {
            error = 'Please enter a search term';
            return;
        }
        
        error = null;
        isLoading = true;
        
        try {
            // Call the WordPress API directly
            const wpApiUrl = `${WP_API_BASE}/tribute-pages?search=${encodeURIComponent(searchTerm.trim())}&page=1`;
            console.log('Calling WordPress API directly:', wpApiUrl);
            
            const response = await fetch(wpApiUrl);
            console.log('WordPress API response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`WordPress API returned status ${response.status}`);
            }
            
            // Get the raw response
            const text = await response.text();
            console.log('WordPress API raw response:', text.substring(0, 500) + (text.length > 500 ? '...' : ''));
            
            try {
                const data = JSON.parse(text);
                apiResponse = data;
                console.log('WordPress API parsed response:', data);
            } catch (jsonError) {
                console.error('JSON parse error:', jsonError);
                throw new Error(`Failed to parse JSON: ${text.substring(0, 100)}...`);
            }
        } catch (err) {
            error = err instanceof Error ? err.message : 'An unknown error occurred';
            console.error('Direct WordPress API test error:', err);
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="container mx-auto p-4 max-w-3xl">
    <h1 class="text-2xl font-bold mb-4">Direct WordPress API Test</h1>
    <p class="mb-4 text-gray-600">This page tests the WordPress API directly, bypassing the SvelteKit API endpoint.</p>
    
    <div class="mb-6 p-4 bg-gray-100 rounded-lg">
        <div class="flex gap-2 mb-4">
            <input
                type="text"
                bind:value={searchTerm}
                placeholder="Enter search term"
                class="flex-1 px-4 py-2 border rounded-md"
            />
            <button
                on:click={testDirectWpApi}
                disabled={isLoading}
                class="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
            >
                {isLoading ? 'Loading...' : 'Test WordPress API'}
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
            <h2 class="text-xl font-semibold mb-2">Has data.tributes array?</h2>
            <div class="p-3 bg-gray-100 rounded-md">
                {apiResponse.data && Array.isArray(apiResponse.data.tributes) ? 'Yes' : 'No'}
            </div>
        </div>
        
        <div class="mb-6">
            <h2 class="text-xl font-semibold mb-2">Tributes length</h2>
            <div class="p-3 bg-gray-100 rounded-md">
                {apiResponse.data && Array.isArray(apiResponse.data.tributes) ? apiResponse.data.tributes.length : 'N/A'}
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