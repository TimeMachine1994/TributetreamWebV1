<script>
    // Initialize state for form data
    let formData = $state({
      package: null,
      livestreamDate: null,
      multipleDates: false,
      locations: [{ id: crypto.randomUUID(), address: "", travelTime: 0 }],
      duration: 2,
      startTime: "",
      continueAfterStartTime: false,
      contact: { name: "", phone: "" },
    });
  
    const packages = [
      { name: "Solo", cost: 399 },
      { name: "Anywhere", cost: 799 },
      { name: "Legacy", cost: 1499 },
    ];
  
    // Derive total cost dynamically
    const totalCost = $derived.by(() => {
      console.log("Recalculating total cost with form data:", formData);
  
      let baseCost = formData.package
        ? packages.find((p) => p.name === formData.package).cost
        : 0;
  
      const additionalCosts = formData.locations.reduce((acc, loc) => {
        if (loc.travelTime > 1) {
          console.log(`Travel time for ${loc.address} exceeds 1 hour, adding cost.`);
          return acc + 100; // Assuming $100 per additional travel hour
        }
        return acc;
      }, 0);
  
      const durationCost = Math.max(0, formData.duration - 2) * 50; // $50 per hour beyond 2 hours
      return baseCost + additionalCosts + durationCost;
    });
  
    // Mock data generation for testing
    const generateMockData = () => {
      formData = {
        package: "Legacy",
        livestreamDate: "2024-01-20",
        multipleDates: true,
        locations: [
          { id: crypto.randomUUID(), address: "123 Elm Street", travelTime: 2 },
          { id: crypto.randomUUID(), address: "456 Oak Avenue", travelTime: 1.5 },
        ],
        duration: 4,
        startTime: "14:00",
        continueAfterStartTime: true,
        contact: { name: "John Doe", phone: "555-1234" },
      };
    };
  
    // Initialize with mock data for testing
    generateMockData();
  </script>
  
  <div class="p-4 space-y-6 bg-gray-100">
    <h1 class="text-2xl font-bold">Livestream Booking Form</h1>
  
    <!-- Package Selection -->
    <div>
      <label class="block text-lg">Select a Package:</label>
      <select bind:value={formData.package} class="p-2 border rounded w-full">
        <option value="" disabled>Select...</option>
        {#each packages as pkg}
          <option value={pkg.name}>{pkg.name} (${pkg.cost})</option>
        {/each}
      </select>
    </div>
  
    <!-- Livestream Date -->
    <div>
      <label class="block text-lg">Livestream Date:</label>
      <input
        type="date"
        bind:value={formData.livestreamDate}
        class="p-2 border rounded w-full"
      />
    </div>
  
    <!-- Locations -->
    <div>
      <label class="block text-lg">Locations:</label>
      {#each formData.locations as loc, i}
        <div class="space-y-2 border p-4 rounded bg-white mt-2">
          <input
            type="text"
            placeholder="Address"
            bind:value={formData.locations[i].address}
            class="p-2 border rounded w-full"
          />
          <input
            type="number"
            placeholder="Travel time (hours)"
            bind:value={formData.locations[i].travelTime}
            min="0"
            step="0.5"
            class="p-2 border rounded w-full"
          />
        </div>
      {/each}
      <button
        class="mt-2 p-2 bg-blue-500 text-white rounded"
        on:click={() =>
          formData.locations = [
            ...formData.locations,
            { id: crypto.randomUUID(), address: "", travelTime: 0 },
          ]
        }
      >
        Add Location
      </button>
    </div>
  
    <!-- Duration -->
    <div>
      <label class="block text-lg">Livestream Duration (hours):</label>
      <input
        type="number"
        bind:value={formData.duration}
        min="2"
        class="p-2 border rounded w-full"
      />
    </div>
  
    <!-- Start Time and Contact -->
    <div>
      <label class="block text-lg">Estimated Start Time:</label>
      <input
        type="time"
        bind:value={formData.startTime}
        class="p-2 border rounded w-full"
      />
    </div>
  
    <div class="mt-4">
      <label class="flex items-center">
        <input
          type="checkbox"
          bind:checked={formData.continueAfterStartTime}
          class="mr-2"
        />
        Continue Livestream If Event Overruns?
      </label>
      {#if formData.continueAfterStartTime}
        <div class="mt-2 space-y-2">
          <input
            type="text"
            placeholder="Contact Name"
            bind:value={formData.contact.name}
            class="p-2 border rounded w-full"
          />
          <input
            type="tel"
            placeholder="Contact Phone Number"
            bind:value={formData.contact.phone}
            class="p-2 border rounded w-full"
          />
        </div>
      {/if}
    </div>
  
    <!-- Cost Display -->
    <div>
      <h2 class="text-lg font-bold">Total Cost: ${totalCost}</h2>
    </div>
  
    <!-- Submit Button -->
    <button
      class="mt-4 p-2 bg-green-500 text-white rounded"
      on:click={() => console.log("Serialized Form Data:", JSON.stringify(formData))}
    >
      Submit
    </button>
  </div>
  

<!-- <script lang="ts">

let currentPage = $state(1);
let livestreamAtFuneralHome = $state(null);
let selectedPackage = $state('');
let additionalLocations = $state({ secondAddress: false, thirdAddress: false });
let livestreamDuration = $state(2);
let packagePrices = $state({'solo': 399, 'Anywhere': 499, 'Legacy': 799 });
let masterPrice = $state(0);
let urlFriendlyText = $state("your_loved_ones_name_here");
let lovedOnesName = $state("lovedOnesName");

</script>

<div class="flex justify-center items-center min-h-screen p-4">
    <div class="flex flex-col max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden transform hover:scale-102 transition-all duration-300 mx-auto">
        <div class="w-full p-8 bg-gradient-to-r from-gray-100 to-gray-200">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">Celebration of Life for {lovedOnesName}</h2>
            <p class="text-gray-600">Tributestream.com/{urlFriendlyText}</p>
        </div>
        <div class="flex flex-col md:flex-row">
            <div class="md:w-2/3 p-8">
                <p class="text-gray-700 leading-relaxed text-lg">
Base Package:
Tributestream Solo                    
- 720p HD Livestreaming (Or Better, if Available)
- Onsite Livestream Videographer 
- 2 Hours of Broadcast Time
- Custom URL
- 1 Year of Complimentary Hosting
- Complimentary Download of Livestream


Tributestream Anywhere                
- 1080p HD Livestreaming
- Onsite Livestream Videographer
- 3 Hours of Broadcast Time
+ 1 Additional Location
- Custom URL
- 1 Year of Complimentary Hosting
- Complimentary Download of Livestream


Tributestream Legacy                 
- 1080p HD Livestreaming
- 4 Hours of Broadcast Time
+ 1 Additional Location
+ 1 Livestream Videographer
+ 1 Professional Cinematographer
+ 1 Production Manager
+ 1 Pre-Site Visit with Production Manager
+ 1 Complimentary Add On
- Custom URL
- 1 Year of Complimentary Hosting
- Complimentary Download of Livestream

Package: Solo: 399, Anywhere, 799 Legacy: 1,499
Livestream Date:  
Muitple Dates? Y/N 
Livestream Location:
Mutiple Locations? Y/N
Location Address One:
Location Address Two:
 (Add Additional Addrss Button)
Livestream Duration:
(2 Hour Minimum)
If Multiple locations, is travle expected to exceed 1 hour for any of them?
Estimated Livestream Start Time:
if we go past the start time, and we do not get to the end of the event, do you want us to continue to livestream or contact you to check if we should stop?
If we should contact, who should we contact? Name: Text Phone Number:

Do you want us to multistream other than the custom link? If so we can share it on our social media as well, or you can pick and choose.

Do you want any add ons:
Preimum Add Ons:
Celebration of Life Planner - A talented event planner will assist you with making the celebration of life something everyone will love and adore. 

Live Captioning - We can add captions to your livestream for the deaf and hard of hearing.



Audio Visual Services - We can provide a full audio visual setup for your event. This includes a sound system, a video projector, and a screen. We can also provide a technician to operate the equipment.


Physical Add Ons:
Tribute Booth - We can Provide a Tribute Booth for your event. This includes a table, a chair, and a backdrop. We can also provide a technician to operate the booth. 
Memorial Video - High Quality Slideshow, which may include videos if desired. Dependent on lenght of total media.
Engraved Wooden USB Drive and Keepsake Box
Standard Wooden USB Drive and Keepsake Poutch
Video Photo Book for Memorial Video
Infinite Object for Memorial Video

Photo Bucket Screen - Allow Visitors to upload photos to a screen in the venue.

Screen size - 10" 27" 32" 55" 65" 75"
Post Production Upgrade - Edit out any livestream dead air,  add in music, add in titles, add in graphics, add in overlays.

Photography and additional Videography - We can take photos and videos of the event and provide them to you as an introduction and an outro to the final edit. This includes the post production upgrade.

Photography Only

Would you like to opt in to the Tributestream Archive where we will store your livestream free forever in exchange for letting us use the footage for marketing and promotional purposes?








            </div>
            <div class="md:w-1/3 p-8 bg-gradient-to-br from-gray-50 to-gray-100">
                <p class="text-gray-700 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco.
                </p>
            </div>
        </div>
    </div>
</div> -->
