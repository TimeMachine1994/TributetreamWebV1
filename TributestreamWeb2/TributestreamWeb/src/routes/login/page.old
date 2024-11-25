<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { writable } from 'svelte/store';
    let username = '';
    let password = '';
    let error = writable('');
  // Function to check if the JWT cookie is set
  const checkCookie = () => {
    const cookies = document.cookie.split('; ');
    const jwtCookie = cookies.find(cookie => cookie.startsWith('jwt='));
    return jwtCookie ? true : false;
  };
  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);

    try {
      // Make a POST request using fetch
      const response = await fetch('/login', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        // Set error message from server response
        error.set(result.error || 'Login failed');
      } else if (result.success) {
        // Redirect to the /admin page on successful login
        window.location.href = '/admin';
    }
    } catch (err) {
      console.error('Client-side login error:', err);
      error.set('Something went wrong. Please try again.');
    }
  };
  // On mount, check if the user is already logged in
  onMount(() => {
    console.log('Checking cookie...');
    if (checkCookie()) {
        window.location.href = '/admin';
    }
  });
</script>

<section class="relative bg-gray-900 text-white">
    <div class="relative z-20 flex flex-col items-center justify-center min-h-screen p-8">
        <div class="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg">
            <h1 class="text-3xl font-bold mb-6 text-center">Login to Tributestream</h1>
            
            <form on:submit|preventDefault={handleSubmit} class="space-y-4">
                <div>
                    <label for="username" class="block text-sm font-medium mb-2">Username</label>
                    <input
                        id="username"
                        name="username" 
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
                        name="password" 
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
