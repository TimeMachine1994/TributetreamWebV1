<script lang="ts">
    import { onMount } from 'svelte';

    interface User {
        id: string;
        name: string;
        email: string;
        nickname?: string;
        firstName?: string;
        lastName?: string;
        avatar?: Record<string, string>;
        description?: string;
        url?: string;
        roles?: string[];
    }

    // State variables
    let users = $state<User[]>([]);
    let loading = $state(true);
    let error = $state('');
    let currentPage = $state(1);
    let totalPages = $state(1);
    let itemsPerPage = $state(10);
    let searchQuery = $state('');
    let editingUser = $state<User | null>(null);
    let showEditModal = $state(false);
    let showDeleteConfirm = $state(false);
    let userToDelete = $state<string | null>(null);

    // Fetch users with pagination
    async function fetchUsers() {
        loading = true;
        try {
            const response = await fetch(`/api/admin/users?page=${currentPage}&per_page=${itemsPerPage}&search=${searchQuery}`, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            users = data.users;
            totalPages = Math.ceil(data.total / itemsPerPage);
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to load users';
        } finally {
            loading = false;
        }
    }

    // Update user
    async function updateUser(user: User) {
        try {
            const response = await fetch(`/api/admin/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            });
            if (!response.ok) throw new Error('Failed to update user');
            
            // Update local state
            const index = users.findIndex(u => u.id === user.id);
            if (index !== -1) {
                users[index] = user;
            }
            showEditModal = false;
            editingUser = null;
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to update user';
        }
    }

    // Delete user
    async function deleteUser(id: string) {
        try {
            const response = await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete user');
            
            // Update local state
            users = users.filter(user => user.id !== id);
            showDeleteConfirm = false;
            userToDelete = null;
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to delete user';
        }
    }

    // Pagination handlers
    function nextPage() {
        if (currentPage < totalPages) {
            currentPage++;
            fetchUsers();
        }
    }

    function prevPage() {
        if (currentPage > 1) {
            currentPage--;
            fetchUsers();
        }
    }

    // Search handler
    let searchTimeout: NodeJS.Timeout;
    function handleSearch() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentPage = 1;
            fetchUsers();
        }, 300);
    }

    onMount(() => {
        fetchUsers();
    });
</script>

<div class="space-y-6">
    <div class="flex justify-between items-center">
        <h1 class="text-2xl font-semibold text-gray-900">User Management</h1>
        <button 
            class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            on:click={() => {
                editingUser = {
                    id: '',
                    name: '',
                    email: '',
                };
                showEditModal = true;
            }}
        >
            Add User
        </button>
    </div>

    <!-- Search -->
    <div class="flex justify-end">
        <input
            type="text"
            placeholder="Search users..."
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
        <!-- Users Table -->
        <div class="bg-white shadow-md rounded-lg overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each users as user}
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-900">{user.name}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-500">{user.email}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-500">{user.roles?.join(', ') || 'User'}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    class="text-indigo-600 hover:text-indigo-900 mr-4"
                                    on:click={() => {
                                        editingUser = { ...user };
                                        showEditModal = true;
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    class="text-red-600 hover:text-red-900"
                                    on:click={() => {
                                        userToDelete = user.id;
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
    {#if showEditModal && editingUser}
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div class="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 class="text-xl font-semibold mb-4">{editingUser.id ? 'Edit' : 'Add'} User</h2>
                <form on:submit|preventDefault={() => updateUser(editingUser!)}>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                bind:value={editingUser.name}
                                required
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                bind:value={editingUser.email}
                                required
                            />
                        </div>
                    </div>
                    <div class="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            class="px-4 py-2 border rounded-md hover:bg-gray-50"
                            on:click={() => {
                                showEditModal = false;
                                editingUser = null;
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
                <p class="text-gray-600 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
                <div class="flex justify-end space-x-3">
                    <button
                        class="px-4 py-2 border rounded-md hover:bg-gray-50"
                        on:click={() => {
                            showDeleteConfirm = false;
                            userToDelete = null;
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        on:click={() => userToDelete && deleteUser(userToDelete)}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>
