<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { writable } from 'svelte/store';
     
    let username = '';
    let password = '';
    let error = writable('');
    const API_BASE_URL = 'https://wp.tributestream.com/wp-json';

    // Function to validate JWT token
    function isValidJWT(token) {
        if (!token) return false;
        const parts = token.split('.');
        return parts.length === 3;
    }

    async function handleLogin() {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        try {
            const response = await fetch('/login', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const result = await response.json();
                error = result.error || 'Login failed';
            } else {
                // Redirect to /admin page if login succeeds
                window.location.href = '/admin';
            }
        } catch (err) {
            console.error('Login error:', err);
            error = 'Server error. Please try again later.';
        }
    }
      
</script>

<section class="relative bg-gray-900 text-white">
    <div class="relative z-20 flex flex-col items-center justify-center min-h-screen p-8">
        <div class="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg">
            <h1 class="text-3xl font-bold mb-6 text-center">Login to Tributestream</h1>
            
            <form on:submit|preventDefault={handleLogin} class="space-y-4">
                <div>
                    <label for="username" class="block text-sm font-medium mb-2">Username</label>
                    <input
                        id="username"
                        type="text"
                        bind:value={username}
                        class="w-full px-4 py-2 text-gray-900 rounded-md"
                        placeholder="Enter your username"
                        required
                    />
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium mb-2">Password</label>
                    <input
                        id="password"
                        type="password"
                        bind:value={password}
                        class="w-full px-4 py-2 text-gray-900 rounded-md"
                        placeholder="Enter your password"
                        required
                    />
                </div>

                {#if $error}
                    <p class="text-red-500 text-sm">{$error}</p>
                {/if}

                <button
                    type="submit"
                    class="w-full bg-[#D5BA7F] text-black font-bold py-2 px-4 rounded-lg hover:shadow-[0_0_10px_4px_#D5BA7F] transition-all duration-300 ease-in-out"
                >
                    Login
                </button>
            </form>
        </div>
    </div>
</section>
