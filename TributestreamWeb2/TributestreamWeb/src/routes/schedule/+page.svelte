<script lang="ts">
  let tributes = $state([]);
  let currentPage = $state(1);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let totalPages = $state(1);
  let dialogOpen = $state(false);
  let selectedTribute = $state<Tribute | null>(null);
  let customHtml = $state('');
  const itemsPerPage = 10;

  interface Tribute {
    id: string;
    user_id: string;
    loved_one_name: string;
    slug: string;
    created_at: string;
    updated_at: string;
    custom_html: string;
    phone_number: string;
    number_of_streams: number | null;
  }

  async function fetchTributes(page: number) {
    try {
      isLoading = true;
      error = null;
      const response = await fetch(`/api/wordpress?page=${page}&per_page=${itemsPerPage}`);
      
      if (!response.ok) throw new Error(`Failed to fetch tributes. Status: ${response.status}`);

      const data = await response.json();
      totalPages = Math.ceil(parseInt(response.headers.get('X-WP-Total') || '0') / itemsPerPage);
      
      if (!Array.isArray(data)) throw new Error('Invalid API response format');
      tributes = data;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load tributes';
      console.error('[TributeList Error]', e);
    } finally {
      isLoading = false;
    }
  }

  $effect(() => {
    fetchTributes(currentPage);
  });

  function handlePageChange(newPage: number) {
    if (newPage >= 1 && newPage <= totalPages) {
      currentPage = newPage;
    }
  }

  function openDialog(tribute: Tribute) {
    selectedTribute = tribute;
    customHtml = tribute.custom_html || '';
    dialogOpen = true;
  }

  async function handleSubmit() {
    if (!selectedTribute) return;

    try {
      const response = await fetch(`/api/wordpress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedTribute.id,
          custom_html: customHtml
        }),
      });

      if (!response.ok) throw new Error('Failed to update custom HTML');

      tributes = tributes.map(t => 
        t.id === selectedTribute.id 
          ? { ...t, custom_html: customHtml }
          : t
      );

      dialogOpen = false;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to update custom HTML';
      console.error('[Update Error]', e);
    }
  }
</script>

<div class="max-w-4xl mx-auto p-4">
  <h1 class="text-2xl font-bold mb-6">Tributes</h1>

  {#if isLoading}
    <div class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  {/if}

  {#if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {error}
    </div>
  {/if}

  {#if !isLoading && !error}
    <div class="space-y-4">
      {#each tributes as tribute (tribute.id)}
        <div 
          class="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:bg-gray-50"
          onclick={() => openDialog(tribute)}
        >
          <h2 class="text-xl font-semibold">{tribute.loved_one_name}</h2>
          <div class="mt-2 text-gray-600">
            <p>Created: {new Date(tribute.created_at).toLocaleDateString()}</p>
            <p>Streams: {tribute.number_of_streams ?? 'None'}</p>
          </div>
        </div>
      {/each}
    </div>

    <div class="flex justify-center gap-2 mt-6">
      <button
        onclick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        class="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
      >
        Previous
      </button>
      
      <span class="px-4 py-2">
        Page {currentPage} of {totalPages}
      </span>
      
      <button
        onclick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        class="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  {/if}
</div>

<dialog open={dialogOpen}>
  <div class="p-4 max-w-md">
    <h2 class="text-xl font-semibold mb-4">Edit Custom HTML</h2>
    <div class="mb-4">
      <label class="block text-sm font-medium mb-2">
        Custom HTML for {selectedTribute?.loved_one_name}
      </label>
      <textarea
        class="w-full min-h-[200px] rounded-md border border-gray-300 p-2"
        bind:value={customHtml}
></textarea>
    </div>
    <div class="flex justify-end gap-2">
      <button
        class="px-4 py-2 bg-gray-100 rounded"
        onclick={() => dialogOpen = false}
      >
        Cancel
      </button>
      <button
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onclick={handleSubmit}
      >
        Save Changes
      </button>
    </div>
  </div>
</dialog>

<style>
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.3);
  }
  
  dialog {
    border: none;
    border-radius: 0.5rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }
</style>