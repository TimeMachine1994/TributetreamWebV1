<!-- src/routes/[slug]/+page.svelte -->
<script>
    export let wpUrl;
</script>

{#if wpUrl}
    <iframe src="{wpUrl}" width="100%" height="100%" style="border: none;"></iframe>
{:else}
    <!-- Render other Svelte content if not matching WordPress slugs -->
    <p>Content not found</p>
{/if}
