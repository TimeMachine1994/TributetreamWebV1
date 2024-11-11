<!-- +index.svelte -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { goto } from '$app/navigation';
  import { userIdStore } from '$lib/stores/userStore';

  // State variables
  let lovedOneName = '';
  let fullName = '';
  let email = '';
  let phone = '';
  let error = '';
  let showSecondPage = false;
  let slugifiedName = '';
  let isEditing = false;
  let tempSlugifiedName = '';
  let isInvalid = false;

  // User ID and token management
  let userId;
  let isLoading = false;

  // Subscribe to the store to get the user ID
  userIdStore.subscribe(value => {
      userId = value;
  });

  // Get JWT Token from local storage
  function getToken() {
      return localStorage.getItem('jwtToken');
  }

  // Function to slugify the loved one's name
  function slugify(text: string): string {
      return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
  }

  // Generate random password
  function generateRandomPassword(): string {
      return Math.random().toString(36).slice(-8);
  }

  // Function to handle the first page submit and navigate to the second page
  function handleNextPage() {
      if (lovedOneName.trim()) {
          showSecondPage = true;
          slugifiedName = slugify(lovedOneName);
          error = '';
      } else {
          isInvalid = true;
          error = "Please enter your loved one's name";
          setTimeout(() => {
              isInvalid = false;
          }, 500);
      }
  }

  async function handleSubmit() {
      const password = generateRandomPassword();
      const username = email.split('@')[0];
      const pageSlug = slugify(lovedOneName);

      isLoading = true;
      try {
          // Register user
          const registerResponse = await fetch('https://wp.tributestream.com/wp-json/custom-user-registration/v1/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, email, password, meta: { full_name: fullName, loved_one_name: lovedOneName, phone: phone } })
          });
          const registerData = await registerResponse.json();

          if (registerResponse.ok) {
              userId = registerData.user_id;
              userIdStore.set(userId);

              // Login and get JWT token
              const loginResponse = await fetch('https://wp.tributestream.com/wp-json/jwt-auth/v1/token', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ username, password })
              });
              const tokenData = await loginResponse.json();
              localStorage.setItem('jwtToken', tokenData.token);

              // Update slug through API endpoint
              await updateSlug(pageSlug, userId);

              // Redirect to new celebration page
              goto(`/celebration-of-life-for-${pageSlug}`);
          } else {
              error = registerData.message;
          }
      } catch (err) {
          error = err.message;
      } finally {
          isLoading = false;
      }
  }

  async function updateSlug(slug: string, userId: number) {
      const response = await fetch('https://wp.tributestream.com/wp-json/tributestream/v1/tribute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
          body: JSON.stringify({ user_id: userId, loved_one_name: lovedOneName, slug: slug })
      });

      if (!response.ok) {
          throw new Error('Failed to create tribute');
      }

      return await response.json();
  }
</script>

<main class="overflow-hidden">
  <section class="relative bg-gray-900 text-white">
      <video autoplay muted loop playsinline class="absolute inset-0 w-full h-full object-cover z-0">
          <source src="https://pub-f5d8194fe58b4bb69fc710f4fecb334f.r2.dev/video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
      </video>
      <div class="absolute inset-0 bg-black opacity-50 z-10"></div>

      <!-- Hero Header -->
      <div class="relative z-20 flex flex-col items-center justify-start h-screen pt-8 font-['Fanwood_Text']">
          <h1 class="text-4xl md:text-6xl text-center mb-4">We Connect Families, One Link at a Time.</h1>
          <p class="text-center mb-8 text-lg md:text-xl">
              Tributestream broadcasts high-quality audio and video of your loved one's celebration of life.
          </p>

          <!-- First Page Form -->
          {#if !showSecondPage}
              <form on:submit|preventDefault={handleNextPage} class="flex flex-col items-center">
                  <input type="text" placeholder="Loved One's Name Here" class="w-full px-4 py-2 text-gray-900 rounded-md mb-4 text-center max-w-md" class:invalid-input={isInvalid} class:shake={isInvalid} bind:value={lovedOneName} />
                  {#if error}
                      <p class="text-red-500">{error}</p>
                  {/if}
                  <div class="flex space-x-4 justify-center">
                      <button type="submit" class="bg-[#D5BA7F] text-black font-bold py-2 px-4 border rounded-lg">Create Tribute</button>
                      <button type="button" on:click={() => { /* Search logic here */ }} class="bg-[#D5BA7F] text-black py-2 px-4 border rounded-lg">Search Streams</button>
                  </div>
              </form>
          {:else}
              <!-- Second Page Form -->
              <div class="text-white">Your Loved One's Custom Link:</div>
              <div class="flex items-center justify-center mb-4">
                  <span class="text-white">http://www.Tributestream.com/celebration-of-life-for-</span>
                  {#if isEditing}
                      <input type="text" class="px-2 py-1 text-gray-900 rounded-md" bind:value={tempSlugifiedName} />
                      <button class="ml-2 text-green-500" on:click={() => { slugifiedName = tempSlugifiedName; isEditing = false; }}>Save</button>
                      <button class="ml-2 text-red-500" on:click={() => { isEditing = false; }}>Cancel</button>
                  {:else}
                      <span class="text-white">{slugifiedName}</span>
                      <button class="ml-2 text-white" on:click={() => { isEditing = true; tempSlugifiedName = slugifiedName; }}>Edit</button>
                  {/if}
              </div>
              <form on:submit|preventDefault={handleSubmit} class="max-w-md mx-auto p-6 space-y-4">
                  <input id="fullName" type="text" bind:value={fullName} placeholder="Your Full Name" class="w-full px-4 py-2 rounded-md" required />
                  <input id="email" type="email" bind:value={email} placeholder="Email Address" class="w-full px-4 py-2 rounded-md" required />
                  <input id="phone" type="tel" bind:value={phone} placeholder="Phone Number" class="w-full px-4 py-2 rounded-md" required />
                  {#if error}
                      <p class="text-red-500">{error}</p>
                  {/if}
                  <div class="flex justify-between">
                      <button type="button" on:click={() => { showSecondPage = false; }} class="bg-gray-600 text-white py-2 px-4 rounded-md">Back</button>
                      <button type="submit" class="bg-[#D5BA7F] text-black font-bold py-2 px-4 rounded-lg">{isLoading ? 'Loading...' : 'See Custom Link'}</button>
                  </div>
              </form>
          {/if}
      </div>
  </section>
</main>

<style>
  /* Custom styles for animations and invalid input */
  .invalid-input {
      border: 2px solid red;
  }

  .shake {
      animation: shake 0.5s ease-in-out;
  }

  @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-10px); }
      75% { transform: translateX(10px); }
  }
</style>
