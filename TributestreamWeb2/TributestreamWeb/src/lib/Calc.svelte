<script lang="ts">
 
//  import { onMount } from "svelte";
 
//   let value = $state(0); // Start at 0%
//   onMount(() => {
//     const interval = setInterval(() => {
//       if (value < 50) {
//         value += 1; // Increment the value
//       } else {
//         clearInterval(interval); // Stop the animation at 50%
//       }
//     }, 20); // Adjust speed by changing this delay
//   });
// State for form data
let formData = $state({
  package: 'Solo', // Default package
  livestreamDate: '',
  allowOverrun: false,
  overrunContact: { name: '', phone: '' },
  locations: [{ address: '', travelExceedsHour: false }],
  dates: [],
  duration: 2, // Default 2 hours
});

let locationNumDefault = $derived.by(() => {
  if (formData.package === 'Solo' || formData.package === 'Legacy') {
    return 1;
  } else if (formData.package === 'Anywhere') {
    return 2;
  }
  return 1; // Default fallback
});

function selectPackage(packageName) {
    formData.package = packageName;
  }
// Derived state for calculating cart items and total
let cartItems = $derived.by(() => {
  let items = [];
  let total = 0;

  // Package cost
  const packageCosts = { Solo: 399, Anywhere: 799, Legacy: 1499 };
  items.push({ name: `${formData.package} Package`, price: packageCosts[formData.package] });
  total += packageCosts[formData.package];

  // Duration cost
  const extraHours = formData.duration > 2 ? formData.duration - 2 : 0;
  if (extraHours) {
    items.push({ name: `Extra Duration (${extraHours} hour(s))`, price: extraHours * 125 });
    total += extraHours * 125;
  }

  // Additional locations
  formData.locations.forEach((loc, index) => {
    if (index > 0) {
      items.push({ name: `Additional Location #${index + 1}`, price: 349 });
      total += 349;
    }
  });

  // Overrun surcharge
  if (formData.allowOverrun) {
    items.push({ name: 'Overrun Surcharge (Refundable)', price: 125 });
    total += 125;
  }

  return { items, total };
});

// Functions to manage form data
function addDate() {
  formData.dates.push('');
}

function removeDate(index) {
  formData.dates.splice(index, 1);
}

function addLocation() {
  formData.locations.push({ address: '', travelExceedsHour: false });
}

function removeLocation(index) {
  formData.locations.splice(index, 1);
}
    </script>


<!-- <ProgressRadial 
  value={value} 
  stroke={40} 
  font={56} 
  strokeLinecap="round" 
  transition="transition-[stroke-dashoffset] ease-in-out duration-500" 
  width="w-36" 
  meter="stroke-blue-500" 
  track="stroke-gray-200" 
  fill="fill-blue-600"
>
  {value}%
</ProgressRadial> -->


<section class="bg-white dark:bg-gray-900">
    <div class="max-w-screen-xl px-4 py-8 mx-auto lg:py-24 lg:px-6">
        <div class="max-w-screen-md mx-auto mb-8 text-center lg:mb-12">
            <h2 class="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Choose Your Package</h2>
            <p class="mb-5 font-light text-gray-500 sm:text-xl dark:text-gray-400">
                Select the package that best suits your needs for an unforgettable livestream experience.
            </p>
        </div>
        <div class="space-y-8 lg:grid lg:grid-cols-3 sm:gap-6 xl:gap-10 lg:space-y-0">
            <!-- Base Package -->
            <div class="flex flex-col max-w-lg p-6 mx-auto text-center bg-white border border-gray-200 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
                <h3 class="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">Tributestream Solo</h3>
               <i>Offline Recording</i>
                <div class="flex items-baseline justify-center my-4">
                    <span class="text-5xl font-bold text-gray-900 dark:text-white">$550</span>
                </div>
                <ul role="list" class="mb-8 space-y-3 text-left">
                    <li class="flex items-center space-x-3">
                        <svg class="flex-shrink-0 w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0L5.293 10.707a1 1 0 111.414-1.414l2.586 2.586 7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                        <span>Professional Videographer</span>
                    </li>
                    <li class="flex items-center space-x-3">
                        <svg class="flex-shrink-0 w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0L5.293 10.707a1 1 0 111.414-1.414l2.586 2.586 7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                        <span>2 Hours of Record Time</span>
                    </li>
                    <li class="flex items-center space-x-3">
                        <svg class="flex-shrink-0 w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0L5.293 10.707a1 1 0 111.414-1.414l2.586 2.586 7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                        <span>Custom URL</span>
                    </li>
                    <li class="flex items-center space-x-3">
                        <svg class="flex-shrink-0 w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0L5.293 10.707a1 1 0 111.414-1.414l2.586 2.586 7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                        <span>1 Year of Complimentary Hosting</span>
                    </li>
                    <li class="flex items-center space-x-3">
                        <svg class="flex-shrink-0 w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0L5.293 10.707a1 1 0 111.414-1.414l2.586 2.586 7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                        <span>Complimentary Download of Recording</span>
                    </li>
                </ul>
                <button onclick={() => selectPackage('Anywhere')} class="text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-yellow-800">
                    Select Package
                </button>
            </div>
            <!-- Package 2  -->
            <div class="flex flex-col max-w-lg p-6 mx-auto text-center bg-white border border-gray-200 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
                <h3 class="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">Tributestream Gold</h3>

                <i>Livestream Recording</i>

                <div class="flex items-baseline justify-center my-4">
                    <span class="text-5xl font-bold text-gray-900 dark:text-white">$1,100</span>
                </div>
                <ul role="list" class="mb-8 space-y-3 text-left">
       
                    <li class="flex items-center space-x-3">
                        <svg class="flex-shrink-0 w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path>
                        </svg>                        <span>Professional Livestream Technician</span>
                    </li>
                    <li class="flex items-center space-x-3">
                        <svg class="flex-shrink-0 w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path>
                        </svg>                        <span>Remote Livestream Producer</span>
                    </li>
         
                    <li class="flex items-center space-x-3">
                        <svg class="flex-shrink-0 w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0L5.293 10.707a1 1 0 111.414-1.414l2.586 2.586 7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                        <span>Professional Videographer</span>
                    </li>
                    <li class="flex items-center space-x-3">
                        <svg class="flex-shrink-0 w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0L5.293 10.707a1 1 0 111.414-1.414l2.586 2.586 7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                        <span>2 Hours of Broadcast Time</span>
                    </li>
                    <li class="flex items-center space-x-3">
                        <svg class="flex-shrink-0 w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0L5.293 10.707a1 1 0 111.414-1.414l2.586 2.586 7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                        <span>Custom URL</span>
                    </li>
                    <li class="flex items-center space-x-3">
                        <svg class="flex-shrink-0 w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0L5.293 10.707a1 1 0 111.414-1.414l2.586 2.586 7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                        <span>1 Year of Complimentary Hosting</span>
                    </li>
                    <li class="flex items-center space-x-3">
                        <svg class="flex-shrink-0 w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0L5.293 10.707a1 1 0 111.414-1.414l2.586 2.586 7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                        <span>Complimentary Download of Livestream</span>
                    </li>
                </ul>
                <button onclick={() => selectPackage('Gold')} class="text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-yellow-800">
                    Tributestream Gold
                </button>
          
            </div>               
            
            <div class="flex flex-col max-w-lg p-6 mx-auto text-center bg-white border border-gray-200 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
                <h3 class="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">Tributestream Legacy</h3>
                <i>Livestream Production</i>

                <div class="flex items-baseline justify-center my-4">
                    <span class="text-5xl font-bold text-gray-900 dark:text-white">$2,799</span>
                </div>
                <ul role="list" class="mb-8 space-y-3 text-left">
       
            

         
                    <li class="flex items-center space-x-3">
                        <svg class="flex-shrink-0 w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path>
                        </svg>                        <span>B-Roll Videographer</span>
                    </li>    
                    <li class="flex items-center space-x-3">
                        <svg class="flex-shrink-0 w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path>
                        </svg>                        <span>Pre-Site Visit by Production Manager</span>
                    </li>
                    <li class="flex items-center space-x-3">
                        <svg class="flex-shrink-0 w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path>
                        </svg>                        <span>Post Production Editing</span>
                    </li>
                 
                    <li class="flex items-center space-x-3">
                        <svg class="flex-shrink-0 w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0L5.293 10.707a1 1 0 111.414-1.414l2.586 2.586 7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>                        <span>Professional Livestream Technician</span>
                    </li>
                    <li class="flex items-center space-x-3">
                        <svg class="flex-shrink-0 w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0L5.293 10.707a1 1 0 111.414-1.414l2.586 2.586 7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>                        <span>Remote Livestream Producer</span>
                    </li>
         
                    <li class="flex items-center space-x-3">
                        <svg class="flex-shrink-0 w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0L5.293 10.707a1 1 0 111.414-1.414l2.586 2.586 7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                        <span>Professional Videographer</span>
                    </li>
                    <li class="flex items-center space-x-3">
                        <svg class="flex-shrink-0 w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0L5.293 10.707a1 1 0 111.414-1.414l2.586 2.586 7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                        <span>2 Hours of Broadcast Time</span>
                    </li>
                    <li class="flex items-center space-x-3">
                        <svg class="flex-shrink-0 w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0L5.293 10.707a1 1 0 111.414-1.414l2.586 2.586 7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                        <span>Custom URL</span>
                    </li>
                    <li class="flex items-center space-x-3">
                        <svg class="flex-shrink-0 w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0L5.293 10.707a1 1 0 111.414-1.414l2.586 2.586 7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                        <span>1 Year of Complimentary Hosting</span>
                    </li>
                    <li class="flex items-center space-x-3">
                        <svg class="flex-shrink-0 w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0L5.293 10.707a1 1 0 111.414-1.414l2.586 2.586 7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                        <span>Complimentary Download of Livestream</span>
                    </li>
                </ul>
                <button onclick={() => selectPackage('Gold')} class="text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-yellow-800">
                    Tributestream Gold
                </button>
          
            </div>  

        </div>
    </div>
</section>


<div class="grid grid-cols-3 gap-6 p-6">
  <!-- Form Section -->
  <div class="col-span-2 p-4 bg-white shadow-lg rounded-lg">
    <form>
      <h2 class="text-lg font-bold mb-4">Schedule a Livestream</h2>

      <!-- Package Selection -->
      <label class="block mb-2">Package</label>
      <select bind:value={formData.package} class="block w-full p-2 border rounded">
        <option value="Solo">Solo ($399)</option>
        <option value="Anywhere">Anywhere ($799)</option>
        <option value="Legacy">Legacy ($1499)</option>
      </select>

      <!-- Livestream Date -->
      <label class="block mt-4 mb-2">Livestream Date</label>
      <input type="date" bind:value={formData.livestreamDate} class="block w-full p-2 border rounded" />

      <!-- Duration -->
      <label class="block mt-4 mb-2">Duration (hours)</label>
      <input type="number" bind:value={formData.duration} min="2" class="block w-full p-2 border rounded" />

      <!-- Overrun Options -->
      <div class="mt-4">
        <label>
          <input type="checkbox" bind:checked={formData.allowOverrun} />
          Allow Time Overrun (Refundable $125)
        </label>
        {#if formData.allowOverrun}
          <div class="mt-2">
            <label class="block">Contact Name</label>
            <input type="text" bind:value={formData.overrunContact.name} class="block w-full p-2 border rounded" />
            <label class="block mt-2">Contact Phone</label>
            <input type="text" bind:value={formData.overrunContact.phone} class="block w-full p-2 border rounded" />
          </div>
        {/if}
      </div>

      <!-- Locations -->
      <div class="mt-4">
        <h3 class="font-bold">Locations</h3>
        {#each formData.locations as loc, index}
          <div class="flex items-center mt-2">
            <input
              type="text"
              placeholder={`Address ${index + 1}`}
              bind:value={loc.address}
              class="block w-full p-2 border rounded"
            />
            <button type="button" onclick={() => removeLocation(index)} class="ml-2 text-red-500" class:hidden={index < locationNumDefault}>Remove</button>
          </div>
        {/each}
        <button type="button" onclick={addLocation} class="mt-2 text-blue-500">Add Location</button>
      </div>
    </form>
  </div>

  <!-- Cart Section -->
  <div class="col-span-1 p-4 bg-gray-100 shadow-lg rounded-lg">
    <h2 class="text-lg font-bold mb-4">Cart</h2>
    <ul>
      {#each cartItems.items as item}
        <li class="flex justify-between border-b py-2">
          <span>{item.name}</span>
          <span>${item.price}</span>
        </li>
      {/each}
    </ul>
    <div class="flex justify-between font-bold mt-4">
      <span>Total</span>
      <span>${cartItems.total}</span>
    </div>
  </div>
</div>

 