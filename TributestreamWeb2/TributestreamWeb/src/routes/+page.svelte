<script lang="ts">
  import { enhance } from '$app/forms';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  console.log("Script loaded successfully");

  let formState = $state({
      active: false,
      userInfo: { name: '', email: '', phone: '' }
  });
  console.log("Initial form state:", formState);

  function toggleForm() {
      console.log("Toggling form visibility. Current state:", formState.active);
      formState.active = !formState.active;
      console.log("New form visibility state:", formState.active);
  }

  function resetForm() {
      console.log("Resetting form");
      formState.userInfo = { name: '', email: '', phone: '' };
      formState.active = false;
      console.log("Form reset. Current state:", formState);
  }

  const uuid1 = crypto.randomUUID();
  const uuid2 = crypto.randomUUID();
  console.log("Generated UUIDs:", uuid1, uuid2);

  let fullName = $state('');
  let email = $state('');
  let phone = $state('');

  let lovedOneName = $state('adfasfd');
  let userName = $state(uuid1);
  let userEmail = $state(`${crypto.randomUUID()}@gmail.com`);
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
  let homeSubmissionComplete = $state(false);
  let token = $state('');
  let user_id = $state(null);
  let status = $state({ loading: false, success: false, error: '' });

  console.log("Initial state variables initialized");

  let user = $state({
      username: '',
      email: '',
      password: '',
      loved_one_name: '',
      slug: '',
  });
  console.log("User object initialized:", user);

  function slugify(text: string): string {
      console.log("Slugifying text:", text);
      const slug = text
          .toString()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '')
          .replace(/\-\-+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '');
      console.log("Generated slug:", slug);
      return slug;
  }

  function generateRandomPassword(): string {
      const password = Math.random().toString(36).slice(-8);
      console.log("Generated random password:", password);
      return password;
  }

  function handleNextPage() {
      console.log("Navigating to second page");
      showSecondPage = true;
      isBlurred = true;
  }

  function handleEditName() {
      console.log("Enabling name edit mode");
      isEditing = true;
  }

  function handleSaveNameChange() {
      console.log("Saving name change. Temp slugified name:", tempSlugifiedName);
      isEditing = false;
  }

  function handleDiscardNameChange() {
      console.log("Discarding name change");
      isEditing = false;
  }

  function handleGoBack() {
      console.log("Navigating back to first page");
      showSecondPage = false;
      isBlurred = false;
  }

  async function handleSubmit() {
      console.log("Handling form submission. Current user data:", user);
      let isFormValid = $derived(
          user.username && user.email && user.password && user.loved_one_name && user.slug
      );

      if (!isFormValid) {
          error = 'Please fill in all required fields.';
          console.log("Form validation failed:", error);
          return;
      }

      console.log("Form is valid. Proceeding with submission...");

      let loading = $state(true);
      error = '';
      let success = $state(false);

      try {
          console.log("Sending registration request...");
          const registerResponse = await fetch('/api/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  username: user.username,
                  email: user.email,
                  password: user.password,
              }),
          });

          if (!registerResponse.ok) {
              const errorData = await registerResponse.json();
              throw new Error(errorData.message || 'Registration failed.');
          }

          const registerData = await registerResponse.json();
          console.log("Registration successful. Data:", registerData);
          user_id = registerData.id;

          console.log("Sending authentication request...");
          const authResponse = await fetch('/api/auth', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  username: user.username,
                  password: user.password,
              }),
          });

          if (!authResponse.ok) {
              const errorData = await authResponse.json();
              throw new Error(errorData.message || 'Authentication failed.');
          }

          const authData = await authResponse.json();
          console.log("Authentication successful. Token:", authData.token);
          token = authData.token;

          console.log("Creating tribute...");
          const tributeResponse = await fetch('/api/create-page', {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  user_id,
                  loved_one_name: user.loved_one_name,
                  slug: user.slug,
              }),
          });

          if (!tributeResponse.ok) {
              const errorData = await tributeResponse.json();
              throw new Error(errorData.message || 'Creating tribute failed.');
          }

          const tributeData = await tributeResponse.json();
          console.log("Tribute created successfully. Data:", tributeData);

          success = true;
      } catch (err) {
          console.error("Error during submission:", err.message);
          error = err.message;
      } finally {
          loading = false;
          console.log("Submission process completed");
      }
  }
</script>



<style>
  @import url('https://fonts.googleapis.com/css2?family=Harrington');

/* Container for the bordered box */
.box {
display: flex;
justify-content: center;
align-items: center;
width: 55px; /* Adjust to your desired size */
height: 55px; /* Adjust to your desired size */
border: 3px solid white; /* Thick border to match the image */
position: relative;
}

/* Stylized Letter T */
.letter {
font-size: 45px; /* Large font size */
font-family: 'Harrington', serif;
/* Bold for the thickness of the letter */
color: white; /* Black color for the letter */
line-height: 1; /* Ensures the letter is centered vertically */
transform: scaleX(1.36726); /* Stretch the text by 136.726% */

}

.glow-button {
background-color: #d4b075; /* Darker gold color */
border: 2px solid #fff; /* White border */
color: #000; /* Text color */
padding: 10px 20px;
font-size: 16px;
font-family: 'Times New Roman', serif; /* Adjust font if needed */
text-align: center;
text-decoration: none;
display: inline-block;
cursor: pointer;
transition: all 0.3s ease;
box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); /* Subtle shadow for depth */
outline: none;
}

.glow-button:hover {
background-color: #f0c75e; /* Brighter gold color on hover */
color: #000; /* Maintain text color */
box-shadow: 0 0 20px #f0c75e, 0 0 30px #f0c75e, 0 0 40px #f0c75e; /* Glowing effect */
border-color: #f0c75e; /* Border glows too */
}

.glow-button:focus {
outline: none;
}

.blurred {
    filter: blur(10px);
    transition: filter 0.3s ease-in-out;
}

</style>

<main> 

<section class="relative bg-gray-900 text-white">
<video autoplay muted loop playsinline class="absolute inset-0 w-full h-full object-cover z-0" class:blurred={isBlurred}>
  <source src="https://209.74.64.181:12091/down/FCymVumu4aQG.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>
<div class="absolute inset-0 bg-black opacity-50 z-10"></div>  

<div class="relative z-20 flex flex-col items-center justify-start h-screen min-w-screen pt-8 font-['Fanwood_Text']">
  <h1 class="text-4xl md:text-6xl text-center mb-4 ">
  We Make Hearts Full Again
  </h1> 
  <p class="text-center mb-8 text-lg md:text-xl">
    {#if !showSecondPage}
      Tributestream broadcasts high quality audio and video of your loved one's celebartion of life. <br> 
      Enter your loved ones name below to begin your journey with Tributestream. 
      <!--Tributestream brings together your families tesitmony of love into one neat package. <br> <i>
      Tributestream brings closure now.<br> A window to the past, to which we all avow. <br>
      Relearn powerful lessons time can't dim,<br>
      and embrace the love that flows from within.
      </i>-->           
    {:else}
        Your Loved One's Custom Link:
    {/if}
    </p>

    <form class="w-full max-w-md">
      {#if !showSecondPage}
        <input
          type="text"
          placeholder="Loved One's Name Here"
          class="w-full px-4 py-2 text-gray-900 rounded-md mb-4 text-center"
          bind:value={lovedOneName}
        />
        <div class="flex space-x-4 justify-center">
          <button onclick={handleNextPage}
            class="bg-[#D5BA7F] text-black font-bold py-2 px-4 border border-transparent rounded-lg hover:text-black  hover:shadow-[0_0_10px_4px_#D5BA7F] transition-all duration-300 ease-in-out">
            Create Tribute
          </button>
          <button
            onclick={() => {
              handleSearch();
              showSecondPage = true;
            }}
            class="bg-[#D5BA7F] text-black py-2 px-4 border border-transparent rounded-lg hover:text-black hover:shadow-[0_0_10px_4px_#D5BA7F] transition-all duration-300 ease-in-out">
            Search Streams
          </button> 
        </div>
      {:else}
            <div class="flex items-center justify-center mb-4">
                <span class="text-white">http://www.tributestream.com/celebration-of-life-for-{#if isEditing}
                    <input
                        type="text"
                        class="px-2 py-1 text-gray-900 rounded-md"
                        bind:value={tempSlugifiedName}
                    />
                {:else}
                    <span class="text-white">{slugifiedName}</span>
                {/if}</span>
                {#if isEditing}
                    <button class="ml-2 text-green-500" onclick={handleSaveNameChange}>
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="ml-2 text-red-500" onclick={handleDiscardNameChange}>
                        <i class="fas fa-times"></i>
                    </button>
                {:else}
                    <button class="ml-2 text-white" onclick={handleEditName}>
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                {/if}
            </div>
            <input
                type="text"
                placeholder="Your Name"
                class="w-full px-4 py-2 text-gray-900 rounded-md mb-4"
                bind:value={fullName}
            />
            <input
                type="email"
                placeholder="Email Address"
                class="w-full px-4 py-2 text-gray-900 rounded-md mb-4"
                bind:value={email}
            />
            <input
                type="tel"
                placeholder="Phone Number"
                class="w-full px-4 py-2 text-gray-900 rounded-md mb-4"
                bind:value={phone}
            />
            <div class="flex justify-between items-center">
                <button type="button" onclick={handleGoBack} class="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <button type="button" onclick={handleSubmit} class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md">
                    Create Tribute
                </button>
            </div>
        {/if}
    </form>
   
    {#if error}
        <p class="text-red-500 mt-4">{error}</p>
    {/if}
    
    </div>
    <div class="box">
        <div class="letter">T</div>
    </div>
    </section>


</main>

