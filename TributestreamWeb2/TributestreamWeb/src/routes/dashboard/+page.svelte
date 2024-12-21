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
