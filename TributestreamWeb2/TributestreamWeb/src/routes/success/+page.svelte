
<script>
  import { onMount } from 'svelte';
   let { user-details } = $props();

</script>

<div class="success-container">
  {#if userData}
    <h2>Welcome, {userData.name}!</h2>
    <div class="user-details">
      <p>Email: {userData.email}</p>
      {#if userData.username}
        <p>Username: {userData.username}</p>
      {/if}
    </div>
  {:else}
    <p>Loading user data...</p>
  {/if}
</div>

<style>
  .success-container {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .user-details {
    margin-top: 1rem;
  }
  
  h2 {
    color: #2c3e50;
    margin-bottom: 1rem;
  }
  
  p {
    color: #34495e;
    margin: 0.5rem 0;
  }
</style>
