<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let isLoggedIn = $state(false);

  onMount(() => {
    isLoggedIn = !!localStorage.getItem('jwtToken');
  });

  function handleAuthAction() {
    if (isLoggedIn) {
      goto('/account-settings');
    } else {
      goto('/login');
    }
  }
</script>

<style>
  .tributestream {
    font-family: 'Great Vibes', 'Times New Roman', serif;
    font-size: 48px;
    letter-spacing: -1.5px;
  }

  .r-symbol {
    font-size: 0.4em;
    vertical-align: top;
    position: relative;
    top: -8px;
    left: 5px;
  }
</style>

<header class="bg-black text-white">
  <div class="container mx-auto flex justify-between items-center py-4 px-4">
    <a href="/" class="text-xl text-white">
      <span class="tributestream">
        <i>Tributestream</i><span class="r-symbol">®</span>
      </span>
    </a>
    
    <nav class="hidden md:flex items-center space-x-8">
      <a href="/why-tributestream" class="text-white hover:text-gray-300">
        Why Tributestream?
      </a>
      <a href="/how-it-works" class="text-white hover:text-gray-300">
        How does it work?
      </a>
      <a href="/contact" class="text-white hover:text-gray-300">
        Contact Us
      </a>
      <a href="/schedule" class="text-white hover:text-gray-300">
        Schedule Now
      </a>
      <button
        onclick={handleAuthAction}
        class="bg-[#D5BA7F] text-black px-4 py-2 rounded hover:bg-opacity-90"
      >
        {isLoggedIn ? 'Account' : 'Login'}
      </button>
    </nav>

    <!-- Mobile menu button -->
    <button 
      class="md:hidden"
      aria-label="Toggle mobile menu"
      onclick={() => {/* Mobile menu implementation will go here */}}
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  </div>
</header>
