<!-- src/routes/login/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import { authStore } from '$lib/stores/auth-store';
  import { goto } from '$app/navigation';
  
  export let form;
  
  let isSubmitting = $state(false);
  
  // Handle client-side login
  async function handleClientLogin(event: SubmitEvent) {
    event.preventDefault();
    isSubmitting = true;
    
    const formData = new FormData(event.target as HTMLFormElement);
    const username = formData.get('username')?.toString();
    const password = formData.get('password')?.toString();
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Auth successful, redirect
        goto('/my-portal/dashboard');
      } else {
        // Auth failed, show error
        form = { error: true, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      form = { error: true, message: 'An error occurred during login' };
    } finally {
      isSubmitting = false;
    }
  }
</script>

<h1>Login</h1>

{#if form?.error}
  <div class="error">
    {form.message}
  </div>
{/if}

<form method="POST" use:enhance={() => {
  isSubmitting = true;
  
  return {
    result: ({ result }) => {
      isSubmitting = false;
      
      // If login was successful, the server will have redirected
      // If we're still here, there was an error
      if (result.type === 'failure') {
        form = result.data;
      }
    }
  };
}}>
  <div>
    <label for="username">Username</label>
    <input id="username" name="username" type="text" required />
  </div>
  
  <div>
    <label for="password">Password</label>
    <input id="password" name="password" type="password" required />
  </div>
  
  <button type="submit" disabled={isSubmitting}>
    {isSubmitting ? 'Logging in...' : 'Log in'}
  </button>
</form>

<style>
  .error {
    color: red;
    margin-bottom: 1rem;
    padding: 0.5rem;
    border: 1px solid red;
    border-radius: 4px;
    background-color: rgba(255, 0, 0, 0.1);
  }
  
  form {
    max-width: 400px;
    margin: 0 auto;
  }
  
  div {
    margin-bottom: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
  }
  
  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  button {
    background-color: #0066cc;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
  
  button:disabled {
    background-color: #999;
    cursor: not-allowed;
  }
</style>
