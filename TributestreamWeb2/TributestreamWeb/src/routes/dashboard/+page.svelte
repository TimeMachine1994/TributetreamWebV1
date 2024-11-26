<script lang="ts">
    import { onMount } from 'svelte';
    import { currentTributes } from '../../lib/stores/currentTributes';
    import CreateTributeForm from '../../form/CreateTributeForm.svelte';

    let showCreateModal = false;

    // Fetch tributes on page load
    onMount(async () => {
        const response = await fetch('/current-tributes');
        const data = await response.json();
        currentTributes.set(data);
    });

    // Open the create tribute modal
    function openCreateModal() {
        showCreateModal = true;
    }
</script>
<slot/>
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
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each $currentTributes as tribute}
                <CurrentTributeCard {tribute} />
            {/each}
        </div>
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
