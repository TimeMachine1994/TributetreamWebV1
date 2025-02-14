<!-- 
  Login Page Component
  Handles user authentication against WordPress using JWT
-->
<script lang="ts">
  import { login, type AuthResponse } from '$lib/utils/api.client';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  
  // Form state
  let username = $state('');
  let password = $state('');
  let isLoading = $state(false);
  let error = $state<string | null>(null);

  // Handle form submission
  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    error = null;
    isLoading = true;

    try {
      // Validate inputs
      if (!username || !password) {
        throw new Error('Please enter both username and password');
      }

      // Attempt login
      const response = await login(username, password);
      
      // Store the token and user data
      handleLoginSuccess(response);
      
      // Redirect to the return URL or dashboard
      const returnUrl = $page.url.searchParams.get('returnUrl') || '/dashboard';
      goto(returnUrl);
    } catch (e) {
      // Handle login errors
      if (e instanceof Error) {
        error = e.message;
      } else {
        error = 'An unexpected error occurred';
      }
      console.error('Login error:', e);
    } finally {
      isLoading = false;
    }
  }

  // Handle successful login
  function handleLoginSuccess(response: AuthResponse) {
    // Store token in localStorage (or preferably in a secure cookie via server)
    localStorage.setItem('auth_token', response.token);
    
    // You might want to update a user store here
    // userStore.set({
    //   email: response.user_email,
    //   displayName: response.user_display_name,
    //   nicename: response.user_nicename
    // });
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <!-- Header -->
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Sign in to your account
      </h2>
    </div>

    <!-- Login Form -->
    <form class="mt-8 space-y-6" on:submit={handleSubmit}>
      <!-- Error Display -->
      {#if error}
        <div class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                {error}
              </h3>
            </div>
          </div>
        </div>
      {/if}

      <div class="rounded-md shadow-sm -space-y-px">
        <!-- Username Field -->
        <div>
          <label for="username" class="sr-only">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            required
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
            placeholder="Username"
            bind:value={username}
            disabled={isLoading}
          />
        </div>

        <!-- Password Field -->
        <div>
          <label for="password" class="sr-only">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
            placeholder="Password"
            bind:value={password}
            disabled={isLoading}
          />
        </div>
      </div>

      <!-- Submit Button -->
      <div>
        <button
          type="submit"
          disabled={isLoading}
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {#if isLoading}
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <!-- Loading spinner -->
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            Signing in...
          {:else}
            Sign in
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>