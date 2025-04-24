<script lang="ts">
    let { form } = $props();
</script>

<div class="container mx-auto p-4">
    <div class="mb-6">
        <h1 class="text-2xl font-bold">Create New Package</h1>
    </div>

    <form method="POST" class="max-w-2xl">
        {#if form?.error}
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {form.error}
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
                value={form?.data?.title ?? ''}
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
                value={form?.data?.slug ?? ''}
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
                value={form?.data?.basePrice ?? ''}
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
                value={form?.data?.description ?? ''}
                class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
        </div>

        <div class="flex gap-4">
            <button
                type="submit"
                class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
            >
                Create Package
            </button>
            <a
                href="/admin/packages"
                class="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded"
            >
                Cancel
            </a>
        </div>
    </form>
</div>