<script lang="ts">
    import { onMount } from 'svelte';
    import CreateTributeForm from '../../form/CreateTributeForm.svelte';

    // Modal state
    let showCreateModal = false;

    // Tributes data
    let tributes: Array<{ event_name: string; event_date: string; livestream_url: string }> = [];

    // Fetch tributes from the SvelteKit endpoint
    async function fetchTributes() {
        try {
            const response = await fetch('/api/tribute-pages');
            if (!response.ok) {
                throw new Error('Failed to fetch tributes');
            }
            tributes = await response.json();
        } catch (error) {
            console.error('Error fetching tributes:', error);
        }
    }

    // Fetch tributes when the component mounts
    onMount(() => {
        fetchTributes();
    });

    // Open the create tribute modal
    function openCreateModal() {
        showCreateModal = true;
    }
</script>

<!-- Rest of your component remains the same -->
<div>

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
