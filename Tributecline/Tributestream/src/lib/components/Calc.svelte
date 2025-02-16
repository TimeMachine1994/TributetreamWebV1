<script lang="ts">
import { createEventDispatcher } from 'svelte';

interface Location {
    name: string;
    address: string;
    travelExceedsHour: boolean;
}

interface OrderDetails {
    cartItems: Array<{ name: string; price: number }>;
    total: number;
    duration: number;
    livestreamDate: string;
    livestreamStartTime: string;
    locations: Location[];
}

let { onOrderUpdate } = $props<{
    onOrderUpdate: (details: OrderDetails) => void;
}>();

interface $$Events {
    calculatorComplete: CustomEvent<{ total: number }>;
}

const dispatch = createEventDispatcher<$$Events>();

// Calculator state using $state
let basePrice = $state(550); // Base price for Solo package
let duration = $state(2); // Default duration in hours
let allowOverrun = $state(false);
let selectedPackage = $state('Solo');
let livestreamDate = $state(new Date().toISOString().split('T')[0]);
let livestreamStartTime = $state('12:00');
let locations = $state<Location[]>([{ name: '', address: '', travelExceedsHour: false }]);

// Form validation using $state
let errors = $state<{ [key: string]: string }>({});

// Derived values
let isFormValid = $derived(Object.keys(errors).length === 0);
let total = $derived(calculateTotal());

// UI state using $state
let showConfirmationModal = $state(false);
let isLoading = $state(false);
let apiError = $state('');

// Effect for form validation
$effect(() => {
    validateForm();
});

function calculateTotal(): number {
    let calculatedTotal = basePrice;
    
    // Add cost for additional duration
    if (duration > 2) {
        calculatedTotal += (duration - 2) * 125;
    }
    // Add overrun surcharge if allowed
    if (allowOverrun) {
        calculatedTotal += 125;
    }
    
    return calculatedTotal;
}

function handlePackageChange(newPackage: string) {
    selectedPackage = newPackage;
    switch (newPackage) {
        case 'Gold':
            basePrice = 1100;
            if (locations.length < 2) {
                locations = [
                    ...locations,
                    { name: '', address: '', travelExceedsHour: false }
                ];
            }
            break;
        case 'Legacy':
            basePrice = 2799;
            break;
        default:
            basePrice = 550;
            locations = [{ name: '', address: '', travelExceedsHour: false }];
    }
}

function validateForm() {
    errors = {};
    
    if (duration < 2 || duration > 8) {
        errors.duration = "Duration must be between 2 and 8 hours";
    }
    
    if (locations.length < 1 || locations.length > 5) {
        errors.locations = "Number of locations must be between 1 and 5";
    }
    
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const selectedDate = new Date(livestreamDate);
    if (!livestreamDate || selectedDate < currentDate) {
        errors.livestreamDate = "Livestream date must be today or a future date";
    }
    
    if (!livestreamStartTime) {
        errors.livestreamStartTime = "Livestream start time is required";
    }

    locations.forEach((location, index) => {
        if (!location.name) {
            errors[`locationName${index}`] = "Location name is required";
        }
        if (!location.address) {
            errors[`locationAddress${index}`] = "Location address is required";
        }
    });
}

function addLocation() {
    if (locations.length < 5) {
        locations = [...locations, { name: '', address: '', travelExceedsHour: false }];
    }
}

function removeLocation(index: number) {
    if (locations.length > 1) {
        locations = locations.filter((_, i) => i !== index);
    }
}

function handleSaveAndCheckout() {
    validateForm();
    if (isFormValid) {
        showConfirmationModal = true;
    }
}

async function updateCalculatorStatus() {
    try {
        const response = await fetch('/api/user-meta', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
            },
            body: JSON.stringify({
                meta_key: 'calculator_status',
                meta_value: JSON.stringify({
                    completed: true,
                    package: selectedPackage,
                    total: total,
                    completedAt: new Date().toISOString()
                })
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update calculator status');
        }
    } catch (error) {
        console.error('Error updating calculator status:', error);
        // Continue with checkout even if status update fails
    }
}

async function confirmCheckout() {
    isLoading = true;
    apiError = '';

    try {
        // Update calculator completion status
        await updateCalculatorStatus();

        // Update order data via props
        onOrderUpdate({
            cartItems: [{ name: selectedPackage, price: total }],
            total,
            duration,
            livestreamDate,
            livestreamStartTime,
            locations
        });

        // Dispatch completion event
        dispatch('calculatorComplete', new CustomEvent('calculatorComplete', { detail: { total } }));
        showConfirmationModal = false;
    } catch (error) {
        console.error('Checkout error:', error);
        apiError = 'Failed to complete checkout. Please try again.';
    } finally {
        isLoading = false;
    }
}

function cancelCheckout() {
    showConfirmationModal = false;
}
</script>

<div class="calculator bg-white shadow-md rounded px-4 sm:px-6 md:px-8 pt-6 pb-8 mb-4 max-w-4xl mx-auto">
    <h2 class="text-2xl font-bold mb-6">Livestream Calculator</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="package">
                Package:
            </label>
            <select 
                id="package"
                bind:value={selectedPackage} 
                on:change={() => handlePackageChange(selectedPackage)}
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                title="Choose your livestream package. Each package offers different features and pricing."
            >
                <option value="Solo">Solo ($550)</option>
                <option value="Gold">Gold ($1,100)</option>
                <option value="Legacy">Legacy ($2,799)</option>
            </select>
        </div>
        
        <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="duration">
                Duration (hours):
            </label>
            <input 
                id="duration"
                type="number" 
                bind:value={duration} 
                min="2" 
                max="8"
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                title="Set the duration of your livestream. Minimum 2 hours, maximum 8 hours. Additional hours incur extra charges."
            />
            {#if errors.duration}
                <p class="text-red-500 text-xs italic">{errors.duration}</p>
            {/if}
        </div>
    </div>
    
    <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2">
            Locations:
        </label>
        {#each locations as location, index}
            <div class="mb-2 p-4 border rounded">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="mb-2">
                        <label class="block text-gray-700 text-sm font-bold mb-2" for={`locationName${index}`}>
                            Location Name:
                        </label>
                        <input 
                            id={`locationName${index}`}
                            type="text" 
                            bind:value={location.name}
                            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            title="Enter the name of the location for the livestream event."
                        />
                        {#if errors[`locationName${index}`]}
                            <p class="text-red-500 text-xs italic">{errors[`locationName${index}`]}</p>
                        {/if}
                    </div>
                    <div class="mb-2">
                        <label class="block text-gray-700 text-sm font-bold mb-2" for={`locationAddress${index}`}>
                            Location Address:
                        </label>
                        <input 
                            id={`locationAddress${index}`}
                            type="text" 
                            bind:value={location.address}
                            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            title="Enter the address of the location for the livestream event."
                        />
                        {#if errors[`locationAddress${index}`]}
                            <p class="text-red-500 text-xs italic">{errors[`locationAddress${index}`]}</p>
                        {/if}
                    </div>
                </div>
                <label class="flex items-center mt-2">
                    <input 
                        type="checkbox" 
                        bind:checked={location.travelExceedsHour}
                        class="mr-2 leading-tight"
                    />
                    <span class="text-sm" title="Check this if travel to this location exceeds 1 hour. This may affect pricing.">
                        Travel exceeds 1 hour
                    </span>
                </label>
                {#if index > 0}
                    <button 
                        type="button" 
                        on:click={() => removeLocation(index)}
                        class="mt-2 text-red-500 hover:text-red-700"
                    >
                        Remove Location
                    </button>
                {/if}
            </div>
        {/each}
        {#if locations.length < 5}
            <button 
                type="button" 
                on:click={addLocation}
                class="mt-2 text-blue-500 hover:text-blue-700"
                title="Add another location for your livestream event. Maximum 5 locations."
            >
                Add Location
            </button>
        {/if}
        {#if errors.locations}
            <p class="text-red-500 text-xs italic">{errors.locations}</p>
        {/if}
    </div>
    
    <div class="mb-4">
        <label class="flex items-center">
            <input 
                type="checkbox" 
                bind:checked={allowOverrun}
                class="mr-2 leading-tight"
            />
            <span class="text-sm" title="Allow the livestream to run over the scheduled time for an additional fee of $125.">
                Allow Overrun ($125 surcharge)
            </span>
        </label>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="livestreamDate">
                Livestream Date:
            </label>
            <input 
                id="livestreamDate"
                type="date" 
                bind:value={livestreamDate}
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                title="Select the date for your livestream event. Must be today or a future date."
            />
            {#if errors.livestreamDate}
                <p class="text-red-500 text-xs italic">{errors.livestreamDate}</p>
            {/if}
        </div>

        <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="livestreamStartTime">
                Livestream Start Time:
            </label>
            <input 
                id="livestreamStartTime"
                type="time" 
                bind:value={livestreamStartTime}
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                title="Select the start time for your livestream event."
            />
            {#if errors.livestreamStartTime}
                <p class="text-red-500 text-xs italic">{errors.livestreamStartTime}</p>
            {/if}
        </div>
    </div>
    
    <div class="mb-6">
        <h3 class="text-lg font-bold mb-2">Cost Breakdown:</h3>
        <div class="bg-gray-100 p-4 rounded">
            <div class="flex justify-between mb-2">
                <span>Base Package ({selectedPackage}):</span>
                <span>${basePrice.toFixed(2)}</span>
            </div>
            {#if duration > 2}
                <div class="flex justify-between mb-2">
                    <span>Additional Duration ({duration - 2} hours):</span>
                    <span>${((duration - 2) * 125).toFixed(2)}</span>
                </div>
            {/if}
            {#if locations.length > 1}
                <div class="flex justify-between mb-2">
                    <span>Additional Locations ({locations.length - 1}):</span>
                    <span>${((locations.length - 1) * 349).toFixed(2)}</span>
                </div>
            {/if}
            {#if allowOverrun}
                <div class="flex justify-between mb-2">
                    <span>Overrun Surcharge:</span>
                    <span>$125.00</span>
                </div>
            {/if}
            <div class="flex justify-between font-bold mt-2 pt-2 border-t border-gray-300">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
            </div>
        </div>
    </div>
    
    <button 
        on:click={handleSaveAndCheckout}
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
        disabled={!isFormValid || isLoading}
    >
        {isLoading ? 'Processing...' : 'Save and Checkout'}
    </button>

    {#if apiError}
        <p class="text-red-500 text-sm mt-2">{apiError}</p>
    {/if}
</div>

{#if showConfirmationModal}
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3 text-center">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Confirm Your Order</h3>
                <div class="mt-2 px-7 py-3">
                    <p class="text-sm text-gray-500">
                        Are you sure you want to proceed with this order?
                    </p>
                    <p class="text-lg font-bold mt-2">
                        Total: ${total.toFixed(2)}
                    </p>
                </div>
                <div class="items-center px-4 py-3">
                    <button
                        id="ok-btn"
                        class="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        on:click={confirmCheckout}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : 'Confirm'}
                    </button>
                    <button
                        id="cancel-btn"
                        class="mt-3 px-4 py-2 bg-gray-300 text-black text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        on:click={cancelCheckout}
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}
