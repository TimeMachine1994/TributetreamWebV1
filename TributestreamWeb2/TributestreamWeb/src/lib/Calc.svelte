<script lang="ts">
    import { masterStore } from './stores/userStore';
    import { packages } from './data/packages';
    import type { PackageDetails } from './stores/types';
    import type { MasterStore, Location } from './stores/types';

    let { initialStartTime = '' } = $props<{initialStartTime?: string}>();

    let formData = $state<{
        package: string;
        livestreamDate: string;
        livestreamStartTime: string;
        allowOverrun: boolean;
        locations: Location[];
        funeralHomeName: string;
        funeralDirectorName: string;
        dates: string[];
        duration: number;
    }>({
        package: 'Solo',
        livestreamDate: '',
        livestreamStartTime: initialStartTime,
        allowOverrun: false,
        locations: [{ name: '', address: '', travelExceedsHour: false }],
        funeralHomeName: '',
        funeralDirectorName: '',
        dates: [],
        duration: 2,
    });

    // Subscribe to store for initial data
    let storeData = $state<MasterStore | null>(null);
    masterStore.subscribe((state: MasterStore) => {
        storeData = state;
        if (state.orderData.funeralHome) {
            formData.funeralHomeName = state.orderData.funeralHome.name || '';
            formData.funeralDirectorName = state.orderData.funeralHome.directorName || '';
            
            // Set first location from funeral home data
            if (state.orderData.funeralHome && formData.locations[0]) {
                formData.locations[0].name = state.orderData.funeralHome.name || '';
                formData.locations[0].address = state.orderData.funeralHome.address || '';
            }
        }
    });

    // Update package when store changes
    $effect(() => {
        if (storeData?.orderData.selectedPackage) {
            const pkg = storeData.orderData.selectedPackage;
            // Map full package name to form value
            const packageMap: Record<string, string> = {
                'Tributestream Solo': 'Solo',
                'Tributestream Gold': 'Gold',
                'Tributestream Legacy': 'Legacy'
            };
            formData.package = packageMap[pkg.details.name as keyof typeof packageMap] || 'Solo';
        }
    });

    // Update store when package changes
    $effect(() => {
        const selectedPackage = packages.find(p => p.name.includes(formData.package));
        if (selectedPackage) {
            masterStore.updateOrderData({
                selectedPackage: {
                    index: packages.findIndex(p => p.name.includes(formData.package)),
                    details: selectedPackage
                }
            });
        }
    });

    let locationNumDefault = $derived.by(() => {
        if (formData.package === 'Solo' || formData.package === 'Legacy') {
            return 1;
        } else if (formData.package === 'Gold') {
            return 2;
        }
        return 1;
    });

    let cartItems = $derived.by(() => {
        let items = [];
        let total = 0;

        // Get package price from packages data
        const selectedPackage = packages.find(p => p.name.includes(formData.package));
        if (selectedPackage) {
            items.push({ name: selectedPackage.name, price: selectedPackage.price });
            total += selectedPackage.price;
        }
  
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
  
    function removeLocation(index: number) {
        formData.locations.splice(index, 1);
    }
</script>

<style>
    .calc-container {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.5s ease;
    }

    .calc-container.open {
        max-height: 2000px; /* Large enough to fit content */
    }

    .calc-content {
        opacity: 0;
        transform: translateY(-20px);
        transition: opacity 0.3s ease, transform 0.3s ease;
        pointer-events: none;
    }

    .calc-container.open .calc-content {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
    }
</style>

<div class={`calc-container ${storeData?.orderData.selectedPackage ? 'open' : ''}`}>
    <div class="calc-content grid grid-cols-4 gap-6 p-6 max-w-6xl mx-auto">
        <!-- Title Area -->
        <div class="col-span-4 p-4 bg-gray-100 shadow-lg rounded-lg text-center">
            <h1 class="text-2xl font-bold">Schedule and Calculate Your Livestream</h1>
        </div>
    
        <!-- Form Section -->
        <div class="col-span-3 p-4 bg-white shadow-lg rounded-lg">
            <form>
                <h2 class="text-lg font-bold mb-4">Schedule a Livestream</h2>
        
                <!-- Package, Date and Time -->
                <div class="grid grid-cols-3 gap-4">
                    <div>
                        <label class="block mb-2">Package</label>
                        <select bind:value={formData.package} class="block w-full p-2 border rounded">
                            <option value="Solo">Solo ($550)</option>
                            <option value="Gold">Gold ($1,100)</option>
                            <option value="Legacy">Legacy ($2,799)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block mb-2">Livestream Date</label>
                        <input 
                            type="date" 
                            bind:value={formData.livestreamDate} 
                            class="block w-full p-2 border rounded" 
                        />
                    </div>
                    <div>
                        <label class="block mb-2">Start Time</label>
                        <input 
                            type="time" 
                            bind:value={formData.livestreamStartTime} 
                            class="block w-full p-2 border rounded" 
                        />
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

            <!-- Save and Pay Buttons -->
            <div class="mt-6 flex flex-col gap-4">
                <button
                    type="button"
                    class="w-full bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800"
                    onclick={async () => {
                        masterStore.updateOrderData({
                            details: {
                                cartItems: cartItems.items,
                                total: cartItems.total,
                                duration: formData.duration,
                                livestreamDate: formData.livestreamDate,
                                livestreamStartTime: formData.livestreamStartTime,
                                locations: formData.locations
                            }
                        });

                        // Call logout endpoint
                        const response = await fetch('/api/logout', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });

                        if (response.ok) {
                            // Clear store
                            masterStore.clear();
                            // Redirect to fd-form
                            window.location.href = '/fd-form';
                        } else {
                            console.error('Failed to logout');
                        }
                    }}
                >
                    Save and Pay Later
                </button>
                <button
                    type="button"
                    class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                    onclick={() => {
                        masterStore.updateOrderData({
                            details: {
                                cartItems: cartItems.items,
                                total: cartItems.total,
                                duration: formData.duration,
                                livestreamDate: formData.livestreamDate,
                                livestreamStartTime: formData.livestreamStartTime,
                                locations: formData.locations
                            }
                        });
                        console.log('Proceeding to checkout');
                    }}
                >
                    Save and Checkout Now
                </button>
            </div>
        </div>
    </div>
</div>
