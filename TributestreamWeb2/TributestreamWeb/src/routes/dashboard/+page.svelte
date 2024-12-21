<script lang="ts">
  import { onMount } from 'svelte';
  
  export let data;
  let searchTerm = '';

  interface TributeWithStreams extends WPA2Tribute {
      associatedStreams: WPA2Stream[];
  }

  // Combine tributes with their streams
  $: tributesWithStreams = data.tributes.map(tribute => ({
      ...tribute,
      associatedStreams: data.streams.filter(stream => 
          stream.tribute_id === tribute.id
      )
  }));

  // Filter tributes based on search
  $: filteredTributes = tributesWithStreams.filter(tribute =>
      tribute.loved_one_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tribute.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function updateCustomHtml(tributeId: number, newHtml: string) {
      try {
          const response = await fetch(`/api/tributes/${tributeId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ custom_html: newHtml })
          });
          
          if (!response.ok) throw new Error('Update failed');
          
      } catch (error) {
          console.error('Failed to update custom HTML:', error);
      }
  }
</script>

<div class="p-6 max-w-7xl mx-auto">
  <div class="mb-4">
      <input
          type="text"
          bind:value={searchTerm}
          placeholder="Search tributes..."
          class="px-4 py-2 border rounded-lg w-full"
      />
  </div>

  <div class="space-y-6">
      {#each filteredTributes as tribute}
          <div class="bg-white shadow rounded-lg p-6">
              <h2 class="text-2xl font-bold mb-2">{tribute.loved_one_name}</h2>
              <div class="text-gray-600 mb-4">
                  <p>Created: {new Date(tribute.created_at).toLocaleDateString()}</p>
                  <p>Streams: {tribute.number_of_streams}</p>
              </div>
              
              <div class="space-y-4">
                  {#each tribute.associatedStreams as stream}
                      <div class="border rounded p-4">
                          <h3 class="font-semibold mb-2">Stream {stream.id}</h3>
                          <div class="mb-2">
                              {#if stream.custom_embed}
                                  {@html stream.custom_embed}
                              {:else}
                                  <p class="text-gray-500">No embed code available</p>
                              {/if}
                          </div>
                      </div>
                  {/each}
              </div>
          </div>
      {/each}
  </div>
</div>
