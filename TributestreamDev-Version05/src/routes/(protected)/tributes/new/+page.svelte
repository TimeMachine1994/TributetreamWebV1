<script lang="ts">
  import { onMount } from 'svelte';
  import { tributeStore } from '$lib/stores/tribute.store';
  import type { TributeCreateInput } from '$lib/types/tribute.types';
  
  // Form data
  let formData = $state<TributeCreateInput>({
    user_id: 0,
    loved_one_name: '',
    slug: '',
    phone_number: '',
    custom_html: '',
    number_of_streams: 0,
    extended_data: {}
  });
  
  // Form state
  let isSubmitting = $state(false);
  let formError = $state<string | null>(null);
  let formSuccess = $state(false);
  let userId = $state(0);
  
  // Get current user ID on mount
  onMount(async () => {
    // In a real app, you would get this from an auth store
    // For now, we'll just use a placeholder
    userId = 1; // Replace with actual user ID
    formData.user_id = userId;
  });
  
  // Function to generate slug from name
  function generateSlug() {
    if (formData.loved_one_name) {
      formData.slug = formData.loved_one_name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
  }
  
  // Function to handle form submission
  async function handleSubmit() {
    formError = null;
    formSuccess = false;
    isSubmitting = true;
    
    try {
      // Validate form
      if (!formData.loved_one_name) {
        throw new Error('Loved one name is required');
      }
      
      if (!formData.phone_number) {
        throw new Error('Phone number is required');
      }
      
      // Set user ID
      formData.user_id = userId;
      
      // Generate slug if not provided
      if (!formData.slug) {
        generateSlug();
      }
      
      // Submit form
      const result = await tributeStore.createTribute(formData);
      
      // Show success message
      formSuccess = true;
      
      // Reset form
      formData = {
        user_id: userId,
        loved_one_name: '',
        slug: '',
        phone_number: '',
        custom_html: '',
        number_of_streams: 0,
        extended_data: {}
      };
      
      // Redirect to the new tribute
      if (result && result.id) {
        setTimeout(() => {
          window.location.href = `/tributes/${result.id}`;
        }, 1500);
      }
    } catch (error) {
      formError = error instanceof Error ? error.message : 'An error occurred';
      console.error('Error creating tribute:', error);
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="container mx-auto p-4">
  <!-- Back button -->
  <div class="mb-4">
    <a href="/tributes" class="text-primary hover:underline flex items-center gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      Back to Tributes
    </a>
  </div>
  
  <div class="bg-card text-card-foreground rounded-lg shadow-sm p-6 mb-6">
    <h1 class="text-2xl font-bold mb-6">Create New Tribute</h1>
    
    <!-- Success message -->
    {#if formSuccess}
      <div class="bg-green-50 text-green-700 p-4 rounded-md mb-4">
        <p>Tribute created successfully! Redirecting...</p>
      </div>
    {/if}
    
    <!-- Error message -->
    {#if formError}
      <div class="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
        <p>{formError}</p>
      </div>
    {/if}
    
    <!-- Form -->
    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
      <!-- Loved One Name -->
      <div>
        <label for="loved_one_name" class="block text-sm font-medium mb-1">
          Loved One Name <span class="text-destructive">*</span>
        </label>
        <input
          id="loved_one_name"
          type="text"
          bind:value={formData.loved_one_name}
          on:blur={generateSlug}
          class="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>
      
      <!-- Slug -->
      <div>
        <label for="slug" class="block text-sm font-medium mb-1">
          Slug
        </label>
        <div class="flex gap-2">
          <input
            id="slug"
            type="text"
            bind:value={formData.slug}
            class="w-full px-3 py-2 border rounded-md"
            placeholder="auto-generated-if-empty"
          />
          <button
            type="button"
            on:click={generateSlug}
            class="px-3 py-2 bg-muted text-muted-foreground rounded-md text-sm"
          >
            Generate
          </button>
        </div>
      </div>
      
      <!-- Phone Number -->
      <div>
        <label for="phone_number" class="block text-sm font-medium mb-1">
          Phone Number <span class="text-destructive">*</span>
        </label>
        <input
          id="phone_number"
          type="tel"
          bind:value={formData.phone_number}
          class="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>
      
      <!-- Number of Streams -->
      <div>
        <label for="number_of_streams" class="block text-sm font-medium mb-1">
          Number of Streams
        </label>
        <input
          id="number_of_streams"
          type="number"
          bind:value={formData.number_of_streams}
          min="0"
          class="w-full px-3 py-2 border rounded-md"
        />
      </div>
      
      <!-- Custom HTML -->
      <div>
        <label for="custom_html" class="block text-sm font-medium mb-1">
          Custom HTML
        </label>
        <textarea
          id="custom_html"
          bind:value={formData.custom_html}
          class="w-full h-32 px-3 py-2 border rounded-md font-mono text-sm"
        ></textarea>
      </div>
      
      <!-- Submit Button -->
      <div class="pt-4">
        <button
          type="submit"
          class="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Tribute'}
        </button>
      </div>
    </form>
  </div>
</div>