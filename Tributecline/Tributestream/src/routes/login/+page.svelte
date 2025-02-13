<script lang="ts">
  import { enhance } from '$app/forms';
  
  export let form: { error?: boolean; message?: string } | null = null;
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50">
  <div class="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
    <div>
      <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
        Sign in to your account
      </h2>
    </div>
    
    {#if form?.error}
      <div class="rounded-md bg-red-50 p-4 text-sm text-red-700">
        {form.message}
      </div>
    {/if}

    <form method="POST" use:enhance class="mt-8 space-y-6">
      <div class="-space-y-px rounded-md shadow-sm">
        <div>
          <label for="email" class="sr-only">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            class="relative block w-full rounded-t-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Email address"
          />
        </div>
        <div>
          <label for="password" class="sr-only">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            class="relative block w-full rounded-b-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Password"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          class="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Sign in
        </button>
      </div>
    </form>
  </div>
</div>
