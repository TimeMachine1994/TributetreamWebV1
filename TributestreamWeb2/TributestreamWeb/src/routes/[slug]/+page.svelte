<!-- +page.svelte -->
<script>
    export let wpUrl;
</script>

{#if wpUrl}
    <iframe src="{wpUrl}" width="100%" height="100%" style="border: none;"></iframe>
{:else}
    <p>Content not found or could not be loaded from WordPress.</p>
{/if}
