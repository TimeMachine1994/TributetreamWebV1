<script lang="ts">
    import Calc from '$lib/components/Calc.svelte';
    import type { PageData } from './$types';
    
    export let data: PageData;

    // Handle any errors from server load
    $: if (data.error) {
        console.error('Error loading calculator data:', data.error);
    }

    // Initialize calculator with preloaded data if available
    let initialData = {
        startTime: data.calculatorData?.livestreamStartTime || '',
        funeralHomeName: data.funeralHomeData?.name || '',
        funeralDirectorName: data.funeralHomeData?.directorName || '',
        locations: data.calculatorData?.locations || [{ 
            name: data.funeralHomeData?.name || '', 
            address: data.funeralHomeData?.address || '',
            travelExceedsHour: false 
        }]
    };
</script>

<div class="container mx-auto px-4 py-8">
    {#if data.error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong class="font-bold">Error!</strong>
            <span class="block sm:inline"> {data.error}</span>
        </div>
    {/if}

    <Calc 
        initialStartTime={initialData.startTime}
        {data}
        on:calculatorComplete={(event) => {
            console.log('Calculator completed with total:', event.detail.total);
            // Handle calculator completion - e.g., redirect to checkout
        }}
    />
</div>