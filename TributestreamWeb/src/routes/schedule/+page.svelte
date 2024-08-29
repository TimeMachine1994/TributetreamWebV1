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
          <p class=" text-center">Your Loved One's Custom Link:</p>
          
          {#if lovedOneName}
              <p class="text-center font-italic">
                  https://tributestream.com/{lovedOneName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}
              </p>
          {/if}
      </div>
  </div>

  <section class="card p-4 mt-4">
      <!-- Schedule Form -->
      <form on:submit|preventDefault={handleSubmit}>
          <label class="label">
              <span>Your Loved One's Name:</span>
              <input class="input" type="text" id="lovedOneName" bind:value={lovedOneName} placeholder="Enter Loved One's Name Here" required />
          </label>
          
          <label class="label">
              <span>Point of Contact Name:</span>
              <input class="input" type="text" id="contactName" bind:value={contactName} placeholder="Enter Point of Contact Name" required />
          </label>
          
          <label class="label">
              <span>Phone Number:</span>
              <input class="input" type="tel" id="phoneNumber" bind:value={phoneNumber} placeholder="Enter phone number" required />
          </label>
          
          <label class="label">
              <span>Email Address:</span>
              <input class="input" type="email" id="emailAddress" bind:value={emailAddress} placeholder="Enter email address" required />
          </label>
          
          <label class="label">
              <span>Date:</span>
              <input class="input" type="date" id="selectedDate" bind:value={selectedDate} required />
          </label>
          
          <label class="label">
              <span>Time:</span>
              <input class="input" type="time" id="selectedTime" bind:value={selectedTime} required />
          </label>
          
          <label class="label">
              <span>Additional Notes:</span>
              <textarea class="textarea" id="additionalNotes" bind:value={additionalNotes} placeholder="Enter any additional notes"></textarea>
          </label>
    
          <button type="submit" class="bg-[#D5BA7F] text-black py-2 px-4 border border-transparent rounded-lg hover:text-black">Submit</button>
      </form>
  </section>

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

  .card {
      background-color: white;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
  }

  .label {
      display: flex;
      flex-direction: column;
      margin-bottom: 15px;
  }

  .input, .textarea {
      width: 100%;
      padding: 12px;
      margin-top: 5px;
      border: 1px solid #ccc;
      border-radius: 8px;
  }

  .textarea {
      resize: vertical;
  }

  button {
      align-self: flex-start;
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.3s ease;
  }

  button:hover {
      background-color: #CFCFCE;
  }

  .hero {
      text-align: center;
      margin-bottom: 20px;
  }
</style>
