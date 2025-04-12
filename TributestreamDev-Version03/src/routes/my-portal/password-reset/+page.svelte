<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import { message } from 'sveltekit-superforms/client';
  import type { SuperValidated } from 'sveltekit-superforms';

  // Get data from props
  const { data } = $props<{
    data: {
      requestForm: SuperValidated<{
        email: string;
      }>;
      resetForm: SuperValidated<{
        resetCode: string;
        newPassword: string;
        confirmPassword: string;
        email?: string;
      }>;
    };
  }>();

  // State management
  let currentStep = $state(1); // 1: Request code, 2: Enter code and new password
  let isSubmitting = $state(false);

  // Initialize the request code form
  const { form: requestForm, errors: requestErrors, enhance: requestEnhance, message: requestMessage } = superForm(data.requestForm, {
    resetForm: false,
    taintedMessage: false,
    onSubmit: () => {
      isSubmitting = true;
    },
    onResult: ({ result }) => {
      isSubmitting = false;
      if (result.type === 'success') {
        currentStep = 2; // Move to the next step
        // Store email in resetForm for the next step
        $resetForm.email = $requestForm.email;
      }
    }
  });

  // Initialize the reset password form
  const { form: resetForm, errors: resetErrors, enhance: resetEnhance, message: resetMessage } = superForm(data.resetForm, {
    resetForm: false,
    taintedMessage: false,
    onSubmit: () => {
      isSubmitting = true;
    },
    onResult: ({ result }) => {
      isSubmitting = false;
    }
  });

  // Password visibility toggle
  let showPassword = $state(false);
  let showConfirmPassword = $state(false);

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }

  function toggleConfirmPasswordVisibility() {
    showConfirmPassword = !showConfirmPassword;
  }

  // Go back to request code step
  function goBackToRequestCode() {
    currentStep = 1;
  }
</script>

<div class="w-full max-w-md mx-auto">
  <div class="bg-surface-100 rounded-lg shadow-lg p-8">
    <h2 class="text-2xl font-bold mb-6 text-center" style="color: #D5BA7F;">Reset Password</h2>
    
    {#if currentStep === 1}
      <!-- Step 1: Request Reset Code -->
      <p class="text-surface-950 mb-6 text-center">
        Enter your email address to receive a password reset code.
      </p>
      
      <form method="POST" action="?/requestResetCode" use:requestEnhance class="space-y-6">
        <!-- Email field -->
        <div>
          <label for="email" class="block text-sm font-medium mb-2 text-surface-950">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            bind:value={$requestForm.email}
            class="w-full px-4 py-3 rounded-md border bg-surface-50 text-surface-950 focus:ring-2 focus:ring-warning-500 focus:outline-none"
            autocomplete="email"
            required
          />
          {#if $requestErrors.email}
            <p class="mt-1.5 text-sm text-error-500">{$requestErrors.email}</p>
          {/if}
        </div>
        
        <!-- Submit button -->
        <button
          type="submit"
          class="w-full py-3 px-6 text-surface-950 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
          style="background-color: #D5BA7F; --tw-ring-color: #D5BA7F;"
          on:mouseover={(e) => e.currentTarget.style.backgroundColor = '#C5AA6F'}
          on:mouseout={(e) => e.currentTarget.style.backgroundColor = '#D5BA7F'}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Reset Code'}
        </button>
        
        <!-- Form message (error/success) -->
        {#if $requestMessage}
          <div class="mt-4 p-3 rounded-md text-center {$requestMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
            {$requestMessage.text}
          </div>
        {/if}
      </form>
    {:else}
      <!-- Step 2: Enter Code and New Password -->
      <p class="text-surface-950 mb-6 text-center">
        Enter the reset code sent to your email and your new password.
      </p>
      
      <form method="POST" action="?/resetPassword" use:resetEnhance class="space-y-6">
        <!-- Hidden email field to pass along -->
        <input type="hidden" name="email" bind:value={$resetForm.email} />
        
        <!-- Reset Code field -->
        <div>
          <label for="resetCode" class="block text-sm font-medium mb-2 text-surface-950">
            Reset Code
          </label>
          <input
            id="resetCode"
            name="resetCode"
            type="text"
            bind:value={$resetForm.resetCode}
            class="w-full px-4 py-3 rounded-md border bg-surface-50 text-surface-950 focus:ring-2 focus:ring-warning-500 focus:outline-none"
            required
          />
          {#if $resetErrors.resetCode}
            <p class="mt-1.5 text-sm text-error-500">{$resetErrors.resetCode}</p>
          {/if}
        </div>
        
        <!-- New Password field -->
        <div>
          <label for="newPassword" class="block text-sm font-medium mb-2 text-surface-950">
            New Password
          </label>
          <div class="relative">
            <input
              id="newPassword"
              name="newPassword"
              type={showPassword ? "text" : "password"}
              bind:value={$resetForm.newPassword}
              class="w-full px-4 py-3 rounded-md border bg-surface-50 text-surface-950 focus:ring-2 focus:ring-warning-500 focus:outline-none"
              required
            />
            <button 
              type="button" 
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-surface-600 hover:text-surface-950"
              on:click={togglePasswordVisibility}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {#if showPassword}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              {/if}
            </button>
          </div>
          {#if $resetErrors.newPassword}
            <p class="mt-1.5 text-sm text-error-500">{$resetErrors.newPassword}</p>
          {/if}
        </div>
        
        <!-- Confirm Password field -->
        <div>
          <label for="confirmPassword" class="block text-sm font-medium mb-2 text-surface-950">
            Confirm Password
          </label>
          <div class="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              bind:value={$resetForm.confirmPassword}
              class="w-full px-4 py-3 rounded-md border bg-surface-50 text-surface-950 focus:ring-2 focus:ring-warning-500 focus:outline-none"
              required
            />
            <button 
              type="button" 
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-surface-600 hover:text-surface-950"
              on:click={toggleConfirmPasswordVisibility}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {#if showConfirmPassword}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              {/if}
            </button>
          </div>
          {#if $resetErrors.confirmPassword}
            <p class="mt-1.5 text-sm text-error-500">{$resetErrors.confirmPassword}</p>
          {/if}
        </div>
        
        <!-- Form actions -->
        <div class="flex space-x-4">
          <button
            type="button"
            class="flex-1 py-3 px-6 bg-surface-200 text-surface-950 font-medium rounded-md hover:bg-surface-300 focus:outline-none focus:ring-2 focus:ring-surface-200 focus:ring-offset-2 transition-colors"
            on:click={goBackToRequestCode}
            disabled={isSubmitting}
          >
            Back
          </button>
          
          <button
            type="submit"
            class="flex-1 py-3 px-6 text-surface-950 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
            style="background-color: #D5BA7F; --tw-ring-color: #D5BA7F;"
            on:mouseover={(e) => e.currentTarget.style.backgroundColor = '#C5AA6F'}
            on:mouseout={(e) => e.currentTarget.style.backgroundColor = '#D5BA7F'}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
        
        <!-- Form message (error/success) -->
        {#if $resetMessage}
          <div class="mt-4 p-3 rounded-md text-center {$resetMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
            {$resetMessage.text}
          </div>
        {/if}
      </form>
    {/if}
    
    <!-- Back to login link -->
    <div class="mt-6 text-center">
      <a href="/login" class="text-sm hover:underline" style="color: #D5BA7F;">
        Back to Login
      </a>
    </div>
  </div>
</div>