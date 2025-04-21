<script>
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  
  /** @type {import('./$types').PageProps} */
  let { data, form } = $props();
  
  // Local state 
  let loading = $state(false);
  
  // Get return URL from query parameter
  let returnUrl = $derived(data.redirectTo || '/');
</script>

<div class="login-container">
  <h1>Login</h1>
  
  {#if form?.error}
    <div class="error">
      {form.error}
    </div>
  {/if}
  
  <form method="POST" use:enhance={() => {
    loading = true;
    
    return ({ result }) => {
      loading = false;
      
      if (result.type === 'success') {
        goto(returnUrl);
      }
    };
  }}>
    <div class="form-group">
      <label for="identifier">Email or Username</label>
      <input 
        type="text" 
        id="identifier" 
        name="identifier" 
        required 
        autocomplete="username"
        value={(form && 'identifier' in form) ? form.identifier : ''}
      />
    </div>
    
    <div class="form-group">
      <label for="password">Password</label>
      <input 
        type="password" 
        id="password" 
        name="password" 
        required
        autocomplete="current-password"
      />
    </div>
    
    <button type="submit" disabled={loading}>
      {loading ? 'Logging in...' : 'Login'}
    </button>
  </form>
</div>

<style>
  .login-container {
    max-width: 400px;
    margin: 2rem auto;
    padding: 2rem;
    background-color: #f8f8f8;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  h1 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #333;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #555;
  }
  
  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  input:focus {
    outline: none;
    border-color: #ff3e00;
    box-shadow: 0 0 0 2px rgba(255, 62, 0, 0.2);
  }
  
  button {
    width: 100%;
    padding: 0.75rem;
    background-color: #ff3e00;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  button:hover:not(:disabled) {
    background-color: #e63700;
  }
  
  button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .error {
    background-color: #fff2f2;
    border-left: 4px solid #ff3e00;
    padding: 1rem;
    margin-bottom: 1.5rem;
    color: #c92a2a;
  }
</style>
