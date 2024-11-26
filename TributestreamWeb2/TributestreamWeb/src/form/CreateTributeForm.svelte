<script lang="ts">
    import { createForm } from 'svelte-forms-lib';
    import { z } from 'zod';

    // Validation schema
    const schema = z.object({
        event_name: z.string().min(1, 'Event name is required'),
        event_date: z.string().min(1, 'Event date is required'),
        livestream_url: z.string().url('Invalid URL')
    });

    const { fields, handleSubmit, resetForm } = createForm({
        initialValues: {
            event_name: '',
            event_date: '',
            livestream_url: ''
        },
        validateSchema: schema,
        onSubmit: async (values) => {
            try {
                const response = await fetch('/wp-json/custom/v1/tribute-pages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values)
                });
                if (response.ok) {
                    alert('Tribute created successfully!');
                    resetForm();
                } else {
                    throw new Error('Error creating tribute');
                }
            } catch (error) {
                console.error('Submission error:', error);
            }
        }
    });

    // Close modal
    export let close: () => void;
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 class="text-lg font-bold mb-4">Create New Tribute</h2>
        <form on:submit|preventDefault={handleSubmit}>
            <label class="block mb-2">
                Event Name:
                <input
                    type="text"
                    bind:value={$fields.event_name}
                    class="w-full border border-gray-300 rounded px-2 py-1"
                />
            </label>
            <label class="block mb-2">
                Event Date:
                <input
                    type="date"
                    bind:value={$fields.event_date}
                    class="w-full border border-gray-300 rounded px-2 py-1"
                />
            </label>
            <label class="block mb-4">
                Livestream URL:
                <input
                    type="url"
                    bind:value={$fields.livestream_url}
                    class="w-full border border-gray-300 rounded px-2 py-1"
                />
            </label>
            <div class="flex justify-end space-x-2">
                <button
                    type="button"
                    on:click={close}
                    class="px-4 py-2 bg-gray-500 text-white rounded"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    class="px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Create
                </button>
            </div>
        </form>
    </div>
</div>
