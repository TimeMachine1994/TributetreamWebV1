<script>
    export let data;
    const { tribute } = data;
</script>

<template>
    {#if tribute}
        <!-- Display tribute data -->
        <h1>{tribute.title}</h1>
        <p>{tribute.description}</p>
        <!-- Add any other details you want to show -->
    {:else}
        <p>Tribute not found.</p>
    {/if}
</template>
