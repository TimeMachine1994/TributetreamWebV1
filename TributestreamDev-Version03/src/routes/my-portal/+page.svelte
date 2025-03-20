<script lang="ts">
  import PageLayout from '$lib/components/page-templates/page-layout.svelte';
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  
  export let form: any; // Will contain form data from server action
  
  let isSubmitting = false;
  let showPassword = false;
  
  // Default form values
  const defaultFormData = {
    username: "",
    password: ""
  };
  
  // Set form data from previous submission if available
  let formData = form?.formData || defaultFormData;
  
  // Function to toggle password visibility
  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }
  
  // Function to handle successful login redirect
  function handleLoginSuccess() {
    if (form?.success) {
      // Add a slight delay before redirecting to allow the user to see the success message
      setTimeout(() => {
        goto('/my-portal/dashboard');
      }, 1500);
    }
  }
  
  // Call handler if form data shows success
  $: if (form?.success) {
    handleLoginSuccess();
  }
</script>

<PageLayout 
  title="My Portal" 
  metaDescription="Log in to your TributeStream account to manage your memorial services and livestreams."
>
  <div class="max-w-md mx-auto">
    <div class="bg-zinc-900 p-8 rounded-lg border border-[#D4AF37]/20">
      <h2 class="text-2xl text-[#D4AF37] font-semibold mb-6">Account Login</h2>
      
      {#if form?.success}
        <div class="bg-emerald-900/30 p-4 rounded-md mb-6 border border-emerald-500/30">
          <p class="text-emerald-300">Login successful! Redirecting you to your dashboard...</p>
        </div>
      {/if}
      
      {#if form?.error}
        <div class="bg-red-900/30 p-4 rounded-md mb-6 border border-red-500/30">
          <p class="text-red-300">{form.message || 'There was an error logging in. Please check your credentials and try again.'}</p>
        </div>
      {/if}
      
      <form 
        method="POST" 
        action="?/login" 
        use:enhance={{ 
          submitting: () => { isSubmitting = true; },
          complete: () => { isSubmitting = false; }
        }} 
        class="space-y-6"
      >
        <div>
          <label for="username" class="block text-sm font-medium mb-2">Email Address</label>
          <input 
            type="email" 
            id="username" 
            name="username" 
            bind:value={formData.username} 
            required
            autocomplete="email"
            class="w-full bg-black border border-zinc-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
            placeholder="you@example.com"
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium mb-2">Password</label>
          <div class="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              id="password" 
              name="password" 
              bind:value={formData.password}
              required
              autocomplete="current-password"
              class="w-full bg-black border border-zinc-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent pr-12"
            />
            <button 
              type="button" 
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
              on:click={togglePasswordVisibility}
            >
              {#if showPassword}
                <!-- Hide password icon -->
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              {:else}
                <!-- Show password icon -->
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              {/if}
            </button>
          </div>
        </div>
        
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input 
              id="remember-me" 
              name="remember-me" 
              type="checkbox" 
              class="h-4 w-4 text-[#D4AF37] focus:ring-[#D4AF37] border-zinc-700 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-300">
              Remember me
            </label>
          </div>
          
          <div class="text-sm">
            <a href="/forgot-password" class="text-[#D4AF37] hover:text-[#F5D76E]">
              Forgot your password?
            </a>
          </div>
        </div>
        
        <div>
          <button 
            type="submit" 
            class="gold-btn w-full flex items-center justify-center"
            disabled={isSubmitting}
          >
            {#if isSubmitting}
              <span>Logging in...</span>
            {:else}
              <span>Log in</span>
            {/if}
          </button>
        </div>
        
        <div class="mt-4 text-center text-sm">
          <p class="text-gray-400">
            Don't have an account? 
            <a href="/fd-form" class="text-[#D4AF37] hover:text-[#F5D76E]">Request one here</a>
          </p>
        </div>
      </form>
    </div>
    
    <div class="mt-8 bg-zinc-900 p-6 rounded-lg border border-[#D4AF37]/20">
      <h3 class="text-xl text-[#D4AF37] font-medium mb-4">Portal Access</h3>
      <p class="text-gray-300 mb-4">
        The TributeStream portal gives you access to:
      </p>
      <ul class="list-disc pl-5 space-y-2 text-gray-300">
        <li>Your personal memorial livestream management</li>
        <li>Video recordings of past events</li>
        <li>Memorial page customization</li>
        <li>Invitations and sharing tools</li>
      </ul>
    </div>
  </div>
</PageLayout>