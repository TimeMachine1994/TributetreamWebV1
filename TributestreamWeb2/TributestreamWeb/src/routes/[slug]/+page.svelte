<!-- src/routes/[slug]/+page.svelte -->
<script>
    export let html;
</script>

{#if html}
    <div>{@html html}</div>
{:else}
    <p>Content not found or could not be loaded from WordPress.</p>
{/if}
