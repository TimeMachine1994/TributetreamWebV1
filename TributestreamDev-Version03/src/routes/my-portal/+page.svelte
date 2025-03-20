<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import { message } from 'sveltekit-superforms/client';
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  // Initialize the form
  const { form, errors, enhance, constraints, message: formMessage } = superForm(data.form ?? {}, {
    resetForm: true,
    taintedMessage: false,
    onUpdate: ({ form }) => {
      if (form.valid) {
        emailInput = '';
      }
    }
  });
  
  let emailInput = '';
  let isSubmitting = false;
</script>

<svelte:head>
  <title>Portal Under Construction | Tributestream</title>
  <meta name="description" content="Our portal is under construction! Check back soon for updates." />
</svelte:head>

<div class="container min-h-screen px-4 py-16 mx-auto flex flex-col items-center justify-center">
  <div class="max-w-2xl w-full bg-card rounded-lg shadow-lg overflow-hidden">
    <div class="py-12 px-6 md:px-10 text-center">
      <h1 class="text-3xl md:text-4xl font-bold mb-6 text-primary">
        Our portal is under construction!
      </h1>
      
      <p class="text-lg mb-8 text-muted-foreground">
        Check back soon for updates. Subscribe below to be notified when our portal becomes available.
      </p>
      
      <div class="divider h-px w-2/3 mx-auto bg-gradient-to-r from-transparent via-muted to-transparent my-8"></div>
      
      <form method="POST" use:enhance class="max-w-md mx-auto">
        <div class="mb-6">
          <label for="email" class="block text-sm font-medium mb-2 text-foreground">
            Email address
          </label>
          
          <input
            id="email"
            name="email"
            type="email"
            bind:value={emailInput}
            placeholder="Enter your email"
            class="w-full px-4 py-3 rounded-md border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            autocomplete="email"
            {...constraints.email}
            required
          />
          
          {#if $errors.email}
            <p class="mt-1.5 text-sm text-destructive">{$errors.email}</p>
          {/if}
        </div>
        
        <button
          type="submit"
          class="w-full py-3 px-6 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Subscribing...' : 'Notify me when available'}
        </button>
        
        {#if $formMessage}
          <div class="mt-4 p-3 rounded-md text-center {$formMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
            {$formMessage.text}
          </div>
        {/if}
      </form>
    </div>
  </div>
</div>

<style>
  /* Additional custom styles if needed */
</style>