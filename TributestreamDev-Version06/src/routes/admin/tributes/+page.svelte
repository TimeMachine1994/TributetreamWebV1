<script lang="ts">
  let { data } = $props();
</script>

<div class="container mx-auto p-4">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Tributes</h1>
    <a 
      href="/admin/tributes/new" 
      class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      Create New Tribute
    </a>
  </div>

  <div class="overflow-x-auto">
    <table class="min-w-full bg-white">
      <thead>
        <tr>
          <th class="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Loved One's Name
          </th>
          <th class="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Date of Birth
          </th>
          <th class="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Date of Death
          </th>
          <th class="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Payment Status
          </th>
          <th class="px-6 py-3 border-b-2 border-gray-200"></th>
        </tr>
      </thead>
      <tbody>
        {#each data.tributes as tribute}
          <tr>
            <td class="px-6 py-4 whitespace-nowrap border-b border-gray-200">
              {tribute.attributes.lovedOnesFullName}
            </td>
            <td class="px-6 py-4 whitespace-nowrap border-b border-gray-200">
              {new Date(tribute.attributes.lovedOnesDOB).toLocaleDateString()}
            </td>
            <td class="px-6 py-4 whitespace-nowrap border-b border-gray-200">
              {new Date(tribute.attributes.lovedOnesDOD).toLocaleDateString()}
            </td>
            <td class="px-6 py-4 whitespace-nowrap border-b border-gray-200">
              <span class={tribute.attributes.paymentComplete ? "text-green-600" : "text-red-600"}>
                {tribute.attributes.paymentComplete ? "Paid" : "Pending"}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap border-b border-gray-200 text-right">
              <a 
                href="/admin/tributes/{tribute.id}" 
                class="text-blue-600 hover:text-blue-900 mr-4"
              >
                View/Edit
              </a>
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan="5" class="px-6 py-4 text-center text-gray-500">
              No tributes found
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>