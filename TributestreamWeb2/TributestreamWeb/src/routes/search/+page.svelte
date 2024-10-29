<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { getPageUrl } from '$lib/utils';
    export let data;
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
            const response = await fetch(
                `/api/search?search=${encodeURIComponent(searchQuery)}&page=${currentPage}`
            );
            
            if (!response.ok) throw new Error('Search failed');
            
            const data = await response.json();
            searchResults = data.results.map(result => ({
                ...result,
                url: getPageUrl(result.url),
                link: getPageUrl(result.link)
            }));
            totalPages = data.totalPages;
        } catch (error) {
            console.error('Search error:', error);
            searchResults = [];
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
        <div class="flex gap-4">
            <input 
                type="search" 
                bind:value={searchQuery}
                placeholder="Refine your search..."
                class="flex-1 p-2 border border-gray-300 rounded-md"
            />
            <button 
                type="submit"   
                class="bg-[#D5BA7F] text-black font-bold py-2 px-4 border border-transparent rounded-lg hover:text-black hover:shadow-[0_0_10px_4px_#D5BA7F] transition-all duration-300 ease-in-out"
            >
                Search
            </button>
        </div>
    </form>

    {#if isLoading}
        <div class="text-center">
            <p class="text-lg">Loading results...</p>
        </div>
    {:else if searchResults.length > 0}
        <ul class="space-y-4">
            {#each searchResults as result}
                <li class="border-b pb-4">
                    <a 
                        href={result.url || result.link} 
                        class="text-xl font-semibold text-blue-600 hover:underline"
                    >
                        {@html result.title.rendered || result.title}
                    </a>
                    {#if result.excerpt}
                        <p class="mt-2 text-gray-600">
                            {@html result.excerpt.rendered || result.excerpt}
                        </p>
                    {/if}
                </li>
            {/each}
        </ul>

        {#if totalPages > 1}
            <div class="mt-8 flex justify-center space-x-2">
                <button 
                    on:click={() => changePage(currentPage - 1)}
                    disabled={currentPage === 1}
                    class="px-3 py-1 border rounded {currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'text-blue-500'}"
                >
                    Previous
                </button>
                
                {#each Array(totalPages) as _, i}
                    <button 
                        on:click={() => changePage(i + 1)}
                        class="px-3 py-1 border rounded {currentPage === i + 1 ? 'bg-[#D5BA7F] text-black' : 'text-blue-500'}"
                    >
                        {i + 1}
                    </button>
                {/each}
                
                <button 
                    on:click={() => changePage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    class="px-3 py-1 border rounded {currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'text-blue-500'}"
                >
                    Next
                </button>
            </div>
        {/if}
    {:else if searchQuery}
        <p class="text-lg text-center">No results found for "{searchQuery}"</p>
    {/if}
</div>