<script lang="ts">
  import PasswordResetFlow from '$lib/components/password-reset/password-reset-flow.svelte';
  import { passwordResetMachine } from '$lib/components/password-reset/password-reset';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  
  // Check for email and code in URL parameters
  onMount(() => {
    const email = $page.url.searchParams.get('email');
    const code = $page.url.searchParams.get('code');
    
    if (email) {
      passwordResetMachine.setEmail(email);
      
      if (code) {
        passwordResetMachine.setCode(code);
        // If both email and code are provided, skip to the set password step
        passwordResetMachine.skipValidation();
      } else {
        // If only email is provided, go to the code validation step
        passwordResetMachine.requestCode();
      }
    }
  });
</script>

<svelte:head>
  <title>Reset Password | TributeStream</title>
  <meta name="description" content="Reset your TributeStream account password" />
</svelte:head>

<div class="container mx-auto py-10">
  <div class="flex flex-col items-center justify-center min-h-[60vh]">
    <div class="w-full max-w-md">
      <h1 class="text-3xl font-bold text-center mb-8">Reset Password</h1>
      <PasswordResetFlow />
    </div>
  </div>
</div>