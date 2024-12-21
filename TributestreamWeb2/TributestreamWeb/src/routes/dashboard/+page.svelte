<script lang="ts">
    export let data;
    console.log('Page data:', data);

    // Filtered tributes based on search term
    let searchTerm = '';
    $: filteredTributes = data.tributes.filter(tribute =>
        tribute.loved_one_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tribute.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
</script>

<div class="container mx-auto p-4">
    <h1 class="text-2xl mb-4">Dashboard</h1>

    <input
        type="text"
        bind:value={searchTerm}
        placeholder="Search tributes..."
        class="px-4 py-2 border rounded-lg w-full mb-4"
    />

    <div class="mb-8">
        <h2 class="text-xl mb-2">Tributes ({filteredTributes.length})</h2>
        {#each filteredTributes as tribute}
            <div class="border p-4 mb-2 rounded">
                <p><strong>Name:</strong> {tribute.loved_one_name}</p>
                <p><strong>Created:</strong> {new Date(tribute.created_at).toLocaleDateString()}</p>
                <p><strong>Streams:</strong> {tribute.number_of_streams}</p>
            </div>
        {/each}
    </div>

    <div>
        <h2 class="text-xl mb-2">Streams ({data.streams.length})</h2>
        {#each data.streams as stream}
            <div class="border p-4 mb-2 rounded">
                <p><strong>ID:</strong> {stream.id}</p>
                <p><strong>Tribute ID:</strong> {stream.tribute_id}</p>
            </div>
        {/each}
    </div>
</div>
