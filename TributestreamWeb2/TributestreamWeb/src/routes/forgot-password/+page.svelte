<script lang="ts">
  import { enhance } from '$app/forms';
  
  interface FormData {
    error?: string;
    success?: boolean;
    message?: string;
  }

  let { form } = $props<{ form?: FormData }>();
  let email = $state('');

  let successMessage = $state('');
  
  function handleSubmit() {
    successMessage = form?.message || '';
  }
</script>

<div class="flex min-h-screen items-center justify-center">
  <div class="w-full max-w-md bg-white rounded-lg shadow-md p-8">
    <h2 class="text-2xl font-bold mb-6 text-center">Reset Password</h2>
    
    <form 
      method="POST" 
      use:enhance={() => {
        return async ({ result, update }) => {
          await update();
          if (result.type === 'success' && result.data) {
            successMessage = (result.data as FormData).message || '';
          }
        };
      }}
    >
      {#if form?.error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {form.error}
        </div>
      {/if}
      
      {#if successMessage}
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      {/if}
      
      <div class="mb-6">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          bind:value={email}
          placeholder="Enter your email address"
          class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D5BA7F]"
          required
        />
      </div>
      
      <button
        type="submit"
        class="w-full bg-[#D5BA7F] text-black font-bold py-2 px-4 border border-transparent rounded-lg hover:text-black hover:shadow-[0_0_10px_4px_#D5BA7F] transition-all duration-300 ease-in-out mb-4"
      >
        Send Reset Link
      </button>
    </form>

    <div class="text-center">
      <a href="/login">
        <button
          type="button"
          class="bg-black text-[#D5BA7F] font-bold py-2 px-4 border border-[#D5BA7F] rounded-lg hover:shadow-[0_0_10px_4px_#D5BA7F] transition-all duration-300 ease-in-out"
        >
          Back to Login
        </button>
      </a>
    </div>
  </div>
</div>
