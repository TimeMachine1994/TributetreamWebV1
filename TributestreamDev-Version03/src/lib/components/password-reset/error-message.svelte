<script lang="ts">
  import { passwordResetMachine } from './password-reset';
  import { Button } from '$lib/components/ui/button';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { cn } from '$lib/utils/cn';
</script>

<div class="space-y-6">
  <div class="flex justify-center">
    <div class="rounded-full bg-red-100 p-3">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        class="h-8 w-8 text-red-600" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M6 18L18 6M6 6l12 12" 
        />
      </svg>
    </div>
  </div>

  <div class="space-y-2 text-center">
    <h2 class="text-2xl font-semibold">Error</h2>
    
    <Alert variant="destructive">
      <AlertDescription>
        {passwordResetMachine.errorMessage || 'An error occurred during the password reset process.'}
      </AlertDescription>
    </Alert>
    
    <p class="text-muted-foreground mt-4">
      Please try again or contact support if the problem persists.
    </p>
  </div>

  <div class="pt-4">
    <Button 
      on:click={() => passwordResetMachine.goBack()}
      class="w-full"
    >
      Go Back
    </Button>
  </div>
</div>