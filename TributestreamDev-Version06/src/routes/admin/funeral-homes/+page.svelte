<script lang="ts">
  let { data } = $props();
  
  console.log('🏠 Rendering funeral homes list:', data.funeralHomes);
</script>

<div class="container mx-auto p-4">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Funeral Homes</h1>
    <a 
      href="/admin/funeral-homes/new"
      class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
    >
      Add New Funeral Home
    </a>
  </div>

  <div class="bg-white shadow-md rounded-lg overflow-hidden">
    <table class="min-w-full">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        {#each data.funeralHomes as home}
          <tr>
            <td class="px-6 py-4 whitespace-nowrap">{home.attributes.Name}</td>
            <td class="px-6 py-4 whitespace-nowrap">{home.attributes.Address}</td>
            <td class="px-6 py-4 whitespace-nowrap space-x-2">
              <a 
                href="/admin/funeral-homes/{home.id}"
                class="text-blue-600 hover:text-blue-900"
              >
                View/Edit
              </a>
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan="3" class="px-6 py-4 text-center text-gray-500">
              No funeral homes found
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>