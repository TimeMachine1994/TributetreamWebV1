<script lang="ts">
    export let tribute;

    function manageStream() {
        // Add logic to manage streams
    }

    function editTribute() {
        // Add logic for opening edit modal
    }
</script>

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
    <div class="mt-4 flex space-x-2">
        <button class="bg-gray-300 px-4 py-2 rounded" on:click={editTribute}>
            Edit
        </button>
        <button class="bg-blue-500 text-white px-4 py-2 rounded" on:click={manageStream}>
            Manage Stream
        </button>
    </div>
</div>
