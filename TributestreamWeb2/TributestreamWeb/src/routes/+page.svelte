<script lang="ts">
 
 

  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  // State variables
  let generatedPassword = '';
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
  let searchQuery = '';
  let shouldSearch = false;
  let fullName = '';
  let email = '';
  let phone = '';
  import { userIdStore } from '$lib/stores/userStore'; // Import the store

  let userId;


    // Subscribe to the store to get the user ID
      userIdStore.subscribe(value => {
        console.log('User ID from store:', value);
        userId = value;
    });

    function getToken() {
      return localStorage.getItem('jwtToken');
    }
  
  // Function to slugify text
  function slugify(text) {
    console.log('Slugifying text:', text);
    const slugified = text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
    console.log('Slugified result:', slugified);
    return slugified;
  }
  
  // Function to generate a random password
  function generateRandomPassword() {
    const password = Math.random().toString(36).slice(-8);
    console.log('Generated random password:', password);
    return password;
  }
  


  // API base URL
  const API_BASE_URL = 'https://wp.tributestream.com/wp-json';
  
  // Function to handle the search and redirect to the results page
  async function handleSearch() {
    console.log('handleSearch called with lovedOneName:', lovedOneName);
    if (lovedOneName.trim()) {
      console.log('Redirecting to search page with query:', lovedOneName);
      goto(`/search?q=${encodeURIComponent(lovedOneName)}`);
    } else {
      console.log('lovedOneName is empty, not redirecting');
    }
  }
  

   
  // Reactive statement to update slugifiedName when lovedOneName changes
  $: {
    console.log('lovedOneName changed:', lovedOneName);
    slugifiedName = slugify(lovedOneName);
    console.log('Updated slugifiedName:', slugifiedName);
  }
  
  // Function to validate JWT token
  function isValidJWT(token) {
    console.log('Validating JWT token');
    if (!token) {
      console.error('Token is null or undefined');
      return false;
    }
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Token does not have 3 parts:', parts.length);
      return false;
    }
    console.log('JWT token is valid');
    return true;
  }
  



// Function to call the WordPress plugin endpoint to send an email
async function sendRegistrationEmail(username, email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/my-custom-plugin/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        email: email,
        password: password
      }),
      mode: 'cors', // Ensure CORS is handled
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send email');
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
  }
}


  // Function to register a user
  async function registerUser() {
    console.log('Registering user');
    generatedPassword = generateRandomPassword();
    try {
      console.log('Sending registration request for:', userName, userEmail);
      const response = await fetch(`${API_BASE_URL}/my-custom-plugin/v1/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userName, email: userEmail, password: generatedPassword }),
        mode: 'cors'

      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Registration failed:', errorData);
        throw new Error(errorData.message || 'Registration failed');
      }
      const data = await response.json();
      console.log('User registered successfully:', data);

       
      return data;
    } catch (err) {
      console.error('Registration error:', err);
      throw err;
    } 
  }
  
  // Function to log in a user
  export async function loginUser(username, password) {
    console.log('Logging in user:', username);
    try {
      const response = await fetch(`${API_BASE_URL}/jwt-auth/v1/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login failed:', errorData);
        throw new Error(errorData.message || 'Login failed');
      }
      const data = await response.json();
      console.log('Login response:', data);
      let token = data.token || (data.data && data.data.token);
      if (!token) {
        console.error('Token not found in server response');
        throw new Error('Token not found in server response');
      }
      if (!isValidJWT(token)) {
        console.error('Received invalid token format from server');
        throw new Error('Received invalid token format from server');
      }
      console.log('Storing JWT token in localStorage');
      localStorage.setItem('jwtToken', token);
      return token;
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  }
  
  // Function to create a page
  async function createPage(token) {
    console.log('Creating page');
    if (!token || !isValidJWT(token)) {
      console.error('Invalid authentication token');
      throw new Error('Invalid authentication token. Please log in again.');
    }
    try {
      console.log('Fetching nonce');
      const nonceResponse = await fetch(`${API_BASE_URL}/my-custom-plugin/v1/get-nonce`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const nonceData = await nonceResponse.json();
      const nonce = nonceData.nonce;
      console.log('Nonce received:', nonce);
  
      console.log('Creating page for:', lovedOneName);
      const response = await fetch(`${API_BASE_URL}/my-custom-plugin/v1/create-page`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-WP-Nonce': nonce
        },
        body: JSON.stringify({
          title: `${lovedOneName}`,
          content: `This is a tribute page for ${lovedOneName}`,
        })
      });
      if (!response.ok) {
        console.error('HTTP error when creating page:', response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.page_id) {
        console.log('Page created successfully with ID:', data.page_id);
        return data.page_id;
      } else {
        console.error('Unexpected response format:', data);
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error creating page:', error);
      throw error;
    }
  }
  async function handleSubmit() {
      const password = generateRandomPassword();
      const username = email.split('@')[0];
      const pageSlug = slugify(lovedOneName);
  
      try {
        // Register user
        const registerResponse = await fetch('https://wp.tributestream.com/wp-json/custom-user-registration/v1/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            email,
            password,
            meta: {
              full_name: fullName,
              loved_one_name: lovedOneName,
              phone: phone
            }
          })
        });
        const registerData = await registerResponse.json();

        if (registerResponse.ok) {
        userId = registerData.user_id;
        console.log('Registered User ID:', userId);

        // Update the store with the user ID
                userIdStore.set(userId);
            } else {
                console.error('Registration failed:', registerData.message);
            }
        
        // Login and get JWT token
        const loginResponse = await fetch('https://wp.tributestream.com/wp-json/jwt-auth/v1/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
  
        const tokenData = await loginResponse.json();
        localStorage.setItem('jwtToken', tokenData.token);
  
        // Update slug through API endpoint
        const updateData = await updateSlug(pageSlug, userId);
        if (updateData.success) {
          console.log('Page slug successfully added:', pageSlug);
        } else {
          throw new Error(updateData.message || 'Failed to update slug');
        }
  
        // Redirect to new celebration page
        goto(`/celebration-of-life-for-${pageSlug}`);
      } catch (err) {
        error = err.message;
      }
    }
    function getUserId() {
    const token = getToken();
    if (!token) return null;
    
    // Decode the JWT token (it's base64 encoded)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    console.log('Decoded JWT Payload:', payload);

    return payload.user_id;
}
async function updateSlug(slug: string, userId: number): Promise<{ message: string, success?: boolean, tribute?: any }> {
    try {
        console.log('JWT Token:', getToken());
        
        const response = await fetch('https://wp.tributestream.com/wp-json/tributestream/v1/tribute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                user_id: userId,
                loved_one_name: lovedOneName,
                slug: slug
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create tribute');
        }

        const result = await response.json();
        console.log('Server response:', result);

        return { 
            message: result.message,
            success: true,
            tribute: {
                id: result.id
            }
        };
    } catch (error) {
        console.error('Error creating tribute:', error);
        return { message: 'Error creating tribute', success: false };
    }
}

  // Function to handle creating a link
  async function handleCreateLink() {
    console.log('Creating link');
    error = '';
    try {
      await registerUser();
      console.log('User registered');

          // Send registration email
      await sendRegistrationEmail(userName, userEmail, generatedPassword);
      console.log('Registration email sent');

      const token = await loginUser(userName, generatedPassword);
      console.log('User logged in with token:', token);
      const pageId = await createPage(token);
  
      console.log('Fetching created page data');
      const response = await fetch(`https://tributestream.com/wp-json/wp/v2/pages/${pageId}`);
      const page = await response.json();
  
      console.log('Page created:', pageId);
      console.log('Fetched page data:', page);
    
      // Redirect to the page using the slug
      if (page.slug) {
        console.log('Redirecting to:', `https://tributestream.com/${page.slug}`);
        window.location.href = `https://tributestream.com/${page.slug}`;
      } else {
        console.error('Slug not found in page data');
        error = 'Slug not found';
      }
    } catch (err) {
      console.error('Error in handleCreateLink:', err);
      error = 'An error occurred while creating the link';
    }
  }
  
  // Function to handle moving to the next page
  function handleNextPage() {
    console.log('Moving to second page');
    showSecondPage = true;
    isBlurred = true;
  }
  
  // Function to handle editing the name
  function handleEditName() {
    console.log('Editing name');
    isEditing = true;
    tempSlugifiedName = slugifiedName;
  }
  
  // Function to handle saving the name change
  function handleSaveNameChange() {
    console.log('Saving name change');
    slugifiedName = tempSlugifiedName;
    isEditing = false;
  }
  
  // Function to handle discarding the name change
  function handleDiscardNameChange() {
    console.log('Discarding name change');
    isEditing = false;
  }
  
  // Function to handle going back to the first page
  function handleGoBack() {
    console.log('Going back to first page');
    showSecondPage = false;
    isBlurred = false;
  }
  
  // Lifecycle hook
  onMount(() => {
    console.log('Component mounted');
  });



// Example usage: sendEmail('testuser', 'test@example.com', 'password123');



  // Add a new function to send the registration email
//   async function sendRegistrationEmail(username, email, password) {
// try {
//   const response = await fetch(`${API_BASE_URL}/my-custom-plugin/v1/register`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ username: username, email: email, password: password }), // Use the parameters here
//     credentials: 'include', // Include credentials like cookies if needed
//     mode: 'cors' // Ensure CORS is handled
//   });

//   // Handle the response
//   if (!response.ok) {
//     throw new Error('Failed to send registration email');
//   }

//   const result = await response.json();
//   console.log('Registration email sent:', result);
// } catch (error) {
//   console.error('Error sending registration email:', error);
//   // }
// }

  </script>
  
  <!-- The rest of your HTML remains unchanged -->
  
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
                  <button    on:click={handleNextPage}
                  class="bg-[#D5BA7F] text-black font-bold py-2 px-4 border border-transparent rounded-lg hover:text-black  hover:shadow-[0_0_10px_4px_#D5BA7F] transition-all duration-300 ease-in-out">
                      Create Tribute
                    </button>
                

                    <button
                                        on:click={() => {
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
                  <button type="button" on:click={handleGoBack} class="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md">
                      <i class="fas fa-arrow-left"></i>
                  </button>
                  <button type="button" on:click={handleSubmit} class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md">
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