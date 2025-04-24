<script lang="ts">
  let { form } = $props();
  
  console.log('🏠 Rendering new funeral home form', { form });
</script>

<div class="container mx-auto p-4">
  <div class="max-w-2xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">New Funeral Home</h1>
      <a 
        href="/admin/funeral-homes"
        class="text-gray-600 hover:text-gray-900"
      >
        Back to List
      </a>
    </div>

    <form method="POST" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      {#if form?.error}
        <div class="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {form.error}
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
          value={form?.values?.name ?? ''}
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
          value={form?.values?.address ?? ''}
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          rows="3"
          required
        ></textarea>
      </div>

      <div class="flex items-center justify-end">
        <button
          type="submit"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Create Funeral Home
        </button>
      </div>
    </form>
  </div>
</div>