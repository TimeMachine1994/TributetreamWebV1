<script lang="ts">
   
  
    // Placeholder for the initial list of live streams (fetched from backend)
    export let data;
    $: tributes = data.tributes;
 

</script>

<!-- Main Content -->
<main class="flex-1 p-6">
    <div class="mb-6">
        <h2 class="text-xl font-bold">Livestreams</h2>
    </div>

    <!-- Livestream Table -->
    <table class="w-full bg-white shadow-md rounded-md">
        <thead class="bg-gray-200">
            <tr>
                <th class="p-4 text-left">Title</th>
                <th class="p-4 text-left">Customer</th>
                <th class="p-4 text-left">Date</th>
                <th class="p-4 text-left">Time</th>
                <th class="p-4 text-left">Status</th>
            </tr>
        </thead>
            <tbody>
                    {#each $tributes as tribute}
                        <tr class="border-b">
                            <td class="p-4">{tribute.loved_one_name}</td>
                            <td class="p-4">{tribute.id}</td>
                            <td class="p-4">{tribute.created_at}</td>
                            <td class="p-4">{tribute.created_at}</td>
                            <td class="p-4">{tribute.created_at}</td>
                        </tr>
                    {/each}
            </tbody>


    </table>
    <p class="p-4">No livestreams found.</p>

</main>
