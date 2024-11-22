<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { writable } from 'svelte/store';
    import { loginUser } from '../+page.svelte';
     let username = '';
    let password = '';
    let error = writable('');

    async function handleLogin(event) {
        event.preventDefault();
        
        const response = loginUser({ username, password })
        });

        const result = response.json();
        
            sessionStorage.setItem('token', result.token);
            await goto('/admin'); // Added await here
    
  
    }
</script>

<div>
    <h1>Login</h1>
    <input type="text" bind:value={username} placeholder="Username" />
    <input type="password" bind:value={password} placeholder="Password" />
    <button on:click={handleLogin}>Login</button>
    <p>{$error}</p>
</div>
