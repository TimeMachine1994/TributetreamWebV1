<script lang="ts">
    let { data, form } = $props();
    let showDeleteConfirm = $state(false);
</script>

<div class="container mx-auto p-4">
    <div class="mb-6">
        <h1 class="text-2xl font-bold">Edit Package</h1>
    </div>

    <form method="POST" action="?/update" class="max-w-2xl">
        {#if form?.error}
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {form.error}
            </div>
        {/if}

        {#if form?.success}
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                Package updated successfully!
            </div>
        {/if}

        <div class="mb-4">
            <label for="title" class="block text-gray-700 font-bold mb-2">
                Title *
            </label>
            <input
                type="text"
                id="title"
                name="title"
                value={form?.data?.title ?? data.package.attributes.title}
                class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
        </div>

        <div class="mb-4">
            <label for="slug" class="block text-gray-700 font-bold mb-2">
                Slug
                <span class="font-normal text-gray-500">(optional - will be generated from title if empty)</span>
            </label>
            <input
                type="text"
                id="slug"
                name="slug"
                value={form?.data?.slug ?? data.package.attributes.slug}
                class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        <div class="mb-4">
            <label for="basePrice" class="block text-gray-700 font-bold mb-2">
                Base Price *
            </label>
            <input
                type="number"
                id="basePrice"
                name="basePrice"
                value={form?.data?.basePrice ?? data.package.attributes.basePrice}
                step="0.01"
                min="0"
                class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
        </div>

        <div class="mb-4">
            <label for="description" class="block text-gray-700 font-bold mb-2">
                Description
            </label>
            <textarea
                id="description"
                name="description"
                rows="4"
                value={form?.data?.description ?? data.package.attributes.description}
                class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
        </div>

        <div class="flex gap-4">
            <button
                type="submit"
                class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
            >
                Update Package
            </button>
            <a
                href="/admin/packages"
                class="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded"
            >
                Cancel
            </a>
            <button
                type="button"
                class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded ml-auto"
                onclick={() => showDeleteConfirm = true}
            >
                Delete Package
            </button>
        </div>
    </form>

    {#if showDeleteConfirm}
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div class="bg-white p-6 rounded-lg max-w-md">
                <h2 class="text-xl font-bold mb-4">Confirm Delete</h2>
                <p class="mb-6">Are you sure you want to delete this package? This action cannot be undone.</p>
                <div class="flex gap-4 justify-end">
                    <button
                        class="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded"
                        onclick={() => showDeleteConfirm = false}
                    >
                        Cancel
                    </button>
                    <form method="POST" action="?/delete">
                        <button
                            type="submit"
                            class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                        >
                            Delete
                        </button>
                    </form>
                </div>
            </div>
        </div>
    {/if}
</div>