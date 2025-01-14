<script lang="ts">
    import { writable } from 'svelte/store';


    // end additions 1-28-24


   // Declare reactive state variables using $state
let livestreamAtFuneralHome = $state(null); // Reactive variable for whether the livestream is at a funeral home
let selectedPackage = $state(''); // Reactive variable for the selected package
let additionalLocations = $state({ secondAddress: false, thirdAddress: false }); // Reactive object for additional locations
let livestreamDuration = $state(2); // Default duration for the livestream
let masterPrice = $state(0); // Reactive variable for the base price of the selected package
let urlFriendlyText = $state("your_loved_ones_name_here"); // Reactive variable for URL-friendly text

// Constant object for package prices (does not need to be reactive)
const packagePrices = { 'Solo': 399, 'Anywhere': 499, 'Legacy': 799 };

// Reactive object to store form data
let calcFormData = $state({
    lovedOnesName: '',
    livestreamDate: '',
    yourName: '',
    email: '',
    phoneNumber: '',    
    secondAddress: '',
    thirdAddress: ''
});



// Derived values
let additionalCharge = $derived(() => {
    return (additionalLocations.secondAddress ? 399 : 0) +
           (additionalLocations.thirdAddress ? 329 : 0) +
           (livestreamDuration > 2 ? (livestreamDuration - 2) * 99 : 0);
});

let totalCost = $derived(() => {
    const charge = additionalCharge(); // Invoke additionalCharge to get the computed value
    return masterPrice + charge; // Add masterPrice and charge
});

// Effect for conditional logic
$effect(() => {
    if (selectedPackage === 'Solo' && (additionalLocations.secondAddress || additionalLocations.thirdAddress)) {
        selectPackage('Anywhere'); // Call function to update selectedPackage
    }
});

 // Derived values for additional charges
let additionalCharges = $derived(() => {
    const charges = [];
    if (additionalLocations.secondAddress) {
        charges.push({ item: 'Location B', price: 399 });
    }
    if (additionalLocations.thirdAddress) {
        charges.push({ item: 'Location C', price: 329 });
    }
    if (livestreamDuration > 2) {
        let extraHours = livestreamDuration - 2;
        charges.push({ item: `Additional Livestream Time (${extraHours}h)`, price: extraHours * 99 });
    }
    return charges;
});


// Reactive state for currentPage
let currentPageValue = $state(1); // Internal reactive value

// Create a store-like object with a `subscribe` method
const currentPage = {
    subscribe(callback: (value: number) => void) {
        // Call the callback initially and whenever currentPageValue changes
        callback(currentPageValue);

        // Create a reactive effect to update subscribers
        $effect(() => {
            callback(currentPageValue);
        });

        // Return an unsubscribe function (no-op since $effect handles cleanup automatically)
        return () => {};
    },

    // Method to update the value
    set(value: number) {
        currentPageValue = value; // Update the reactive value
    }
};

// Usage example in a Svelte template
/*
{#if $currentPage === 1}
    <p>Page 1 Content</p>
{/if}
*/



    function selectPackage(packageName) {
        selectedPackage = packageName;
        masterPrice = packagePrices[packageName];
    }

    async function submitForm() {
    try {
        isSubmitting = true;

        const response = await fetch('https://tributestream.com/wp-json/book_now/v1/process_booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                lovedOnesName: formData.lovedOnesName,
                livestreamDate: formData.livestreamDate,
                yourName: formData.yourName,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                secondAddress: formData.secondAddress,
                thirdAddress: formData.thirdAddress,
                selectedPackage: selectedPackage,
                livestreamAtFuneralHome: livestreamAtFuneralHome,
                additionalLocations: JSON.stringify(additionalLocations),
                livestreamDuration: livestreamDuration,
                masterPrice: masterPrice,
                totalCost: totalCost,
                urlFriendlyText: urlFriendlyText
            })
        });

        const data = await response.json();
        if (data && data.url) {
            invoiceUrl = data.url;
            window.location.href = invoiceUrl;
        } else {
            console.error('Error fetching invoice URL', data);
        }
    } catch (error) {
        console.error('Error submitting form:', error);
    } finally {
        isSubmitting = false;
    }
}





    // my functions
    
    function convertText(){
         urlFriendlyText = formData.lovedOnesName.replace(/\s+/g, '_');
         urlFriendlyText = urlFriendlyText.toLowerCase();
         return urlFriendlyText;
    }
</script>
{#if $currentPage === 1}
<div class="min-h-screen bg-gray-700 flex items-center justify-center">
    <!-- Form Section -->
    <div class="bg-gray-800 border-2 border-gray-900 shadow-2xl rounded-lg">
        <!-- Display the custom link -->
        <div class="text-white text-center p-4">
            <p>Your Loved One's Custom Link:</p>
            <p>Tributestream.com/celebration_of_life_for_{urlFriendlyText}</p>
        </div>
        
        <!-- Input Fields -->
        <div class="p-6 grid grid-cols-4 gap-5">
            <label class="col-span-4 text-white text-center">Loved One's Name</label>
            <input
                type="text"
                class="col-span-4 bg-gray-800 border-2 border-gray-900 text-white rounded-lg"
                bind:value={formData.lovedOnesName}
                oninput={convertText}
                placeholder="Loved One's Name"
            />

            <label class="col-span-4 text-white text-center">Livestream Date</label>
            <input
                type="date"
                class="col-span-4 bg-gray-800 border-2 border-gray-900 text-white rounded-lg"
                bind:value={formData.livestreamDate}
            />

            <label class="col-span-4 text-white text-center">Your Name</label>
            <input
                type="text"
                class="col-span-4 bg-gray-800 border-2 border-gray-900 text-white rounded-lg"
                bind:value={formData.yourName}
                placeholder="Your Name"
            />

            <label class="col-span-4 text-white text-center">Email</label>
            <input
                type="email"
                class="col-span-4 bg-gray-800 border-2 border-gray-900 text-white rounded-lg"
                bind:value={formData.email}
                placeholder="Email"
            />

            <label class="col-span-4 text-white text-center">Phone Number</label>
            <input
                type="tel"
                class="col-span-4 bg-gray-800 border-2 border-gray-900 text-white rounded-lg"
                bind:value={formData.phoneNumber}
                placeholder="Phone Number"
            />
            
            <label class="col-span-4 text-white text-center">Are we livestreaming at the funeral home?</label>
            <button
                class="col-span-2 bg-gray-500 hover:bg-gray-400 rounded-full text-white"
                onclick={() => livestreamAtFuneralHome = true}
            >
                Yes
            </button>
            <button
                class="col-span-2 bg-gray-500 hover:bg-gray-400 rounded-full text-white"
                onclick={() => livestreamAtFuneralHome = false}
            >
                No
            </button>
            
            <div class="col-span-3"></div>
            <button
                class="col-span-1 bg-gray-500 hover:bg-gray-400 rounded-full text-white"
                onclick={() => currentPage.set(2)}
            >
                Next
            </button>
        </div>
    </div>
</div>
{:else}
<div class="min-h-screen bg-gray-700 flex items-center justify-center">
    <!-- Package Selection and Summary -->
    <div class="bg-gray-800 border-2 border-gray-900 shadow-2xl rounded-lg grid grid-cols-4 gap-2">
        <!-- Package Selection -->
        <div class="col-span-2 p-4">
            <div class="text-center text-white mb-4">Select a Package:</div>
            <div class="flex justify-center space-x-2">
                {#if livestreamAtFuneralHome !== false}
                    <button
                        class="bg-gray-500 hover:bg-gray-400 rounded-full p-2 text-white"
                        onclick={() => selectPackage('Solo')}
                    >
                        Solo
                    </button>
                {/if}
                <button
                    class="bg-gray-500 hover:bg-gray-400 rounded-full p-2 text-white"
                    onclick={() => selectPackage('Anywhere')}
                >
                    Anywhere
                </button>
                <button
                    class="bg-gray-500 hover:bg-gray-400 rounded-full p-2 text-white"
                    onclick={() => selectPackage('Legacy')}
                >
                    Legacy
                </button>
            </div>

            <!-- Livestream Duration Slider -->
            <div class="text-center text-white mt-4">
                Livestream Duration: {livestreamDuration} hours
            </div>
            <input
                type="range"
                min="1"
                max="8"
                bind:value={livestreamDuration}
                class="w-full mt-2"
            />

            <!-- Additional Locations -->
            <label class="block mt-4 text-white">
                <input type="checkbox" bind:checked={additionalLocations.secondAddress} />
                Livestream at a second address?
            </label>
            {#if additionalLocations.secondAddress}
                <input
                    type="text"
                    bind:value={formData.secondAddress}
                    placeholder="Enter second address"
                    class="bg-gray-800 border-2 border-gray-900 text-white rounded-lg w-full mt-2"
                />
            {/if}

            <label class="block mt-4 text-white">
                <input type="checkbox" bind:checked={additionalLocations.thirdAddress} />
                Livestream at a third address?
            </label>
            {#if additionalLocations.thirdAddress}
                <input
                    type="text"
                    bind:value={formData.thirdAddress}
                    placeholder="Enter third address"
                    class="bg-gray-800 border-2 border-gray-900 text-white rounded-lg w-full mt-2"
                />
            {/if}
        </div>

        <!-- Summary Section -->
        <div class="col-span-2 p-4">
            <div class="text-center text-white mb-4">Summary</div>
            <div class="overflow-x-auto">
                <table class="min-w-full text-white">
                    <thead>
                        <tr>
                            <th class="border px-2 text-right">Services</th>
                            <th class="border px-2 text-right">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="border px-2 text-right">Base Price</td>
                            <td class="border px-2 text-right">${masterPrice}</td>
                        </tr>
                        {#each additionalCharges as charge}
                            <tr>
                                <td class="border px-2 text-right">{charge.item}</td>
                                <td class="border px-2 text-right">${charge.price}</td>
                            </tr>
                        {/each}
                        <tr>
                            <td class="border px-2 text-right font-bold">Total Cost</td>
                            <td class="border px-2 text-right font-bold">${totalCost}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <button
                class="w-full bg-gray-500 hover:bg-gray-400 rounded-full p-3 text-white mt-4"
                onclick={submitForm}
                disabled={isSubmitting}
            >
                {#if isSubmitting} Processing... {:else} Submit {/if}
            </button>
        </div>
    </div>
</div>
{/if}
