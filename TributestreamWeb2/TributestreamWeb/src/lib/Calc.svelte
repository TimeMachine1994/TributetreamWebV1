<script lang="ts">
    let formData = $state({
      package: 'Solo',
      livestreamDate: '',
      allowOverrun: false,
      locations: [{ name: '', address: '', travelExceedsHour: false }],
      funeralHomeName: '',
      funeralDirectorName: '',
      dates: [],
      duration: 2,
    });
  
    let locationNumDefault = $derived.by(() => {
      if (formData.package === 'Solo' || formData.package === 'Legacy') {
        return 1;
      } else if (formData.package === 'Anywhere') {
        return 2;
      }
      return 1;
    });
  
    let cartItems = $derived.by(() => {
      let items = [];
      let total = 0;
  
      const packageCosts = { Solo: 399, Anywhere: 799, Legacy: 1499 };
      items.push({ name: `${formData.package} Package`, price: packageCosts[formData.package] });
      total += packageCosts[formData.package];
  
      const extraHours = formData.duration > 2 ? formData.duration - 2 : 0;
      if (extraHours) {
        items.push({ name: `Extra Duration (${extraHours} hour(s))`, price: extraHours * 125 });
        total += extraHours * 125;
      }
  
      formData.locations.forEach((loc, index) => {
        if (index > 0) {
          items.push({ name: `Additional Location #${index + 1}`, price: 349 });
          total += 349;
        }
      });
  
      if (formData.allowOverrun) {
        items.push({ name: 'Overrun Surcharge (Refundable)', price: 125 });
        total += 125;
      }
  
      return { items, total };
    });
  
    function addLocation() {
      formData.locations.push({ name: '', address: '', travelExceedsHour: false });
    }
  
    function removeLocation(index) {
      formData.locations.splice(index, 1);
    }
  </script>
  
  <div class="grid grid-cols-6 gap-6 p-6">
    <!-- Title Area -->
    <div class="col-span-6 p-4 bg-gray-100 shadow-lg rounded-lg text-center">
      <h1 class="text-2xl font-bold">Schedule and Calculate Your Livestream</h1>
    </div>
  
    <!-- Form Section -->
    <div class="col-span-4 p-4 bg-white shadow-lg rounded-lg">
      <form>
        <h2 class="text-lg font-bold mb-4">Schedule a Livestream</h2>
  
        <!-- Package and Livestream Date -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block mb-2">Package</label>
            <select bind:value={formData.package} class="block w-full p-2 border rounded">
              <option value="Solo">Solo ($399)</option>
              <option value="Anywhere">Anywhere ($799)</option>
              <option value="Legacy">Legacy ($1499)</option>
            </select>
          </div>
          <div>
            <label class="block mb-2">Livestream Date</label>
            <input type="date" bind:value={formData.livestreamDate} class="block w-full p-2 border rounded" />
          </div>
        </div>
  
        <!-- Duration Slider -->
        <div class="mt-4">
          <label class="block mb-2">Duration (hours)</label>
          <input
            type="range"
            bind:value={formData.duration}
            min="2"
            max="8"
            step="1"
            class="block w-full"
          />
          <p class="text-sm text-gray-600 mt-2">Selected Duration: {formData.duration} hours</p>
        </div>
  
        <!-- Funeral Home and Director -->
        <div class="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label class="block mb-2">Funeral Home Name</label>
            <input type="text" bind:value={formData.funeralHomeName} class="block w-full p-2 border rounded" />
          </div>
          <div>
            <label class="block mb-2">Funeral Director Name</label>
            <input type="text" bind:value={formData.funeralDirectorName} class="block w-full p-2 border rounded" />
          </div>
        </div>
  
        <!-- Locations -->
        <div class="mt-4">
          <h3 class="font-bold">Locations</h3>
          {#each formData.locations as loc, index}
            <div class="grid grid-cols-2 gap-4 mt-2">
              <div>
                <label class="block">Location Name</label>
                <input
                  type="text"
                  bind:value={loc.name}
                  placeholder={`Location #${index + 1} Name`}
                  class="block w-full p-2 border rounded"
                />
              </div>
              <div>
                <label class="block">Location Address</label>
                <input
                  type="text"
                  bind:value={loc.address}
                  placeholder={`Location #${index + 1} Address`}
                  class="block w-full p-2 border rounded"
                />
              </div>
            </div>
            <button
              type="button"
              onclick={() => removeLocation(index)}
              class="mt-2 text-red-500"
              class:hidden={index < locationNumDefault}
            >
              Remove Location
            </button>
          {/each}
          <button type="button" onclick={addLocation} class="mt-4 text-blue-500">Add Location</button>
        </div>
      </form>
    </div>
  
  <!-- Cart Section -->
  <div class="col-span-2 p-4 bg-gray-100 shadow-lg rounded-lg">
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

    <!-- Save and Pay Buttons -->
    <div class="mt-6 flex flex-col gap-4">
      <button
        type="button"
        class="w-full bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800"
        onclick={() => console.log('Save and Pay Later')}
      >
        Save and Pay Later
      </button>
      <button
        type="button"
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
        onclick={() => console.log('Save and Pay Now')}
      >
        Save and Checkout Now
      </button>
    </div>
  </div>
</div>