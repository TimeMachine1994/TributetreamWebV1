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

    const API_BASE_URL = 'https://tributestream.com/wp-json';

    function slugify(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
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
                    title: `Tribute to ${lovedOneName}`,
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
            console.log('Page created:', pageId);
            window.location.href = `https://tributestream.com/tribute/${pageId}`;
        } catch (err) {
            console.error('Process error:', err);
            // Error handling remains the same
        }
    }

    function handleNextPage() {
        showSecondPage = true;
    }

    async function handleFindLivestream() {
        // Implement the logic to find an existing livestream
        console.log('Finding livestream for:', lovedOneName);
        // This is a placeholder. You'll need to implement the actual logic to find a livestream.
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
    }
</script>

<section class="relative bg-gray-900 text-white">
    <video autoplay muted loop playsinline class="absolute inset-0 w-full h-full object-cover z-0">
        <source src="../../videos/video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
    </video>

    <div class="absolute inset-0 bg-black opacity-50 z-10"></div>

    <div class="relative z-20 flex flex-col items-center justify-center h-screen min-w-screen">
        <h1 class="text-4xl md:text-6xl font-bold text-center mb-4">
            Tributestream
        </h1>
        <h2>Celebrating loved ones through time and space.</h2>
        <br>
       
        <p class="text-center mb-8 text-lg md:text-xl">
            {#if !showSecondPage}
                Please enter your loved ones' name below to find or create a livestream.
            {:else}
                Your Loved Ones' Custom Link:
            {/if}
        </p>
       
        <form class="w-full max-w-md">
            {#if !showSecondPage}
                <input
                    type="text"
                    placeholder="Enter loved ones' name"
                    class="w-full px-4 py-2 text-gray-900 rounded-md mb-4"
                    bind:value={lovedOneName}
                />
                <div class="flex space-x-4 justify-center">
                    <button type="button" on:click={handleNextPage} class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md">
                        Next
                    </button>
                    <button type="button" on:click={handleFindLivestream} class="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-md">
                        Find Livestream
                    </button>
                </div>
            {:else}
                <div class="flex items-center justify-center mb-4">
                    <span class="text-white">http://www.Tributestream.com/{#if isEditing}
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
</section>
