<script lang="ts">
  import { formatCurrency } from '$lib/utils/format';
  import { page } from '$app/stores';

  // Define page data type
  interface PageData {
    package: {
      id: number;
      attributes: {
        name: string;
        description?: string;
        price: number;
        features?: string[];
        createdAt?: string;
        updatedAt?: string;
        publishedAt?: string;
      }
    };
    tributes: Array<{
      id: number;
      attributes: {
        lovedOnesFullName: string;
        dateOfPassing?: string;
        slug?: string;
      }
    }>;
  }

  // Get data from page store
  let data = $page.data as PageData;
</script>

<svelte:head>
  <title>Package: {data.package.attributes.name}</title>
  <meta name="description" content="Package details for {data.package.attributes.name}" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="mb-4">
    <a href="/packages" class="text-blue-600 hover:underline">
      &larr; Back to Packages
    </a>
  </div>

  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex justify-between items-start">
      <div>
        <h1 class="text-3xl font-bold mb-2">{data.package.attributes.name}</h1>
        <div class="text-2xl text-green-600 font-semibold mb-4">
          {formatCurrency(data.package.attributes.price)}
        </div>
      </div>
      
      <div class="flex space-x-2">
        <a 
          href={`/packages/${data.package.id}/edit`} 
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Edit
        </a>
      </div>
    </div>

    {#if data.package.attributes.description}
      <div class="my-6">
        <h2 class="text-xl font-semibold mb-2">Description</h2>
        <p class="text-gray-700">{data.package.attributes.description}</p>
      </div>
    {/if}

    {#if data.package.attributes.features && data.package.attributes.features.length > 0}
      <div class="my-6">
        <h2 class="text-xl font-semibold mb-2">Features</h2>
        <ul class="list-disc list-inside space-y-1">
          {#each data.package.attributes.features as feature}
            <li class="text-gray-700">{feature}</li>
          {/each}
        </ul>
      </div>
    {/if}

    <hr class="my-6 border-gray-200" />

    <div class="my-6">
      <h2 class="text-xl font-semibold mb-2">
        Tributes Using This Package 
        <span class="text-gray-500 text-base">({data.tributes.length})</span>
      </h2>
      
      {#if data.tributes.length > 0}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {#each data.tributes as tribute}
            <a 
              href={`/tributes/${tribute.id}`}
              class="block p-4 border border-gray-200 rounded hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div class="font-medium text-lg">{tribute.attributes.lovedOnesFullName}</div>
              {#if tribute.attributes.dateOfPassing}
                <div class="text-sm text-gray-600">
                  Passed: {new Date(tribute.attributes.dateOfPassing).toLocaleDateString()}
                </div>
              {/if}
            </a>
          {/each}
        </div>
      {:else}
        <p class="text-gray-500 italic">No tributes are currently using this package.</p>
      {/if}
    </div>
  </div>
</div>