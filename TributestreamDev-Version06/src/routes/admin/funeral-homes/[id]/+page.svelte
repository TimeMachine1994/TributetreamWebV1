<script lang="ts">
  let { data, form } = $props();
  
  let showDeleteConfirm = $state(false);
  
  console.log('🏠 Rendering funeral home details:', { data, form });
</script>

<div class="container mx-auto p-4">
  <div class="max-w-2xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Edit Funeral Home</h1>
      <a 
        href="/admin/funeral-homes"
        class="text-gray-600 hover:text-gray-900"
      >
        Back to List
      </a>
    </div>

    <form 
      method="POST" 
      action="?/update"
      class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
    >
      {#if form?.error}
        <div class="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {form.error}
        </div>
      {/if}

      {#if form?.success}
        <div class="mb-4 p-4 bg-green-100 text-green-700 rounded">
          Funeral home updated successfully!
        </div>
      {/if}

      <div class="mb-4">
        <label 
          for="name"
          class="block text-gray-700 text-sm font-bold mb-2"
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={form?.values?.name ?? data.funeralHome.attributes.Name}
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      <div class="mb-6">
        <label 
          for="address"
          class="block text-gray-700 text-sm font-bold mb-2"
        >
          Address
        </label>
        <textarea
          id="address"
          name="address"
          value={form?.values?.address ?? data.funeralHome.attributes.Address}
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          rows="3"
          required
        ></textarea>
      </div>

      <div class="flex items-center justify-between">
        <button
          type="button"
          class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onclick={() => showDeleteConfirm = true}
        >
          Delete
        </button>
        <button
          type="submit"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Save Changes
        </button>
      </div>
    </form>

    {#if showDeleteConfirm}
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h2 class="text-xl font-bold mb-4">Confirm Delete</h2>
          <p class="mb-4">Are you sure you want to delete this funeral home? This action cannot be undone.</p>
          <div class="flex justify-end space-x-4">
            <button
              class="text-gray-600 hover:text-gray-900"
              onclick={() => showDeleteConfirm = false}
            >
              Cancel
            </button>
            <form method="POST" action="?/delete" class="inline">
              <button
                type="submit"
                class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Delete
              </button>
            </form>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>