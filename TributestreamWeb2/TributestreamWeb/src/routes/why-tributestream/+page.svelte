<script lang="ts">
  let pageTitle = 'Why Tributestream?';
  import { TabGroup, Tab, TabAnchor } from '@skeletonlabs/skeleton';

  let tabSet: number = 4;
</script>

<svelte:head>
  <title>{pageTitle}</title>  
  
</svelte:head>

<main>
  <div class="card p-4">
    <div class="hero">
      <h1 class="text-2xl p-4 text-center">{pageTitle}</h1>
      <p class="text-center">
        At Tributestream, we believe in the power of love and connection. At Tributestream, there are no limits to the ways we can honor and celebrate the lives of those we love.
        Our platform is designed to be a sanctuary for those who have lost a loved one, a place where they can find solace, connection, and a sense of community.
        We understand that the grieving process is unique to each individual, and we are here to support you every step of the way.
        Whether you're looking for a way to honor a loved one's memory, connect with others who have experienced similar loss, or simply find comfort in shared experiences, Tributestream is here for you.
        Join us in celebrating the lives of those we love, and let's create a world where love and connection never fade.
      </p>
    </div>
  </div>
   
			
</main>

<style>
  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  .card {
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    padding: 20px;
  }

  .hero {
    text-align: center;
    margin-bottom: 20px;
  }
.tabSet {
  background-color: white;

}
  h1 {
    color: #333;
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  p {
    line-height: 1.6;
    margin-bottom: 1rem;
  }
</style>
