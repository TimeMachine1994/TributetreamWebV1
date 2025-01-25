<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import EditTributeModal from '$lib/EditTributeModal.svelte';
    import type { PageData } from './$types';
    import type { Tribute } from '../../types/tribute';

    export let data: PageData;

    let searchQuery = '';
    let selectedTribute: Tribute | null = null;
    let loading = false;

    $: ({ tributes, totalPages } = data);
    $: currentPage = Number($page.url.searchParams.get('page')) || 1;

    async function handleSearch() {
        const url = new URL($page.url);
        url.searchParams.set('search', searchQuery);
        url.searchParams.set('page', '1');
        history.pushState({}, '', url.toString());
        await invalidate('app:tributes');
    }

    async function handleUpdateTribute(id: string, htmlContent: string) {
        loading = true;
        try {
            const response = await fetch('/api/tributes', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, html_content: htmlContent })
            });

            if (!response.ok) {
                throw new Error('Failed to update tribute');
            }

            await invalidate('app:tributes');
        } catch (e) {
            throw new Error(e instanceof Error ? e.message : 'Failed to update tribute');
        } finally {
            loading = false;
        }
    }

    function handlePageChange(newPage: number) {
        if (newPage >= 1 && newPage <= totalPages) {
            const url = new URL($page.url);
            url.searchParams.set('page', newPage.toString());
            history.pushState({}, '', url.toString());
            invalidate('app:tributes');
        }
    }

    $: paginationRange = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        if (totalPages <= 5) return i + 1;
        if (currentPage <= 3) return i + 1;
        if (currentPage >= totalPages - 2) return totalPages - 4 + i;
        return currentPage - 2 + i;
    });
</script>

<div class="p-6 max-w-7xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Tributestream Dashboard</h1>

    <!-- Search -->
    <div class="mb-6">
        <div class="flex gap-2">
            <input
                type="text"
                bind:value={searchQuery}
                placeholder="Search tributes..."
                class="flex-1 p-2 border rounded"
                on:keydown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
                on:click={handleSearch}
                class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                disabled={loading}
            >
                Search
            </button>
        </div>
    </div>

    <!-- Loading State -->
    {#if loading}
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
        </div>
    {/if}
        <!-- Tributes Table -->
        <div class="bg-white shadow rounded-lg overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created At
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tribute Content
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each tributes as tribute}
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap">
                                {tribute.loved_one_name}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                {new Date(tribute.created_at).toLocaleDateString()}
                            </td>
                            <td class="px-6 py-4">
                                <div class="prose max-h-32 overflow-y-auto">
                                    {@html tribute.html_content || 'No content available'}
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <button
                                    on:click={() => selectedTribute = tribute}
                                    class="text-indigo-600 hover:text-indigo-900"
                                >
                                    Edit HTML
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div class="mt-4 flex justify-center gap-2">
            <button
                on:click={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
            >
                Previous
            </button>
            
            {#each paginationRange as page}
                <button
                    on:click={() => handlePageChange(page)}
                    class="px-3 py-1 border rounded {currentPage === page ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}"
                >
                    {page}
                </button>
            {/each}
            
            <button
                on:click={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
            >
                Next
            </button>
        </div>
</div>

<!-- Edit Modal -->
{#if selectedTribute}
    <EditTributeModal
        tribute={selectedTribute}
        onClose={() => selectedTribute = null}
        onSave={handleUpdateTribute}
    />
{/if}
