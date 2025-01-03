// src/+page.svelte
<script>
import { goto } from '$app/navigation';

function navigateToLogin() {
  goto('/login');
}
</script>

<div class="flex min-h-screen items-center justify-center">
  <div class="text-center">
    <h1 class="text-4xl font-bold mb-4">Welcome</h1>
    <button 
      onclick={navigateToLogin}
      class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      Login
    </button>
  </div>
</div>