<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/layout/header.svelte';
	import Footer from '$lib/components/layout/footer.svelte';
	import { setContext } from 'svelte';

	interface User {
		id: number;
		email: string;
		displayName: string;
		nicename: string;
	}

	// Global user state
	let user = $state<User | null>(null);

	// Props for child components
	let { children } = $props();

	// Handle user login
	function handleLoginSuccess(userData: User) {
		user = userData;
	}

	// Provide user state and handlers via context
	setContext('user', {
		user,
		onLoginSuccess: handleLoginSuccess
	});
</script>

<div class="flex flex-col min-h-screen">
	<Header />
	<main class="flex-grow">
		{@render children()}
	</main>
	<Footer />
</div>
