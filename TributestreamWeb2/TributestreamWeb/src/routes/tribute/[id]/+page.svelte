<script lang="ts">
    let { tribute } = $props();
</script>

<main>
    <h1>{tribute.loved_one_name}</h1>
    <p>Created by: {tribute.user_id}</p>
    <p>{tribute.custom_html}</p>
</main>
