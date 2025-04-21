<script lang="ts">
  import { page } from '$app/state';
  
  let user = $derived(page.data.user);
  let isAuthenticated = $derived(!!user);
</script>

<section class="hero">
  <div class="hero-content">
    <h1>Welcome to Tributestream</h1>
    <p class="lead">A Strapi-powered SvelteKit application with role-based authentication</p>
    
    {#if !isAuthenticated}
      <div class="cta-buttons">
        <a href="/login" class="btn primary">Login</a>
        <a href="/register" class="btn secondary">Register</a>
      </div>
    {:else}
      <div class="welcome-message">
        <p>Welcome back, <strong>{user.username}</strong>!</p>
        <div class="cta-buttons">
          <a href="/profile" class="btn primary">View Profile</a>
          {#if user.role.type === 'admin'}
            <a href="/admin/dashboard" class="btn secondary">Admin Dashboard</a>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</section>

<section class="features">
  <h2>Features</h2>
  
  <div class="feature-grid">
    <div class="feature-card">
      <h3>Authentication</h3>
      <p>Secure login and registration with JWT authentication through Strapi CMS.</p>
    </div>
    
    <div class="feature-card">
      <h3>Role-Based Access</h3>
      <p>Different permissions and views based on user roles - admin, editor, and regular users.</p>
    </div>
    
    <div class="feature-card">
      <h3>Reactive UI</h3>
      <p>Built with Svelte 5's runes for reactive state management and efficient updates.</p>
    </div>
    
    <div class="feature-card">
      <h3>Content Management</h3>
      <p>Powerful content management through Strapi's flexible API and dashboard.</p>
    </div>
  </div>
</section>

<style>
  section {
    padding: 3rem 1rem;
  }
  
  .hero {
    background-color: #f8f8f8;
    text-align: center;
    border-radius: 8px;
    margin-bottom: 2rem;
  }
  
  .hero-content {
    max-width: 800px;
    margin: 0 auto;
  }
  
  h1 {
    font-size: 2.5rem;
    color: #333;
    margin-bottom: 1rem;
  }
  
  .lead {
    font-size: 1.25rem;
    color: #555;
    margin-bottom: 2rem;
  }
  
  .cta-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1.5rem;
  }
  
  .btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.2s;
  }
  
  .primary {
    background-color: #ff3e00;
    color: white;
  }
  
  .primary:hover {
    background-color: #e63700;
  }
  
  .secondary {
    background-color: white;
    color: #ff3e00;
    border: 2px solid #ff3e00;
  }
  
  .secondary:hover {
    background-color: #fff1ee;
  }
  
  .welcome-message {
    background-color: #fff1ee;
    padding: 1.5rem;
    border-radius: 8px;
    margin-top: 1rem;
  }
  
  .features h2 {
    text-align: center;
    margin-bottom: 2rem;
    font-size: 2rem;
    color: #333;
  }
  
  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
  }
  
  .feature-card {
    background-color: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
  }
  
  .feature-card:hover {
    transform: translateY(-5px);
  }
  
  .feature-card h3 {
    color: #ff3e00;
    margin-bottom: 1rem;
  }
  
  .feature-card p {
    color: #666;
  }
  
  @media (max-width: 768px) {
    .cta-buttons {
      flex-direction: column;
    }
    
    .feature-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
