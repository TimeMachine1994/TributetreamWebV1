<script lang="ts">
  import { setUser, getUser } from '$lib/stores/auth.store.svelte';
  import { page } from '$app/state';

  let { children } = $props();
  
  // Create a reactive derived value for authentication status
  let userAuthenticated = $derived(getUser().authenticated);
</script>

<div class="flex flex-col min-h-screen">
  <!-- Navigation Header -->
  <header class="bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-md">
    <div class="container mx-auto px-4 py-3">
      <nav class="flex flex-wrap items-center justify-between">
        <!-- Logo/Brand -->
        <a href="/" class="text-2xl font-bold flex items-center">
          <span>TributeStream</span>
        </a>

        <!-- Main Navigation -->
        <div class="flex justify-center gap-4 items-center">
          <a href="/" class="btn btn-sm rounded-lg bg-white text-blue-800 shadow hover:bg-white hover:scale-105">Home</a>
          
          <a
            href="/funeral-director-portal/fd-tribute-creator"
            class="btn btn-sm rounded-lg bg-white text-blue-800 shadow hover:bg-white hover:scale-105"
            aria-label="Create Memorial Page"
          >Create Memorial</a>
          
          {#if userAuthenticated}
            <a
              href="/funeral-director-portal"
              class="btn btn-sm rounded-lg bg-white text-blue-800 shadow hover:bg-white hover:scale-105">Portal</a>
          {:else}
            <a
              href="/login"
              class="btn btn-sm rounded-lg bg-white text-blue-800 shadow hover:bg-white hover:scale-105">Login</a>
            <a
              href="/register"
              class="btn btn-sm rounded-lg bg-white text-blue-800 shadow hover:bg-white hover:scale-105">Register</a>
          {/if}
        </div>
      </nav>
    </div>
  </header>

  <!-- Main Content -->
  <main class="flex-grow">
    {@render children()}
  </main>

  <!-- Footer -->
  <footer class="bg-gray-800 text-white py-6">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row justify-between items-center">
        <div class="mb-4 md:mb-0">
          <p>&copy; {new Date().getFullYear()} TributeStream. All rights reserved.</p>
        </div>
        <div class="flex gap-4">
          <a href="/about" class="hover:text-blue-300">About</a>
          <a href="/contact" class="hover:text-blue-300">Contact</a>
          <a href="/privacy" class="hover:text-blue-300">Privacy Policy</a>
        </div>
      </div>
    </div>
  </footer>
</div>