<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import '@fortawesome/fontawesome-free/css/all.min.css';

  // State management using runes
  let isMenuOpen = $state(false);
  let isLoggedIn = $derived(!!$page.data.user);
  let isAdmin = $derived($page.data.user?.isAdmin ?? false);

  // Handle portal navigation
  function handlePortalClick(): void {
    if (!isLoggedIn) {
      goto('/login');
      return;
    }
    goto(isAdmin ? '/admin' : '/schedule');
  }

  // Toggle mobile menu
  function toggleMenu(): void {
    isMenuOpen = !isMenuOpen;
  }
</script>

<!-- Header Section -->
<header class="bg-black text-white fixed w-full top-0 z-50">
  <div class="container mx-auto flex justify-between items-center py-4 px-4">
    <!-- Logo -->
    <a href="/" class="text-xl text-white z-50">
      <span class="font-great-vibes text-4xl">
        <i>Tributestream</i><span class="text-sm align-top relative -top-2 left-1">®</span>
      </span>
    </a>

    <!-- Mobile Menu Button -->
    <button 
      class="md:hidden z-50 p-2"
      on:click={toggleMenu}
      aria-label="Toggle menu"
    >
      <i class={`fas fa-${isMenuOpen ? 'times' : 'bars'}`}></i>
    </button>

    <!-- Navigation Menu -->
    <nav 
      class={`fixed md:relative top-0 right-0 h-screen md:h-auto w-full md:w-auto 
      bg-black md:bg-transparent transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} 
      md:translate-x-0 transition-transform duration-300 ease-in-out flex items-center md:flex`}
    >
      <ul class="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6 items-center w-full md:w-auto p-8 md:p-0">
        <li>
          <a 
            href="/why-tributestream" 
            class="text-white hover:text-[#D5BA7F] transition-colors duration-300"
          >
            Why Tributestream?
          </a>
        </li>
        <li>
          <a 
            href="/how-it-works" 
            class="text-white hover:text-[#D5BA7F] transition-colors duration-300"
          >
            How does it work?
          </a>
        </li>
        <li>
          <a 
            href="/contact" 
            class="text-white hover:text-[#D5BA7F] transition-colors duration-300"
          >
            Contact Us
          </a>
        </li>
        <li>
          <a 
            href="/schedule" 
            class="text-white hover:text-[#D5BA7F] transition-colors duration-300"
          >
            Schedule Now
          </a>
        </li>
        <li>
          <button 
            on:click={handlePortalClick}
            class="bg-[#D5BA7F] text-black py-2 px-6 rounded-lg hover:shadow-[0_0_10px_4px_#D5BA7F] 
            transition-all duration-300 ease-in-out font-medium"
          >
            My Portal
          </button>
        </li>
      </ul>
    </nav>
  </div>
</header>

<!-- Spacer to prevent content from hiding under fixed header -->
<div class="h-20"></div>

<style>
  /* Import Google Fonts */
  @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Fanwood+Text&display=swap');

  /* Apply Fanwood Text as the default font */
  :global(body) {
    font-family: 'Fanwood Text', serif;
  }

  /* Custom styles for the mobile menu */
  @media (max-width: 768px) {
    nav {
      padding-top: 5rem;
    }
  }
</style>
