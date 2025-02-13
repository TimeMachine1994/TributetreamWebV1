<script lang="ts">
import Calc from '$lib/components/Calc.svelte';
import CcForm from '$lib/components/CcForm.svelte';
import { masterStore } from '$lib/stores/userStore';
import type { PageData } from './$types';

let { data } = $props<{ data: PageData }>();
const appId = (data as any).appId as string;
const locationId = (data as any).locationId as string;

let showPaymentForm = $state(false);
let calculatorTotal = $state(0);

function handleCalculatorComplete(event: CustomEvent<{ total: number }>) {
    calculatorTotal = event.detail.total;
    showPaymentForm = true;
}

function handlePaymentComplete() {
    // Handle successful payment
    console.log('Payment completed');
    // You might want to redirect or show a success message here
}
</script>

<div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Calculator and Payment</h1>
    
    <Calc on:calculatorComplete={handleCalculatorComplete} />
    
    {#if showPaymentForm}
        <div class="mt-8">
            <h2 class="text-xl font-bold mb-4">Payment</h2>
            <CcForm 
                {appId} 
                {locationId} 
                total={calculatorTotal}
                on:paymentComplete={handlePaymentComplete}
            />
        </div>
    {/if}
</div>
