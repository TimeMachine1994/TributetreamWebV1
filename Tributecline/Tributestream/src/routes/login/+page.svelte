<!-- 
  Login Page Component
  Handles user authentication using mock data store for development
-->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authStore, isAdmin, needsCalculator } from '$lib/stores/authStore.svelte';
  import { userStore } from '$lib/stores/userStore';
  import { enhance } from '$app/forms';
  import type { ActionResult } from '@sveltejs/kit';
  
  // Form state using SvelteKit 5 runes
  let username = $state('');
  let password = $state('');
  let isLoading = $state(false);
  let error = $state<string | null>(null);

  // Subscribe to auth store
  let currentAuth = $state($authStore);
  $effect(() => {
    const unsubscribe = authStore.subscribe(value => {
      currentAuth = value;
    });
    return unsubscribe;
  });

  // Response type for login action
  interface LoginResponse {
    success: boolean;
    user?: {
      id: number;
      username: string;
      email: string;
      displayName: string;
      roles: string[];
      role?: string;
      token?: string;
    };
    error?: string;
  }

  // Handle successful login response
  function handleLoginSuccess(response: LoginResponse) {
    if (response.success && response.user) {
      // Update stores with user data
      const userData = {
        id: response.user.id,
        username: response.user.username,
        email: response.user.email,
        displayName: response.user.displayName,
        roles: response.user.roles,
        meta: {},
        token: response.user.token
      };

      userStore.setUser(userData);
      authStore.initFromUser(userData);

      // Handle redirect based on role and returnUrl
      const returnUrl = $page.url.searchParams.get('returnUrl') || '';
      if (isAdmin(currentAuth)) {
        goto('/admin-dashboard', { replaceState: true });
      } else if (needsCalculator(currentAuth)) {
        goto('/calculator', { replaceState: true });
      } else {
        goto(returnUrl || '/family-dashboard', { replaceState: true });
      }
    }
  }

  // Form submission handler
  function handleSubmit() {
    isLoading = true;
    error = null;
    
    return async ({ result }: { result: ActionResult }) => {
      isLoading = false;
      
      if (result.type === 'failure') {
        const failureData = result.data as { error?: string };
        error = failureData?.error || 'An unexpected error occurred';
      } else if (result.type === 'success') {
        const successData = result.data as LoginResponse;
        handleLoginSuccess(successData);
      }
    };
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <!-- Header -->
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Sign in to your account
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Demo Accounts:
        <br />
        admin/admin123 - Administrator
        <br />
        user/user123 - Regular User
        <br />
        family/family123 - Family Member
      </p>
    </div>

    <!-- Login Form -->
    <form 
      method="POST" 
      class="mt-8 space-y-6"
      use:enhance={handleSubmit}
    >
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