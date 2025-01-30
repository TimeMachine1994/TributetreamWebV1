<script lang="ts">
    // Import required SvelteKit and local components
    import { invalidate } from '$app/navigation';
    import EditTributeModal from '$lib/EditTributeModal.svelte';

    // Import types
    import type { PageData } from './$types';
    import type { Tribute } from '../../types/tribute';

    // Access incoming page data
    // $props is used here to destructure SvelteKit's data property in your Svelte file
    const { data } = $props<{ data: PageData }>();

    // Local state using SvelteKit 5 $state
    // These are not standard SvelteKit constructs; presumably a specialized store or plugin is being used
    let searchQuery = $state('');
    let selectedTribute = $state<Tribute | null>(null);
    let loading = $state(false);
    let currentPage = $state(1);

    // Derived values using $derived
    // Similarly, $derived is presumably a specialized store or plugin
    let tributes: Tribute[] = $derived(data.tributes);
    let totalPages: number = $derived(data.totalPages);

    /**
     * Calculate the pagination range.
     * We show a maximum of 5 pagination buttons at a time.
     */
    function calculatePaginationRange() {
        // Log the current page and total pages
        console.log('[calculatePaginationRange] currentPage:', currentPage, 'totalPages:', totalPages);

        const length = Math.min(5, totalPages);
        return Array.from({ length }, (_, i) => {
            if (totalPages <= 5) return i + 1;
            if (currentPage <= 3) return i + 1;
            if (currentPage >= totalPages - 2) return totalPages - 4 + i;
            return currentPage - 2 + i;
        });
    }

    // Another derived value that uses calculatePaginationRange
    let paginationRange = $derived(calculatePaginationRange());

    /**
     * Handles the search action when the search button is clicked or
     * when the user presses Enter in the search input.
     */
    async function handleSearch() {
        // Log the search query before proceeding
        console.log('[handleSearch] searchQuery:', searchQuery);

        loading = true;
        console.log('[handleSearch] loading set to true');

        try {
            const url = new URL(window.location.href);
            url.searchParams.set('search', searchQuery);
            url.searchParams.set('page', '1');

            console.log('[handleSearch] Updating URL with new search params:', url.toString());

            history.pushState({}, '', url.toString());
            console.log('[handleSearch] Invalidating tributes data...');

            await invalidate('app:tributes');
            console.log('[handleSearch] Data invalidated successfully');
        } catch (error) {
            console.error('[handleSearch] Error while searching tributes:', error);
        } finally {
            loading = false;
            console.log('[handleSearch] loading set to false');
        }
    }

    /**
     * Handles updating a tribute's HTML content by sending a PUT request to /api/tributes.
     */
    async function handleUpdateTribute(id: string, htmlContent: string) {
        // Log the ID and updated content
        console.log('[handleUpdateTribute] Updating tribute with ID:', id);
        console.log('[handleUpdateTribute] New HTML content:', htmlContent);

        loading = true;
        console.log('[handleUpdateTribute] loading set to true');

        try {
            const response = await fetch('/api/tributes', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, html_content: htmlContent })
            });

            console.log('[handleUpdateTribute] PUT request sent to /api/tributes');

            if (!response.ok) {
                console.error('[handleUpdateTribute] Non-OK response:', response);
                throw new Error('Failed to update tribute');
            }

            console.log('[handleUpdateTribute] Tribute updated successfully. Invalidating tributes data...');
            await invalidate('app:tributes');
            console.log('[handleUpdateTribute] Data invalidated successfully.');
        } catch (e) {
            console.error('[handleUpdateTribute] Error while updating tribute:', e);
            throw new Error(e instanceof Error ? e.message : 'Failed to update tribute');
        } finally {
            loading = false;
            console.log('[handleUpdateTribute] loading set to false');
        }
    }

    /**
     * Handles changing pages in the pagination bar.
     */
    function handlePageChange(newPage: number) {
        console.log('[handlePageChange] Request to change to page:', newPage);

        if (newPage >= 1 && newPage <= totalPages) {
            // Update the URL to reflect new page
            const url = new URL(window.location.href);
            url.searchParams.set('page', newPage.toString());

            console.log('[handlePageChange] Updated URL for page change:', url.toString());

            history.pushState({}, '', url.toString());
            currentPage = newPage;

            console.log('[handlePageChange] currentPage set to:', currentPage);
            console.log('[handlePageChange] Invalidating tributes data...');
            invalidate('app:tributes');
        } else {
            console.warn('[handlePageChange] Page out of valid range. No action taken.');
        }
    }
</script>

<!-- Page Container -->
<div class="p-6 max-w-7xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Tributestream Dashboard</h1>

    <!-- Search Section -->
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

    <!-- Loading Overlay -->
    {#if loading}
        <!-- Dark semi-transparent overlay with a spinner in the center -->
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
                <!-- Render each tribute with a key of tribute.id -->
                {#each tributes as tribute (tribute.id)}
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
                            <!-- Sets the selectedTribute to show the modal for editing -->
                            <button
                                on:click={() => {
                                    console.log('[Table] Setting selectedTribute to tribute with ID:', tribute.id);
                                    selectedTribute = tribute;
                                }}
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

    <!-- Pagination Controls -->
    <div class="mt-4 flex justify-center gap-2">
        <button
            on:click={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
        >
            Previous
        </button>

        <!-- Dynamically render pagination buttons based on calculatePaginationRange -->
        {#each calculatePaginationRange() as page}
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

<!-- Edit Tribute Modal -->
{#if selectedTribute}
    <!-- This modal will show when selectedTribute is not null -->
    <EditTributeModal
        tribute={selectedTribute}
        onClose={() => {
            console.log('[EditTributeModal] Closing modal, setting selectedTribute to null');
            selectedTribute = null;
        }}
        onSave={handleUpdateTribute}
    />
{/if}
