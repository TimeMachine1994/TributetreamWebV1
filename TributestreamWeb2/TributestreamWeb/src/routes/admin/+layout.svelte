<script lang="ts">
    import { page } from '$app/stores';
    
    let { data } = $props();
    let sidebarOpen = $state(true);

    function toggleSidebar() {
        sidebarOpen = !sidebarOpen;
    }
</script>

<div class="min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="fixed top-0 left-0 z-40 w-64 h-screen transition-transform {sidebarOpen ? '' : '-translate-x-full'}" aria-label="Sidebar">
        <div class="h-full px-3 py-4 overflow-y-auto bg-gray-800">
            <div class="flex items-center justify-between mb-5">
                <span class="text-xl font-semibold text-white">Admin Dashboard</span>
                <button class="lg:hidden text-white" on:click={toggleSidebar}>
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <ul class="space-y-2 font-medium">
                <li>
                    <a href="/admin" class="flex items-center p-2 text-white rounded-lg hover:bg-gray-700 group">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span class="ml-3">Dashboard</span>
                    </a>
                </li>
                <li>
                    <a href="/admin/users" class="flex items-center p-2 text-white rounded-lg hover:bg-gray-700 group">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span class="ml-3">Users</span>
                    </a>
                </li>
                <li>
                    <a href="/admin/tributes" class="flex items-center p-2 text-white rounded-lg hover:bg-gray-700 group">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span class="ml-3">Tributes</span>
                    </a>
                </li>
            </ul>
        </div>
    </aside>

    <!-- Main content -->
    <div class="p-4 lg:ml-64">
        <div class="lg:hidden">
            <button class="p-2 text-gray-600" on:click={toggleSidebar}>
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
        </div>
        <div class="p-4 rounded-lg bg-white shadow-md">
            <slot />
        </div>
    </div>
</div>

<style>
    :global(body) {
        background-color: #f3f4f6;
    }
</style>
