<script lang="ts">
	import '../app.css';
	import Navigation from '$lib/components/Navigation.svelte';

	let { data, children } = $props();
</script>

<header>
	<Navigation />
</header>

<main>
	{@render children()}
</main>

<style>
	main {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem;
	}

	@media (max-width: 768px) {
		main {
			padding: 0.5rem;
		}
	}
</style>
