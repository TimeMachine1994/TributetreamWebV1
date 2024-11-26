<script lang="ts">
    // Props passed from the server-side load function
    export let tributes: Array<{ event_name: string; event_date: string; livestream_url: string }>;

    // Modal state
    let showCreateModal = false;

    // Open the create tribute modal
    function openCreateModal() {
        showCreateModal = true;
    }
</script>

<div class="container mx-auto py-6 px-4">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Welcome to Your Dashboard</h1>
        <nav class="space-x-4">
            <a href="/" class="text-blue-500 underline">Home</a>
            <a href="/tributes" class="text-gray-600 hover:underline">Your Tributes</a>
            <a href="/stream" class="text-gray-600 hover:underline">Create a Stream</a>
            <a href="/pay-now" class="text-gray-600 hover:underline">Pay Now</a>
        </nav>
    </div>

    <!-- Current Tributes -->
    <section class="mb-6">
        <h2 class="text-xl font-semibold mb-4">Current Tributes</h2>
        {#if tributes.length > 0}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each tributes as tribute}
                    <div class="p-4 border border-gray-300 rounded-lg shadow-sm">
                        <h3 class="font-semibold text-lg">{tribute.event_name}</h3>
                        <p class="text-sm text-gray-600">Date: {tribute.event_date}</p>
                        <a
                            href={tribute.livestream_url}
                            target="_blank"
                            class="text-blue-500 underline text-sm"
                        >
                            View Livestream
                        </a>
                    </div>
                {/each}
            </div>
        {:else}
            <p>No tributes available.</p>
        {/if}
    </section>

    <!-- Add New Tribute -->
    <button
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        on:click={openCreateModal}
    >
        Add New Tribute
    </button>

    <!-- Create Tribute Modal -->
    {#if showCreateModal}
        <CreateTributeForm on:close={() => (showCreateModal = false)} />
    {/if}
</div>
