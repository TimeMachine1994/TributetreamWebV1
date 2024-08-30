<script lang="ts" context="module">
    // This function runs on the server side to fetch data
    export async function load({ fetch, url }) {
      const query = url.searchParams.get('q') || '';
      let results = [];
  
      if (query) {
        // Fetch search results from WordPress REST API
        const response = await fetch(`https://tributestream.com/wp-json/wp/v2/posts?search=${query}`);
        if (response.ok) {
          results = await response.json();
        }
      }
  
      return { query, results };
    }
  </script>
  
  <script lang="ts">
    export let query: string;
    export let results: any[];
  </script>
  
  <main class="max-w-5xl mx-auto p-6">
    <div class="text-center mb-6">
      <h1 class="text-3xl font-bold mb-4">Search Results for "{query}"</h1>
  
      {#if results.length > 0}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each results as result}
            <div class="bg-white shadow-lg rounded-lg p-6">
              <h2 class="text-xl font-bold mb-2" innerHTML={result.title.rendered}></h2>
              <p class="text-gray-700 mb-4" innerHTML={result.excerpt.rendered}></p>
              <a href={result.link} class="text-blue-500 hover:underline">Read More</a>
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-center text-gray-500">No results found for "{query}".</p>
      {/if}
    </div>
  </main>
  
  <style>
    /* Add any custom styles here */
  </style>
  