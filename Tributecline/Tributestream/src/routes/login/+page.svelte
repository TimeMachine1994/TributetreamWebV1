<script lang="ts">
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
import { userStore } from '$lib/stores/userStore';
import type { ActionResult } from '@sveltejs/kit';

interface LoginResult {
  user?: {
    id: string;
    username: string;
    email: string;
    displayName: string;
    role: string;
  };
  redirectTo?: string;
  error?: {
    message: string;
  };
}

let isLoading = $state(false);
let errorMessage = $state('');

// Client-side validation function
const validateForm = (formData: FormData): boolean => {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || username.trim().length < 3) {
    errorMessage = 'Username must be at least 3 characters long';
    return false;
  }

  if (!password || password.length < 8) {
    errorMessage = 'Password must be at least 8 characters long';
    return false;
  }

  return true;
};
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Sign in to your account
      </h2>
    </div>
    <form
      method="POST"
      class="mt-8 space-y-6"
      use:enhance={({ formData, cancel }) => {
        isLoading = true;
        errorMessage = '';
        
        if (!validateForm(formData)) {
          isLoading = false;
          cancel();
        }
        
        return async ({ result }) => {
          isLoading = false;
          
          if (result.type === 'failure') {
            const data = result.data as LoginResult;
            errorMessage = data.error?.message || 'An error occurred during login';
          } else if (result.type === 'success') {
            const data = result.data as LoginResult;
            if (data.user && data.redirectTo) {
              userStore.set(data.user);
              await goto(data.redirectTo);
            }
          }
        };
      }}
    >
      {#if errorMessage}
        <div class="rounded-md bg-red-50 p-4">
          <div class="text-sm text-red-700">
            {errorMessage}
          </div>
        </div>
      {/if}

      <div class="rounded-md shadow-sm -space-y-px">
        <div>
          <label for="username" class="sr-only">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            required
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
            placeholder="Username"
          />
        </div>
        <div>
          <label for="password" class="sr-only">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
            placeholder="Password"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {#if isLoading}
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
          {/if}
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </form>
  </div>
</div>