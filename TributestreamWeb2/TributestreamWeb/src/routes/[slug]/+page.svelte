<script context="module">
  export { load } from './+page.server.js';
</script>

<script>
  export let data;

  // Destructure the tribute data from the load function
  const { tribute } = data;
</script>

<main>
  {#if tribute}
    <h1>Tribute for {tribute.loved_one_name}</h1>
    <p>ID: {tribute.id}</p>
    <p>User ID: {tribute.user_id}</p>
    <p>Slug: {tribute.slug}</p>
    <p>Created At: {tribute.created_at}</p>
    <p>Updated At: {tribute.updated_at}</p>
  {:else}
    <p>Loading tribute data...</p>
  {/if}
</main>

<style>
  main {
    padding: 1rem;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  p {
    margin: 0.5rem 0;
  }
</style>
