<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

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

// Function to handle the search and redirect to the results page
 
    async function handleSearch() {
            if (searchQuery.trim()) {
                // Redirect to the search results page with the query parameter
                goto(`/search?q=${encodeURIComponent(searchQuery)}`);
            }
        }
    
    const API_BASE_URL = 'https://tributestream.com/wp-json';

    function slugify(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    }
    function navigateToPage() {
        window.location.href = `https://tributestream.com/tribute-to-34243434`;
    }
    $: slugifiedName = slugify(lovedOneName);

    function isValidJWT(token) {
        if (!token) {
            console.error('Token is null or undefined');
            return false;
        }
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.error('Token does not have 3 parts:', parts.length);
            return false;
        }
        return true;
    }

    function generateRandomPassword() {
        return Math.random().toString(36).slice(-8);
    }

    async function registerUser() {
        console.log('Registering user');
        generatedPassword = generateRandomPassword();
        try {
            const response = await fetch(`${API_BASE_URL}/my-custom-plugin/v1/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: userName, email: userEmail, password: generatedPassword })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }
            const data = await response.json();
            console.log('User registered successfully:', data);
            // TODO: Send email with password to userEmail
            return data;
        } catch (err) {
            console.error('Registration error:', err);
            throw err;
        }
    }

    async function loginUser(username, password) {
        console.log('Logging in user');
        try {
            const response = await fetch(`${API_BASE_URL}/jwt-auth/v1/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }
            const data = await response.json();
            console.log('Login response:', data);
            let token = data.token || (data.data && data.data.token);
            if (!token) {
                throw new Error('Token not found in server response');
            }
            if (!isValidJWT(token)) {
                throw new Error('Received invalid token format from server');
            }
            localStorage.setItem('jwtToken', token);
            return token;
        } catch (err) {
            console.error('Login error:', err);
            throw err;
        }
    }

    async function createPage(token) {
        console.log('Creating page');
        if (!token || !isValidJWT(token)) {
            throw new Error('Invalid authentication token. Please log in again.');
        }
        try {
            const nonceResponse = await fetch(`${API_BASE_URL}/my-custom-plugin/v1/get-nonce`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const nonceData = await nonceResponse.json();
            const nonce = nonceData.nonce;

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
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data && data.page_id) {
                console.log('Page created successfully with ID:', data.page_id);
                return data.page_id;
            } else {
                throw new Error('Unexpected response format');
            }
        } catch (error) {
            console.error('Error creating page:', error);
            throw error;
        }
    }

    async function handleCreateLink() {
        console.log('Creating link');
        error = '';
        try {
            await registerUser();
            console.log('User registered');
            const token = await loginUser(userName, generatedPassword);
            console.log('User logged in with token:', token);
            const pageId = await createPage(token);

            const response = await fetch(`https://tributestream.com/wp-json/wp/v2/pages/${pageId}`);
            const page = await response.json();

            console.log('Page created:', pageId);

            console.log('Fetched page data:', page);

// Redirect to the page using the slug
if (page.slug) {
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
    

    function handleNextPage() {
        showSecondPage = true;
        isBlurred = true;

    }

    // Modify the handleFindLivestream function to use the search functionality
    async function handleFindLivestream() {
        if (lovedOneName.trim()) {
            searchQuery = lovedOneName;
            await handleSearch();
        }

    function handleEditName() {
        isEditing = true;
        tempSlugifiedName = slugifiedName;
    }

    function handleSaveNameChange() {
        slugifiedName = tempSlugifiedName;
        isEditing = false;
    }

    function handleDiscardNameChange() {
        isEditing = false;
    }

    function handleGoBack() {
        showSecondPage = false;
        isBlurred = false;
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
 <div class="flex items-center space-x-2 mb-4">
    <input
        type="text"
        placeholder="Search..."
        bind:value={searchQuery}
        class="border border-gray-300 rounded-lg p-2 w-full"
    />
    <button
        on:click={handleSearch}
        class="bg-[#D5BA7F] text-black py-2 px-4 border border-transparent rounded-lg hover:text-black hover:shadow-[0_0_10px_4px_#D5BA7F] transition-all duration-300 ease-in-out">
        Search
    </button>
</div>
<section class="relative bg-gray-900 text-white">
    <video autoplay muted loop playsinline class="absolute inset-0 w-full h-full object-cover z-0" class:blurred={isBlurred}>
        <source src="../../videos/video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
    </video>
    <div class="absolute inset-0 bg-black opacity-50 z-10"></div>  
    <div class="relative z-20 flex flex-col items-center justify-start h-screen min-w-screen pt-8">
        <h1 class="text-4xl md:text-6xl font-bold text-center mb-4">
       Tributestream
        </h1> 
   
         <p class="text-center mb-8 text-lg md:text-xl">
            {#if !showSecondPage}
            <i>Connecting with Loved Ones In Heaven and On Earth</i>
            {:else}
                Your Loved One's Custom Link:
            {/if}
        </p>
  
        <form class="w-full max-w-md">
            {#if !showSecondPage}
                <input
                    type="text"
                    placeholder="Enter Your Loved One's Name Here"
                    class="w-full px-4 py-2 text-gray-900 rounded-md mb-4 text-center"
                    bind:value={lovedOneName}
                />
                <div class="flex space-x-4 justify-center">
                    <button    on:click={handleNextPage}
                    class="bg-[#D5BA7F] text-black font-bold py-2 px-4 border border-transparent rounded-lg hover:text-black  hover:shadow-[0_0_10px_4px_#D5BA7F] transition-all duration-300 ease-in-out">
                        Create Tribute
                      </button>
                  

                      <button on:click={handleSearch} class="bg-[#D5BA7F] text-black  py-2 px-4 border border-transparent rounded-lg hover:text-black  hover:shadow-[0_0_10px_4px_#D5BA7F] transition-all duration-300 ease-in-out">
                        Search Streams
                      </button>
                </div>
            {:else}
                <div class="flex items-center justify-center mb-4">
                    <span class="text-white">http://www.Tributestream.com/celebration-of-life-for-{#if isEditing}
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
                    bind:value={userName}
                />
                <input
                    type="email"
                    placeholder="Email Address"
                    class="w-full px-4 py-2 text-gray-900 rounded-md mb-4"
                    bind:value={userEmail}
                />
                <input
                    type="tel"
                    placeholder="Phone Number"
                    class="w-full px-4 py-2 text-gray-900 rounded-md mb-4"
                    bind:value={userPhone}
                />
                <div class="flex justify-between items-center">
                    <button type="button" on:click={handleGoBack} class="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <button type="button" on:click={handleCreateLink} class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md">
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

  