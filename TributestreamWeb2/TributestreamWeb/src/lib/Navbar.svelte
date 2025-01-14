<!-- +index.svelte -->

<!-- Head Section -->
<svelte:head>
  <!-- Importing external JavaScript libraries for Backbone.js and WordPress API -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.4.0/backbone-min.js"></script>
  <script src="https://tributestream.com/wp-includes/js/wp-api.min.js"></script>
  
</svelte:head>

<!-- Styles -->
<style>
  /* Importing Google Font 'Fanwood' */
  @import url('https://fonts.googleapis.com/css2?family=Fanwood');

  /* Custom styles for the Tributestream title */
  .tributestream {
    font-family: 'Great Vibes', 'Times New Roman', serif; /* Setting font family */
    font-size: 48px; /* Setting font size */
    letter-spacing: -1.5px; /* Adjusting letter spacing to make letters touch */
  }

  /* Styles for the registered trademark symbol */
  .r-symbol {
    font-size: 0.4em; /* Smaller font size for the symbol */
    vertical-align: top; /* Aligning symbol to the top */
    position: relative; /* Relative positioning for fine-tuning */
    top: -8px; /* Adjusting vertical position */
    left: 5px; /* Adjusting horizontal position */
  }

  /* Scrollbar customizations */
 
  
</style>

<script lang="ts">
    /* Importing necessary functions and components */
    import { onMount } from 'svelte'; /* Svelte lifecycle function */
    import { Drawer, getDrawerStore, initializeStores } from '@skeletonlabs/skeleton'; /* Skeleton UI components */
    import type { DrawerSettings } from '@skeletonlabs/skeleton'; /* Type-only import for DrawerSettings */
    import { goto } from '$app/navigation'; /* Function to navigate to a new page */
    import '../app.postcss'; /* Importing global styles */
    import '@fortawesome/fontawesome-free/css/all.min.css'

/*********** START Intialize stores and drawer ***********/
    initializeStores();

    const drawerStore = getDrawerStore();

    function openDrawer() { 
        drawerStore.open() 
    }

    function closeDrawer() { 
        drawerStore.close() 
    }
/*********** END Intialize stores and drawer ***********/

/*********** START Handle Authentication Actions ***********/
  /* Reactive variable to check login status */
  let isLoggedIn = $state(false);

  /* onMount lifecycle function to check if the user is logged in */
  onMount(() => {
    /* Checks if a JWT token exists in localStorage */
    isLoggedIn = !!localStorage.getItem('jwtToken');
  });

  /* Function to handle authentication actions */
  function handleAuthAction() {
    if (isLoggedIn) {
      // If the user is logged in, navigate to account settings page
      goto('/account-settings');
    } else {
      // If the user is not logged in, navigate to login page
      goto('/login');
    }
  }
/*********** END Handle Authentication Actions **********/




</script>
    
<!--*********** START Drawer Component Logic **********-->

<!-- Drawer Component for Mobile Navigation -->
<Drawer>
  
      <!-- Drawer Contents -->
      <div class="p-4">
        <!-- Close Button -->
        <button class="focus:outline-none mb-4" onclick={closeDrawer}>
          <!-- Close Icon SVG -->
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <!-- Navigation Menu Items -->
        <ul class="space-y-4">
          <li>
            <a href="/why-tributestream" class="text-black hover:text-gray-700" onclick={closeDrawer}>
              Why Tributestream?
            </a>
          </li>
          <li>
            <a href="/how-it-works" class="text-black hover:text-gray-700" onclick={closeDrawer}>
              How does it work?
            </a>
          </li>
          <li>
            <a href="/contact" class="text-black hover:text-gray-700" onclick={closeDrawer}>
              Contact Us
            </a>
          </li>
          <li>
            <a href="/schedule" class="text-black hover:text-gray-700" onclick={closeDrawer}>
              Schedule Now
            </a>
          </li>
          <li>
            <!-- Login/Account Settings Button -->
            <button
              onclick={() => { handleAuthAction(); closeDrawer; }}
              class="bg-[#D5BA7F] text-black py-2 px-4 border border-transparent rounded-lg hover:text-black"
            >
              {isLoggedIn ? 'Account Settings' : 'Login'}
            </button>
          </li>
        </ul>
      </div>
</Drawer>

<!--*********** END Drawer Component Logic **********-->

 
<!-- Header Section -->
<header class="bg-black text-white">
    <div class="container mx-auto flex justify-between items-center py-4 px-4">
      <!-- Logo -->
      <a href="https://tributestream.com" class="text-xl text-white">
        <span class="tributestream">
          <i>Tributestream</i><span class="r-symbol">®</span>
        </span>
      </a>
      <!-- Navigation Menu -->
      <!-- On larger screens, show the menu items -->
      <nav class="hidden md:block">
        <ul class="flex space-x-4 items-center">
          <!-- Navigation Links -->
          <li>
            <a href="/why-tributestream" class="text-white hover:text-gray-300">
              Why Tributestream?
            </a>
          </li>
          <li>
            <a href="/how-it-works" class="text-white hover:text-gray-300">
              How does it work?
            </a>
          </li>
          <li>
            <a href="/contact" class="text-white hover:text-gray-300">
              Contact Us
            </a>
          </li>
          <li>
            <a href="/schedule" class="text-white hover:text-gray-300">
              Schedule Now
            </a>
          </li>
          <li>
            <!-- Login/Account Settings Button -->
            <button
              onclick={handleAuthAction}
              class="bg-[#D5BA7F] text-black py-2 px-4 border border-transparent rounded-lg hover:text-black"
            >
              {isLoggedIn ? 'Account Settings' : 'Login'}
            </button>
          </li>
        </ul>
      </nav>
      <!-- On smaller screens, show the hamburger menu -->
      <button class="md:hidden focus:outline-none" onclick={openDrawer}>
        <!-- Hamburger Icon SVG -->
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </div>
</header>
