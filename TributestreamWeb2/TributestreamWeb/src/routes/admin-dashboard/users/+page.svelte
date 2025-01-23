<script lang="ts">
    import { onMount } from 'svelte';

    interface User {
        id: string;
        name: string;
        email: string;
        nickname?: string;
        firstName?: string;
        lastName?: string;
        roles?: string[];
        created_at?: string;
        last_login?: string;
    }

    let users = $state<User[]>([]);
    let loading = $state(true);
    let error = $state('');
    let currentPage = $state(1);
    let totalPages = $state(1);
    let searchQuery = $state('');
    let searchTimeout: ReturnType<typeof window.setTimeout>;

    async function fetchUsers(page: number = 1, search: string = '') {
        loading = true;
        error = '';
        
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                per_page: '10'
            });
            
            if (search) {
                queryParams.set('search', search);
            }

            const response = await fetch(`/api/admin/users?${queryParams}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            users = data.users;
            totalPages = data.total_pages || 1;
            currentPage = page;
        } catch (err) {
            error = err instanceof Error ? err.message : 'An error occurred while fetching users';
        } finally {
            loading = false;
        }
    }

    function handleSearch() {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        searchTimeout = setTimeout(() => {
            currentPage = 1;
            fetchUsers(1, searchQuery);
        }, 300);
    }

    function formatDate(dateString: string | undefined): string {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    onMount(() => {
        fetchUsers();
    });
</script>

<div class="space-y-6">
    <div class="sm:flex sm:items-center sm:justify-between">
        <h1 class="text-2xl font-semibold text-gray-900">Users</h1>
        <div class="mt-4 sm:mt-0">
            <input
                type="text"
                placeholder="Search users..."
                class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                bind:value={searchQuery}
                on:input={handleSearch}
            />
        </div>
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
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
            <ul class="divide-y divide-gray-200">
                {#each users as user}
                    <li>
                        <div class="px-4 py-4 sm:px-6">
                            <div class="flex items-center justify-between">
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-medium text-indigo-600 truncate">
                                        {user.name}
                                    </p>
                                    <p class="mt-1 text-sm text-gray-500">
                                        {user.email}
                                    </p>
                                </div>
                                <div class="ml-4 flex-shrink-0 flex space-x-4">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {user.roles?.join(', ') || 'No roles'}
                                    </span>
                                </div>
                            </div>
                            <div class="mt-2 sm:flex sm:justify-between">
                                <div class="sm:flex">
                                    <p class="flex items-center text-sm text-gray-500">
                                        Created: {formatDate(user.created_at)}
                                    </p>
                                </div>
                                <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                    Last Login: {formatDate(user.last_login)}
                                </div>
                            </div>
                        </div>
                    </li>
                {/each}
            </ul>
        </div>

        <!-- Pagination -->
        {#if totalPages > 1}
            <div class="flex justify-center space-x-2 mt-4">
                <button
                    class="px-4 py-2 border rounded-md {currentPage === 1 ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-50'}"
                    disabled={currentPage === 1}
                    on:click={() => fetchUsers(currentPage - 1, searchQuery)}
                >
                    Previous
                </button>
                
                <span class="px-4 py-2 text-gray-700">
                    Page {currentPage} of {totalPages}
                </span>
                
                <button
                    class="px-4 py-2 border rounded-md {currentPage === totalPages ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-50'}"
                    disabled={currentPage === totalPages}
                    on:click={() => fetchUsers(currentPage + 1, searchQuery)}
                >
                    Next
                </button>
            </div>
        {/if}
    {/if}
</div>
