<script lang="ts">
import { createEventDispatcher } from 'svelte';

const dispatch = createEventDispatcher<{
    paymentComplete: void
}>();

let { appId, locationId, total } = $props<{
    appId: string;
    locationId: string;
    total: number;
}>();

let cardNumber = $state('');
let expirationDate = $state('');
let cvv = $state('');
let nameOnCard = $state('');

function handlePayment() {
    // Implement payment logic here
    console.log(`Processing payment of $${total} with appId: ${appId} and locationId: ${locationId}`);
    console.log(`Card details: ${cardNumber}, ${expirationDate}, ${cvv}, ${nameOnCard}`);
    // In a real application, you would send this data to your payment processor
    // and handle the response accordingly
    dispatch('paymentComplete');
}
</script>

<div class="payment-form">
    <h2 class="text-xl font-bold mb-4">Payment Form</h2>
    <p class="mb-4">Total to pay: ${total}</p>
    <form on:submit|preventDefault={handlePayment} class="space-y-4">
        <div>
            <label for="cardNumber" class="block mb-1">Card Number</label>
            <input type="text" id="cardNumber" bind:value={cardNumber} placeholder="1234 5678 9012 3456" class="w-full p-2 border rounded" required />
        </div>
        <div class="flex space-x-4">
            <div class="flex-1">
                <label for="expirationDate" class="block mb-1">Expiration Date</label>
                <input type="text" id="expirationDate" bind:value={expirationDate} placeholder="MM/YY" class="w-full p-2 border rounded" required />
            </div>
            <div class="flex-1">
                <label for="cvv" class="block mb-1">CVV</label>
                <input type="text" id="cvv" bind:value={cvv} placeholder="123" class="w-full p-2 border rounded" required />
            </div>
        </div>
        <div>
            <label for="nameOnCard" class="block mb-1">Name on Card</label>
            <input type="text" id="nameOnCard" bind:value={nameOnCard} placeholder="John Doe" class="w-full p-2 border rounded" required />
        </div>
        <button type="submit" class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Process Payment</button>
    </form>
</div>
