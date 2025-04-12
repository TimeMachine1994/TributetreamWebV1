<script lang="ts">
  import { passwordResetMachine } from './password-reset';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { cn } from '$lib/utils/cn';
</script>

<div class="space-y-6">
  <div class="space-y-2">
    <h2 class="text-2xl font-semibold">Enter Reset Code</h2>
    <p class="text-muted-foreground">
      Enter the code that was sent to your email address {passwordResetMachine.email}.
    </p>
  </div>

  <form 
    on:submit|preventDefault={() => passwordResetMachine.validateCode()}
    class="space-y-4"
  >
    <div class="space-y-2">
      <Label for="code">Reset Code</Label>
      <Input 
        id="code"
        type="text" 
        placeholder="Enter your reset code" 
        value={passwordResetMachine.code}
        on:input={(e: Event) => {
          const target = e.currentTarget as HTMLInputElement;
          passwordResetMachine.setCode(target.value);
        }}
        required
        autocomplete="off"
      />
    </div>

    {#if passwordResetMachine.errorMessage && passwordResetMachine.errorType === 'validation_error'}
      <Alert variant="destructive">
        <AlertDescription>
          {passwordResetMachine.errorMessage}
        </AlertDescription>
      </Alert>
    {/if}

    <div class="flex justify-between">
      <Button 
        type="button" 
        variant="outline"
        on:click={() => passwordResetMachine.goBack()}
      >
        Back
      </Button>
      
      <Button 
        type="submit" 
        disabled={!passwordResetMachine.canValidateCode || passwordResetMachine.isLoading}
      >
        {#if passwordResetMachine.isLoading}
          <span class="mr-2">
            <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          Validating...
        {:else}
          Validate Code
        {/if}
      </Button>
    </div>
    
    <div class="text-center">
      <button 
        type="button" 
        class="text-sm text-primary hover:underline"
        on:click={() => passwordResetMachine.skipValidation()}
      >
        Skip validation and set new password
      </button>
    </div>
  </form>
</div>