<script>
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
  
    // Store for tributes
    let tributes = writable([]);
  
    // State to track the tribute being edited
    let editingId = null;
    let editingHtml = "";
  
    // Fetch all tributes on mount
    const fetchTributes = async () => {
    const token = localStorage.getItem('jwt_token');
    console.log('🔑 Using token for fetch:', token ? 'Token present' : 'No token');
    
    const response = await fetch("https://wp.tributestream.com/wp-json/tributestream/v1/tribute", {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    });
    
    console.log('📡 Response status:', response.status);
    const data = await response.json();
    console.log('📦 Fetched data:', data);
    
    tributes.set(data);
};

    // Save updated custom_html
    const saveCustomHtml = async (tributeId) => {
      try {
        const response = await fetch(
          `https://wp.tributestream.com/wp-json/tributestream/v1/tribute/custom-html/${tributeId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ custom_html: editingHtml }),
          }
        );
  
        if (!response.ok) {
          console.error("Failed to save custom HTML");
          return;
        }
  
        console.log("Custom HTML saved successfully");
        await fetchTributes(); // Refresh the tribute list
        editingId = null; // Exit editing mode
      } catch (error) {
        console.error("Error saving custom HTML:", error);
      }
    };
  
    // Cancel editing
    const cancelEditing = () => {
      editingId = null;
      editingHtml = "";
    };
  
    onMount(fetchTributes);
  </script>
  
  <table class="table-auto w-full border-collapse border border-gray-300">
    <thead>
      <tr class="bg-gray-100">
        <th class="border border-gray-300 px-4 py-2">Loved One Name</th>
        <th class="border border-gray-300 px-4 py-2">Custom HTML</th>
        <th class="border border-gray-300 px-4 py-2">Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each $tributes as tribute}
        <tr class="hover:bg-gray-50">
          <td class="border border-gray-300 px-4 py-2">{tribute.loved_one_name}</td>
          <td class="border border-gray-300 px-4 py-2">
            {#if editingId === tribute.id}
              <!-- Editable content -->
              <textarea
                class="w-full border rounded p-2"
                bind:value={editingHtml}
              ></textarea>
            {:else}
              <!-- Static content -->
              {@html tribute.custom_html}
            {/if}
          </td>
          <td class="border border-gray-300 px-4 py-2">
            {#if editingId === tribute.id}
              <button
                class="bg-green-500 text-white px-4 py-2 rounded mr-2"
                on:click={() => saveCustomHtml(tribute.id)}
              >
                Save
              </button>
              <button
                class="bg-red-500 text-white px-4 py-2 rounded"
                on:click={cancelEditing}
              >
                Cancel
              </button>
            {:else}
              <button
                class="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                on:click={() => {
                  editingId = tribute.id;
                  editingHtml = tribute.custom_html;
                }}
              >
                Edit
              </button>
              <a
                class="bg-gray-500 text-white px-4 py-2 rounded"
                href={`https://tributestream.com/celebration-of-life-for-${tribute.slug}`}
                target="_blank"
              >
                Preview
              </a>
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  