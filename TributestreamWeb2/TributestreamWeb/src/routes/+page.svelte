<script lang="ts">
  
  //*************/ START import statements and variables /**************/
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  // State variables
  let lovedOneName = '';
  let userName = '';
  let userEmail = '';
  let userPhone = '';
  let error = '';
  let showSecondPage = false;
  let slugifiedName = '';
  let isEditing = false;
  let tempSlugifiedName = '';
  let isBlurred = false;
  let isLoading = false; // New variable to track the loading state
  let nameError = '';
  let emailError = '';
  let phoneError = '';

  // API base URL
  const API_BASE_URL = 'https://tributestream.com/wp-json';

  //*************/ END import statements and variables /**************/

  //*************/ START slugify text /**************/

  // Function to slugify text
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

  // Reactive statement to update slugifiedName when lovedOneName changes
  $: slugifiedName = slugify(lovedOneName);


  //*************/ END slugify text /**************/


  //*************/ START generate password and validate JWT token function and register user function /**************/

  // Function to generate a random password
  function generateRandomPassword(): string {
    return Math.random().toString(36).slice(-8);
  }

  // Function to validate JWT token
  function isValidJWT(token: string): boolean {
    return token && token.split('.').length === 3;
  } 
//*************/  START register user  /*************/

//Function to register a user
  async function registerUser(): Promise<string> {
    const generatedPassword = generateRandomPassword();
    try {
      const response = await fetch(`${API_BASE_URL}/my-custom-plugin/v1/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userName, email: userEmail, password: generatedPassword }),
        mode: 'cors',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      // Send registration email
      await sendRegistrationEmail(userName, userEmail, generatedPassword);
      return generatedPassword;
    } catch (err) {
      error = 'Registration failed';
      throw err;
    }
  }

  // Function to send a registration email
  async function sendRegistrationEmail(username: string, email: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/my-custom-plugin/v1/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
        mode: 'cors',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send email');
      }
      return await response.json();
    } catch (err) {
      error = 'Failed to send email';
      throw err;
    }
  }

  // Function to log in a user
  async function loginUser(username: string, password: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/jwt-auth/v1/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      const data = await response.json();
      const token = data.token || (data.data && data.data.token);
      if (!token || !isValidJWT(token)) {
        throw new Error('Invalid token received');
      }
      localStorage.setItem('jwtToken', token);
      return token;
    } catch (err) {
      error = 'Login failed';
      throw err;
    }
  }

  //*************/ END generate password and validate JWT token function /**************/

//*************/ START generate user name /**************/

 // Function to generate username from full name
 function generateUserName(fullName: string): string {
    const nameParts = fullName.trim().split(/\s+/);  // Split the full name by spaces
    if (nameParts.length >= 2) {
      const lastName = nameParts[nameParts.length - 1]; // Last word is assumed to be the last name
      const firstInitial = nameParts[0][0];            // First initial of the first word
      return `${lastName}${firstInitial}`.toLowerCase();  // Combine them and convert to lowercase
    }
    return '';  // Return empty if the name doesn't have at least two words
  }

  // Function to check if username exists on the server
  async function checkUserNameAvailability(userName: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/my-custom-plugin/v1/check-username?username=${userName}`);
      const data = await response.json();
      
      // If the username exists, append an iterative number (_1, _2, etc.)
      if (data.exists) {
        let suffix = 1;
        let newUserName = `${userName}_${suffix}`;

        // Keep checking for availability until we find a unique username
        while (await doesUsernameExist(newUserName)) {
          suffix++;
          newUserName = `${userName}_${suffix}`;
        }

        return newUserName;
      }

      return userName;  // If the username is available, return it
    } catch (err) {
      console.error("Error checking username availability", err);
      return userName;  // Fallback to original username in case of an error
    }
  }

  // Helper function to check username existence (used in the loop)
  async function doesUsernameExist(userName: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/my-custom-plugin/v1/check-username?username=${userName}`);
    const data = await response.json();
    return data.exists;
  }

  // Reactive statement to update username when fullName changes
  $: if (fullName) {
    const generatedName = generateUserName(fullName);
    if (generatedName) {
      checkUserNameAvailability(generatedName).then((availableUserName) => {
        userName = availableUserName;
      });
    }
  }

//*************/ END generate user name /**************/


  //*************/ START handle serarch and redirect to the results page /**************/

  // Function to handle the search and redirect to the results page
  function handleSearch() {
    if (lovedOneName.trim()) {
      goto(`/search?q=${encodeURIComponent(lovedOneName)}`);
    }
  }
  
  //*************/ END handle search and redirect to the results page /**************/

  //*************/ START create page and link /**************/


  // Function to create a page
  async function createPage(token: string): Promise<number> {
    if (!isValidJWT(token)) {
      throw new Error('Invalid authentication token. Please log in again.');
    }
    try {
      // Fetch nonce
      const nonceResponse = await fetch(`${API_BASE_URL}/my-custom-plugin/v1/get-nonce`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const nonceData = await nonceResponse.json();
      const nonce = nonceData.nonce;

      // Create page
      const response = await fetch(`${API_BASE_URL}/my-custom-plugin/v1/create-page`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-WP-Nonce': nonce,
        },
        body: JSON.stringify({
          title: lovedOneName,
          content: `This is a tribute page for ${lovedOneName}`,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.page_id) {
        return data.page_id;
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (err) {
      error = 'Error creating page';
      throw err;
    }
  }

  // Function to handle creating a link
  async function handleCreateLink() {
  // Reset error states
  nameError = '';
  emailError = '';
  phoneError = '';
  error = '';  // General error message

  // Validate form fields before submission
  if (!validateFields()) {
    // Trigger shake animation for invalid fields
    setTimeout(() => {
      nameError = emailError = phoneError = '';  // Clear individual field errors
      setTimeout(() => {
        validateFields();  // Revalidate to show errors
      }, 10);
    }, 0);
    return;
  }

  isLoading = true; // Set loading state to true while processing
  try {
    const password = await registerUser();  // Register the user
    const token = await loginUser(userName, password);  // Log the user in and get token
    const pageId = await createPage(token);  // Create the tribute page

    // Fetch created page data
    const response = await fetch(`${API_BASE_URL}/wp/v2/pages/${pageId}`);
    const page = await response.json();

    // Redirect to the page using the slug
    if (page.slug) {
      window.location.href = `https://tributestream.com/${page.slug}`;
    } else {
      error = 'Slug not found';  // Set general error if slug is not found
    }

  } catch (err) {
    // Parse specific errors and display meaningful messages
    if (err.message && err.message.includes('email')) {
      emailError = 'This email is already registered. Please use another email or log in.';
    } else if (err.message && err.message.includes('username')) {
      nameError = 'This username is already taken. Please choose another username.';
    } else {
      // Fallback for generic errors
      error = err.message || 'An error occurred while creating the link';
    }
  } finally {
    isLoading = false;  // Set loading state to false after processing
  }
}


  //*************/ END create page and link /**************/

  
  //*************/ START handle form data input /**************/

  // Function to handle moving to the next page
  let isInvalid = false;

function handleNextPage() {
  if (lovedOneName.trim()) {
    showSecondPage = true;
    isBlurred = true;
    isInvalid = false;
    error = '';
  } else {
    isInvalid = true;
    error = "Please enter your loved one's name";
    // Trigger shake animation
    setTimeout(() => {
      isInvalid = false;
      setTimeout(() => {
        isInvalid = true;
      }, 10);
    }, 0);
  }
}


  // Function to handle editing the name
  function handleEditName() {
    isEditing = true;
    tempSlugifiedName = slugifiedName;
  }

  // Function to handle saving the name change
  function handleSaveNameChange() {
    slugifiedName = tempSlugifiedName;
    isEditing = false;
  }

  // Function to handle discarding the name change
  function handleDiscardNameChange() {
    isEditing = false;
  }

  // Function to handle going back to the first page
  function handleGoBack() {
    showSecondPage = false;
    isBlurred = false;
  }
    //*************/ END handle form data input/**************/

    function validateFields() {
  let isValid = true;

  if (!userName.trim()) {
    nameError = 'Please enter your name';
    isValid = false;
  } else {
    nameError = '';
  }

  if (!userEmail.trim()) {
    emailError = 'Please enter your email address';
    isValid = false;
  } else {
    emailError = '';
  }

  if (!userPhone.trim()) {
    phoneError = 'Please enter your phone number';
    isValid = false;
  } else {
    phoneError = '';
  }

  return isValid;
}



  // Lifecycle hook
  onMount(() => {
    // Component mounted
  });


</script>


<style>

  /************* START Custom CSS for the first page - Glow button and old stuff (box an letter but we'll keep it for now.) /**************/

  @import url('https://fonts.googleapis.com/css2?family=Harrington');

  /* Container for the bordered box */
  .box {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 55px;
    height: 55px;
    border: 3px solid white;
    position: relative;
  }

  /* Stylized Letter T */
  .letter {
    font-size: 45px;
    font-family: 'Harrington', serif;
    color: white;
    line-height: 1;
    transform: scaleX(1.36726);
  }

  .glow-button {
    background-color: #d4b075;
    border: 2px solid #fff;
    color: #000;
    padding: 10px 20px;
    font-size: 16px;
    font-family: 'Times New Roman', serif;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    outline: none;
  }

  .glow-button:hover {
    background-color: #f0c75e;
    color: #000;
    box-shadow: 0 0 20px #f0c75e, 0 0 30px #f0c75e, 0 0 40px #f0c75e;
    border-color: #f0c75e;
  }

  .glow-button:focus {
    outline: none;
  }

  .blurred {
    filter: blur(10px);
    transition: filter 0.3s ease-in-out;
  }

  /************* STOP Custom CSS for the first page - Glow button, blur background, and some old stuff (box and letter but we'll keep it for now.) /**************/
  .spinner-border {
  width: 30px;
  height: 30px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #D5BA7F;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }

  .shake {
    animation: shake 0.5s ease-in-out;
  }

  .invalid-input {
    border: 2px solid red;
  }
</style>
<!-- START video background section -->
<main class="overflow-hidden">
  <section class="relative bg-gray-900 text-white overf">
    <video
    autoplay
    muted
    loop
    playsinline
    class="absolute inset-0 w-full h-full object-cover z-0"
    class:blurred={isBlurred}
    >
      <source
        src="https://pub-f5d8194fe58b4bb69fc710f4fecb334f.r2.dev/video.mp4"
        type="video/mp4"
        />


     Your browser does not support the video tag.
    </video>
    <!-- this is the black overlay to  make the white text readable on the homepage over the video -->
    <div class="absolute inset-0 bg-black opacity-50 z-10"></div>
  <!-- END video background section -->


  <!-- START hero header text-->

  <div
    class="relative z-20 flex flex-col items-center justify-start h-screen min-w-screen pt-8 font-['Fanwood_Text']"
  >
  <h1 class="text-4xl md:text-6xl text-center mb-4">
    We Connect Families, One Link at a Time.
  </h1>

  <p class="text-center mb-8 text-lg md:text-xl">
  <!-- END hero header text-->



  <!-- START first page -->
  {#if !showSecondPage}
  <form on:submit|preventDefault={handleNextPage}> 
    <div class="flex flex-col items-center justify-center mb-4 ">
    Tributestream broadcasts high quality audio and video of your loved
    one's celebration of life. <br />
    Enter your loved one's name below to begin your journey with
    Tributestream.
  </div>
  <input
  type="text"
  placeholder="Loved One's Name Here"
  class="w-full px-4 py-2 text-gray-900 rounded-md mb-4 text-center max-w-md"
  class:invalid-input={isInvalid}
  class:shake={isInvalid}
  bind:value={lovedOneName}
/>
{#if error}
<p class="error-text">{error}</p>
{/if}
  <div class="flex space-x-4 justify-center">
    <button type="submit"
      class="bg-[#D5BA7F] text-black font-bold py-2 px-4 border border-transparent rounded-lg hover:text-black hover:shadow-[0_0_10px_4px_#D5BA7F] transition-all duration-300 ease-in-out"
      >
      Create Tribute
    </button>
    <button
      on:click={() => {
      handleSearch();
      showSecondPage = true;
      }}
      class="bg-[#D5BA7F] text-black py-2 px-4 border border-transparent rounded-lg hover:text-black hover:shadow-[0_0_10px_4px_#D5BA7F] transition-all duration-300 ease-in-out"
      >
      Search Streams
      </button>
    </div>
  </form>
  <!-- END first page -->

  {:else}

      <!-- START second page -->
    <div class=""> Your Loved One's Custom Link:</div>
    <div class="flex items-center justify-center mb-4">
      <span class="text-white">
        http://www.Tributestream.com/celebration-of-life-for-
      </span>
        {#if isEditing}
           <input
            type="text"
            class="px-2 py-1 text-gray-900 rounded-md"
            bind:value={tempSlugifiedName}
          />          
 
        {:else}
          <span class="text-white">{slugifiedName}</span>
        {/if}
        {#if isEditing}
        

          <button class="ml-2 text-green-500" on:click={handleSaveNameChange}>
            <i class="fas fa-check"></i>
          </button>
          <button class="ml-2 text-red-500" on:click={handleDiscardNameChange}>
            <i class="fas fa-times"></i>
          </button>
 
        {:else}
 
          <button class="ml-2 text-white" on:click={handleEditName}>
            <i class="fas fa-pencil-alt"></i>
          </button>
 
        {/if}
 
      </div>
      <input
      type="text"
      placeholder="Your Full Name"
      class="w-full px-4 py-2 text-gray-900 rounded-md mb-4"
      class:invalid-input={nameError}
      class:shake={nameError}
      bind:value={fullName}
    />
    {#if nameError}
       <p class="error-text">{nameError}</p>
    {/if}
    
    <input
      type="email"
      placeholder="Email Address"
      class="w-full px-4 py-2 text-gray-900 rounded-md mb-4"
      class:invalid-input={emailError}
      class:shake={emailError}
      bind:value={userEmail}
    />
    {#if emailError}
       <p class="error-text">{emailError}</p>
    {/if}
    
    <input
      type="tel"
      placeholder="Phone Number"
      class="w-full px-4 py-2 text-gray-900 rounded-md mb-4"
      class:invalid-input={phoneError}
      class:shake={phoneError}
      bind:value={userPhone}
    />
    {#if phoneError}
    <p class="error-text">{phoneError}</p>
    {/if}
      <div class="flex justify-between items-center">
        <button
          type="button"
          on:click={handleGoBack}
          class="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md"
        >
          <i class="fas fa-arrow-left"></i>
        </button>
 
        <!-- Conditionally show the throbber or the button -->
        
           <button
            type="button"
            on:click={handleCreateLink}
            class="bg-[#D5BA7F] text-black font-bold py-2 px-4 border border-transparent rounded-lg hover:text-black hover:shadow-[0_0_10px_4px_#D5BA7F] transition-all duration-300 ease-in-out"
          >
            See Custom Link
          </button>
 
       </div>
  
      {#if error}
        <p class="text-red-500 mt-4">{error}</p>
      {/if}
    {/if}
 



</section>
</main>  