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
    export let onSave: (id: string, htmlContent: string) => Promise<void>;

    let htmlContent = tribute.html_content || '';
    let loading = false;
    let error = '';

    async function handleSave() {
        loading = true;
        error = '';
        try {
            await onSave(tribute.id, htmlContent);
            onClose();
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to update tribute';
        } finally {
            loading = false;
        }
    }
</script>

<div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl">
        <div class="p-6">
            <h2 class="text-xl font-semibold mb-4">
                Edit HTML for {tribute.loved_one_name}
            </h2>
            {#if error}
                <div class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            {/if}
            <textarea
                bind:value={htmlContent}
                class="w-full h-96 p-4 border rounded font-mono text-sm"
                placeholder="Enter HTML content..."
                disabled={loading}
            ></textarea>
            <div class="mt-4 flex justify-end space-x-3">
                <button
                    on:click={onClose}
                    class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    on:click={handleSave}
                    class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    </div>
</div>
