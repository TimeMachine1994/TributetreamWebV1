


<script lang="ts">
  export let data;
  let searchTerm = '';
  
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
  <!-- Table structure remains the same until the select elements -->
  {#each filteredTributes as tribute}
      {@const tributeStreams = getTributeStreams(tribute.id)}
      <div data-tribute-id={tribute.id}>
          {#each tributeStreams as stream, index}
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
  {/each}
</div>

 

<!-- <script lang="ts">
    export let data;
    let searchTerm = '';
    
    $: filteredTributes = data.wpa2_tributes.filter(tribute => 
        tribute.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
</script>

<div class="container mx-auto p-6">
    <div class="mb-6">
        <input
            type="text"
            bind:value={searchTerm}
            placeholder="Search tributes by slug..."
            class="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
        />
    </div>

    <div class="overflow-x-auto bg-white rounded-lg shadow">
        <table class="min-w-full table-auto">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                {#each filteredTributes as tribute}
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tribute.slug}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tribute.title}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                {tribute.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                                {tribute.status}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(tribute.created_at).toLocaleDateString()}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

-->