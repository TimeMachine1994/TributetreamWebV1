<script lang="ts">
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    
    // Define props using Svelte 5 runes syntax
    const { form, data } = $props();
    
    // Button styling
    let button = "bg-[#D5BA7F] text-black py-2 px-4 border border-transparent rounded-lg hover:text-black hover:shadow-[0_0_10px_4px_#D5BA7F] transition-all duration-300 ease-in-out";
    
    // Form state machine
    let formState = $state('initial'); // initial, searching, creating, submitting, success
    
    // Form fields - Search
    let searchTerm = $state('');
    
    // Form fields - Memorial creation
    let deceasedName = $state('');
    let deceasedDOB = $state('');
    let deceasedDOD = $state('');
    let tributeMessage = $state('');
    let creatorEmail = $state('');
    
    // UI state
    let isSubmitting = $state(false);
    let isSearching = $state(false);
    let showQuickCreateForm = $state(false);
    let formError = $state<string | null>(null);
    
    // Video background state
    let isBlurred = $state(false);
    
    // Derived values using Svelte 5's $derived rune
    let slugifiedName = $derived(
        deceasedName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
    );
    
    let customLink = $derived(
        `https://tributestream.com/celebration-of-life-for-${slugifiedName}`
    );
    
    // Form validation using $derived for reactive validation
    let isNameValid = $derived(!!deceasedName.trim());
    let isDODValid = $derived(!!deceasedDOD.trim());
    let isMessageValid = $derived(!!tributeMessage.trim() && tributeMessage.length >= 10);
    let isEmailValid = $derived(
        !!creatorEmail.trim() && 
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(creatorEmail)
    );
    
    let isQuickFormValid = $derived(
        isNameValid && isDODValid && isMessageValid && isEmailValid
    );
    
    let isSearchValid = $derived(!!searchTerm.trim());
    
    // Side effects using $effect
    $effect(() => {
        // Reset form error when form state changes
        formError = null;
        
        // Apply blur effect when not in initial state
        isBlurred = formState !== 'initial';
        
        // Pre-populate form data if returning from failed submission
        if (form?.create && form.error && form.data) {
            deceasedName = form.data.deceasedName || '';
            deceasedDOB = form.data.deceasedDOB || '';
            deceasedDOD = form.data.deceasedDOD || '';
            tributeMessage = form.data.tributeMessage || '';
            creatorEmail = form.data.creatorEmail || '';
            
            // Show the create form and any error message
            showQuickCreateForm = true;
            formError = form.message;
        }
        
        // Handle search results
        if (form?.search) {
            if (form.error) {
                formError = form.error;
            }
            
            if (form.term) {
                searchTerm = form.term;
            }
        }
    });
    
    // Handle search action
    function handleSearchAction() {
        if (!isSearchValid) {
            formError = 'Please enter a name to search';
            return;
        }
        
        formState = 'searching';
        isSearching = true;
    }
    
    // Handle reset search
    function resetSearch() {
        formState = 'initial';
        searchTerm = '';
        isSearching = false;
    }
    
    // Handle create memorial button click
    function handleCreateMemorial() {
        showQuickCreateForm = true;
        formState = 'creating';
    }
    
    // Handle form submission
    function handleMemorialSubmit() {
        if (!isQuickFormValid) {
            let errors = [];
            if (!isNameValid) errors.push('Loved one\'s name is required');
            if (!isDODValid) errors.push('Date of passing is required');
            if (!isMessageValid) errors.push('Tribute message is required (at least 10 characters)');
            if (!isEmailValid) errors.push('Valid email address is required');
            
            formError = errors.join('. ');
            return;
        }
        
        formState = 'submitting';
        isSubmitting = true;
    }
    
    // Handle go back
    function handleGoBack() {
        formState = 'initial';
        showQuickCreateForm = false;
    }
</script>

<!-- Main component with video background -->
<section class="relative bg-gray-900 text-white min-h-screen">
    <!-- Video background with conditional blur effect -->
    <video 
        autoplay 
        muted 
        loop 
        playsinline 
        class="absolute inset-0 w-full h-full object-cover z-0 transition-all duration-300" 
        class:blur-sm={isBlurred}
    >
        <source src="https://209.74.64.181:12091/down/FCymVumu4aQG.mp4" type="video/mp4" />
        Your browser does not support the video tag.
    </video>
    
    <!-- Overlay for better text readability -->
    <div class="absolute inset-0 bg-black opacity-50 z-10"></div>
    
    <!-- Main content container -->
    <div class="relative z-20 flex flex-col items-center justify-start min-h-screen pt-8 px-4 font-['Fanwood_Text']">
        <!-- Header section -->
        <h1 class="text-4xl md:text-6xl text-center mb-4">
            We Make Hearts Full Again
        </h1>
        
        <!-- Error message display -->
        {#if formError}
            <div class="bg-red-500 text-white px-4 py-2 rounded-md mb-4 max-w-md text-center">
                {formError}
            </div>
        {/if}
        
        <!-- Main content area -->
        <div class="w-full max-w-lg">
            {#if formState === 'initial'}
                <!-- Initial state - Name input form and actions -->
                <p class="text-center mb-8 text-lg md:text-xl">
                    Tributestream broadcasts high quality audio and video of your loved one's celebration of life. <br> 
                    Enter your loved one's name below to search, or create a new memorial.
                </p>
                
                <form method="POST" action="?/search" use:enhance={() => {
                    handleSearchAction();
                    return ({ update }) => {
                        update({ reset: false });
                        isSearching = false;
                    };
                }} class="w-full">
                    <input
                        type="text"
                        id="searchTerm"
                        name="searchTerm"
                        placeholder="Enter a name to search"
                        class="w-full px-4 py-2 text-gray-900 rounded-md mb-4 text-center"
                        bind:value={searchTerm}
                        aria-label="Search for a memorial"
                    />
                    
                    <div class="flex space-x-4 justify-center">
                        <button 
                            type="button"
                            on:click={handleCreateMemorial}
                            class={button}
                        >
                            Create Memorial
                        </button>
                        
                        <button
                            type="submit"
                            class={button}
                            disabled={isSearching || !isSearchValid}
                        >
                            {isSearching ? 'Searching...' : 'Search Memorials'}
                        </button>
                    </div>
                </form>
                
            {:else if formState === 'searching' || (form?.search && form.results)}
                <!-- Search results state -->
                <div class="bg-black bg-opacity-30 p-6 rounded-lg shadow-lg">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-semibold">
                            Search Results for "{form?.term || searchTerm}"
                        </h2>
                        <button 
                            on:click={resetSearch}
                            class="text-white hover:text-gray-300 focus:outline-none"
                            aria-label="Close search results"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    {#if form?.search && form.results && form.results.length > 0}
                        <div class="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {#each form.results as tribute}
                                <div class="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors">
                                    <a 
                                        href={`/celebration-of-life-for-${tribute.slug}`}
                                        class="block"
                                    >
                                        <h3 class="text-xl font-semibold text-[#D5BA7F]">{tribute.loved_one_name}</h3>
                                        <p class="text-sm text-gray-300">
                                            Created {new Date(tribute.created_at).toLocaleDateString()}
                                        </p>
                                    </a>
                                </div>
                            {/each}
                        </div>
                        
                        {#if form.totalPages > 1}
                            <div class="mt-4 flex justify-center space-x-2">
                                <span class="text-gray-300">
                                    Page {form.currentPage} of {form.totalPages}
                                </span>
                            </div>
                        {/if}
                        
                    {:else}
                        <div class="text-center py-8">
                            <p class="text-lg mb-4">No memorials found matching "{form?.term || searchTerm}"</p>
                            <button 
                                on:click={handleCreateMemorial}
                                class={button}
                            >
                                Create a Memorial
                            </button>
                        </div>
                    {/if}
                </div>
                
            {:else if formState === 'creating' || showQuickCreateForm}
                <!-- Create memorial state - Quick creation form -->
                <div class="bg-black bg-opacity-30 p-6 rounded-lg shadow-lg">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-semibold">Create a Memorial</h2>
                        <button 
                            on:click={handleGoBack}
                            class="text-white hover:text-gray-300 focus:outline-none"
                            aria-label="Close form"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <form 
                        method="POST" 
                        action="?/createMemorial" 
                        use:enhance={() => {
                            handleMemorialSubmit();
                            return ({ update }) => {
                                update({ reset: false });
                                isSubmitting = false;
                            };
                        }}
                        class="space-y-4"
                    >
                        <!-- Memorial Information -->
                        <div>
                            <label for="deceasedName" class="block text-sm font-medium text-gray-300 mb-1">
                                Full Name of Loved One *
                            </label>
                            <input
                                type="text"
                                id="deceasedName"
                                name="deceasedName"
                                placeholder="John Doe"
                                class="w-full px-4 py-2 text-gray-900 rounded-md"
                                bind:value={deceasedName}
                                required
                            />
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="deceasedDOB" class="block text-sm font-medium text-gray-300 mb-1">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    id="deceasedDOB"
                                    name="deceasedDOB"
                                    class="w-full px-4 py-2 text-gray-900 rounded-md"
                                    bind:value={deceasedDOB}
                                />
                            </div>
                            
                            <div>
                                <label for="deceasedDOD" class="block text-sm font-medium text-gray-300 mb-1">
                                    Date of Passing *
                                </label>
                                <input
                                    type="date"
                                    id="deceasedDOD"
                                    name="deceasedDOD"
                                    class="w-full px-4 py-2 text-gray-900 rounded-md"
                                    bind:value={deceasedDOD}
                                    required
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label for="tributeMessage" class="block text-sm font-medium text-gray-300 mb-1">
                                Tribute Message *
                            </label>
                            <textarea
                                id="tributeMessage"
                                name="tributeMessage"
                                rows="4"
                                placeholder="Share a memory or tribute message (minimum 10 characters)"
                                class="w-full px-4 py-2 text-gray-900 rounded-md"
                                bind:value={tributeMessage}
                                required
                                minlength="10"
                            ></textarea>
                        </div>
                        
                        <div>
                            <label for="creatorEmail" class="block text-sm font-medium text-gray-300 mb-1">
                                Your Email *
                            </label>
                            <input
                                type="email"
                                id="creatorEmail"
                                name="creatorEmail"
                                placeholder="your.email@example.com"
                                class="w-full px-4 py-2 text-gray-900 rounded-md"
                                bind:value={creatorEmail}
                                required
                            />
                            <p class="text-xs text-gray-400 mt-1">
                                Used to create your account and manage the memorial page.
                            </p>
                        </div>
                        
                        <!-- Preview of memorial page URL -->
                        {#if deceasedName}
                            <div class="bg-gray-800 p-2 rounded-md text-xs overflow-hidden">
                                <p class="text-gray-400 mb-1">Memorial page URL:</p>
                                <p class="text-[#D5BA7F] truncate">{customLink}</p>
                            </div>
                        {/if}
                        
                        <!-- Submit button -->
                        <button 
                            type="submit" 
                            class={`${button} w-full`}
                            disabled={isSubmitting || !isQuickFormValid}
                        >
                            {isSubmitting ? 'Creating Memorial...' : 'Create Memorial'}
                        </button>
                    </form>
                </div>
                
            {:else if formState === 'submitting'}
                <!-- Submitting state - Loading indicator -->
                <div class="text-center py-12">
                    <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                    <p class="mt-4 text-xl">Creating your memorial page...</p>
                </div>
            {/if}
            
            <!-- Optional - Search results from server -->
            {#if form?.search && !showQuickCreateForm && formState !== 'creating'}
                <div class="mt-8 text-center">
                    <p class="text-gray-300 mb-2">Don't see what you're looking for?</p>
                    <button 
                        on:click={handleCreateMemorial}
                        class={button}
                    >
                        Create a New Memorial
                    </button>
                </div>
            {/if}
        </div>
    </div>
</section>
