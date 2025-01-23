// src/login/+page.svelte
<script>

///Main Stores

   // Declare reactive state variables using $state
let livestreamAtFuneralHome = $state(null); // Reactive variable for whether the livestream is at a funeral home
let selectedPackage = $state(''); // Reactive variable for the selected package
let additionalLocations = $state({ secondAddress: false, thirdAddress: false }); // Reactive object for additional locations
let livestreamDuration = $state(2); // Default duration for the livestream
let masterPrice = $state(0); // Reactive variable for the base price of the selected package
let urlFriendlyText = $state("your_loved_ones_name_here"); // Reactive variable for URL-friendly text
// Reactive object to store form data
let formData = $state({
    lovedOnesName: '',
    livestreamDate: '',
    yourName: '',
    email: '',
    phoneNumber: '',
    secondAddress: '',
    thirdAddress: ''
});
import { enhance } from '$app/forms';
let { form } = $props();




// Auto-filled credentials for demo
let username = $state('admints');
let password = $state('WorldOfTribute!!123$$$@');
</script>

<div class="flex min-h-screen items-center justify-center">
  <div class="w-full max-w-md bg-white rounded-lg shadow-md p-8">
    <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>
    
    <form method="POST" use:enhance>
      {#if form?.error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {form.error}
        </div>
      {/if}
      
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          bind:value={username}
          class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div class="mb-6">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          bind:value={password}
          class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <button
        type="submit"
        class="w-full bg-[#D5BA7F] text-black font-bold py-2 px-4 border border-transparent rounded-lg hover:text-black hover:shadow-[0_0_10px_4px_#D5BA7F] transition-all duration-300 ease-in-out mb-4"
      >
        Log In
      </button>
    </form>

    <div class="text-center mt-4">
      <a 
        href="/forgot-password" 
        class="text-black hover:text-[#D5BA7F] transition-all duration-300 ease-in-out text-sm"
      >
        Forgot Password?
      </a>
    </div>
  </div>
</div>
