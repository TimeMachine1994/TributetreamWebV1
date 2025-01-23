<script lang="ts">
    export let data;
    const { tributes } = data;
</script>

<div class="p-6">
    <div class="mb-6">
        <h2 class="text-xl font-bold">Tributes</h2>
    </div>

    <!-- Tributes Table -->
    <table class="w-full bg-white shadow-md rounded-md">
        <thead class="bg-gray-200">
            <tr>
                <th class="p-4 text-left">Loved One's Name</th>
                <th class="p-4 text-left">Created At</th>
                <th class="p-4 text-left">Updated At</th>
                <th class="p-4 text-left">Phone Number</th>
                <th class="p-4 text-left">Streams</th>
            </tr>
        </thead>
        <tbody>
            {#each tributes as tribute}
                <tr class="border-b">
                    <td class="p-4">{tribute.loved_one_name}</td>
                    <td class="p-4">{new Date(tribute.created_at).toLocaleDateString()}</td>
                    <td class="p-4">{new Date(tribute.updated_at).toLocaleDateString()}</td>
                    <td class="p-4">{tribute.phone_number}</td>
                    <td class="p-4">{tribute.number_of_streams ?? 0}</td>
                </tr>
            {/each}
        </tbody>
    </table>

    {#if tributes.length === 0}
        <div class="text-center mt-4 text-gray-500">
            No tributes found
        </div>
    {/if}
</div>
