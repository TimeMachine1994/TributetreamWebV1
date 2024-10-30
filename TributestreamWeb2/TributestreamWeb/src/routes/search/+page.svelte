// src/routes/search/+page.server.ts
import { error } from '@sveltejs/kit';
import { WORDPRESS_API_URL } from '$env/static/private';

export const config = {
    runtime: 'edge'
};

/** @type {import('./$types').PageServerLoad} */
export async function load({ url, fetch }) {
    const searchQuery = url.searchParams.get('q') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    
    if (!searchQuery) {
        return {
            query: '',
            results: [],
            currentPage: 1,
            totalPages: 0,
            totalItems: 0
        };
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(
            `${WORDPRESS_API_URL}/wp-json/wp/v2/search?` + 
            new URLSearchParams({
                search: searchQuery,
                page: page.toString(),
                per_page: '10',
                _embed: 'true'
            }),
            {
                headers: {
                    'Accept': 'application/json'
                },
                signal: controller.signal
            }
        );

        clearTimeout(timeout);

        if (!response.ok) {
            throw error(response.status, `Search failed with status ${response.status}`);
        }

        const results = await response.json();
        const totalItems = parseInt(response.headers.get('X-WP-Total') || '0');
        const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');

        return {
            query: searchQuery,
            results: results.map(item => ({
                id: item.id,
                title: { rendered: item.title },
                excerpt: { rendered: item.excerpt || '' },
                url: item.url || item.link,
                type: item.type,
                subtype: item.subtype
            })),
            currentPage: page,
            totalPages,
            totalItems
        };

    } catch (err) {
        console.error('Search error:', err);
        if (err.name === 'AbortError') {
            throw error(504, 'Search request timed out. Please try again.');
        }
        throw error(500, 'Failed to fetch search results');
    }
}

// src/routes/search/+page.svelte
<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { enhance } from '$app/forms';
    
    /** @type {import('./$types').PageData} */
    export let data;

    let isSubmitting = false;

    $: searchQuery = data.query;
    $: results = data.results;
    $: currentPage = data.currentPage;
    $: totalPages = data.totalPages;

    function handleSubmit(event: SubmitEvent) {
        const form = event.target as HTMLFormElement;
        const searchInput = form.querySelector('input[name="q"]') as HTMLInputElement;
        
        if (!searchInput.value.trim()) {
            event.preventDefault();
            return;
        }

        isSubmitting = true;
        goto(`?q=${encodeURIComponent(searchInput.value)}&page=1`, {
            replaceState: true
        }).finally(() => {
            isSubmitting = false;
        });
    }

    async function changePage(newPage: number) {
        if (newPage >= 1 && newPage <= totalPages) {
            await goto(`?q=${encodeURIComponent(searchQuery)}&page=${newPage}`, {
                keepFocus: true
            });
        }
    }
</script>

<svelte:head>
    <title>Search {searchQuery ? `- ${searchQuery}` : ''} - Tributestream</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Search Results</h1>

    <form 
        method="GET"
        action="/search"
        on:submit|preventDefault={handleSubmit}
        class="mb-8"
    >
        <div class="flex gap-4">
            <input
                type="search"
                name="q"
                value={searchQuery}
                placeholder="Refine your search..."
                class="flex-1 p-2 border border-gray-300 rounded-md"
            />
            <button
                type="submit"
                disabled={isSubmitting}
                class="bg-[#D5BA7F] text-black font-bold py-2 px-4 border border-transparent rounded-lg 
                       hover:text-black hover:shadow-[0_0_10px_4px_#D5BA7F] transition-all duration-300 ease-in-out
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? 'Searching...' : 'Search'}
            </button>
        </div>
    </form>

    {#if results.length > 0}
        <ul class="space-y-4">
            {#each results as result (result.id)}
                <li class="border-b pb-4">
                    <a
                        href={result.url}
                        class="text-xl font-semibold text-blue-600 hover:underline"
                    >
                        {@html result.title.rendered}
                    </a>
                    {#if result.excerpt}
                        <p class="mt-2 text-gray-600">
                            {@html result.excerpt.rendered}
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