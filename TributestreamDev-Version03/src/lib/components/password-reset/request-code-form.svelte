<script lang="ts">
  // Import the password reset machine
  import { passwordResetMachine } from './password-reset';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { cn } from '$lib/utils/cn';
</script>

<div class="space-y-6">
  <div class="space-y-2">
    <h2 class="text-2xl font-semibold">Reset Your Password</h2>
    <p class="text-muted-foreground">
      Enter your email address below and we'll send you a code to reset your password.
    </p>
  </div>

  <form 
    on:submit|preventDefault={() => passwordResetMachine.requestCode()}
    class="space-y-4"
  >
    <div class="space-y-2">
      <Label for="email">Email</Label>
      <Input 
        id="email"
        type="email" 
        placeholder="your.email@example.com" 
        value={passwordResetMachine.email}
        on:input={(e: Event) => {
          const target = e.currentTarget as HTMLInputElement;
          passwordResetMachine.setEmail(target.value);
        }}
        required
        autocomplete="email"
      />
    </div>

    {#if passwordResetMachine.errorMessage && passwordResetMachine.errorType === 'request_error'}
      <Alert variant="destructive">
        <AlertDescription>
          {passwordResetMachine.errorMessage}
        </AlertDescription>
      </Alert>
    {/if}

    <Button 
      type="submit" 
      class="w-full"
      disabled={!passwordResetMachine.canRequestCode || passwordResetMachine.isLoading}
    >
      {#if passwordResetMachine.isLoading}
        <span class="mr-2">
          <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
        Sending...
      {:else}
        Send Reset Code
      {/if}
    </Button>
  </form>
</div>