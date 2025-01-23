<script lang="ts">
    import { onMount } from 'svelte';

    interface Tribute {
        id: string;
        loved_one_name: string;
        slug: string;
        user_id: string;
        created_at: string;
        status?: string;
        memorial_date?: string;
        memorial_location?: string;
    }

    // State variables
    let tributes = $state<Tribute[]>([]);
    let loading = $state(true);
    let error = $state('');
    let currentPage = $state(1);
    let totalPages = $state(1);
    let itemsPerPage = $state(10);
    let searchQuery = $state('');
    let editingTribute = $state<Tribute | null>(null);
    let showEditModal = $state(false);
    let showDeleteConfirm = $state(false);
    let tributeToDelete = $state<string | null>(null);

    // Fetch tributes with pagination
    async function fetchTributes() {
        loading = true;
        try {
            const response = await fetch(`/api/tribute-table?page=${currentPage}&per_page=${itemsPerPage}&search=${searchQuery}`, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Failed to fetch tributes');
            const data = await response.json();
            tributes = data.tributes;
            totalPages = Math.ceil(data.total / itemsPerPage);
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to load tributes';
        } finally {
            loading = false;
        }
    }

    // Update tribute
    async function updateTribute(tribute: Tribute) {
        try {
            const response = await fetch(`/api/tribute-table/${tribute.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(tribute)
            });
            if (!response.ok) throw new Error('Failed to update tribute');
            
            // Update local state
            const index = tributes.findIndex(t => t.id === tribute.id);
            if (index !== -1) {
                tributes[index] = tribute;
            }
            showEditModal = false;
            editingTribute = null;
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to update tribute';
        }
    }

    // Delete tribute
    async function deleteTribute(id: string) {
        try {
            const response = await fetch(`/api/tribute-table/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete tribute');
            
            // Update local state
            tributes = tributes.filter(tribute => tribute.id !== id);
            showDeleteConfirm = false;
            tributeToDelete = null;
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to delete tribute';
        }
    }

    // Pagination handlers
    function nextPage() {
        if (currentPage < totalPages) {
            currentPage++;
            fetchTributes();
        }
    }

    function prevPage() {
        if (currentPage > 1) {
            currentPage--;
            fetchTributes();
        }
    }

    // Search handler
    let searchTimeout: NodeJS.Timeout;
    function handleSearch() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentPage = 1;
            fetchTributes();
        }, 300);
    }

    // Format date helper
    function formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    onMount(() => {
        fetchTributes();
    });
</script>

<div class="space-y-6">
    <div class="flex justify-between items-center">
        <h1 class="text-2xl font-semibold text-gray-900">Tribute Management</h1>
        <button 
            class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            on:click={() => {
                editingTribute = {
                    id: '',
                    loved_one_name: '',
                    slug: '',
                    user_id: '',
                    created_at: new Date().toISOString(),
                };
                showEditModal = true;
            }}
        >
            Add Tribute
        </button>
    </div>

    <!-- Search -->
    <div class="flex justify-end">
        <input
            type="text"
            placeholder="Search tributes..."
            class="px-4 py-2 border rounded-md w-64"
            bind:value={searchQuery}
            on:input={handleSearch}
        />
    </div>

    {#if loading}
        <div class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
    {:else if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
        </div>
    {:else}
        <!-- Tributes Table -->
        <div class="bg-white shadow-md rounded-lg overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Memorial Date</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each tributes as tribute}
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-900">{tribute.loved_one_name}</div>
                                <div class="text-sm text-gray-500">{tribute.slug}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-500">{formatDate(tribute.created_at)}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {
                                    tribute.status === 'active' ? 'bg-green-100 text-green-800' :
                                    tribute.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                }">
                                    {tribute.status || 'Draft'}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-500">
                                    {tribute.memorial_date ? formatDate(tribute.memorial_date) : 'Not set'}
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    class="text-indigo-600 hover:text-indigo-900 mr-4"
                                    on:click={() => {
                                        editingTribute = { ...tribute };
                                        showEditModal = true;
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    class="text-red-600 hover:text-red-900"
                                    on:click={() => {
                                        tributeToDelete = tribute.id;
                                        showDeleteConfirm = true;
                                    }}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div class="flex justify-between items-center mt-4">
            <div class="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
            </div>
            <div class="flex space-x-2">
                <button
                    class="px-4 py-2 border rounded-md {currentPage === 1 ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-50'}"
                    on:click={prevPage}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <button
                    class="px-4 py-2 border rounded-md {currentPage === totalPages ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-50'}"
                    on:click={nextPage}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    {/if}

    <!-- Edit Modal -->
    {#if showEditModal && editingTribute}
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div class="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 class="text-xl font-semibold mb-4">{editingTribute.id ? 'Edit' : 'Add'} Tribute</h2>
                <form on:submit|preventDefault={() => updateTribute(editingTribute!)}>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Loved One's Name</label>
                            <input
                                type="text"
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                bind:value={editingTribute.loved_one_name}
                                required
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Status</label>
                            <select
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                bind:value={editingTribute.status}
                            >
                                <option value="draft">Draft</option>
                                <option value="pending">Pending</option>
                                <option value="active">Active</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Memorial Date</label>
                            <input
                                type="date"
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                bind:value={editingTribute.memorial_date}
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Memorial Location</label>
                            <input
                                type="text"
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                bind:value={editingTribute.memorial_location}
                            />
                        </div>
                    </div>
                    <div class="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            class="px-4 py-2 border rounded-md hover:bg-gray-50"
                            on:click={() => {
                                showEditModal = false;
                                editingTribute = null;
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    {/if}

    <!-- Delete Confirmation Modal -->
    {#if showDeleteConfirm}
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div class="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 class="text-xl font-semibold mb-4">Confirm Delete</h2>
                <p class="text-gray-600 mb-6">Are you sure you want to delete this tribute? This action cannot be undone.</p>
                <div class="flex justify-end space-x-3">
                    <button
                        class="px-4 py-2 border rounded-md hover:bg-gray-50"
                        on:click={() => {
                            showDeleteConfirm = false;
                            tributeToDelete = null;
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        on:click={() => tributeToDelete && deleteTribute(tributeToDelete)}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>
