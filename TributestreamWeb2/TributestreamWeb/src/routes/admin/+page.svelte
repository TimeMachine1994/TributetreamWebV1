<script lang="ts">
    import { onMount } from 'svelte';

    interface Tribute {
        id: string;
        loved_one_name: string;
        created_at: string;
        slug: string;
        user_id: string;
    }

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

    // State variables with proper typing
    let stats = $state({
        totalUsers: 0,
        totalTributes: 0,
        recentTributes: [] as Tribute[],
        recentUsers: [] as User[]
    });

    let loading = $state(true);
    let error = $state('');

    // Fetch dashboard data
    async function fetchDashboardData() {
        try {
            // Fetch users count
            const usersResponse = await fetch('/api/user_data?count=true', {
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (!usersResponse.ok) throw new Error('Failed to fetch users count');
            const usersData = await usersResponse.json();
            stats.totalUsers = usersData.count;

            // Fetch tributes data
            const tributesResponse = await fetch('/api/tribute-table?recent=true', {
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (!tributesResponse.ok) throw new Error('Failed to fetch tributes');
            const tributesData = await tributesResponse.json();
            stats.totalTributes = tributesData.total;
            stats.recentTributes = tributesData.recent || [];

            // Fetch recent users
            const recentUsersResponse = await fetch('/api/user_data?recent=true', {
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (!recentUsersResponse.ok) throw new Error('Failed to fetch recent users');
            const recentUsersData = await recentUsersResponse.json();
            stats.recentUsers = recentUsersData.users || [];

        } catch (err: unknown) {
            error = err instanceof Error ? err.message : 'An unknown error occurred';
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        fetchDashboardData();
    });

    // Format date helper
    function formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
</script>

<div class="space-y-6">
    <h1 class="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>

    {#if loading}
        <div class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
    {:else if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
        </div>
    {:else}
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white overflow-hidden shadow rounded-lg">
                <div class="p-5">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                            <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                            </svg>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                                <dd class="text-3xl font-semibold text-gray-900">{stats.totalUsers}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
                <div class="p-5">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 bg-green-500 rounded-md p-3">
                            <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                            </svg>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-500 truncate">Total Tributes</dt>
                                <dd class="text-3xl font-semibold text-gray-900">{stats.totalTributes}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Activity -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Recent Tributes -->
            <div class="bg-white shadow rounded-lg">
                <div class="px-4 py-5 sm:px-6">
                    <h3 class="text-lg font-medium text-gray-900">Recent Tributes</h3>
                </div>
                <div class="border-t border-gray-200">
                    <ul class="divide-y divide-gray-200">
                        {#each stats.recentTributes as tribute}
                            <li class="px-4 py-4">
                                <div class="flex items-center space-x-4">
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm font-medium text-gray-900 truncate">
                                            {tribute.loved_one_name}
                                        </p>
                                        <p class="text-sm text-gray-500">
                                            Created {formatDate(tribute.created_at)}
                                        </p>
                                    </div>
                                    <a href="/admin/tributes/{tribute.id}" class="text-indigo-600 hover:text-indigo-900">
                                        View
                                    </a>
                                </div>
                            </li>
                        {/each}
                    </ul>
                </div>
            </div>

            <!-- Recent Users -->
            <div class="bg-white shadow rounded-lg">
                <div class="px-4 py-5 sm:px-6">
                    <h3 class="text-lg font-medium text-gray-900">Recent Users</h3>
                </div>
                <div class="border-t border-gray-200">
                    <ul class="divide-y divide-gray-200">
                        {#each stats.recentUsers as user}
                            <li class="px-4 py-4">
                                <div class="flex items-center space-x-4">
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm font-medium text-gray-900 truncate">
                                            {user.name}
                                        </p>
                                        <p class="text-sm text-gray-500">
                                            {user.email}
                                        </p>
                                    </div>
                                    <a href="/admin/users/{user.id}" class="text-indigo-600 hover:text-indigo-900">
                                        View
                                    </a>
                                </div>
                            </li>
                        {/each}
                    </ul>
                </div>
            </div>
        </div>
    {/if}
</div>
