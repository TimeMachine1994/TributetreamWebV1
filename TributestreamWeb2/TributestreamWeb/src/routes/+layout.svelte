<!-- +index.svelte -->

<!-- Head Section -->
<svelte:head>
  <script>
    
    window.wpApiSettings = {
      root: 'https://wp.tributestream.com/wp-json/',
      nonce: '',
      versionString: 'wp/v2/'
    };

  </script>
  <!-- Importing external JavaScript libraries for Backbone.js and WordPress API -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.4.0/backbone-min.js"></script>
  <script src="https://wp.tributestream.com/wp-includes/js/wp-api.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fanwood+Text:ital@0;1&display=swap" rel="stylesheet">
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
  .fanwood-text-regular {
  font-family: "Fanwood Text", serif;
  font-weight: 400;
  font-style: normal;
}

.fanwood-text-regular-italic {
  font-family: "Fanwood Text", serif;
  font-weight: 400;
  font-style: italic;
}
  
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
  let isLoggedIn = false;

  /* onMount lifecycle function to check if the user is logged in */
  onMount(() => {
    /* Checks if a JWT token exists in localStorage */
    isLoggedIn = !!localStorage.getItem('jwtToken');
  });

  /* Function to handle authentication actions */
  function handleAuthAction() {
    if (isLoggedIn) {
      // If the user is logged in, log them out
      // NOT-COMPLETE
      goto('/#');
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
        <button class="focus:outline-none mb-4" on:click={closeDrawer}>
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
            <a href="/why-tributestream" class="text-black hover:text-gray-700" on:click={closeDrawer}>
              Why Tributestream?
            </a>
          </li>
          <li>
            <a href="/how-it-works" class="text-black hover:text-gray-700" on:click={closeDrawer}>
              How does it work?
            </a>
          </li>
          <li>
            <a href="/contact" class="text-black hover:text-gray-700" on:click={closeDrawer}>
              Contact Us
            </a>
          </li>
          <li>
            <a href="/schedule" class="text-black hover:text-gray-700" on:click={closeDrawer}>
              Schedule Now
            </a>
          </li>
          <li>
            <!-- Login/Account Settings Button -->
            <button
              on:click={() => { handleAuthAction(); closeDrawer; }}
              class="bg-[#D5BA7F] text-black py-2 px-4 border border-transparent rounded-lg hover:text-black"
            >
              {isLoggedIn ? 'Log Out' : 'Login'}
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
            <button
            on:click={handleAuthAction}
            class="bg-[#D5BA7F] text-black py-2 px-4 border border-transparent rounded-lg hover:text-black"
          >
            {isLoggedIn ? 'My Portal' : 'Login'}
          </button>
          </li>
        </ul>
      </nav>
      <!-- On smaller screens, show the hamburger menu -->
      <button class="md:hidden focus:outline-none" on:click={openDrawer}>
        <!-- Hamburger Icon SVG -->
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </div>
</header>


     <!-- Main Content -->
<main class="min-w-screen min-h-screen overflow-y-auto">
<!-- Slot for rendering the content of the current page route -->
  <slot />
</main>
   <!-- Footer Section -->
  <footer class="bg-black text-white py-12">
    <div class="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
      <!-- Logo and Brief Description -->
      <div class="flex flex-col items-center md:items-start">
        <!-- Logo -->
        <a href="https://tributestream.com" class="text-xl text-white">
          <span class="tributestream">
            <i>Tributestream</i><span class="r-symbol">®</span>
          </span>
        </a>
        <!-- Brief Description -->
        <p class="text-sm mt-4">
          Tributestream is a premier, affordable, and reliable livestreaming service to transport your families and friends to a celebration of life. We don't make videos, we make documentaries.
        </p>
      </div>
  
      <!-- Coverage Locations List -->
      <div>
        <h3 class="text-lg font-semibold mb-4">COVERAGE LOCATIONS</h3>
        <p class="text-sm">
          Orange, Lake, Osceola, Seminole, Marion, Sumter, Volusia, Flagler, and Brevard counties.
        </p>
        <p class="text-sm mt-4">Please call if your location is not listed:</p>
        <p class="text-sm">+1 (407) 221-5922</p>
        <p class="text-sm">Contact@tributestream.com</p>
      </div>
  
      <!-- Office Hours -->
      <div>
        <h3 class="text-lg font-semibold mb-4">Office Hours</h3>
        <p class="text-sm">
          Monday – Friday:<br>10:00AM – 5:00PM EST
        </p>
        <p class="text-sm mt-4">
          Saturday – Sunday:<br>12:00PM – 5:00PM EST
        </p>
        <h3 class="text-lg font-semibold mt-8 mb-4">After Hours</h3>
        <p class="text-sm">
          If you need to contact us after hours, feel free to reach out via text or email.
        </p>
      </div>
  
      <!-- Review Us on Google Section -->
      <div>
        <h3 class="text-lg font-semibold mb-4">REVIEW US ON GOOGLE</h3>
        <p class="text-sm mb-4">
          If you appreciated the service we provided you and your family, please consider leaving us a five-star review on Google!
        </p>
        <!-- Button for Reviewing on Google -->
        <a href="https://g.page/r/CT2e1k0NJGeKEAE/review"
        class="bg-[#D5BA7F] text-black py-2 px-4 border border-transparent rounded-lg hover:text-black hover:shadow-[0_0_10px_4px_#D5BA7F] transition-all duration-300 ease-in-out inline-block"
     >
       Review Us
     </a>
      </div>
    </div>
  
    <!-- Footer Copyright -->
    <div class="border-t border-gray-700 mt-8 pt-4">
      <p class="text-center text-sm text-gray-500">
        © 2019-2024 All rights reserved | Tributestream is a Registered Trademark
      </p>
    </div>
  </footer>
 