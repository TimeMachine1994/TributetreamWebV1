<!-- *****************************************************************************************
     +page.svelte (Svelte 5 / Dashboard)
     This file is the main Dashboard page in Svelte 5. It demonstrates:
       1. Using Runes ($state) for reactivity.
       2. Handling props via $props().
       3. Managing editing and saving logic for tribute objects.
       4. Tailwind CSS utility classes for styling.
       5. Extensive console logging to debug data flow.
***************************************************************************************** -->

<script lang="ts">
  /******************************************************************************
   * 1. Imports and Declarations
   *****************************************************************************/
  import type { Tribute } from './+page.server';

  // Just for demonstration, we declare a fallback constant here.
  // In a real project, you'd import from '$env/static/public' or a custom config.
  const BASE_WORDPRESS_API = 'https://example.com';

  /**
   * Svelte 5's new approach: $props(), $state, etc.
   * We can console.log to confirm we’re getting the correct server data (tributes, status).
   */
  const { data } = $props(); // The `load` function in +page.server.ts returns this
  console.log('[dashboard/+page.svelte] data from +page.server.ts:', data);

  /******************************************************************************
   * 2. Reactive State Declarations using $state
   *****************************************************************************/
  // tributes: the array of Tribute items, initialized from data.tributes
  let tributes = $state<Tribute[]>(
    data && data.tributes ? JSON.parse(data.tributes) : []
  );

  // status: indicates whether data load was "success" or "error" (or anything else)
  let status = $state<string>(data && data.status ? data.status : 'loading');

  // editingTribute: the tribute object currently being edited; null if none
  let editingTribute = $state<Tribute | null>(null);

  // isEditing: boolean to toggle "edit mode"
  let isEditing = $state(false);

  /******************************************************************************
   * 3. Edit & Save Handlers
   *****************************************************************************/

  /**
   * handleEdit - prepares the tribute object for editing
   * @param tribute - the tribute object we want to edit
   */
  function handleEdit(tribute: Tribute) {
    console.log('[dashboard/+page.svelte] handleEdit called with tribute:', tribute);
    editingTribute = { ...tribute }; // Clone to avoid direct mutation
    isEditing = true;
  }

  /**
   * handleSave - sends the updated tribute object to our custom WP endpoint
   *              and updates our local tributes array on success.
   */
  async function handleSave() {
    // If nothing is being edited, just return
    if (!editingTribute) {
      console.warn('[dashboard/+page.svelte] handleSave called but editingTribute is null');
      return;
    }

    console.log('[dashboard/+page.svelte] handleSave: Attempting to save tribute:', editingTribute);

    try {
      // Example PUT request to your custom WP endpoint
      const response = await fetch(`${BASE_WORDPRESS_API}/custom/v1/tributestream`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTribute)
      });

      if (response.ok) {
        console.log('[dashboard/+page.svelte] handleSave: Tribute updated successfully on server');
        // Update tributes array
        tributes = tributes.map((t) =>
          t.id === editingTribute?.id ? editingTribute : t
        );
        // Clear editing flags
        isEditing = false;
        editingTribute = null;
      } else {
        console.error('[dashboard/+page.svelte] handleSave: Non-OK response:', response.status);
      }
    } catch (error) {
      console.error('[dashboard/+page.svelte] handleSave: Error updating tribute:', error);
    }
  }
</script>

<!-- ****************************************************************************
     4. Svelte Markup - Display Logic
     **************************************************************************** -->

{#if status === 'loading'}
  <!-- Loading state -->
  <div class="text-center p-4">Loading tributes...</div>

{:else if tributes.length === 0}
  <!-- No tributes found -->
  <div class="text-center p-4">No tributes found.</div>

{:else}
  <!-- List of tributes -->
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
    {#each tributes as tribute (tribute.id)}
      <div class="border border-gray-200 rounded-lg shadow bg-white p-4">
        {#if isEditing && editingTribute?.id === tribute.id}
          <!-- Edit Mode -->
          <div class="flex flex-col space-y-2">
            <!-- Title -->
            <input
              type="text"
              bind:value={editingTribute.title}
              placeholder="Title"
              class="border border-gray-300 rounded p-2"
            />
            <!-- Content -->
            <textarea
              bind:value={editingTribute.content}
              placeholder="Content"
              class="border border-gray-300 rounded p-2 min-h-[100px]"
            ></textarea>

            <!-- Buttons -->
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
                  console.log('[dashboard/+page.svelte] Cancel Edit');
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
          <!-- View Mode -->
          <h3 class="text-lg font-semibold">{tribute.title}</h3>
          <p class="text-gray-700">{tribute.content}</p>

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
