<script lang="ts">
    export const ssr = true;
    export let data;

    import { writable } from 'svelte/store';

    // Store for search input
    let searchQuery = '';

    // Store for selected tribute
    const selectedTribute = writable(null);

    // Filtered tributes based on search
    $: filteredTributes = data.tributes.filter((tribute) =>
        tribute.loved_one_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    function openPanel(tribute) {
        selectedTribute.set(tribute);
    }

    function closePanel() {
        selectedTribute.set(null);
    }
</script>

<div class="dashboard container mx-auto py-8">
    <h1 class="text-center text-2xl font-bold mb-6">Tributes Dashboard</h1>

    <!-- Search Bar -->
    <div class="mb-4 flex justify-center">
        <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search tributes..."
            class="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
    </div>

    <!-- Grid of Cards -->
    {#if filteredTributes?.length > 0}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each filteredTributes as tribute}
                <div
                    class="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition"
                    on:click={() => openPanel(tribute)}
                >
                    <h2 class="text-lg font-semibold mb-2">{tribute.loved_one_name}</h2>
                    <p><strong>ID:</strong> {tribute.id}</p>
                    <p><strong>Slug:</strong> {tribute.slug}</p>
                </div>
            {/each}
        </div>
    {:else}
        <p class="text-center text-gray-500">No tributes found. Please try again later.</p>
    {/if}

    <!-- Detail Panel -->
    {#if $selectedTribute}
        <div
            class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            on:click={closePanel}
        >
            <div
                class="bg-white w-11/12 max-w-lg p-6 rounded-lg shadow-lg relative"
                on:click|stopPropagation
            >
                <button
                    class="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                    on:click={closePanel}
                >
                    ✖
                </button>
                <h2 class="text-2xl font-bold mb-4">Details for { $selectedTribute.loved_one_name }</h2>
                <p><strong>ID:</strong> { $selectedTribute.id }</p>
                <p><strong>User ID:</strong> { $selectedTribute.user_id }</p>
                <p><strong>Slug:</strong> { $selectedTribute.slug }</p>
                <p><strong>Created At:</strong> { $selectedTribute.created_at }</p>
                <p><strong>Updated At:</strong> { $selectedTribute.updated_at }</p>
                <p><strong>Phone Number:</strong> { $selectedTribute.phone_number || 'N/A' }</p>
                <p><strong>Number of Streams:</strong> { $selectedTribute.number_of_streams ?? 'N/A' }</p>
            </div>
        </div>
    {/if}
</div>

<style>
    /* Custom TailwindCSS tweaks if needed */
</style>
