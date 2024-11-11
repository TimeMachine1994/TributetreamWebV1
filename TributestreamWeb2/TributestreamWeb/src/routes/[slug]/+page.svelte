<script>
  export let data;

  // Destructure the tribute data from the load function
  const { tribute } = data;
</script>

<main>
  {#if tribute}
    <pre>
ID: {tribute.id}
User ID: {tribute.user_id}
Loved One Name: {tribute.loved_one_name}
Slug: {tribute.slug}
Created At: {tribute.created_at}
Updated At: {tribute.updated_at}
    </pre>
  {:else}
    <p>Loading tribute data...</p>
  {/if}
</main>

<style>
  main {
    padding: 1rem;
    font-family: monospace;
  }

  pre {
    background-color: #f4f4f4;
    padding: 1rem;
    border-radius: 5px;
  }
</style>
