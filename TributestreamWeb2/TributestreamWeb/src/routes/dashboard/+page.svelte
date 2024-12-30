<script lang="ts">
    export const ssr = true;
    export let data;

    import { writable } from 'svelte/store';
    import { invalidate } from '$app/navigation';

    let searchQuery = '';
    const selectedTribute = writable(null);

    $: filteredTributes = data.tributes.filter((tribute) =>
        tribute.loved_one_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    let customHtml = '';

    function openPanel(tribute) {
        console.log('🟢 Opening panel for tribute:', tribute);
        selectedTribute.set(tribute);
        customHtml = tribute.custom_html || '';
    }

    function closePanel() {
        console.log('🟡 Closing panel');
        selectedTribute.set(null);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        console.log('🔵 Submitting form with tributeId:', $selectedTribute.id);
        console.log('🔵 Custom HTML content:', customHtml);

        const formData = new FormData(event.target);
        for (const [key, value] of formData.entries()) {
            console.log(`🟣 Form Data - ${key}:`, value);
        }

        try {
            const response = await fetch('?/saveCustomHtml', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Server response:', result);

            if (result.success) {
                alert('Custom HTML updated successfully!');
                invalidate(); // Refresh the data
            } else {
                console.error('❌ Server error message:', result.error);
                alert(result.error || 'Failed to save custom HTML.');
            }
        } catch (error) {
            console.error('❌ Error during form submission:', error);
            alert('Failed to save custom HTML. Please try again.');
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
                <p><strong>Custom HTML:</strong></p>

                <!-- Save Form -->
                <form method="POST" action="?/saveCustomHtml" on:submit|preventDefault={handleSubmit}>
                    <input type="hidden" name="tributeId" value={ $selectedTribute.id } />
                    <textarea
                        name="customHtml"
                        bind:value={customHtml}
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
