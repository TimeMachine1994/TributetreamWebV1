<script lang="ts">
    import { error } from '@sveltejs/kit';
    import { goto } from '$app/navigation';
    import type { Tribute } from '../types/tribute';

    // Error and UI state
    let userError = $state('');
    let searchResults = $state<Tribute[]>([]);
    let isSearching = $state(false);
    let showResults = $state(false);

    let userInfo = $state({
        name: '',
        email: '',
        phone: '',
    });
    let lovedOneName = $state('');
    let slugifiedName = $state('');
    let isBlurred = $state(false);
    let tempNameChange = $state('');
    let isEditing = $state(false);
    let showSecondForm = $state(false);
    const uuid1 = crypto.randomUUID();
    const uuid2 = crypto.randomUUID(); 

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
        slugifiedName = slug;
        return slug;
    }

    // Handle next page button click
    function handleNextPage() {
        if (lovedOneName.trim() === '') {
            userError = 'Please enter a valid name';
            return;
        }
        slugifiedName = slugify(lovedOneName);
        showSecondForm = true;
    }

    // Save edited name
    function editNameSave() {
        if (tempNameChange.trim() === '') {
            userError = 'Name cannot be empty';
            return;
        }
        slugifiedName = slugify(tempNameChange);
        isEditing = false;
        lovedOneName = tempNameChange;
    }

    // Cancel edit
    function editNameCancel() {
        isEditing = false;
        tempNameChange = '';
    }

    // Edit name (toggle to editing mode)
    function editName() {
        tempNameChange = lovedOneName;
        isEditing = true;
    }

    // Handle back navigation
    function handleGoBack() {
        showSecondForm = false;
    }

    // Handle search
    async function handleSearch() {
        if (!lovedOneName.trim()) {
            searchResults = [];
            return;
        }
        isSearching = true;
        showResults = true;
        try {
            const response = await fetch(`/api/tributestream/v1/all-tributes?search=${encodeURIComponent(lovedOneName)}`);
            if (response.ok) {
                const data = await response.json();
                searchResults = data.tributes || [];
            }
        } catch (err) {
            console.error('Search error:', err);
            searchResults = [];
        } finally {
            isSearching = false;
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
  
    /* Button with glowing hover effect */
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
  
    /* Blurred effect for video */
    .blurred {
      filter: blur(10px);
      transition: filter 0.3s ease-in-out;
    }
</style>
  
<main>
    <section class="relative bg-gray-900 text-white">
        <!-- Background video -->
        <video 
            autoplay 
            muted 
            loop 
            playsinline 
            class="absolute inset-0 w-full h-full object-cover z-0" 
            class:blurred={isBlurred} 
        >
            <source 
                src="https://209.74.64.181:12091/down/FCymVumu4aQG.mp4" 
                type="video/mp4" 
            />
            Your browser does not support the video tag.
        </video>
  
        <!-- Semi-transparent overlay -->
        <div class="absolute inset-0 bg-black opacity-50 z-10"></div>
  
        <!-- Main content area -->
        <div class="relative z-20 flex flex-col items-center justify-start h-screen min-w-screen pt-8 font-['Fanwood_Text']">
            <!-- Hero title -->
            <h1 class="text-4xl md:text-6xl text-center mb-4">
                We Make Hearts Full Again
            </h1>
  
            <!-- Introductory text -->
            <p class="text-center mb-8 text-lg md:text-xl">
                {#if !showSecondForm}
                    Tributestream broadcasts high quality audio and video of your loved one's celebration of life. <br>
                    Enter your loved one's name below to begin your journey with Tributestream.
                {:else}
                    Your Loved One's Custom Link:
                {/if}
            </p>
  
            <!-- Main form -->
            <form method="POST" action="?/homeRegister" class="w-full max-w-md">
                {#if !showSecondForm}
                    <!-- Input for loved one's name -->
                    <input
                        type="text"
                        name="lovedOneName"
                        placeholder="Enter name to create or search tributes..."
                        class="w-full px-4 py-2 text-gray-900 rounded-md mb-4 text-center"
                        bind:value={lovedOneName}
                    />
  
                    <!-- Buttons for creating tribute or searching -->
                    <div class="flex space-x-4 justify-center">
                        <button 
                            type="button"
                            onclick={handleNextPage}
                            class="bg-[#D5BA7F] text-black font-bold py-2 px-4 border border-transparent rounded-lg hover:text-black hover:shadow-[0_0_10px_4px_#D5BA7F] transition-all duration-300 ease-in-out"
                        >
                            Create Tribute
                        </button>
              <button 
                type="button"
                onclick={handleSearch}
                class="bg-[#D5BA7F] text-black py-2 px-4 border border-transparent rounded-lg hover:text-black hover:shadow-[0_0_10px_4px_#D5BA7F] transition-all duration-300 ease-in-out"
              >
                Search Streams
              </button>
                    </div>
                {:else}
                    <!-- Display the generated link -->
                    <div class="flex items-center justify-center mb-4">
                        Your Loved One's Custom Link:
                        <span class="text-white">
                            http://www.tributestream.com/celebration-of-life-for-
                            {#if isEditing}
                                <input
                                    type="text"
                                    class="px-2 py-1 text-gray-900 rounded-md"
                                    bind:value={tempNameChange}
                                />
                            {:else}
                                <span class="text-white">{slugifiedName}</span>
                            {/if}
                        </span>
  
                        <!-- Edit controls -->
                        {#if isEditing}
                            <button type="button" class="ml-2 text-green-500" onclick={editNameSave}>
                                <i class="fas fa-check"></i>
                            </button>
                            <button type="button" class="ml-2 text-red-500" onclick={editNameCancel}>
                                <i class="fas fa-times"></i>
                            </button>
                        {:else}
                            <button type="button" class="ml-2 text-white" onclick={editName}>
                                <i class="fas fa-pencil-alt"></i>
                            </button>
                        {/if}
                    </div>
  
                    <!-- Additional input fields -->
                    <input
                        type="text"
                        name="userInfo.name"
                        placeholder="Your Name"
                        class="w-full px-4 py-2 text-gray-900 rounded-md mb-4"
                        bind:value={userInfo.name}
                    />
                    <input
                        type="email"
                        name="userInfo.email"
                        placeholder="Email Address"
                        class="w-full px-4 py-2 text-gray-900 rounded-md mb-4"
                        bind:value={userInfo.email}
                    />
                    <input
                        type="tel"
                        name="userInfo.phone"
                        placeholder="Phone Number"
                        class="w-full px-4 py-2 text-gray-900 rounded-md mb-4"
                        bind:value={userInfo.phone}
                    />
  
                    <!-- Navigation buttons -->
                    <div class="flex justify-between items-center">
                        <button 
                            type="button" 
                            onclick={handleGoBack} 
                            class="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md"
                        >
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <input type="hidden" name="lovedOneName" value={lovedOneName} />
                        <input type="hidden" name="slugifiedName" value={slugifiedName} />
                        <button 
                            type="submit" 
                            formaction="?/homeRegister"
                            class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md"
                        >
                            Create Tribute
                        </button>
                    </div>
                {/if}
            </form>

            <!-- Search Results -->
            {#if showResults}
                <div class="mt-8 w-full max-w-md transition-all duration-300 ease-in-out">
                    <div class="bg-black bg-opacity-70 p-6 rounded-lg">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-2xl text-center flex-grow">Search Results</h2>
                            <button 
                                type="button"
                                onclick={() => {
                                    showResults = false;
                                    searchResults = [];
                                }}
                                class="text-white hover:text-gray-300"
                            >
                                ✕
                            </button>
                        </div>
                        <div class="space-y-2">
                            {#if isSearching}
                                <div class="text-center text-white">Searching...</div>
                            {:else if searchResults.length > 0}
                                {#each searchResults as result}
                                    <div class="bg-white bg-opacity-10 p-3 rounded-md hover:bg-opacity-20 transition-all cursor-pointer"
                                         onclick={() => goto(`/celebration-of-life-for-${result.slug}`)}>
                                        <div class="text-lg text-white">{result.loved_one_name}</div>
                                        <div class="text-sm text-gray-300">
                                            Created {new Date(result.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                {/each}
                            {:else}
                                <div class="text-center text-white">No tributes found</div>
                            {/if}
                        </div>
                    </div>
                </div>
            {/if}
        </div>
  
        <!-- Bordered box with letter -->
        <div class="box">
            <div class="letter">T</div>
        </div>
    </section>
</main>
