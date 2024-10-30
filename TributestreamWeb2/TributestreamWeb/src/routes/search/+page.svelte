<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	// Search query and results store
	let query = '';
	let isLoading = writable(false);
	let error = writable<string | null>(null);
	let results = writable<any[]>([]);

	// Base URL for Tributestream API
	const API_URL = 'https://tributestream.com/wp-json/wp/v2/search';

	// Function to fetch data from Tributestream API
	async function fetchPages(searchQuery: string) {
		isLoading.set(true);
		error.set(null);
		try {
			const response = await fetch(`${API_URL}?search=${encodeURIComponent(searchQuery)}`);
			if (!response.ok) {
				throw new Error('Error fetching data');
			}
			const data = await response.json();
			results.set(data);
		} catch (err: any) {
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
	/* Simple styling for the form and results */
	.search-form {
		display: flex;
		margin-bottom: 1em;
	}
	.search-input {
		flex: 1;
		padding: 0.5em;
		font-size: 1em;
		border: 1px solid #ddd;
		border-radius: 4px;
	}
	.search-button {
		padding: 0.5em 1em;
		margin-left: 0.5em;
		font-size: 1em;
		cursor: pointer;
	}
	.results {
		margin-top: 1em;
	}
	.result-item {
		padding: 0.75em;
		margin: 0.5em 0;
		border: 1px solid #ddd;
		border-radius: 4px;
	}
	.error {
		color: red;
		font-weight: bold;
		margin-top: 1em;
	}
	.loading {
		margin-top: 1em;
	}
</style>

<!-- HTML for the search form and displaying results -->
<form class="search-form" on:submit={handleSearch}>
	<input
		type="text"
		class="search-input"
		bind:value={query}
		placeholder="Search pages..."
	/>
	<button type="submit" class="search-button">Search</button>
</form>

{#if $isLoading}
	<p class="loading">Loading...</p>
{/if}

{#if $error}
	<p class="error">Error: {$error}</p>
{/if}

{#if $results.length > 0}
	<div class="results">
		{#each $results as result}
			<div class="result-item">
				<h2>{result.title.rendered}</h2>
				<p>{@html result.excerpt.rendered}</p>
				<a href={result.link} target="_blank" rel="noopener noreferrer">Read More</a>
			</div>
		{/each}
	</div>
{:else if !isLoading && !$error && query}
	<p>No results found for "{query}"</p>
{/if}
