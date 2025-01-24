<script lang="ts">
    import { error } from '@sveltejs/kit';
    let userError = $state(''); // Local variable for UI-related error messages

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
    slugifiedName =  slug;
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
        // lovedOneName = '';
        // slugifiedName = '';
        // userInfo = {
        //     name: '',
        //     email: '',
        //     phone: '',
        // };
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
      color: white; /* White color for the letter to contrast with background */
      line-height: 1; /* Ensures the letter is centered vertically */
      transform: scaleX(1.36726); /* Stretch the text by 136.726% */
    }
  
    /* Button with glowing hover effect */
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
      transition: all 0.3s ease; /* Smooth transition for hover effects */
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
      outline: none; /* Prevent the default focus outline */
    }
  
    /* Blurred effect for video */
    .blurred {
      filter: blur(10px); /* Adds blur to the video */
      transition: filter 0.3s ease-in-out; /* Smooth transition when toggling blur */
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
        Your browser does not support the video tag. <!-- Fallback message for unsupported browsers -->
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
              placeholder="Loved One's Name Here"
              class="w-full px-4 py-2 text-gray-900 rounded-md mb-4 text-center"
              bind:value={lovedOneName}
            />
  
            <!-- Buttons for creating tribute or searching -->
            <div class="flex space-x-4 justify-center">
              <button 
                onclick={handleNextPage}
                class="bg-[#D5BA7F] text-black font-bold py-2 px-4 border border-transparent rounded-lg hover:text-black hover:shadow-[0_0_10px_4px_#D5BA7F] transition-all duration-300 ease-in-out"
              >
                Create Tribute
              </button>
              <button 
                onclick={() => {
                  // Placeholder for search functionality
                }}
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
                <button class="ml-2 text-green-500" onclick={editNameSave}>
                  <i class="fas fa-check"></i>
                </button>
                <button class="ml-2 text-red-500" onclick={editNameCancel}>
                  <i class="fas fa-times"></i>
                </button>
              {:else}
                <button class="ml-2 text-white" onclick={editName}>
                  <i class="fas fa-pencil-alt"></i>
                </button>
              {/if}
            </div>
  
            <!-- Additional input fields -->
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              class="w-full px-4 py-2 text-gray-900 rounded-md mb-4"
              bind:value={userInfo.name}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              class="w-full px-4 py-2 text-gray-900 rounded-md mb-4"
              bind:value={userInfo.email}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              class="w-full px-4 py-2 text-gray-900 rounded-md mb-4"
              bind:value={userInfo.phone}
              required
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
                class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md"
              >
                Create Tribute
              </button>
            </div>
          {/if}
        </form>
  
    
      </div>
  
      <!-- Bordered box with letter -->
      <div class="box">
        <div class="letter">T</div>
      </div>
    </section>
  </main>
