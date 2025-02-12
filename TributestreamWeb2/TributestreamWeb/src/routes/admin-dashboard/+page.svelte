<script lang="ts">
    import { goto } from '$app/navigation';
    import EditTributeModal from '$lib/EditTributeModal.svelte';

    import type { PageData } from './$types';
    import type { Tribute } from '../../types/tribute';

    const { data } = $props<{ data: PageData }>();

    // Local state
    let searchQuery = $state(data.searchQuery || '');
    let selectedTribute = $state<Tribute | null>(null);
    let loading = $state(false);

    // Derived values from server data
    let tributes = $derived(data.tributes);
    let totalPages = $derived(data.totalPages);
    let totalItems = $derived(data.totalItems);
    let currentPage = $derived(data.currentPage);
    let perPage = $derived(data.perPage);

    // Track if the search query was changed by user input
    let userChangedQuery = $state(false);

    // Debug logging for state changes
    $effect(() => {
        console.log('[State Debug] searchQuery changed:', searchQuery);
    });

    $effect(() => {
        console.log('[State Debug] data.searchQuery changed:', data.searchQuery);
    });

    // Sync URL query with local state, but only if user hasn't modified it
    $effect(() => {
        if (!userChangedQuery && data.searchQuery !== searchQuery) {
            console.log('[Sync Debug] Updating searchQuery from URL:', {
                from: searchQuery,
                to: data.searchQuery
            });
            searchQuery = data.searchQuery;
        }
    });

    // Reset loading state when data changes
    $effect(() => {
        loading = false;
    });

    // Show loading feedback in the UI
    let loadingText = $derived(() => {
        if (!loading) return 'Search';
        return searchQuery ? 'Searching...' : 'Loading...';
    });

    // Show loading state in the table
    let tableLoadingClass = $derived(() => loading ? 'opacity-50' : '');

    function calculatePaginationRange() {
        const length = Math.min(5, totalPages);
        const range = Array.from({ length }, (_, i) => {
            if (totalPages <= 5) return i + 1;
            if (currentPage <= 3) return i + 1;
            if (currentPage >= totalPages - 2) return totalPages - 4 + i;
            return currentPage - 2 + i;
        });
        return range;
    }

    let paginationRange = $derived(calculatePaginationRange());

    async function handleSearch() {
        if (loading) {
            console.log('[Search Debug] Search cancelled - already loading');
            return;
        }
        
        console.log('[Search Debug] Starting search with query:', searchQuery);
        loading = true;
        userChangedQuery = false; // Reset the user input flag
        
        try {
            const url = new URL(window.location.href);
            url.searchParams.set('search', searchQuery);
            url.searchParams.set('page', '1'); // Reset to first page on new search
            url.searchParams.set('per_page', String(perPage));
            
            console.log('[Search Debug] Navigating to:', url.toString());
            await goto(url.toString(), { 
                keepFocus: true, 
                invalidateAll: true 
            });
        } catch (error) {
            console.error('[Search Debug] Search error:', error);
            userChangedQuery = true; // Restore the flag if search fails
        } finally {
            loading = false;
            console.log('[Search Debug] Search completed');
        }
    }

    async function handlePageChange(newPage: number) {
        if (newPage < 1 || newPage > totalPages || loading) return;
        
        loading = true;
        try {
            const url = new URL(window.location.href);
            url.searchParams.set('page', newPage.toString());
            url.searchParams.set('per_page', String(perPage));
            if (searchQuery) {
                url.searchParams.set('search', searchQuery);
            }
            await goto(url.toString(), { keepFocus: true, invalidateAll: true });
        } catch (error) {
            console.error('Page change error:', error);
        } finally {
            loading = false;
        }
    }
</script>

<div class="p-6">
    <div class="mb-6">
        <div class="flex gap-4">
            <input
                type="text"
                bind:value={searchQuery}
                placeholder="Search tributes..."
                class="flex-1 p-2 border rounded-md"
                on:input={(e) => {
                    console.log('[Input Debug] Input event:', e.currentTarget.value);
                    userChangedQuery = true;
                }}
                on:keydown={(e) => {
                    console.log('[Input Debug] Keydown event:', e.key);
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        userChangedQuery = false;
                        handleSearch();
                    }
                }}
            />
            <button
                on:click={handleSearch}
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                disabled={loading}
            >
                {loadingText || 'Search'}
            </button>
        </div>
    </div>

    <div class="overflow-x-auto {tableLoadingClass}">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                {#each tributes as tribute}
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">{tribute.loved_one_name}</td>
                        <td class="px-6 py-4 whitespace-nowrap">{tribute.slug}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            {new Date(tribute.created_at).toLocaleDateString()}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <button
                                on:click={async () => {
                                    // First show the modal with initial data
                                    selectedTribute = tribute;
                                    
                                    // Then fetch latest data
                                    loading = true;
                                    try {
                                        const response = await fetch(`?/getTribute&id=${tribute.id}`, { method: 'POST' });
                                        const result = await response.json();
                                        if (result.success) {
                                            // Update the modal with fresh data
                                            selectedTribute = {
                                                id: result.tribute.id,
                                                loved_one_name: result.tribute.loved_one_name,
                                                html_content: result.tribute.custom_html || '',
                                                created_at: result.tribute.created_at,
                                                slug: result.tribute.slug
                                            };
                                        }
                                    } catch (error) {
                                        console.error('Error fetching tribute:', error);
                                    } finally {
                                        loading = false;
                                    }
                                }}
                                class="text-indigo-600 hover:text-indigo-900"
                            >
                                Edit
                            </button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <div class="mt-4 flex justify-center gap-2">
        <button
            on:click={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            class="px-3 py-1 border rounded-md disabled:opacity-50"
        >
            Previous
        </button>
        {#each paginationRange as page}
            <button
                on:click={() => handlePageChange(page)}
                class="px-3 py-1 border rounded-md {page === currentPage ? 'bg-indigo-600 text-white' : ''}"
            >
                {page}
            </button>
        {/each}
        <button
            on:click={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            class="px-3 py-1 border rounded-md disabled:opacity-50"
        >
            Next
        </button>
    </div>
</div>

{#if selectedTribute}
    <EditTributeModal
        tribute={selectedTribute}
        onClose={() => selectedTribute = null}
        form="?/updateTribute"
        onSuccess={async () => {
            console.log('Invalidating and refreshing data...');
            await goto(window.location.href, { keepFocus: true, invalidateAll: true });
            selectedTribute = null;
            loading = false;
        }}
        onError={() => {
            loading = false;
        }}
    />
{/if}
