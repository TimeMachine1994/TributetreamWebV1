 <script lang="ts">
	import { run } from 'svelte/legacy';

	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { page } from '$app/stores';
	let lovedOneName = $state();
	run(() => {
		lovedOneName = $page.url.searchParams.get('q');
	});

	let query = $state('');
	let isLoading = writable(false);
	let error = writable<string | null>(null);
	let results = writable<any[]>([]);
 
	const API_URL = 'https://wp.tributestream.com/wp-json/wp/v2/pages';

	async function fetchPages(searchQuery: string) {
		isLoading.set(true);
		error.set(null);
		try {
			const response = await fetch(`${API_URL}?search=${encodeURIComponent(searchQuery)}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json"
				},
				mode: "cors"
			});
			if (!response.ok) {
				throw new Error(`Error fetching data: ${response.status} ${response.statusText}`);
			}

			const data = await response.json();
			const formattedData = data.map((item: any) => ({
				title: item.title?.rendered || "Untitled",
				link: item.link || "#"
			}));

			results.set(formattedData);
		} catch (err: any) {
			console.error("Fetch error:", err);
			error.set(err.message || 'Unknown error');
		} finally {
			isLoading.set(false);
		}
	}

	function handleSearch(event: Event) {
		event.preventDefault();
		if (query.trim()) {
			fetchPages(query);
		}
	}

	onMount(() => {
		if (lovedOneName) {
        query = lovedOneName; // Set the query value to the URL parameter
        fetchPages(lovedOneName); // Perform the search with the URL parameter
    } else {
        fetchPages('');
    }	});
</script>

<style>
	@import "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css";


  /* Scrollbar customizations */
  .fanwood-text-regular {
  font-family: "Fanwood Text", serif;
  font-weight: 400;
  font-style: normal;
}

.fanwood-text-regular-italic {
  font-family: "Fanwood Text", serif;
  font-weight: 400;
  font-style: italic;
}
</style>

<div class="min-h-screen bg-[#CFCFCE] flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
	<h1 class="text-4xl font-extrabold text-[#070707] mb-6">Search Pages</h1>
	<form onsubmit={handleSearch} class="w-full max-w-lg flex mb-8">
		<input
			type="text"
			bind:value={query}
			placeholder="Search pages..."
			class="flex-grow py-3 px-4 rounded-l-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D5BA7F] focus:border-[#D5BA7F] text-gray-700"
		/>
		<button
			type="submit"
			class="px-6 py-3 bg-[#FF7E00] text-white font-semibold rounded-r-md hover:bg-[#D5BA7F] focus:outline-none focus:ring-2 focus:ring-[#D5BA7F] transition"
		>
			Search
		</button>
	</form>

	{#if $isLoading}
		<p class="text-lg text-[#070707] animate-pulse">Loading...</p>
	{/if}

	{#if $error}
		<p class="text-lg text-red-600 font-semibold">Error: {$error}</p>
	{/if}

	{#if $results.length > 0}
		<div class="w-full max-w-2xl space-y-4">
			{#each $results as result}
				<div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200">
					<h2 class="text-xl font-bold text-[#070707] mb-4">{result.title}</h2>
					<a
						href={result.link}
						target="_blank"
						rel="noopener noreferrer"
						class="text-[#FF7E00] font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-[#D5BA7F] transition"
					>
						Read More
					</a>
				</div>
			{/each}
		</div>
	{:else if !$isLoading && !$error && query}
		<p class="text-lg text-gray-700">No results found for "<span class="font-semibold">{query}</span>"</p>
	{/if}
</div>
