<svelte:head>
  <!-- Importing external JavaScript libraries for Backbone.js and WordPress API -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.4.0/backbone-min.js"></script>
  <script src="https://tributestream.com/wp-includes/js/wp-api.min.js"></script>
</svelte:head>

<!-- Custom CSS for the title and buttons -->
<style>
  @import url('https://fonts.googleapis.com/css2?family=Fanwood'); /* Importing Google Font 'Fanwood' */

  .tributestream {
    font-family: 'Great Vibes', 'Times New Roman', serif; /* Setting font-family for the Tributestream title */
    font-size: 48px; /* Font size for the Tributestream title */
    letter-spacing: -1.5px; /* Adjusting letter spacing to make the letters touch */
  }

  .r-symbol {
    font-size: 0.4em; /* Smaller font size for the registered trademark symbol */
    vertical-align: top; /* Aligning the symbol to the top */
    position: relative; /* Using relative positioning for fine-tuning */
    top: -8px; /* Adjusting the vertical position of the symbol */
    left: 5px; /* Adjusting the horizontal position of the symbol */
  }
</style>

<script lang="ts">
  import { Drawer, getDrawerStore, initializeStores } from '@skeletonlabs/skeleton';
  import { onMount } from 'svelte'; /* Svelte lifecycle function */
  import '../app.postcss'; /* Importing global styles */
  import { AppShell, AppBar } from '@skeletonlabs/skeleton';
   import { page } from '$app/stores'; /* Svelte store for page data */
  import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom'; /* Floating UI library for tooltip/pop-up positioning */
  import { storePopup } from '@skeletonlabs/skeleton'; /* Store for pop-up configurations */
  
  /* Initialize stores for Skeleton UI components */
  initializeStores();

  /* Setting up drawer store and pop-up positioning logic */
  const drawerStore = getDrawerStore();

  /* Function to open the drawer with custom settings */
  function openDrawer() {
    const drawerSettings = {
      id: 'cart',
      bgDrawer: 'bg-white text-black',
      bgBackdrop: 'bg-gray-900/50',
      width: 'w-[300px]',
      padding: 'p-4',
      rounded: 'rounded-lg',
      position: 'right'
    };
    drawerStore.open(drawerSettings);
  }

  /* Reactive variable to check login status */
  let isLoggedIn = false;

  /* onMount lifecycle function to check if the user is logged in */
  onMount(() => {
    isLoggedIn = !!localStorage.getItem('jwtToken'); /* Checks if a JWT token exists in localStorage */
  });

  /* Function to handle authentication actions */
  function handleAuthAction() {
    if (isLoggedIn) {
      localStorage.removeItem('jwtToken'); /* Log out the user by removing JWT token */
      isLoggedIn = false;
    } else {
      // Implement login logic or navigation to login page
    }
  }
</script>

<!-- Drawer component -->
<Drawer>
  {#if $drawerStore.id === 'cart'}
    <!-- Drawer Content for 'example-drawer' -->
    <div class="p-4">
      <div class="card p-4 mb-4">You have nothing in your cart.</div>

      <h2 class="text-2xl font-bold mb-4">Shop</h2>
      <ul>
        <li>Livestream Services</li>
        <li>Slideshows</li>
        <li>Livestream Services</li>
        <li>Photo Restoration</li>
        <li>Home Video Restoration</li>
        <li>Audio / Visual Support </li>
      </ul>
      <button on:click={() => drawerStore.close()} class="mt-4 bg-red-500 text-white py-2 px-4 rounded">
        Close
      </button>
    </div>
  {/if}
</Drawer>

<!-- AppShell component for structuring the app -->
<AppShell>
  <svelte:fragment slot="header">
    <!-- AppBar for the top navigation bar -->
    <AppBar background="bg-black">
      <svelte:fragment slot="lead">
        <!-- Logo and branding link in the lead slot of the AppBar -->
        <a href="https://tributestream.com" class="text-xl text-white">  
          <span class="tributestream"><i>Tributestream</i><span class="r-symbol">®</span></span>
        </a>
      </svelte:fragment>

      <svelte:fragment slot="default">
        <!-- Default slot can be used for other center content in the AppBar -->
      </svelte:fragment>

      <svelte:fragment slot="trail">
        <!-- Trail slot for the right side of the AppBar -->
        <div class="flex-1 flex justify-center items-center text-white">
          <div class="flex space-x-4">
            <!-- Navigation menu -->
            <nav>
              <ul class="flex space-x-4 items-center">
                <li><a href="/why-tributestream" class="text-white hover:text-gray-300">Why Tributestream?</a></li>
                <li><a href="/how-it-works" class="text-white hover:text-gray-300">How does it work?</a></li>
                <li><a href="/contact" class="text-white hover:text-gray-300">Contact Us</a></li>
                <li><a href="/schedule" class="text-white hover:text-gray-300">Schedule Now</a></li>
                <li> | </li>
<li>
                <button 
                on:click={openDrawer} 
                class="flex items-center space-x-2 bg-[#D5BA7F] text-black py-2 px-4 border border-transparent rounded-lg hover:bg-[#CFCFCE]">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  stroke-width="1.5"
                  class="w-6 h-6">
                  <!-- Calendar icon base -->
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Schedule Livestream</span>
              </button>
            </li>
                
              </ul>
            </nav>
                    
            <!-- Login/Logout button -->
            <button on:click={handleAuthAction} class="bg-[#D5BA7F] text-black py-2 px-4 border border-transparent rounded-lg hover:text-black">
              {isLoggedIn ? 'Logout' : 'Login'} <!-- Display 'Logout' if logged in, otherwise 'Login' -->
            </button>
          </div>
        </div>
      </svelte:fragment>
    </AppBar>
  </svelte:fragment>

  <div class="min-w-screen">
    <!-- Content of the current page route will be rendered here -->
    <slot />
  </div>

  <!-- Footer section -->
  <footer class="bg-black text-white py-12">
    <div class="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
      <!-- Logo and brief description -->
      <div class="flex flex-col items-center md:items-start">
        <a href="https://tributestream.com" class="text-xl text-white">  
          <span class="tributestream"><i>Tributestream</i><span class="r-symbol">®</span></span>
        </a>
        <p class="text-sm">
          Tributestream is a premier, affordable, and reliable livestreaming service to transport your families and friends to a celebration of life. We don't make videos, we make documentaries.
        </p>
      </div>
      
      <!-- Coverage locations list -->
      <div>
        <h3 class="text-lg font-semibold mb-4">COVERAGE LOCATIONS</h3>
        <p class="text-sm">
          Orange, Lake, Osceola, Seminole, Marion, Sumter, Volusia, Flagler, and Brevard counties.
        </p>
        <p class="text-sm mt-4">Please call if your location is not listed:</p>
        <p class="text-sm">+1 (407) 221-5922</p>
        <p class="text-sm">Contact@Tributestream.com</p>
      </div>
      
      <!-- Office hours -->
      <div>
        <h3 class="text-lg font-semibold mb-4">Office Hours</h3>
        <p class="text-sm">Monday – Friday:<br>10:00AM – 5:00PM EST</p>
        <p class="text-sm mt-4">Saturday – Sunday:<br>12:00PM – 5:00PM EST</p>
        <h3 class="text-lg font-semibold mt-8 mb-4">After Hours</h3>
        <p class="text-sm">
          If you need to contact us after hours, feel free to reach out via text or email.
        </p>
      </div>
      
      <!-- Review us on Google section -->
      <div>
        <h3 class="text-lg font-semibold mb-4">REVIEW US ON GOOGLE</h3>
        <p class="text-sm mb-4">
          If you appreciated the service we provided you and your family, please consider leaving us a five-star review on Google!
        </p>
        <!-- Button for reviewing on Google -->
        <button class="bg-[#D5BA7F] text-black py-2 px-4 border border-transparent rounded-lg hover:text-black hover:shadow-[0_0_10px_4px_#D5BA7F] transition-all duration-300 ease-in-out">
          Review Us
        </button>
      </div>
    </div>
    
    <!-- Footer copyright -->
    <div class="border-t border-gray-700 mt-8 pt-4">
      <p class="text-center text-sm text-gray-500">
        © 2019-2024 All rights reserved | Tributestream is a Registered Trademark
      </p>
    </div>
  </footer>
</AppShell>
