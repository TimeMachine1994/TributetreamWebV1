<script lang="ts">
    import { enhance } from '$app/forms';
    import { processFormActionResult } from '$lib/utils/unified-form-helper';
    import { getUnifiedStoreContext } from '$lib/stores/unified-store.svelte';
    
    // Get the unified store
    const store = getUnifiedStoreContext();
    
    // Props from the form action response
    let { form } = $props();
    
    // Define package options
    const PACKAGES = [
      {
        id: "solo",
        name: "Tributestream Solo",
        description: "Basic memorial package",
        basePrice: 550,
        features: []
      },
      {
        id: "gold",
        name: "Tributestream Gold",
        description: "Enhanced memorial package",
        basePrice: 1100,
        features: []
      },
      {
        id: "legacy",
        name: "Tributestream Legacy",
        description: "Premium memorial package",
        basePrice: 2799,
        features: []
      }
    ];
    
    // Process form action result
    $effect(() => {
      if (!form) return;
      
      processFormActionResult(form, store);
      
      if (form.error) {
        alert(form.message || 'Error saving data');
      } else if (form.success) {
        alert('Data saved successfully');
      }
    });
    
    // Effect to calculate cart items and total price
    $effect(() => {
      const items = [];
      let total = 0;
      
      // Add package price
      const packageItem = PACKAGES.find(p => p.name === store.packageInfo.selection);
      if (packageItem) {
        items.push({
          name: packageItem.name,
          price: packageItem.basePrice
        });
        total += packageItem.basePrice;
      }
      
      // Calculate costs for all days and locations
      store.scheduleDays.forEach((day, dayIndex) => {
        // Additional locations beyond the first one cost extra
        day.locations.slice(1).forEach((location, locationIndex) => {
          items.push({
            name: `Additional Location (Day ${dayIndex + 1}, Location ${locationIndex + 2}) - ${location.name}`,
            price: 349
          });
          total += 349;
        });
        
        // Calculate extra hours for each location
        day.locations.forEach((location, locationIndex) => {
          const extraHours = Math.max(0, location.duration - 2);
          if (extraHours > 0) {
            items.push({
              name: `Extra Duration (Day ${dayIndex + 1}, Location ${locationIndex + 1}) - ${extraHours} additional hours at ${location.name}`,
              price: extraHours * 125
            });
            total += extraHours * 125;
          }
        });
      });
      
      // Update the store
      store.updatePackageInfo({
        items,
        priceTotal: total
      });
    });
    
    // Helper function to handle package selection
    function selectPackage(packageName: string) {
      store.updatePackageInfo({ selection: packageName });
    }
</script>
  
<div class="memorial-calculator">
  <!-- Package Selection -->
  <div class="package-selection">
    {#each PACKAGES as pkg}
      <button 
        class="px-4 py-2 rounded-lg border-2 {store.packageInfo.selection === pkg.name ? 'border-primary bg-primary/10' : 'border-gray-200'}"
        on:click={() => selectPackage(pkg.name)}
      >
        <span class="block font-semibold">{pkg.name}</span>
        <span class="block text-sm text-gray-600">${pkg.basePrice}</span>
      </button>
    {/each}
  </div>

  <!-- Schedule Days -->
  <div class="schedule-days mt-6 space-y-8">
    {#each store.scheduleDays as day, dayIndex}
      <div class="day p-4 border rounded-lg">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">Day {dayIndex + 1}</h3>
          {#if store.scheduleDays.length > 1}
            <button 
              on:click={() => store.removeScheduleDay(dayIndex)}
              class="text-sm text-red-600 hover:text-red-700"
            >
              Remove Day
            </button>
          {/if}
        </div>

        <label class="block mb-4">
          <span class="text-sm font-medium text-gray-700">Date:</span>
          <input 
            type="date"
            bind:value={day.date}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </label>

        <!-- Locations for this day -->
        <div class="locations space-y-4">
          {#each day.locations as location, locationIndex}
            <div class="location p-4 border rounded-lg">
              <div class="flex items-center justify-between mb-4">
                <h4 class="font-medium">Location {locationIndex + 1}</h4>
                {#if locationIndex > 0}
                  <button 
                    on:click={() => store.removeScheduleDayLocation(dayIndex, locationIndex)}
                    class="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove Location
                  </button>
                {/if}
              </div>

              <input 
                type="text"
                placeholder="Location Name"
                bind:value={location.name}
                on:input={() => store.updateScheduleDayLocation(dayIndex, locationIndex, { name: location.name })}
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />

              <input 
                type="text"
                placeholder="Address"
                bind:value={location.address}
                on:input={() => store.updateScheduleDayLocation(dayIndex, locationIndex, { address: location.address })}
                class="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />

              <div class="grid grid-cols-2 gap-4 mt-2">
                <label class="block">
                  <span class="text-sm font-medium text-gray-700">Start Time:</span>
                  <input 
                    type="time"
                    bind:value={location.startTime}
                    on:input={() => store.updateScheduleDayLocation(dayIndex, locationIndex, { startTime: location.startTime })}
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </label>

                <label class="block">
                  <span class="text-sm font-medium text-gray-700">Duration (hours):</span>
                  <input 
                    type="number"
                    min="1"
                    bind:value={location.duration}
                    on:input={() => store.updateScheduleDayLocation(dayIndex, locationIndex, { duration: location.duration })}
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </label>
              </div>

              <label class="mt-2 block">
                <span class="text-sm font-medium text-gray-700">Notes:</span>
                <textarea
                  bind:value={location.notes}
                  on:input={() => store.updateScheduleDayLocation(dayIndex, locationIndex, { notes: location.notes })}
                  rows="2"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                ></textarea>
              </label>

              <label class="mt-2 flex items-center">
                <input 
                  type="checkbox"
                  bind:checked={location.travelExceedsHour}
                  on:change={() => store.updateScheduleDayLocation(dayIndex, locationIndex, { travelExceedsHour: location.travelExceedsHour })}
                  class="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span class="ml-2 text-sm text-gray-600">Travel exceeds 1 hour</span>
              </label>
            </div>
          {/each}

          {#if day.locations.length < 3}
            <button 
              on:click={() => store.addScheduleDayLocation(dayIndex)}
              class="text-sm text-primary hover:text-primary-dark"
            >
              Add Location ({day.locations.length}/3)
            </button>
          {/if}
        </div>
      </div>
    {/each}

    <button 
      on:click={() => store.addScheduleDay()}
      class="w-full py-2 text-center border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary hover:text-primary"
    >
      Add Another Day
    </button>
  </div>

  <!-- Cart Summary -->
  <div class="cart-summary mt-8 p-4 bg-gray-50 rounded-lg">
    <h3 class="text-lg font-semibold">Order Summary</h3>
    <div class="mt-4 space-y-2">
      {#each store.packageInfo.items || [] as item}
        <div class="flex justify-between text-sm">
          <div>
            <span>{item.name}</span>
          </div>
          <span>${item.price}</span>
        </div>
      {/each}
      <div class="pt-4 border-t flex justify-between font-semibold">
        <span>Total:</span>
        <span>${store.packageInfo.priceTotal}</span>
      </div>
    </div>
  </div>

  <!-- Actions -->
  <div class="actions mt-6 flex gap-4">
    <!-- Form to save calculator data -->
    <form 
      method="POST" 
      action="?/saveCalculatorData" 
      use:enhance 
      class="flex-1"
    >
      <input type="hidden" name="selectedPackage" value={store.packageInfo.selection} />
      <input type="hidden" name="cartItems" value={JSON.stringify(store.packageInfo.items)} />
      <input type="hidden" name="cartTotal" value={store.packageInfo.priceTotal} />
      <input type="hidden" name="scheduleDays" value={JSON.stringify(store.scheduleDays)} />
      
      <button
        type="submit"
        class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Save
      </button>
    </form>
    
    <!-- Form to proceed to checkout -->
    <form 
      method="POST" 
      action="?/proceedToCheckout" 
      use:enhance 
      class="flex-1"
    >
      <input type="hidden" name="selectedPackage" value={store.packageInfo.selection} />
      <input type="hidden" name="cartItems" value={JSON.stringify(store.packageInfo.items)} />
      <input type="hidden" name="cartTotal" value={store.packageInfo.priceTotal} />
      <input type="hidden" name="scheduleDays" value={JSON.stringify(store.scheduleDays)} />
      
      <button
        type="submit"
        class="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Checkout
      </button>
    </form>
  </div>
</div>