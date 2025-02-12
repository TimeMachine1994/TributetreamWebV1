<script lang="ts">
    import { invalidate } from '$app/navigation';
    import EditTributeModal from '$lib/EditTributeModal.svelte';

    import type { PageData } from './$types';
    import type { Tribute } from '../../types/tribute';

    const { data } = $props<{ data: PageData }>();

    // Local state
    let searchQuery = $state('');
    let selectedTribute = $state<Tribute | null>(null);
    let loading = $state(false);
    let currentPage = $state(1);

    // Derived values
    let tributes: Tribute[] = $derived(data.tributes);
    let totalPages: number = $derived(data.totalPages);

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
        loading = true;
        try {
            const url = new URL(window.location.href);
            url.searchParams.set('search', searchQuery);
            url.searchParams.set('page', '1');
            history.pushState({}, '', url.toString());
            await invalidate('app:tributes');
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            loading = false;
        }
    }

    function handlePageChange(newPage: number) {
        if (newPage < 1 || newPage > totalPages) return;
        
        const url = new URL(window.location.href);
        url.searchParams.set('page', newPage.toString());
        history.pushState({}, '', url.toString());
        currentPage = newPage;
        invalidate('app:tributes');
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
                on:keydown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
                on:click={handleSearch}
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                disabled={loading}
            >
                {loading ? 'Searching...' : 'Search'}
            </button>
        </div>
    </div>

    <div class="overflow-x-auto">
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
                                on:click={() => selectedTribute = tribute}
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
            await invalidate('app:tributes');
            selectedTribute = null;
            loading = false;
        }}
        onError={() => {
            loading = false;
        }}
    />
{/if}
