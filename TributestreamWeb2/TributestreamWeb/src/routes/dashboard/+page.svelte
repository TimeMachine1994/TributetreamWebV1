


<script lang="ts">
  import { onMount } from 'svelte';
    export let data;
    let searchTerm = '';

    onMount(() => {
        console.log('Component mounted with data:', data);
        console.log('Tributes:', data.tributes);
        console.log('Streams:', data.streams);
    });

  
  // Get streams associated with a tribute
  function getTributeStreams(tributeId: number) {
      return data.streams.filter(stream => stream.tribute_id === tributeId);
  }

  // Handle stream selection change
  async function handleStreamChange(tribute: any, streamId: number, position: number) {
      // Get all current selections for this tribute
      const dropdowns = document.querySelectorAll(`[data-tribute-id="${tribute.id}"] select`);
      let embedCodes = [];
      
      // Collect embed codes in order of appearance
      dropdowns.forEach((dropdown: HTMLSelectElement) => {
          const selectedStream = data.streams.find(s => s.id === Number(dropdown.value));
          if (selectedStream?.embed_code) {
              embedCodes.push(selectedStream.embed_code);
          }
      });

      // Join all embed codes with a newline
      const newCustomHtml = embedCodes.join('\n');

      // Update the tribute's custom_html
      try {
          const response = await fetch(`/api/tributes/${tribute.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  custom_html: newCustomHtml
              })
          });
          
          if (!response.ok) throw new Error('Update failed');
          
          console.log(`Updated tribute ${tribute.id} with new embed codes`);
      } catch (error) {
          console.error('Failed to update tribute:', error);
      }
  }

  $: filteredTributes = data.tributes.filter(tribute => 
      tribute.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tribute.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
</script>

<div class="p-6 max-w-7xl mx-auto">
  <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Stream Management</h1>
      <input
          type="text"
          bind:value={searchTerm}
          placeholder="Search tributes..."
          class="px-4 py-2 border rounded-lg w-64"
      />
  </div>

  <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
              <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active Streams</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
              {#each filteredTributes as tribute}
                  <tr class="hover:bg-gray-50">
                      <td class="px-6 py-4 text-sm font-medium text-gray-900">{tribute.title}</td>
                      <td class="px-6 py-4 text-sm text-gray-500">{tribute.slug}</td>
                      <td class="px-6 py-4">
                          <div data-tribute-id={tribute.id}>
                              {#each getTributeStreams(tribute.id) as stream, index}
                                  <select
                                      class="px-2 py-1 border rounded"
                                      on:change={(e) => handleStreamChange(tribute, parseInt(e.target.value), index)}
                                  >
                                      {#each data.streams as streamOption}
                                          <option value={streamOption.id}>
                                              Stream {streamOption.id}
                                          </option>
                                      {/each}
                                  </select>
                              {/each}
                          </div>
                      </td>
                      <td class="px-6 py-4">
                          <button class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                              Add Stream
                          </button>
                      </td>
                  </tr>
              {/each}
          </tbody>
      </table>
  </div>
</div>
