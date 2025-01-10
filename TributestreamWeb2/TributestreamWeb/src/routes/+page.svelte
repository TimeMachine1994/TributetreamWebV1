<script lang="ts">

// State variables
// State variables using $state rune
let lovedOneName = $state('adfasfd');
let userName = $state('asdfasdf');
let userEmail = $state('adfsas@gmail.com');
let userPhone = $state('407-221-5922');
let error = $state('');
let showSecondPage = $state(false);
let isEditing = $state(false);
let tempSlugifiedName = $state('');
let isBlurred = $state(false);
let isLoading = $state(false);
let nameError = $state('');
let emailError = $state('');
let phoneError = $state('');
let isInvalid = $state(false);
let slugifiedName = $derived(slugify(lovedOneName));
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
let homeSubmissionComplete = $state(false);


// Helper Functions
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function generateRandomPassword(): string {
  return Math.random().toString(36).slice(-8);
}

</script>
<!-- START video background section -->
 
    <!-- this is the black overlay to  make the white text readable on the homepage over the video -->
   <!-- END video background section -->
   <!-- START hero header text-->

   <div
   class="relative z-20 flex flex-col items-center justify-start h-screen min-w-screen pt-8 font-['Fanwood_Text']"
 >
 <h1 class="text-4xl md:text-6xl text-center mb-4">
   We Connect Families, One Link at a Time.
 </h1>

<form method="POST" class="w-full max-w-lg mx-auto p-6 bg-white/80 rounded-lg shadow-lg">
  <div class="mb-6">
    <label for="lovedOneName" class="block text-gray-700 text-sm font-bold mb-2">Loved One's Name</label>
    <input 
      type="text" 
      id="lovedOneName" 
      name="lovedOneName" 
      bind:value={lovedOneName}
      class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      placeholder="Enter your loved one's name"
      required
    />
    {#if nameError}
      <p class="text-red-500 text-xs italic">{nameError}</p>
    {/if}
  </div>

  <div class="mb-6">
    <label for="userName" class="block text-gray-700 text-sm font-bold mb-2">Your Name</label>
    <input 
      type="text" 
      id="userName" 
      name="userName"
      bind:value={userName}
      class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      placeholder="Enter your name"
      required
    />
  </div>

  <div class="mb-6">
    <label for="userEmail" class="block text-gray-700 text-sm font-bold mb-2">Your Email</label>
    <input 
      type="email" 
      id="userEmail"
      name="userEmail" 
      bind:value={userEmail}
      class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      placeholder="Enter your email"
      required
    />
    {#if emailError}
      <p class="text-red-500 text-xs italic">{emailError}</p>
    {/if}
  </div>

  <div class="mb-6">
    <label for="userPhone" class="block text-gray-700 text-sm font-bold mb-2">Your Phone Number</label>
    <input 
      type="tel" 
      id="userPhone" 
      name="userPhone"
      bind:value={userPhone}
      class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      placeholder="Enter your phone number"
      required
    />
    {#if phoneError}
      <p class="text-red-500 text-xs italic">{phoneError}</p>
    {/if}
  </div>

  <button 
    type="submit" 
    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
    disabled={isLoading}
  >
    {isLoading ? 'Loading...' : 'Submit'}
  </button>

  {#if error}
    <p class="text-red-500 text-xs italic mt-4">{error}</p>
  {/if}
</form>

 <p class="text-center mb-8 text-lg md:text-xl"></p>
 </div>
 <!-- END hero header text-->
 