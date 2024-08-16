<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	
	let userName = '';
	let userEmail = '';
	let userPassword = '';
	let error = '';
	
	const API_BASE_URL = 'https://tributestream.com/wp-json';
	
	function isValidJWT(token) {
		if (!token) {
			console.error('Token is null or undefined');
			return false;
		}
		const parts = token.split('.');
		if (parts.length !== 3) {
			console.error('Token does not have 3 parts:', parts.length);
			return false;
		}
		return true;
	}
	
	async function registerUser() {
		console.log('Registering user');
		try {
			const response = await fetch(`${API_BASE_URL}/my-custom-plugin/v1/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username: userName, email: userEmail, password: userPassword })
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Registration failed');
			}
			const data = await response.json();
			console.log('User registered successfully:', data);
			return data;
		} catch (err) {
			console.error('Registration error:', err);
			throw err;
		}
	}
	
	async function loginUser() {
		console.log('Logging in user');
		try {
			const response = await fetch(`${API_BASE_URL}/jwt-auth/v1/token`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username: userName, password: userPassword })
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Login failed');
			}
			const data = await response.json();
			console.log('Login response:', data);
			let token;
			if (data.token) {
				token = data.token;
			} else if (data.data && data.data.token) {
				token = data.data.token;
			} else {
				console.error('Token structure in response:', JSON.stringify(data, null, 2));
				throw new Error('Token not found in server response');
			}
			console.log('Received token:', token);
			if (!isValidJWT(token)) {
				console.error('Invalid token format:', token);
				throw new Error('Received invalid token format from server');
			}
			localStorage.setItem('jwtToken', token);
			console.log('User logged in successfully, token:', token);
			return token;
		} catch (err) {
			console.error('Login error:', err);
			throw err;
		}
	}
	
	async function createPage(token) {
		console.log('Creating page');
		if (!token || !isValidJWT(token)) {
			throw new Error('Invalid authentication token. Please log in again.');
		}
					try {
						// Fetch a new nonce
						const nonceResponse = await fetch(`${API_BASE_URL}/my-custom-plugin/v1/get-nonce`, {
							method: 'GET',
							headers: {
								'Authorization': `Bearer ${token}`
							}
						});
						const nonceData = await nonceResponse.json();
						const nonce = nonceData.nonce;

						// Create a new page with the nonce
						const response = await fetch(`${API_BASE_URL}/my-custom-plugin/v1/create-page`, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								'Authorization': `Bearer ${token}`,
								'X-WP-Nonce': nonce
							},
							body: JSON.stringify({
								title: 'Your Page Title',
								content: 'Your Page Content',
							})
						});			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			if (data && data.page_id) {
				console.log('Page created successfully with ID:', data.page_id);
				return data.page_id;
			} else {
				throw new Error('Unexpected response format');
			}
		} catch (error) {
			console.error('Error creating page:', error);
			throw error;
		}
	}
	
	async function getPage(pageId: number) {
		const response = await fetch(`${API_BASE_URL}/wp/v2/pages/${pageId}`, {
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
			}
		});
		if (!response.ok) throw new Error('Failed to retrieve page');
		return await response.json();
	}
	
	async function updatePage(pageId: number, title: string, content: string) {
		const response = await fetch(`${API_BASE_URL}/wp/v2/pages/${pageId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
			},
			body: JSON.stringify({ title, content })
		});
		if (!response.ok) throw new Error('Failed to update page');
		return await response.json();
	}
	
	async function deletePage(pageId: number) {
		const response = await fetch(`${API_BASE_URL}/wp/v2/pages/${pageId}`, {
			method: 'DELETE',
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
			}
		});
		if (!response.ok) throw new Error('Failed to delete page');
		return await response.json();
	}
	
	async function handleSubmit() {
		console.log('Form submitted');
		error = '';
		try {
			await registerUser();
			console.log('User registered');
			const token = await loginUser();
			console.log('User logged in with token:', token);
			const pageId = await createPage(token);
			console.log('Page created:', pageId);
			window.location.href = `https://tributestream.com/tribute/${pageId}`;
		} catch (err) {
			console.error('Process error:', err);
			if (err.message.includes('Token not found') || err.message.includes('invalid token format')) {
				error = 'There was an issue with authentication. Please try again or contact support.';
				console.error('Authentication error details:', err.message);
				localStorage.removeItem('jwtToken');
			} else if (err.message.includes('Registration failed')) {
				error = 'Registration failed. The username or email might already be in use.';
			} else if (err.message.includes('Login failed')) {
				error = 'Login failed. Please check your credentials.';
			} else if (err.message.includes('Failed to create page')) {
				error = 'Failed to create the tribute page. Please try again later.';
			} else if (err.message.includes('Token validation failed')) {
				localStorage.removeItem('jwtToken');
				error = 'Your session has expired. Please log in again.';
			} else {
				error = 'An unexpected error occurred. Please try again.';
				console.error('Unexpected error details:', err.message);
			}
		}
	}
	</script>
	
	<main>
		<div class="registration">
			<h1>Create Tribute</h1>
			<form on:submit|preventDefault={handleSubmit}>
				<input type="text" bind:value={userName} placeholder="Your Name" required>
				<input type="email" bind:value={userEmail} placeholder="Email Address" required>
				<input type="password" bind:value={userPassword} placeholder="Password" required>
				<button type="submit">Create Tribute</button>
			</form>
			{#if error}
				<p class="error">{error}</p>
			{/if}
		</div>
	</main>
	
	<style>
		/* Your styles remain unchanged */
	</style>
	