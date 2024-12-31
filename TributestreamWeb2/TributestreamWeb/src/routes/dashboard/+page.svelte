<script lang="ts">
    import { writable } from 'svelte/store';

    // Initialize props and state
    const { data } = $props();

    // Type definition for a tribute
    interface Tribute {
        loved_one_name: string;
        id: number;
        slug: string;
        custom_html?: string;
    }

    // Declare state variables with Svelte 5's $state
    let searchQuery = $state('');
    let selectedTribute = $state<Tribute | null>(null);
    let currentPage = $state(1);
    const itemsPerPage = 10;

    // Reactive state-derived properties
    const filteredTributes = $derived(() => {
        console.log("Deriving filtered tributes");
        const tributes = (data?.tributes || []) as Tribute[];
        return tributes.filter((tribute) => {
            // console.log("Filtering tribute:", tribute);
            return tribute.loved_one_name.toLowerCase().includes(searchQuery.toLowerCase());
        });
    });

    const paginatedTributes = $derived(() => {
        // console.log("Deriving paginated tributes");
        const tributes = filteredTributes();
        return tributes.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
    });

    const totalPages = $derived(() => {
        // console.log("Deriving total pages");
        const tributes = filteredTributes();
        return Math.ceil(tributes.length / itemsPerPage);
    });

    // Navigation functions
    function nextPage() {
        console.log("Next page");
        if (currentPage < totalPages()) currentPage++;
    }

    function previousPage() {
        console.log("Previous page");
        if (currentPage > 1) currentPage--;
    }

    function openPanel(tribute: Tribute) {
        console.log("Opening panel for tribute:", tribute);
        selectedTribute = tribute;
    }

    function closePanel() {
        console.log("Closing panel");
        selectedTribute = null;
    }


async function handleSave(event: Event) {
    console.log("🔄 Saving custom HTML...");
    
    try {
        const formData = new FormData(event.target as HTMLFormElement);
        const tributeId = formData.get('tributeId');
        const customHtml = formData.get('customHtml');

        if (!tributeId || !customHtml) {
            console.error('❌ Invalid input.');
            return;
        }

        const response = await fetch('?/saveCustomHtml', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to save custom HTML.');
        }

        const result = await response.json();
        console.log('✅ Save successful:', result);

        // Optionally, refresh the page or close the panel
        closePanel();
        await goto(window.location.pathname); // Refresh the current page
    } catch (error) {
        console.error('❌ Error saving custom HTML:', error);
    }
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

    <!-- Pagination Controls -->
    <div class="flex justify-center gap-4 mb-4">
        <button 
            on:click={previousPage}
            disabled={currentPage === 1}
            class="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
        >
            Previous
        </button>
        <span class="py-2">Page {currentPage} of {totalPages()}</span>
        <button 
            on:click={nextPage}
            disabled={currentPage === totalPages()}
            class="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
        >
            Next
        </button>
    </div>

    <!-- Tribute Grid -->
    {#if paginatedTributes()?.length > 0}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each paginatedTributes() as tribute (tribute.id)}
                <button
                    class="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition text-left"
                    on:click={() => openPanel(tribute)}
                    aria-label="Open tribute details for {tribute.loved_one_name}"
                >
                    <h2 class="text-lg font-semibold mb-2">{tribute.loved_one_name}</h2>
                    <p><strong>ID:</strong> {tribute.id}</p>
                    <p><strong>Slug:</strong> {tribute.slug}</p>
                </button>
            {/each}
        </div>
    {:else}
        <p class="text-center text-gray-500">No tributes found. Please try again later.</p>
    {/if}

    <!-- Detail Panel -->
    {#if selectedTribute}
        <div
            class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            on:click={closePanel}
            role="dialog"
            aria-labelledby="tribute-details-title"
            aria-describedby="tribute-details-description"
        >
            <div
                class="bg-white w-11/12 max-w-lg p-6 rounded-lg shadow-lg relative"
                on:click|stopPropagation
            >
                <button
                    class="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                    on:click={closePanel}
                    aria-label="Close tribute details"
                >
                    ✖
                </button>
                <h2 id="tribute-details-title" class="text-2xl font-bold mb-4">Details for {selectedTribute.loved_one_name}</h2>
                <p id="tribute-details-description"><strong>ID:</strong> {selectedTribute.id}</p>
                <p><strong>Custom HTML:</strong></p>

                <!-- Save Form -->
                <form on:submit|preventDefault={handleSave}>
                    <input type="hidden" name="tributeId" value={selectedTribute.id} />
                    <textarea
                        name="customHtml"
                        bind:value={selectedTribute.custom_html}
                        class="w-full h-40 p-2 border border-gray-300 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                    <div class="mt-4 flex justify-end">
                        <button
                            type="submit"
                            class="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
                
            </div>
        </div>
    {/if}
</div>

<style>
    /* Custom TailwindCSS tweaks if needed */
</style>
