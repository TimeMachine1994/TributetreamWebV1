// src/routes/search/+page.server.ts
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url, fetch }) {
    const query = url.searchParams.get('q') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    
    if (!query) {
        return { query: '', results: [], currentPage: 1, totalPages: 0 };
    }

    try {
        const response = await fetch(
            `https://tributestream.com/wp-json/wp/v2/search?` + 
            new URLSearchParams({
                search: query,
                page: page.toString(),
                per_page: '10',
                _embed: 'true'
            })
        );

        if (!response.ok) {
            throw error(response.status, 'Failed to fetch search results');
        }

        const results = await response.json();
        const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');

        return {
            query,
            results,
            currentPage: page,
            totalPages
        };
    } catch (err) {
        console.error('Search error:', err);
        throw error(500, 'Failed to fetch search results');
    }
}

// src/routes/search/+page.svelte
<script lang="ts">
    import { goto } from '$app/navigation';
    
    /** @type {import('./$types').PageData} */
    export let data;

    let isLoading = false;

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const searchInput = form.querySelector('input[name="q"]') as HTMLInputElement;
        
        if (!searchInput.value.trim()) return;
        
        isLoading = true;
        await goto(`?q=${encodeURIComponent(searchInput.value)}&page=1`);
        isLoading = false;
    }

    async function changePage(newPage: number) {
        if (newPage >= 1 && newPage <= data.totalPages) {
            isLoading = true;
            await goto(`?q=${encodeURIComponent(data.query)}&page=${newPage}`);
            isLoading = false;
        }
    }
</script>

<svelte:head>
    <title>Search {data.query ? `- ${data.query}` : ''} - Tributestream</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Search</h1>

    <form 
        on:submit={handleSubmit}
        class="mb-8"
    >
        <div class="flex gap-4">
            <input
                type="search"
                name="q"
                value={data.query}
                placeholder="Search Tributestream..."
                class="flex-1 p-2 border border-gray-300 rounded-md"
                aria-label="Search query"
            />
            <button
                type="submit"
                disabled={isLoading}
                class="bg-[#D5BA7F] text-black font-bold py-2 px-4 rounded-lg
                       hover:shadow-[0_0_10px_4px_#D5BA7F] transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Searching...' : 'Search'}
            </button>
        </div>
    </form>

    {#if data.results.length > 0}
        <div class="space-y-6">
            {#each data.results as result (result.id)}
                <article class="border-b pb-4">
                    <a
                        href={result.url}
                        class="text-xl font-semibold hover:text-[#D5BA7F] transition-colors"
                    >
                        {@html result.title.rendered || result.title}
                    </a>
                </article>
            {/each}
        </div>

        {#if data.totalPages > 1}
            <div class="mt-8 flex justify-center gap-2">
                <button
                    on:click={() => changePage(data.currentPage - 1)}
                    disabled={data.currentPage === 1 || isLoading}
                    class="px-4 py-2 border rounded-lg hover:bg-[#D5BA7F] hover:text-black transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                
                {#each Array(data.totalPages) as _, i}
                    {#if i + 1 === 1 || i + 1 === data.totalPages || (i + 1 >= data.currentPage - 1 && i + 1 <= data.currentPage + 1)}
                        <button
                            on:click={() => changePage(i + 1)}
                            class="px-4 py-2 border rounded-lg 
                                   {data.currentPage === i + 1 ? 'bg-[#D5BA7F] text-black' : 'hover:bg-[#D5BA7F] hover:text-black'} 
                                   transition-colors"
                        >
                            {i + 1}
                        </button>
                    {:else if i + 1 === data.currentPage - 2 || i + 1 === data.currentPage + 2}
                        <span class="px-2 py-2">...</span>
                    {/if}
                {/each}
                
                <button
                    on:click={() => changePage(data.currentPage + 1)}
                    disabled={data.currentPage === data.totalPages || isLoading}
                    class="px-4 py-2 border rounded-lg hover:bg-[#D5BA7F] hover:text-black transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        {/if}
    {:else if data.query}
        <p class="text-center text-lg">No results found for "{data.query}"</p>
    {/if}
</div>