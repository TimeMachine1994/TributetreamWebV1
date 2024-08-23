<svelte:head>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.4.0/backbone-min.js"></script>
  <script src="https://tributestream.com/wp-includes/js/wp-api.min.js"></script>
</svelte:head>

<script lang="ts">
    import '../app.postcss';
    import { AppShell, AppBar } from '@skeletonlabs/skeleton';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';

    // Floating UI for Popups
    import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
    import { storePopup } from '@skeletonlabs/skeleton';
    storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

    let isLoggedIn = false;

    onMount(() => {
        isLoggedIn = !!localStorage.getItem('jwtToken');
    });

    function handleAuthAction() {
        if (isLoggedIn) {
            localStorage.removeItem('jwtToken');
            isLoggedIn = false;
        } else {
            // Implement login logic or navigation to login page
        }
    }
</script>

<!-- App Shell -->
<AppShell>
    <svelte:fragment slot="header">
        <!-- App Bar -->
        <AppBar background="bg-black">
            <svelte:fragment slot="lead">
                            <a href="https://tributestream.com" class="text-xl uppercase text-white hover:text-yellow-500 transition-colors duration-300">
                                <strong>Tributestream</strong>
                            </a>
                        </svelte:fragment>
            <svelte:fragment slot="default">
    <div class="flex-1 flex justify-center items-center">
        <div class="flex space-x-4">
            <a

			class="btn btn-sm bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg hover:shadow-yellow-500/50 transition-all duration-300"
                href=" "
                target="_blank"
                rel="noreferrer"
            >
                Connecting Families
            </a>
            <a
                class="btn btn-sm bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg hover:shadow-yellow-500/50 transition-all duration-300"
                href="https://tributestream.com/who-we-are/"
                target="_blank"
                rel="noreferrer"
            >
                Company Ethos
            </a>
            <a
                class="btn btn-sm bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg hover:shadow-yellow-500/50 transition-all duration-3000"
                href="https://tributestream.com/bookus/"
                target="_blank"
                rel="noreferrer"
            >
                Contact Tributestream
            </a>
        </div>
    </div>
</svelte:fragment>
<svelte:fragment slot="trail">
    <div class="w-[150px] flex justify-end">
        <button on:click={handleAuthAction} class="btn btn-sm bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg hover:shadow-yellow-500/50 transition-all duration-300">
            {isLoggedIn ? 'Logout' : 'Login'}
        </button>
    </div>
</svelte:fragment>

        </AppBar>
    </svelte:fragment>

    <div class="min-w-screen">
        <!-- Page Route Content -->
        <slot />
    </div>

    <footer class="bg-black text-white py-12">
        <div class="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          <!-- Logo and Description -->
          <div class="flex flex-col items-center md:items-start">
            <img src="path_to_your_logo_image" alt="Tributestream Logo" class="mb-4">
            <p class="text-sm">
              Tributestream is a premier, affordable, and reliable livestreaming service to transport your families and friends to a celebration of life. We don't make videos, we make documentaries.
            </p>
          </div>
         
          <!-- Coverage Locations -->
          <div>
            <h3 class="text-lg font-semibold mb-4">COVERAGE LOCATIONS</h3>
            <p class="text-sm">
              Orange, Lake, Osceola, Seminole, Marion, Sumter, Volusia, Flagler, and Brevard counties.
            </p>
            <p class="text-sm mt-4">Please call if your location is not listed:</p>
            <p class="text-sm">+1 (407) 221-5922</p>
            <p class="text-sm">Contact@Tributestream.com</p>
          </div>
         
          <!-- Office Hours -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Office Hours</h3>
            <p class="text-sm">Monday – Friday:<br>10:00AM – 5:00PM EST</p>
            <p class="text-sm mt-4">Saturday – Sunday:<br>12:00PM – 5:00PM EST</p>
            <h3 class="text-lg font-semibold mt-8 mb-4">After Hours</h3>
            <p class="text-sm">
              If you need to contact us after hours, feel free to reach out via text or email.
            </p>
          </div>
         
          <!-- Review Us -->
          <div>
            <h3 class="text-lg font-semibold mb-4">REVIEW US ON GOOGLE</h3>
            <p class="text-sm mb-4">
              If you appreciated the service we provided you and your family, please consider leaving us a five-star review on Google!
            </p>
            <button class="bg-yellow-600 text-black py-2 px-6 rounded-md hover:bg-yellow-700">
              Review Us
            </button>
          </div>
        </div>
     
        <!-- Copyright -->
        <div class="border-t border-gray-700 mt-8 pt-4">
          <p class="text-center text-sm text-gray-500">
            © 2019-2024 All rights reserved | Tributestream is a Registered Trademark
          </p>
        </div>
    </footer>
</AppShell>
