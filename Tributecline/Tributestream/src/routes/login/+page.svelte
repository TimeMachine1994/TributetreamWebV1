<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';
  import type { SubmitFunction } from '@sveltejs/kit';

  const { form } = $props<{ form: ActionData }>();
  
  // Reactive state using runes
  let isLoading = $state(false);
  let formData = $state({
    username: '',
    password: ''
  });

  // Derived state for form validation
  let isValid = $derived(!!formData.username && !!formData.password);

  // Form submission handler with progressive enhancement
  function getEnhanceCallback(): SubmitFunction {
    return () => {
      isLoading = true;
      
      return async ({ update }: { update: (options?: { reset: boolean }) => Promise<void> }) => {
        await update(); // Updates the form with server response
        isLoading = false;
      };
    };
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Sign in to your account
      </h2>
    </div>

    {#if form?.error}
      <div class="rounded-md bg-red-50 p-4">
        <div class="flex">
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              {form.error.message}
            </h3>
          </div>
        </div>
      </div>
    {/if}

    <form
      method="POST"
      action="?/login"
      use:enhance={getEnhanceCallback()}
      class="mt-8 space-y-6"
    >
      <div class="rounded-md shadow-sm -space-y-px">
        <div>
          <label for="username" class="sr-only">Username or email</label>
          <input
            id="username"
            name="username"
            type="text"
            autocomplete="username"
            required
            bind:value={formData.username}
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Username or email"
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
            bind:value={formData.password}
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Password"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={!isValid || isLoading}
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </form>
  </div>
</div>