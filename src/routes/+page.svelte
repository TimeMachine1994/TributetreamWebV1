<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { authStore } from '$lib/stores/auth-store';
  
  // Use $derived to create reactive values from the store
  let isAuthenticated = $derived($authStore.isAuthenticated);
</script>

<div class="container">
  <header>
    <h1>TributeStream</h1>
    <nav>
      {#if isAuthenticated}
        <a href="/my-portal/dashboard">Dashboard</a>
      {:else}
        <a href="/login">Login</a>
      {/if}
    </nav>
  </header>
  
  <main>
    <section class="hero">
      <h2>Welcome to TributeStream</h2>
      <p>A platform for managing tributes and celebrations.</p>
      
      {#if isAuthenticated}
        <a href="/my-portal/dashboard" class="cta-button">Go to Dashboard</a>
      {:else}
        <a href="/login" class="cta-button">Login</a>
      {/if}
    </section>
  </main>
  
  <footer>
    <p>&copy; {new Date().getFullYear()} TributeStream. All rights reserved.</p>
  </footer>
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
  }
  
  nav a {
    margin-left: 1rem;
    text-decoration: none;
    color: #0066cc;
    font-weight: bold;
  }
  
  nav a:hover {
    text-decoration: underline;
  }
  
  .hero {
    text-align: center;
    padding: 4rem 2rem;
    background-color: #f9f9f9;
    border-radius: 8px;
    margin-bottom: 2rem;
  }
  
  .hero h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
  
  .hero p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    color: #666;
  }
  
  .cta-button {
    display: inline-block;
    background-color: #0066cc;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    text-decoration: none;
    font-weight: bold;
    transition: background-color 0.2s;
  }
  
  .cta-button:hover {
    background-color: #0055aa;
  }
  
  footer {
    margin-top: 4rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
    text-align: center;
    color: #666;
  }
</style>
