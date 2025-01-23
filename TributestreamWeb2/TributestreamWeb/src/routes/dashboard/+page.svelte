<script lang="ts">
    import { onMount } from 'svelte';

    interface Tribute {
        id: string;
        loved_one_name: string;
        created_at: string;
        slug: string;
    }

    let tributes = $state<Tribute[]>([]);
    let loading = $state(true);
    let error = $state('');

    async function fetchTributes() {
        try {
            const response = await fetch('/api/tributes');
            if (!response.ok) {
                throw new Error('Failed to fetch tributes');
            }
            const data = await response.json();
            tributes = data.tributes || [];
        } catch (err) {
            error = err instanceof Error ? err.message : 'An error occurred';
        } finally {
            loading = false;
        }
    }

    onMount(fetchTributes);

    function formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
</script>

<div class="space-y-6">
    <h1 class="text-2xl font-semibold text-gray-900">Your Dashboard</h1>

    {#if loading}
        <div class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
    {:else if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
        </div>
    {:else}
        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Your Tributes</h3>
            </div>
            {#if tributes.length === 0}
                <div class="px-4 py-5 sm:p-6 text-center text-gray-500">
                    No tributes found. Create your first tribute to get started.
                </div>
            {:else}
                <ul class="divide-y divide-gray-200">
                    {#each tributes as tribute}
                        <li class="px-4 py-4 sm:px-6">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h4 class="text-lg font-medium text-gray-900">
                                        {tribute.loved_one_name}
                                    </h4>
                                    <p class="mt-1 text-sm text-gray-500">
                                        Created {formatDate(tribute.created_at)}
                                    </p>
                                </div>
                                <div class="flex space-x-3">
                                    <a
                                        href={`/celebration-of-life-for-${tribute.slug}`}
                                        class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        View Tribute
                                    </a>
                                </div>
                            </div>
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
    {/if}
</div>
