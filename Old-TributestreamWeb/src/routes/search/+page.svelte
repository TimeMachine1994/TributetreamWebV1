<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    
    let searchQuery = '';
    let searchResults = [];
    let isLoading = false;
    let currentPage = 1;
    let totalPages = 1;
    
    onMount(() => {
        searchQuery = $page.url.searchParams.get('q') || '';
        if (searchQuery) {
            performSearch();
        }
    });
    
    async function performSearch() {
        isLoading = true;
        try {
            const response = await fetch(`https://tributestream.com/wp-json/wp/v2/search?search=${encodeURIComponent(searchQuery)}&page=${currentPage}`);
            if (!response.ok) throw new Error('Search failed');
            const data = await response.json();
            searchResults = data;
            totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            isLoading = false;
        }
    }
    
    function handleSubmit() {
        currentPage = 1;
        performSearch();
    }
    
    function changePage(newPage: number) {
        if (newPage >= 1 && newPage <= totalPages) {
            currentPage = newPage;
            performSearch();
        }
    }
    </script>
    
    <svelte:head>
        <title>Search Results - Tributestream</title>
    </svelte:head>
    
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-6">Search Results</h1>
    
        <form on:submit|preventDefault={handleSubmit} class="mb-8">
            <input 
                type="search" 
                bind:value={searchQuery}
                placeholder="Refine your search..."
                class="w-full p-2 border border-gray-300 rounded-md"
            />
            <button type="submit" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Search
            </button>
        </form>
    
        {#if isLoading}
            <div class="text-center">
                <p class="text-lg">Loading results...</p>
            </div>
        {:else if searchResults.length > 0}
            <ul class="space-y-4">
                {#each searchResults as result}
                    <li class="border-b pb-4">
                        <a href={result.url} class="text-xl font-semibold text-blue-600 hover:underline">
                            {result.title}
                        </a>
                        <p class="mt-2 text-gray-600">{result.excerpt}</p>
                    </li>
                {/each}
            </ul>
    
            <div class="mt-8 flex justify-center space-x-2">
                {#each Array(totalPages) as _, i}
                    <button 
                        on:click={() => changePage(i + 1)}
                        class="px-3 py-1 border rounded {currentPage === i + 1 ? 'bg-blue-500 text-white' : 'text-blue-500'}"
                    >
                        {i + 1}
                    </button>
                {/each}
            </div>
        {:else}
            <p class="text-lg text-center">No results found for "{searchQuery}"</p>
        {/if}
    </div>
    