<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { writable } from 'svelte/store';

    let username = '';
    let password = '';
    let error = writable('');

    async function handleLogin(event) {
        event.preventDefault();
        
        const response = await fetch('https://wp.tributestream.com/wp-json/jwt-auth/v1/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        if (response.ok) {
            sessionStorage.setItem('token', result.token);
            await goto('/admin'); // Added await here
        } else {
            error.set(result.message || 'Login failed');
        }
    }
</script>

<div>
    <h1>Login</h1>
    <input type="text" bind:value={username} placeholder="Username" />
    <input type="password" bind:value={password} placeholder="Password" />
    <button on:click={handleLogin}>Login</button>
    <p>{$error}</p>
</div>
