<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { fade } from 'svelte/transition';
  
  // State
  let username = $state('');
  let password = $state('');
  let isLoading = $state(false);
  let errorMessage = $state('');
  
  // Form validation
  let isUsernameValid = $derived(username.length >= 3);
  let isPasswordValid = $derived(password.length >= 6);
  let isFormValid = $derived(isUsernameValid && isPasswordValid);
</script>

<svelte:head>
  <title>Login | Tributestream Admin</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-100">
  <div class="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-gray-800">Tributestream Admin</h1>
      <p class="text-gray-600 mt-2">Login to access the admin dashboard</p>
    </div>
    
    {#if errorMessage}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert" transition:fade>
        <span class="block sm:inline">{errorMessage}</span>
      </div>
    {/if}
    
    <form method="POST" use:enhance={() => {
      isLoading = true;
      errorMessage = '';
      
      return async ({ result }) => {
        isLoading = false;
        
        if (result.type === 'failure') {
          errorMessage = (result.data?.message as string) || 'Login failed. Please check your credentials.';
        } else if (result.type === 'redirect') {
          goto(result.location);
        }
      };
    }}>
      <div class="mb-4">
        <label for="username" class="block text-gray-700 text-sm font-bold mb-2">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          bind:value={username}
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="your_username"
          required
        />
        {#if username && !isUsernameValid}
          <p class="text-red-500 text-xs italic mt-1">Username must be at least 3 characters.</p>
        {/if}
      </div>
      
      <div class="mb-6">
        <label for="password" class="block text-gray-700 text-sm font-bold mb-2">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          bind:value={password}
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="********"
          required
        />
        {#if password && !isPasswordValid}
          <p class="text-red-500 text-xs italic mt-1">Password must be at least 6 characters.</p>
        {/if}
      </div>
      
      <div class="flex items-center justify-between">
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          class="bg-primary text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </form>
  </div>
</div>