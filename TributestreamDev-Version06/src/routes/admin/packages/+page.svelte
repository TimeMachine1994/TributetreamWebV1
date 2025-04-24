<script lang="ts">
    let { data } = $props();
</script>

<div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Packages</h1>
        <a 
            href="/admin/packages/new"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
            Create New Package
        </a>
    </div>

    {#if data.packages.length === 0}
        <p class="text-gray-500 text-center py-8">No packages found</p>
    {:else}
        <div class="grid gap-4">
            {#each data.packages as pkg}
                <div class="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex justify-between items-start">
                        <div>
                            <h2 class="text-xl font-semibold">{pkg.attributes.title}</h2>
                            <p class="text-gray-600 mt-1">
                                Base Price: ${pkg.attributes.basePrice}
                            </p>
                        </div>
                        <div class="flex gap-2">
                            <a
                                href="/admin/packages/{pkg.id}"
                                class="text-blue-500 hover:text-blue-600"
                            >
                                View/Edit
                            </a>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>