<script>
    import { onMount } from 'svelte';
    
    let data = [];
  
    // Form data variables
    let lovedOneName = '';
    let contactName = '';
    let phoneNumber = '';
    let emailAddress = '';
    let additionalNotes = '';
    let selectedDate = '';
    let selectedTime = '';
  
    function fetchData() {
      // Fetch or process data here
    }
  
    onMount(() => {
      fetchData();
    });
  
    function handleSubmit() {
      // Process the form data
      const formData = {
        lovedOneName,
        contactName,
        phoneNumber,
        emailAddress,
        additionalNotes,
        selectedDate,
        selectedTime
      };
      console.log('Form Data:', formData);
    }
  </script>
  
  <main>
    <div class="card p-4">
        <div class="hero">
            <p class="text-2xl p-4 text-center">Schedule Your Tributestream</p>
            <p class=" text-center">Your Loved Ones Custom Link:</p>
            
                        {#if lovedOneName}
                            <p class="text-center font-italic">
                                https://tributestream.com/{lovedOneName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}
                            </p>
                        {/if}
            

    <!-- Schedule Form -->
    <form on:submit|preventDefault={handleSubmit}>
      <div>
        <label for="lovedOneName" class="mt-3">Your Loved One's Name:</label>
        <input type="text" id="lovedOneName" bind:value={lovedOneName} placeholder="Enter Loved One's Name Here" required />
      </div>
      
      <div>
        <label for="contactName">Point of Contact Name:</label>
        <input type="text" id="contactName" bind:value={contactName} placeholder="Enter Point of Contact Name" required />
      </div>
      
      <div>
        <label for="phoneNumber">Phone Number:</label>
        <input type="tel" id="phoneNumber" bind:value={phoneNumber} placeholder="Enter phone number" required />
      </div>
      
      <div>
        <label for="emailAddress">Email Address:</label>
        <input type="email" id="emailAddress" bind:value={emailAddress} placeholder="Enter email address" required />
      </div>
      
      <div>
        <label for="selectedDate">Date:</label>
        <input type="date" id="selectedDate" bind:value={selectedDate} required />
      </div>
      
      <div>
        <label for="selectedTime">Time:</label>
        <input type="time" id="selectedTime" bind:value={selectedTime} required />
      </div>
      
      <div>
        <label for="additionalNotes">Additional Notes:</label>
        <textarea id="additionalNotes" bind:value={additionalNotes} placeholder="Enter any additional notes"></textarea>
      </div>
  
      <button type="submit" class="bg-[#D5BA7F] text-black py-2 px-4 border border-transparent rounded-lg hover:text-black">Submit</button>
    </form>
  
    <!-- Displaying fetched data -->
    {#each data as item}
      <div>
        <!-- Display your data -->
      </div>
    {/each}
  </main>
  
  <style>
    main {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
  
    div {
      margin-bottom: 15px;
    }
  
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
  
    input, textarea {
      width: 100%;
      padding: 8px;
      margin-bottom: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
  
    button {
      padding: 10px 20px;
       border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  
    button:hover {
     }
  </style>
  