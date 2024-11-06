<!-- src/routes/[slug]/+page.svelte -->
<script context="module">
    export async function load({ html }) {
        return { html };
    }
</script>

<div>
    {@html html}
</div>
