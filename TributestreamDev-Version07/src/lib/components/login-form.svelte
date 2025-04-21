<script lang="ts">
  import { enhance } from '$app/forms';
  import Button from '$lib/components/ui/button.svelte';
  import Input from '$lib/components/ui/input.svelte';
  
  export let error: string | null = null;
  
  let identifier = '';
  let password = '';
  let loading = false;
  
  async function handleSubmit(event: SubmitEvent) {
    loading = true;
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier, password })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        error = data.error || 'Login failed';
        return;
      }
      
      // Reload the page to show user data
      window.location.reload();
    } catch (err) {
      console.error('Login error:', err);
      error = 'An unexpected error occurred';
    } finally {
      loading = false;
    }
  }
</script>

<div class="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
  <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>
  
  {#if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
      <span>{error}</span>
    </div>
  {/if}
  
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div>
      <label for="identifier" class="block text-sm font-medium text-gray-700 mb-1">
        Email or Username
      </label>
      <Input 
        type="text" 
        id="identifier" 
        name="identifier" 
        bind:value={identifier} 
        required 
        placeholder="Enter your email or username" 
      />
    </div>
    
    <div>
      <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
        Password
      </label>
      <Input 
        type="password" 
        id="password" 
        name="password" 
        bind:value={password} 
        required 
        placeholder="Enter your password" 
      />
    </div>
    
    <Button
      type="submit"
      variant="primary"
      disabled={loading}
      className="w-full"
    >
      {loading ? 'Logging in...' : 'Login'}
    </Button>
  </form>
</div>