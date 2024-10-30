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
import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

  import { Drawer, getDrawerStore, initializeStores } from '@skeletonlabs/skeleton';
  import { onMount } from 'svelte'; /* Svelte lifecycle function */
  import '../app.postcss'; /* Importing global styles */
  import { AppShell, AppBar } from '@skeletonlabs/skeleton';
   import { page } from '$app/stores'; /* Svelte store for page data */
  import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom'; /* Floating UI library for tooltip/pop-up positioning */
  import { storePopup } from '@skeletonlabs/skeleton'; /* Store for pop-up configurations */
  import { goto } from '$app/navigation'; /* Function to navigate to a new page */
  /* Initialize stores for Skeleton UI components */
  initializeStores();
  injectSpeedInsights();


  /* Reactive variable to check login status */
  let isLoggedIn = false;

  /* onMount lifecycle function to check if the user is logged in */
  onMount(() => {
    isLoggedIn = !!localStorage.getItem('jwtToken'); /* Checks if a JWT token exists in localStorage */
  });

  /* Function to handle authentication actions */
  function handleAuthAction() {
  if (isLoggedIn) {
    // Navigate to account settings page
    goto('/account-settings');
  } else {
    // Navigate to login page
    goto('/login');
  }
}

</script>



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
<li>
  {#if isLoggedIn}
  
    <!-- Login/Logout button -->
    <button on:click={handleAuthAction} class="bg-[#D5BA7F] text-black py-2 px-4 border border-transparent rounded-lg hover:text-black">
      {isLoggedIn ? 'Account Settings' : 'Login'}
    </button>
{/if}
{#if !isLoggedIn}
  
<!-- Login/Logout button -->
<button on:click={handleAuthAction} class="bg-[#D5BA7F] text-black py-2 px-4 border border-transparent rounded-lg hover:text-black">
  {isLoggedIn ? 'Account Settings' : 'Login'}
</button>
{/if}
           
                    
         
            
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
