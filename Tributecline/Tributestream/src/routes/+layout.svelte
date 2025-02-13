<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/layout/header.svelte';
	import Footer from '$lib/components/layout/footer.svelte';
	let { children } = $props();
</script>

<div class="flex flex-col min-h-screen">
	<Header />
	<main class="flex-grow">
		{@render children()}
	</main>
	<Footer />
</div>
