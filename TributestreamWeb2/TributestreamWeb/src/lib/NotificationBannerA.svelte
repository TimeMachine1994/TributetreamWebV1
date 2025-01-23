<script>
    export let isPaid = false; // Pass this from the parent component or page
    let showBanner = false;
    let Calc; // Placeholder for the dynamically loaded module
    let calcLoaded = false; // Tracks if the Calc module is loaded
  
    import { onMount } from 'svelte';
  
    onMount(() => {
      setTimeout(() => {
        if (!isPaid) {
          showBanner = true;
        }
      }, 2000); // Delay for 2 seconds
    });
  
    const completeBooking = async () => {
      if (!calcLoaded) {
        Calc = (await import('./Calc.svelte')).default; // Dynamically import the Calc module
        calcLoaded = true;
      }
    };
  
    const saveAndContinueLater = () => {
      if (!isPaid) {
        calcLoaded = false; // Reverts back to red banner
      }
    };
  </script>
  
  <style>
    .banner {
      overflow: hidden; /* Ensures content doesn't overflow during animation */
      height: 0; /* Initial height */
      transition: height 0.5s ease, background-color 0.3s ease; /* Smooth transition for height and color */
    }
  
    .banner.show {
      height: 128px; /* Adjusted for text and buttons */
    }
  
    .banner.bg-red {
      background-color: #f87171; /* Red color */
    }
  
    .banner.bg-grey {
      background-color: #d1d5db; /* Grey color */
    }
  
    .blue-button {
      background-color: #007bff; /* Blue color */
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      font-weight: bold;
      transition: box-shadow 0.3s ease, transform 0.2s ease;
    }
  
    .blue-button:hover {
      box-shadow: 0 0 15px rgba(0, 123, 255, 0.75); /* Glow effect */
      transform: scale(1.05); /* Slight zoom-in effect */
    }
  
    .blue-button:active {
      transform: scale(0.95); /* Button press effect */
    }


  .section-barrier {
    background-color: black; /* Black background */
    color: white; /* White text */
    font-family: 'Fanwood', serif; /* Fanwood font */
    font-size: 2rem; /* Large text */
    text-align: center; /* Center the text */
    padding: 20px; /* Add some spacing */
    margin: 0; /* Remove default margin */
  }
  </style>
  
  <div
    class="banner w-full flex flex-col justify-center items-center shadow-md text-center"
    class:show={showBanner}
    class:bg-red={!calcLoaded}
    class:bg-grey={calcLoaded}
  >
    <p class="mb-4">
      {calcLoaded
        ? 'Click here to save and continue later.'
        : 'Your booking is not complete! We are missing some key details.'}
    </p>
    {#if !calcLoaded}
      <button class="blue-button" on:click={completeBooking}>
        Complete Booking
      </button>
      
    {/if}
  
    {#if calcLoaded}
      <button class="blue-button" on:click={saveAndContinueLater}>
        Save and Continue Later
      </button>
    {/if}
  </div>


  <!-- Render Calc if it has been loaded -->
  {#if calcLoaded}
    <Calc />
    <div class="section-barrier">
    </div>
   {/if}
  