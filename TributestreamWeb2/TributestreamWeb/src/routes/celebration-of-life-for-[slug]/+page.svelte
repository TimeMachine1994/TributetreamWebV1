<script>
    export let data;
    const { tribute } = data;
    console.log('Tribute data:', tribute); // Let's see what we're getting
</script>

<main class="min-w-screen min-h-screen overflow-y-auto">
    {#if tribute}
        <h1>{tribute.loved_one_name}</h1>
        <p>{tribute.slug}</p>
    {:else}
        <p>Loading tribute data...</p>
    {/if}
</main>
