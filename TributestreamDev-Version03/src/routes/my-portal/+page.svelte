<script lang="ts">
  import LoginForm from '$lib/components/auth/login-form.svelte';
  import ForgotPassword from '$lib/components/auth/forgot-password.svelte';
  import TributeGrid from '$lib/components/tributes/tribute-grid.svelte';
  import type { Tribute } from '$lib/types/tribute';
  import type { SuperValidated } from 'sveltekit-superforms';
  
  interface PageData {
    user: { id: string; name: string; email: string } | null;
    tributes: Tribute[];
    loginForm: SuperValidated<Record<string, unknown>>;
    resetForm: SuperValidated<Record<string, unknown>>;
    isAdmin: boolean;
  }
  
  let { data } = $props<{ data: PageData }>();
  
  // State
  let showForgotPassword = $state(false);
  
  // Toggle between login and forgot password forms
  function toggleForgotPassword() {
    showForgotPassword = !showForgotPassword;
  }
</script>

<svelte:head>
  <title>{data.user ? 'My Tributes' : 'Login'} | Tributestream</title>
  <meta name="description" content="Access your Tributestream account and manage your tributes." />
</svelte:head>

<div class="container min-h-screen px-4 py-16 mx-auto flex flex-col items-center justify-center">
  <div class="max-w-4xl w-full">
    {#if data.user}
      <!-- Authenticated user view -->
      <div class="bg-surface-100 rounded-lg shadow-lg overflow-hidden">
        <div class="p-6 md:p-8">
          <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl md:text-4xl font-bold" style="color: #D5BA7F;">
              My Tributes
            </h1>
            
            <form method="POST" action="?/logout">
              <button 
                type="submit"
                class="px-4 py-2 bg-surface-200 text-surface-600 rounded-md hover:bg-surface-300 transition-colors"
              >
                Log Out
              </button>
            </form>
          </div>
          
          <div class="mb-8">
            <p class="text-surface-950">
              Welcome back, <span class="font-medium text-surface-950">{data.user.name}</span>.
              Here are the tributes associated with your account.
            </p>
            
            {#if data.isAdmin}
              <div class="mt-4">
                <a
                  href="/my-portal/users"
                  class="inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  Manage Users
                </a>
              </div>
            {/if}
          </div>
          
          <TributeGrid tributes={data.tributes} />
        </div>
      </div>
    {:else}
      <!-- Unauthenticated user view -->
      <div class="bg-surface-100 rounded-lg shadow-lg overflow-hidden">
        <div class="p-6 md:p-8">
          <h1 class="text-3xl md:text-4xl font-bold mb-6 text-center" style="color: #D5BA7F;">
            {showForgotPassword ? 'Reset Your Password' : 'My Portal'}
          </h1>
          
          {#if showForgotPassword}
            <ForgotPassword form={data.resetForm} onCancel={toggleForgotPassword} />
          {:else}
            <div class="mb-6 text-center">
              <p class="text-surface-950">
                Log in to access your tributes and manage your account.
              </p>
            </div>
            
            <LoginForm form={data.loginForm} />
            
            <div class="mt-8 text-center">
              <button 
                type="button" 
                class="hover:underline" style="color: #D5BA7F;"
                on:click={toggleForgotPassword}
              >
                Forgot your password?
              </button>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>