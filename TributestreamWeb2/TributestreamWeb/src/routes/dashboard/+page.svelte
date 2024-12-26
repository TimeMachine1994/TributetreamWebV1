<!-- *****************************************************************************************
     +page.svelte

     This file is the main Dashboard page in Svelte 5. It demonstrates:
       1. Using Runes ($state) for reactivity.
       2. Handling props via $props().
       3. Managing editing and saving logic for tribute objects.
       4. Tailwind CSS utility classes for styling.
     ***************************************************************************************** -->

     <script lang="ts">
        /******************************************************************************
         * Imports and Declarations
         *****************************************************************************/
        // Importing the Tribute type from our server load file (adjust the path if needed)
        import type { Tribute } from './+page.server';
      
        // Recommended: use SvelteKit environment utilities instead of `process.env`
        // This might vary based on your project’s config. Example:
        // import { PUBLIC_BASE_WORDPRESS_API } from '$env/static/public';
        // const BASE_WORDPRESS_API = PUBLIC_BASE_WORDPRESS_API;
      
        // For illustration, we show a direct constant assignment. In a real project,
        // replace this with your official environment variable import from SvelteKit.
        const BASE_WORDPRESS_API = 'https://example.com'; // Example fallback
      
        /**
         * Svelte 5's $props() approach to extract load data or passed-in props
         * We can also console.log it to confirm it's being set. 
         */
        const { data } = $props();
        console.log('Loaded props from +page.svelte:', data);
      
        /**
         * Svelte 5 Runes:
         *  - $state: declare a reactive state variable
         *  - $derived: for purely derived variables (not used here)
         *  - $effect: for side effects (not needed in this example)
         *
         * Here we focus on $state, as we want to be able to modify these variables
         * in response to user actions (e.g., editing, saving).
         */
      
        // tributes: stores the array of Tribute items, initialized from `data.tributes`
        let tributes = $state<Tribute[]>(
          data && data.tributes ? JSON.parse(data.tributes) : []
        );
      
        // status: indicates loading state or error/success status, initialized from `data.status`
        let status = $state<string>(
          data && data.status ? data.status : 'loading'
        );
      
        // editingTribute: keeps track of the currently edited tribute object
        let editingTribute = $state<Tribute | null>(null);
      
        // isEditing: boolean flag indicating if we are in "edit mode"
        let isEditing = $state(false);
      
        /**
         * handleEdit - prepares the tribute object for editing
         * @param tribute - the tribute object that should be edited
         */
        function handleEdit(tribute: Tribute) {
          editingTribute = { ...tribute }; // Clone so we don't mutate the array directly
          isEditing = true;
        }
      
        /**
         * handleSave - sends the updated tribute object to our custom WordPress endpoint
         *              and updates the local tributes array upon success.
         */
        async function handleSave() {
          // If nothing is being edited, just return
          if (!editingTribute) return;
      
          try {
            const response = await fetch(`${BASE_WORDPRESS_API}/custom/v1/tributestream`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(editingTribute)
            });
      
            if (response.ok) {
              // Update the tributes array with the newly edited tribute
              tributes = tributes.map((t) =>
                t.id === editingTribute?.id ? editingTribute : t
              );
              // Reset the editing states
              isEditing = false;
              editingTribute = null;
            } else {
              console.error('Non-OK response updating tribute:', response.statusText);
            }
          } catch (error) {
            console.error('Error updating tribute:', error);
          }
        }
      </script>
      
      <!--
        We use Svelte markup to conditionally show loading, no tributes, or
        a list of tribute cards with edit buttons.
      -->
      {#if status === 'loading'}
        <div class="text-center p-4">Loading tributes...</div>
      
      {:else if tributes.length === 0}
        <div class="text-center p-4">No tributes found.</div>
      
      {:else}
        <!-- Container for tributes, using Tailwind utility classes -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
          {#each tributes as tribute (tribute.id)}
            <!-- Card for each tribute -->
            <div class="border border-gray-200 rounded-lg shadow bg-white p-4">
              {#if isEditing && editingTribute?.id === tribute.id}
                <!-- Edit Form -->
                <div class="flex flex-col space-y-2">
                  <!--
                    For demonstration, we assume the WP data has "title" and "content".
                    Adjust these fields as needed for your actual data structure.
                  -->
                  <input
                    type="text"
                    bind:value={editingTribute.title}
                    placeholder="Title"
                    class="border border-gray-300 rounded p-2"
                  />
                  <textarea
                    bind:value={editingTribute.content}
                    placeholder="Content"
                    class="border border-gray-300 rounded p-2 min-h-[100px]"
                  ></textarea>
      
                  <div class="flex space-x-2">
                    <!-- Save Button -->
                    <button 
                      onclick={handleSave}
                      class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                    <!-- Cancel Button -->
                    <button
                      onclick={() => {
                        isEditing = false;
                        editingTribute = null;
                      }}
                      class="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              {:else}
                <!-- Display Tribute -->
                <h3 class="text-lg font-semibold">{tribute.title}</h3>
                <p class="text-gray-700">{tribute.content}</p>
      
                <!-- Edit button -->
                <button
                  onclick={() => handleEdit(tribute)}
                  class="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit
                </button>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
      