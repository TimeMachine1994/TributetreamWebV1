<script>
    export let tributes = [];
</script>

<h1 class="text-2xl font-bold">Admin Dashboard</h1>
<p>Welcome to the admin area!</p>

{#if tributes.length > 0}
    <ul class="space-y-4">
        {#each tributes as tribute}
            <li class="p-4 bg-white shadow rounded">
                <h2 class="text-xl font-semibold">{tribute.loved_one_name}</h2>
                <p class="text-gray-600">Slug: {tribute.slug}</p>
            </li>
        {/each}
    </ul>
{:else}
    <p class="text-gray-500">No tributes found.</p>
{/if}
