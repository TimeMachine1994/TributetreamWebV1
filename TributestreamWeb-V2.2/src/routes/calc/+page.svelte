<script lang="ts">
    let selectedSquare: number | null = $state(null);
    import Calc from '$lib/Calc.svelte';
    let { userMeta } = $props();
    console.log(userMeta);

    // Function to handle square selection
    function handleSquareClick(index: number) {
        selectedSquare = selectedSquare === index ? null : index;
    }
</script>

<style>
  /* Custom CSS for the 3D glass effect */
  .glass-square {
      backdrop-filter: blur(10px) saturate(150%);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2), 0 8px 30px rgba(0, 0, 0, 0.1) inset;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease, opacity 0.3s ease;
      padding: 16px;
      position: relative;
  }
  .glass-square:hover {
      transform: scale(1.1) translateZ(10px);
      box-shadow: 0 8px 20px rgba(255, 255, 255, 0.4), 0 12px 40px rgba(0, 0, 0, 0.2);
  }

  .selected {
      border-color: #000000;
      border-width: 2px;
      opacity: 1;
  }

  .faded {
      opacity: 0.5;
      filter: blur(2px);
  }

  .gradient-solo {
      background: linear-gradient(to bottom right, #ffffff, #e0e0ff);
  }

  .gradient-gold {
      background: linear-gradient(to bottom right, #fff8dc, #ffe066);
  }

  .gradient-legacy {
      background: linear-gradient(to bottom right, #b8860b, #e5c078);
  }

  .title {
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 8px;
  }

  .price {
      font-size: 2rem;
      font-weight: bold;
      margin: 16px 0;
  }

  .bookmark-icon {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 24px;
      height: 24px;
      cursor: pointer;
      fill: rgba(255, 0, 0, 0.5);
      transition: fill 0.3s ease;
  }

  .selected .bookmark-icon {
      fill: rgba(255, 0, 0, 1);
  }

  /* Updated Calculator Panel */
  .calculator-panel {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.5s ease, padding 0.5s ease;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 12px;
      padding: 0 16px;
      box-sizing: border-box; /* Ensure padding is included in height calculation */
  }

  .calculator-panel.open {
      max-height: none;
      min-height: 150px;
      padding: 16px;
  }
  /* Prevent unintended gaps */
  body, html {
      margin: 0;
      padding: 0;
      height: 100%; /* Ensure the body takes the full height of the viewport */
      overflow-x: hidden; /* Prevent horizontal overflow */
  }

  .grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(5, 1fr);
      height: auto; /* Ensure the grid height adjusts to content */
  }

  .flex {
      flex-grow: 1;
      align-items: center;
      justify-content: center;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
      .calculator-panel.open {
          max-height: calc(100vh - 20%);
      }
  }

  /* Responsive layout for the grid */
  .grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(5, 1fr);
  }
</style>


<!-- Squares Layout -->
<div class="flex flex-col items-center gap-8 p-8">
    <div class="flex justify-center gap-8">
        <!-- Package 1 -->
        <div
            class={`w-[20vw] h-auto glass-square gradient-solo ${
                selectedSquare === 0 ? 'selected' : selectedSquare === null ? '' : 'faded'
            }`}
            on:click={() => handleSquareClick(0)}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                class="bookmark-icon"
            >
                <path d="M6 2c-1.1 0-2 .9-2 2v18l8-5 8 5V4c0-1.1-.9-2-2-2H6z" />
            </svg>
            <h3 class="title">Tributestream Solo</h3>
            <i>Offline Recording</i>
            <p class="price">$550</p>
            <ul>
                <li>Professional Videographer</li>
                <li>2 Hours of Record Time</li>
                <li>Custom URL</li>
                <li>1 Year of Complimentary Hosting</li>
                <li>Complimentary Download of Recording</li>
            </ul>
        </div>

        <!-- Package 2 -->
        <div
            class={`w-[20vw] h-auto glass-square gradient-gold ${
                selectedSquare === 1 ? 'selected' : selectedSquare === null ? '' : 'faded'
            }`}
            on:click={() => handleSquareClick(1)}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                class="bookmark-icon"
            >
                <path d="M6 2c-1.1 0-2 .9-2 2v18l8-5 8 5V4c0-1.1-.9-2-2-2H6z" />
            </svg>
            <h3 class="title">Tributestream Gold</h3>
            <i>Livestream Recording</i>
            <p class="price">$1,100</p>
            <ul>
                <li>Professional Livestream Technician</li>
                <li>Remote Livestream Producer</li>
                <li>Professional Videographer</li>
                <li>2 Hours of Broadcast Time</li>
                <li>Custom URL</li>
                <li>1 Year of Complimentary Hosting</li>
                <li>Complimentary Download of Livestream</li>
            </ul>
        </div>

        <!-- Package 3 -->
        <div
            class={`w-[20vw] h-auto glass-square gradient-legacy ${
                selectedSquare === 2 ? 'selected' : selectedSquare === null ? '' : 'faded'
            }`}
            on:click={() => handleSquareClick(2)}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                class="bookmark-icon"
            >
                <path d="M6 2c-1.1 0-2 .9-2 2v18l8-5 8 5V4c0-1.1-.9-2-2-2H6z" />
            </svg>
            <h3 class="title">Tributestream Legacy</h3>
            <i>Livestream Production</i>
            <p class="price">$2,799</p>
            <ul>
                <li>B-Roll Videographer</li>
                <li>Pre-Site Visit by Production Manager</li>
                <li>Post Production Editing</li>
                <li>Professional Livestream Technician</li>
                <li>Remote Livestream Producer</li>
                <li>Professional Videographer</li>
                <li>2 Hours of Broadcast Time</li>
                <li>Custom URL</li>
                <li>1 Year of Complimentary Hosting</li>
                <li>Complimentary Download of Livestream</li>
            </ul>
        </div>
    </div>


</div>

<div class="grid grid-cols-5 gap-4">
    <div class="col-span-1">
        <!-- Column 1 content -->
    </div>
    <div class="col-span-3">
    <!-- Calculator Panel -->
    <div class={`calculator-panel ${selectedSquare !== null ? 'open' : ''}`}>
   
     <!-- Add calculator elements here -->
      <Calc />
    </div>    </div>
    <div class="col-span-1">
        <!-- Column 3 content -->
    </div>
</div>

