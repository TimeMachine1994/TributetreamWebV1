<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	// Search query and results store
	let query = '';
	let isLoading = writable(false);
	let error = writable<string | null>(null);
	let results = writable<any[]>([]);

	// Base URL for Tributestream API
	const API_URL = 'https://wp.tributestream.com/wp-json/wp/v2/pages';

	// Function to fetch data from Tributestream API
	async function fetchPages(searchQuery: string) {
		isLoading.set(true);
		error.set(null);
		try {
			const response = await fetch(`${API_URL}?search=${encodeURIComponent(searchQuery)}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json"
				},
				mode: "cors"  // Enable CORS
			});
			if (!response.ok) {
				throw new Error(`Error fetching data: ${response.status} ${response.statusText}`);
			}

			// Parse response data
			const data = await response.json();
			// Map to ensure required fields are safely accessed
			const formattedData = data.map((item: any) => ({
				title: item.title?.rendered || "Untitled",
				excerpt: item.excerpt?.rendered || item.content?.rendered || "No description available.",
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

	// Trigger search when the form is submitted
	function handleSearch(event: Event) {
		event.preventDefault();
		if (query.trim()) {
			fetchPages(query);
		}
	}

	// Fetch initial data on page load (optional)
	onMount(() => {
		fetchPages(''); // Optionally fetch all pages if empty search is allowed
	});
</script>

<style>
	@import "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css";
</style>

<div class="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
	<h1 class="text-4xl font-extrabold text-gray-900 mb-6">Search Pages</h1>
	<form on:submit={handleSearch} class="w-full max-w-lg flex mb-8">
		<input
			type="text"
			bind:value={query}
			placeholder="Search pages..."
			class="flex-grow py-3 px-4 rounded-l-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
		/>
		<button
			type="submit"
			class="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
		>
			Search
		</button>
	</form>

	{#if $isLoading}
		<p class="text-lg text-gray-700 animate-pulse">Loading...</p>
	{/if}

	{#if $error}
		<p class="text-lg text-red-600 font-semibold">Error: {$error}</p>
	{/if}

	{#if $results.length > 0}
		<div class="w-full max-w-2xl space-y-4">
			{#each $results as result}
			<div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200">
				<h2 class="text-xl font-bold text-gray-800 mb-2">{result.title}</h2>
				<p class="text-gray-600 mb-4">{@html result.excerpt}</p>
				<a
					href={result.link}
					target="_blank"
					rel="noopener noreferrer"
					class="text-indigo-600 font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
				>
					Read More
				</a>
			</div>
		{/each}
		</div>
	{:else if !$isLoading && !$error && query}
		<p class="text-lg text-gray-500">No results found for "<span class="font-semibold">{query}</span>"</p>
	{/if}
</div>
