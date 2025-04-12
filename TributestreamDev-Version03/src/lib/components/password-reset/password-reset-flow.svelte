<script lang="ts">
  import { passwordResetMachine, PasswordResetState } from './password-reset';
  import RequestCodeForm from './request-code-form.svelte';
  import ValidateCodeForm from './validate-code-form.svelte';
  import SetPasswordForm from './set-password-form.svelte';
  import SuccessMessage from './success-message.svelte';
  import ErrorMessage from './error-message.svelte';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { cn } from '$lib/utils/cn';
  
  export let className = '';
</script>

<Card class={cn('w-full max-w-md mx-auto', className)}>
  <CardContent class="pt-6">
    {#if passwordResetMachine.state === PasswordResetState.INITIAL}
      <RequestCodeForm />
    {:else if passwordResetMachine.state === PasswordResetState.CODE_REQUESTED}
      <ValidateCodeForm />
    {:else if passwordResetMachine.state === PasswordResetState.CODE_VALIDATED}
      <SetPasswordForm />
    {:else if passwordResetMachine.state === PasswordResetState.COMPLETED}
      <SuccessMessage />
    {:else if passwordResetMachine.state === PasswordResetState.ERROR}
      <ErrorMessage />
    {:else}
      <div class="flex justify-center items-center p-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    {/if}
  </CardContent>
</Card>