<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authStore, isAuthenticated, isLoading, authError } from '$lib/stores/auth.store';
  
  // Form data
  let username = '';
  let password = '';
  let rememberMe = false;
  let submitting = false;
  let errorMessage = '';
  
  // Get the redirect URL from the query string
  let redirectTo = '/';
  
  onMount(() => {
    // Get the redirect URL from the query string
    const params = new URLSearchParams($page.url.search);
    redirectTo = params.get('redirectTo') || '/';
    
    // If the user is already authenticated, redirect to the requested page
    if ($isAuthenticated) {
      goto(redirectTo);
    }
    
    // Clear any previous errors
    authStore.clearError();
  });
  
  // Handle form submission
  async function handleSubmit() {
    // Reset error message
    errorMessage = '';
    
    // Validate form
    if (!username || !password) {
      errorMessage = 'Please enter both username and password';
      return;
    }
    
    // Set submitting state
    submitting = true;
    
    try {
      // Attempt to login
      await authStore.login(username, password);
      
      // If successful, redirect to the requested page
      goto(redirectTo);
    } catch (error) {
      // Handle error
      errorMessage = error instanceof Error ? error.message : 'Login failed';
    } finally {
      // Reset submitting state
      submitting = false;
    }
  }
</script>

<svelte:head>
  <title>Login | TributeStream</title>
  <meta name="description" content="Login to your TributeStream account" />
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="w-full max-w-md space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
        Sign in to your account
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Or <a href="/register" class="font-medium text-blue-600 hover:text-blue-500">create a new account</a>
      </p>
    </div>
    
    <form class="mt-8 space-y-6" on:submit|preventDefault={handleSubmit}>
      <div class="-space-y-px rounded-md shadow-sm">
        <div>
          <label for="username" class="sr-only">Username or Email</label>
          <input
            id="username"
            name="username"
            type="text"
            autocomplete="username"
            required
            class="relative block w-full rounded-t-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            placeholder="Username or Email"
            bind:value={username}
            disabled={submitting || $isLoading}
          />
        </div>
        <div>
          <label for="password" class="sr-only">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="current-password"
            required
            class="relative block w-full rounded-b-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            placeholder="Password"
            bind:value={password}
            disabled={submitting || $isLoading}
          />
        </div>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            bind:checked={rememberMe}
            disabled={submitting || $isLoading}
          />
          <label for="remember-me" class="ml-2 block text-sm text-gray-900">Remember me</label>
        </div>

        <div class="text-sm">
          <a href="/forgot-password" class="font-medium text-blue-600 hover:text-blue-500">
            Forgot your password?
          </a>
        </div>
      </div>

      {#if errorMessage || $authError}
        <div class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <!-- Heroicon name: mini/x-circle -->
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                {errorMessage || $authError}
              </h3>
            </div>
          </div>
        </div>
      {/if}

      <div>
        <button
          type="submit"
          class="group relative flex w-full justify-center rounded-md bg-blue-600 py-2 px-3 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={submitting || $isLoading}
        >
          {#if submitting || $isLoading}
            <span class="absolute inset-y-0 left-0 flex items-center pl-3">
              <!-- Heroicon name: mini/arrow-path -->
              <svg class="h-5 w-5 text-blue-400 animate-spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clip-rule="evenodd" />
              </svg>
            </span>
            Signing in...
          {:else}
            <span class="absolute inset-y-0 left-0 flex items-center pl-3">
              <!-- Heroicon name: mini/lock-closed -->
              <svg class="h-5 w-5 text-blue-500 group-hover:text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd" />
              </svg>
            </span>
            Sign in
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>