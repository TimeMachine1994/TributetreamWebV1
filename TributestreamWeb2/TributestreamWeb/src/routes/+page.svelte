<script lang="ts">
    import { error } from '@sveltejs/kit';
    import { goto } from '$app/navigation';
    import type { Tribute } from '$lib/stores/unified-store.svelte';
    import { getUnifiedStoreContext } from '$lib/stores/unified-store.svelte';
    import { createTributeSlug, createTributeUrl } from '$lib/utils/string-helper';
    import { enhance } from '$app/forms';
    import { processFormActionResult } from '$lib/utils/unified-form-helper';

    // Get store context
    const store = getUnifiedStoreContext();

    // Error and UI state
    let userError = $state('');
    let searchResults = $state<Tribute[]>([]);
    let isSearching = $state(false);
    let showResults = $state(false);
    let isBlurred = $state(false);
    let tempNameChange = $state('');
    let isEditing = $state(false);
    let showSecondForm = $state(false);

    // Reactive control flags
    let slugSet = $state(false);
    let formSubmitting = $state(false);
    
    // Derived value for display purposes only
    let currentSlug = $derived(store.currentTribute.slug || '');
    
    // Update only when needed to avoid infinite loops
    function setSlugFromName(name: string): void {
        // Skip if the slug is already set for this name or name is empty
        if (slugSet || !name.trim()) return;
        
        console.log('Setting slug from name:', name);
        const slug = createTributeSlug(name, false);
        store.updateCurrentTribute({
            slug: slug
        });
        
        // Mark as set to prevent re-running
        slugSet = true;
    }
    
    // Initialize from store
    $effect(() => {
        // Only update the slug if it hasn't been set and we have a name
        if (store.lovedOneInfo.fullName && !slugSet) {
            setSlugFromName(store.lovedOneInfo.fullName);
        }
    });

    // Handle next page button click
    function handleNextPage() {
        if (!store.lovedOneInfo.fullName?.trim()) {
            userError = 'Please enter a valid name';
            return;
        }
        setSlugFromName(store.lovedOneInfo.fullName);
        showSecondForm = true;
    }

    // Save edited name
    function editNameSave() {
        if (tempNameChange.trim() === '') {
            userError = 'Name cannot be empty';
            return;
        }
        
        // Name is changing, so we need to reset the slug flag
        slugSet = false;
        
        // Update the store
        store.updateLovedOneInfo({ fullName: tempNameChange });
        
        // Generate a new slug
        setSlugFromName(tempNameChange);
        
        // Exit editing mode
        isEditing = false;
        console.log('Name updated, new slug:', currentSlug);
    }

    // Cancel edit
    function editNameCancel() {
        isEditing = false;
        tempNameChange = '';
    }

    // Edit name (toggle to editing mode)
    function editName() {
        tempNameChange = store.lovedOneInfo.fullName || '';
        isEditing = true;
    }

    // Handle back navigation
    function handleGoBack() {
        showSecondForm = false;
    }

    // Handle search
    async function handleSearch() {
        if (!store.lovedOneInfo.fullName?.trim()) {
            searchResults = [];
            return;
        }
        isSearching = true;
        showResults = true;
        
        try {
            await store.searchTributes(store.lovedOneInfo.fullName, 1, 10);
            searchResults = store.searchResults.tributes;
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
  
            <!-- Main form with enhanced submission handler to prevent infinite loops -->
            <form
                method="POST"
                action="?/createTribute"
                class="w-full max-w-md"
                use:enhance={() => {
                    // Pre-submission setup
                    const preSubmit = () => {
                        // Prevent multiple submissions
                        if (formSubmitting) {
                            console.log('Form submission canceled - already submitting');
                            return false;
                        }
                        
                        // Validate form data before submission
                        const lovedOneFullName = store.lovedOneInfo.fullName;
                        const userFullName = store.userInfo.fullName;
                        const userEmail = store.userInfo.emailAddress;
                        const userPhone = store.userInfo.phoneNumber;
                        
                        // Memorial information fields
                        const memorialDate = store.memorialInfo.date;
                        const memorialLocation = store.memorialInfo.locations?.[0]?.name;
                        
                        console.log('Form submission validation:', {
                            lovedOneFullName,
                            userFullName,
                            userEmail,
                            userPhone,
                            memorialDate,
                            memorialLocation
                        });
                        
                        // Client-side validation
                        if (!lovedOneFullName || !userFullName || !userEmail || !userPhone) {
                            console.error('Missing required user fields in client validation');
                            userError = 'Please fill in all required personal information fields';
                            return false;
                        }
                        
                        // Memorial information validation (date and location are required)
                        if (!memorialDate || !memorialLocation) {
                            console.error('Missing required memorial fields in client validation');
                            userError = 'Please provide memorial date and location information';
                            return false;
                        }
                        
                        // Ensure the slug is set before submission
                        if (!store.currentTribute.slug) {
                            console.log('Setting slug before submission');
                            setSlugFromName(lovedOneFullName);
                        }
                        
                        console.log('Form submission started');
                        formSubmitting = true;
                        return true;
                    };

                    // If validation fails, don't proceed with submission
                    if (!preSubmit()) return;
                    
                    return ({ update, result }) => {
                        // Reset the submitting state when done
                        console.log('Form submission completed:', result);
                        formSubmitting = false;
                         if (result.type === 'failure') {
                            // Display error message to user
                            userError = typeof result.data?.message === 'string'
                                ? result.data.message
                                : 'Form submission failed';
                            console.error('Form error:', result.data);
                        }
                        
                        // If the request was successful, reset the slug flag for new submissions
                        // and update the unified store
                        if (result.type === 'success') {
                            slugSet = false;
                            
                            // Convert SvelteKit action result to our FormActionResult format
                            const formActionResult = {
                                success: true,
                                data: result.data || {}
                            };
                            
                            // Process the form action result for the unified store
                            processFormActionResult(
                                formActionResult,
                                store
                            );
                        }
                        
                        // Allow default update to proceed
                        update();
                    };
                }}
            >
                {#if !showSecondForm}
                    <!-- Input for loved one's name -->
                    <input
                        type="text"
                        name="lovedOneInfo.fullName"
                        placeholder="Enter name to create or search tributes..."
                        class="w-full px-4 py-2 text-gray-900 rounded-md mb-4 text-center"
                        bind:value={store.lovedOneInfo.fullName}
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
                                <span class="text-white">{currentSlug}</span>
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

                    <!-- Contact information fields -->
                    <div class="space-y-4 mb-6">
                        <h3 class="text-xl font-semibold">Your Information</h3>
                        <input
                            type="text"
                            name="userInfo.fullName"
                            placeholder="Your Name"
                            class="w-full px-4 py-2 text-gray-900 rounded-md"
                            bind:value={store.userInfo.fullName}
                        />
                        <input
                            type="email"
                            name="userInfo.emailAddress"
                            placeholder="Email Address"
                            class="w-full px-4 py-2 text-gray-900 rounded-md"
                            bind:value={store.userInfo.emailAddress}
                        />
                        <input
                            type="tel"
                            name="userInfo.phoneNumber"
                            placeholder="Phone Number"
                            class="w-full px-4 py-2 text-gray-900 rounded-md"
                            bind:value={store.userInfo.phoneNumber}
                        />
                    </div>

                    <!-- Memorial information fields -->
                    <div class="space-y-4 mb-6">
                        <h3 class="text-xl font-semibold">Memorial Details</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label for="memorial-date" class="block text-sm font-medium mb-1">Date</label>
                                <input
                                    id="memorial-date"
                                    type="date"
                                    name="memorialInfo.date"
                                    class="w-full px-4 py-2 text-gray-900 rounded-md"
                                    bind:value={store.memorialInfo.date}
                                />
                            </div>
                            <div>
                                <label for="memorial-time" class="block text-sm font-medium mb-1">Start Time</label>
                                <input
                                    id="memorial-time"
                                    type="time"
                                    name="memorialInfo.startTime"
                                    class="w-full px-4 py-2 text-gray-900 rounded-md"
                                    bind:value={store.memorialInfo.startTime}
                                />
                            </div>
                        </div>
                        <div>
                            <label for="memorial-location" class="block text-sm font-medium mb-1">Location Name</label>
                            <input
                                id="memorial-location"
                                type="text"
                                name="memorialInfo.locations[0].name"
                                placeholder="Funeral Home or Venue Name"
                                class="w-full px-4 py-2 text-gray-900 rounded-md"
                                bind:value={store.memorialInfo.locations[0].name}
                            />
                        </div>
                        <div>
                            <label for="memorial-address" class="block text-sm font-medium mb-1">Location Address</label>
                            <input
                                id="memorial-address"
                                type="text"
                                name="memorialInfo.locations[0].address"
                                placeholder="Full address of venue"
                                class="w-full px-4 py-2 text-gray-900 rounded-md"
                                bind:value={store.memorialInfo.locations[0].address}
                            />
                        </div>
                        <div>
                            <label for="tribute-notes" class="block text-sm font-medium mb-1">Additional Notes</label>
                            <textarea
                                id="tribute-notes"
                                name="tribute.notes"
                                placeholder="Any additional information about the memorial service"
                                class="w-full px-4 py-2 text-gray-900 rounded-md"
                                rows="3"
                                bind:value={store.currentTribute.notes}
                            ></textarea>
                        </div>
                    </div>
  
                    <!-- Error message display -->
                    {#if userError}
                        <div class="bg-red-500 text-white p-3 rounded-md mb-4 text-center">
                            {userError}
                        </div>
                    {/if}
                    
                    <!-- Navigation buttons -->
                    <div class="flex justify-between items-center">
                        <button 
                            type="button" 
                            onclick={handleGoBack} 
                            class="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md"
                        >
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <!-- Add hidden fields to ensure values are submitted properly -->
                        <input
                            type="hidden"
                            name="lovedOneInfo.fullName"
                            value={store.lovedOneInfo.fullName || ''}
                        />
                        <input
                            type="hidden"
                            name="userInfo.fullName"
                            value={store.userInfo.fullName || ''}
                        />
                        <input
                            type="hidden"
                            name="userInfo.emailAddress"
                            value={store.userInfo.emailAddress || ''}
                        />
                        <input
                            type="hidden"
                            name="userInfo.phoneNumber"
                            value={store.userInfo.phoneNumber || ''}
                        />
                        
                        <!-- Memorial information hidden fields -->
                        <input
                            type="hidden"
                            name="memorialInfo.date"
                            value={store.memorialInfo.date || ''}
                        />
                        <input
                            type="hidden"
                            name="memorialInfo.startTime"
                            value={store.memorialInfo.startTime || ''}
                        />
                        <input
                            type="hidden"
                            name="memorialInfo.locations[0].name"
                            value={store.memorialInfo.locations?.[0]?.name || ''}
                        />
                        <input
                            type="hidden"
                            name="memorialInfo.locations[0].address"
                            value={store.memorialInfo.locations?.[0]?.address || ''}
                        />
                        <input
                            type="hidden"
                            name="tribute.notes"
                            value={store.currentTribute.notes || ''}
                        />
                        <button
                            type="submit"
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
                                    store.searchResults.tributes = [];
                                }}
                                class="text-white hover:text-gray-300"
                            >
                                
                            </button>
                        </div>
                        <div class="space-y-2">
                            {#if store.searchResults.isLoading}
                                <div class="text-center text-white">Searching...</div>
                            {:else if store.searchResults.tributes.length > 0}
                                {#each store.searchResults.tributes as result}
                                    <a href={`/celebration-of-life-for-${result.slug}`}
                                       class="block bg-white bg-opacity-10 p-3 rounded-md hover:bg-opacity-20 transition-all cursor-pointer">
                                        <div class="text-lg text-white">{store.tributeTitle}</div>
                                        <div class="text-sm text-gray-300">
                                            Created {result.created_at ? new Date(result.created_at).toLocaleDateString() : 'Recently'}
                                        </div>
                                    </a>
                                {/each}
                                
                                {#if store.searchResults.total_pages > 1}
                                    <div class="flex justify-center mt-4 space-x-2">
                                        <button
                                            class="px-3 py-1 bg-gray-700 text-white rounded-md disabled:opacity-50"
                                            disabled={store.searchResults.currentPage === 1}
                                            onclick={() => store.searchTributes(store.lovedOneInfo.fullName || '', store.searchResults.currentPage - 1)}
                                        >
                                            Previous
                                        </button>
                                        <span class="px-3 py-1 text-white">
                                            Page {store.searchResults.currentPage} of {store.searchResults.total_pages}
                                        </span>
                                        <button
                                            class="px-3 py-1 bg-gray-700 text-white rounded-md disabled:opacity-50"
                                            disabled={store.searchResults.currentPage === store.searchResults.total_pages}
                                            onclick={() => store.searchTributes(store.lovedOneInfo.fullName || '', store.searchResults.currentPage + 1)}
                                        >
                                            Next
                                        </button>
                                    </div>
                                {/if}
                            {:else if store.searchResults.error}
                                <div class="text-center text-red-400">{store.searchResults.error}</div>
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
