
<script>
  import { onMount } from 'svelte';

  let pageTitle = 'Why Tributestream?';
  let isLoading = false;

  onMount(() => {
    // Simulating some asynchronous operation
    setTimeout(() => {
      isLoading = false;
    }, 1000);
  });
</script>

<svelte:head>
  <title>{pageTitle}</title>  
</svelte:head>

<main>
  {#if isLoading}
    <p>Loading...</p>
  {:else}
    <h1>{pageTitle}</h1>
    <p>At Tributestream, we believe in the power of love and connection.
      At Tributestream, there are no limits to the ways we can honor and celebrate the lives of those we love.
      Our platform is designed to be a sanctuary for those who have lost a loved one, a place where they can find solace, connection, and a sense of community.
      We understand that the grieving process is unique to each individual, and we are here to support you every step of the way.
      Whether you're looking for a way to honor a loved one's memory, connect with others who have experienced similar loss, or simply find comfort in shared experiences, Tributestream is here for you.
      Join us in celebrating the lives of those we love, and let's create a world where love and connection never fade.
      </p>  
    <!-- Add more content here -->
  {/if}
</main>

<style>
  main {
    padding: 1rem;
    max-width: 800px;
    margin: 0 auto;
  }

  h1 {
    color: #333;
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  p {
    line-height: 1.6;
  }
</style>
