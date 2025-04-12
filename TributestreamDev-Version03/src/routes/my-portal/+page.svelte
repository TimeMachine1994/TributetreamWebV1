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
      <div class="bg-card rounded-lg shadow-lg overflow-hidden">
        <div class="p-6 md:p-8">
          <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl md:text-4xl font-bold text-primary">
              My Tributes
            </h1>
            
            <form method="POST" action="?/logout">
              <button 
                type="submit"
                class="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors"
              >
                Log Out
              </button>
            </form>
          </div>
          
          <div class="mb-8">
            <p class="text-muted-foreground">
              Welcome back, <span class="font-medium text-foreground">{data.user.name}</span>. 
              Here are the tributes associated with your account.
            </p>
          </div>
          
          <TributeGrid tributes={data.tributes} />
        </div>
      </div>
    {:else}
      <!-- Unauthenticated user view -->
      <div class="bg-card rounded-lg shadow-lg overflow-hidden">
        <div class="p-6 md:p-8">
          <h1 class="text-3xl md:text-4xl font-bold mb-6 text-center text-primary">
            {showForgotPassword ? 'Reset Your Password' : 'My Portal'}
          </h1>
          
          {#if showForgotPassword}
            <ForgotPassword form={data.resetForm} onCancel={toggleForgotPassword} />
          {:else}
            <div class="mb-6 text-center">
              <p class="text-muted-foreground">
                Log in to access your tributes and manage your account.
              </p>
            </div>
            
            <LoginForm form={data.loginForm} />
            
            <div class="mt-8 text-center">
              <button 
                type="button" 
                class="text-primary hover:underline"
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