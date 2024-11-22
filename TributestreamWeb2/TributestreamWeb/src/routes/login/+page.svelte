<script>
    import { onMount } from 'svelte';

    let username = '';
    let password = '';

    // Function to handle login
    async function handleLogin() {
        try {
            const response = await fetch('https://wp.tributestream.com/wp-json/jwt-auth/v1/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error('Login failed. Please check your credentials.');
            }

            const data = await response.json();
            localStorage.setItem('token', data.token); // Save the JWT token
            window.location.href = '/admin'; // Redirect to admin page
        } catch (error) {
            console.error('Error during login:', error);
        }
    }
</script>

<main>
    <h1>Login</h1>
    <form on:submit|preventDefault={handleLogin}>
        <input type="text" bind:value={username} placeholder="Username" required />
        <input type="password" bind:value={password} placeholder="Password" required />
        <button type="submit">Login</button>
    </form>
</main>
