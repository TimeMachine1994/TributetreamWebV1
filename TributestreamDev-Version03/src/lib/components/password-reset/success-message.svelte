<script lang="ts">
  import { passwordResetMachine } from './password-reset';
  import { Button } from '$lib/components/ui/button';
  import { cn } from '$lib/utils/cn';
  import { goto } from '$app/navigation';
</script>

<div class="space-y-6 text-center">
  <div class="flex justify-center">
    <div class="rounded-full bg-green-100 p-3">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        class="h-8 w-8 text-green-600" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M5 13l4 4L19 7" 
        />
      </svg>
    </div>
  </div>

  <div class="space-y-2">
    <h2 class="text-2xl font-semibold">Password Reset Successful</h2>
    <p class="text-muted-foreground">
      {passwordResetMachine.successMessage || 'Your password has been reset successfully.'}
    </p>
  </div>

  <div class="pt-4">
    <Button 
      on:click={() => goto('/login')}
      class="w-full"
    >
      Go to Login
    </Button>
  </div>
</div>