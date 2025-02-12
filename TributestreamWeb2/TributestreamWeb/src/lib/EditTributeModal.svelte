<script lang="ts">
    interface Tribute {
        id: string;
        loved_one_name: string;
        created_at: string;
        slug: string;
        html_content?: string;
    }

    export let tribute: Tribute;
    export let onClose: () => void;
    export let form: string;
    export let onSuccess: () => Promise<void>;
    export let onError: () => void;

    let htmlContent = tribute.html_content || '';
    let lovedOneName = tribute.loved_one_name;
    let slug = tribute.slug;
    let loading = false;
    let error = '';

    async function handleSubmit(event: SubmitEvent) {
        loading = true;
        error = '';
        
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        
        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                await onSuccess();
                onClose();
            } else {
                error = result.error || 'Failed to update tribute';
                onError();
            }
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to update tribute';
            onError();
        } finally {
            loading = false;
        }
    }
</script>

<div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl">
        <div class="p-6">
            <h2 class="text-xl font-semibold mb-4">Edit Tribute</h2>
            {#if error}
                <div class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            {/if}
            <div class="space-y-4">
                <div>
                    <label for="loved_one_name" class="block text-sm font-medium text-gray-700">Loved One's Name</label>
                    <input
                        type="text"
                        id="loved_one_name"
                        bind:value={lovedOneName}
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter name..."
                        disabled={loading}
                    />
                </div>
                <div>
                    <label for="slug" class="block text-sm font-medium text-gray-700">Slug</label>
                    <input
                        type="text"
                        id="slug"
                        bind:value={slug}
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter slug..."
                        disabled={loading}
                    />
                </div>
                <div>
                    <label for="html_content" class="block text-sm font-medium text-gray-700">HTML Content</label>
                    <textarea
                        id="html_content"
                        bind:value={htmlContent}
                        class="w-full h-96 p-4 border rounded font-mono text-sm"
                        placeholder="Enter HTML content..."
                        disabled={loading}
                    ></textarea>
                </div>
            </div>
            <form method="POST" action={form} on:submit|preventDefault={handleSubmit}>
                <input type="hidden" name="id" value={tribute.id} />
                <input type="hidden" name="loved_one_name" value={lovedOneName} />
                <input type="hidden" name="html_content" value={htmlContent} />
                <input type="hidden" name="slug" value={slug} />
                
                <div class="mt-4 flex justify-end space-x-3">
                    <button
                        type="button"
                        on:click={onClose}
                        class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
