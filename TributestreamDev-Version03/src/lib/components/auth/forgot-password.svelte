<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import { message } from 'sveltekit-superforms/client';
  import type { SuperValidated } from 'sveltekit-superforms';

  // Props
  let { form: formData, onCancel } = $props<{
    form: SuperValidated<Record<string, unknown>>;
    onCancel: () => void;
  }>();

  // Initialize the form
  const { form, errors, enhance, message: formMessage } = superForm(formData, {
    resetForm: true,
    taintedMessage: false,
    onSubmit: () => {
      isSubmitting = true;
    },
    onResult: ({ result }) => {
      isSubmitting = false;
    }
  });

  // State
  let isSubmitting = $state(false);
</script>

<div class="w-full max-w-md mx-auto">
  <div class="bg-card rounded-lg shadow-lg p-8">
    <h2 class="text-2xl font-bold mb-6 text-center text-primary">Reset Password</h2>
    
    <p class="text-muted-foreground mb-6 text-center">
      Enter your email address and we'll send you a link to reset your password.
    </p>
    
    <form method="POST" action="?/resetPassword" use:enhance class="space-y-6">
      <!-- Email field -->
      <div>
        <label for="email" class="block text-sm font-medium mb-2 text-foreground">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          bind:value={$form.email}
          class="w-full px-4 py-3 rounded-md border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
          autocomplete="email"
          required
        />
        {#if $errors.email}
          <p class="mt-1.5 text-sm text-destructive">{$errors.email}</p>
        {/if}
      </div>
      
      <!-- Form actions -->
      <div class="flex space-x-4">
        <button
          type="button"
          class="flex-1 py-3 px-6 bg-muted text-muted-foreground font-medium rounded-md hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-muted focus:ring-offset-2 transition-colors"
          on:click={onCancel}
          disabled={isSubmitting}
        >
          Back to Login
        </button>
        
        <button
          type="submit"
          class="flex-1 py-3 px-6 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </button>
      </div>
      
      <!-- Form message (error/success) -->
      {#if $formMessage}
        <div class="mt-4 p-3 rounded-md text-center {$formMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
          {$formMessage.text}
        </div>
      {/if}
    </form>
  </div>
</div>