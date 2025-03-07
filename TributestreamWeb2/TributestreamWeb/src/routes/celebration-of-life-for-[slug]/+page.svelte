<script lang="ts">
import { onMount } from 'svelte';
import { fade, slide } from 'svelte/transition';
import NotificationBannerA from '$lib/NotificationBannerA.svelte';

interface Tribute {
    name: string;
    custom_html: string | null;
}

interface PageData {
    tribute: Tribute;
}

const props = $props<{ data: PageData }>();
let isPaid = $state(false); // Simulate a payment state; you can fetch this from a store or API
let isLoading = $state(true);
let hasError = $state(false);
let errorMessage = $state('');

// Store tribute data in a regular state variable to avoid TypeScript errors
let tributeData = $state({
    name: 'Loading...',
    custom_html: null as string | null
});

// Use effect to update the tribute data when props change
$effect(() => {
    if (!props?.data?.tribute) {
        console.error('Tribute data unavailable in props');
        hasError = true;
        errorMessage = 'Unable to load tribute data';
    } else {
        tributeData = props.data.tribute;
    }
});

// Debug mount and unmount to track component lifecycle
onMount(() => {
    console.log('Tribute page mounted with data:', tributeData);
    isLoading = false;
    
    return () => {
        console.log('Tribute page unmounting');
    };
});
</script>

{#if isLoading}
    <div class="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div class="text-center">
            <div class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-yellow-500 border-r-transparent"></div>
            <p class="mt-4 text-xl">Loading celebration...</p>
        </div>
    </div>
{:else if hasError}
    <div class="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
        <div class="text-center max-w-md" transition:fade={{ duration: 300 }}>
            <h2 class="text-2xl text-red-500 mb-4">Error Loading Tribute</h2>
            <p class="mb-4">{errorMessage}</p>
            <button class="bg-yellow-500 text-black px-4 py-2 rounded-md" 
                    on:click={() => window.location.reload()}>
                Try Again
            </button>
        </div>
    </div>
{:else}
    <NotificationBannerA {isPaid} />

    <!-- Hero Section -->
    <main class="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <!-- Hero with gradient overlay -->
        <section
            class="relative h-[60vh] flex items-center justify-center bg-cover bg-bottom"
            style="background-image: url('https://wp.tributestream.com/wp-content/uploads/2019/11/candle-PEVB9JR-scaled.jpg')"
        >
            <div class="absolute inset-0 bg-gradient-to-b from-[#D5BA7F]/40 to-transparent z-10"></div>
            <div class="container mx-auto px-4 z-20 text-center">
                <h1 class="text-4xl md:text-6xl mb-4 text-white font-['Fanwood_Text'] italic">
                    Celebration of Life for {tributeData?.name || 'Loading...'}
                </h1>
            </div>
        </section>

        <!-- Video Section -->
        {#if tributeData?.custom_html === null}
            <section class="py-16 px-4">
                <div class="container mx-auto max-w-4xl">
                    <div class="relative aspect-video bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
                        <div class="absolute inset-0 flex items-center justify-center">
                            <button class="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center transition-transform hover:scale-110">
                                <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        {:else}
            <div class="custom-html-container">
                {@html tributeData.custom_html}
            </div>
        {/if}

        <!-- FAQ Cards -->
        <section class="py-16 px-4 bg-black-900">
            <div class="container mx-auto">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <!-- FAQ Card 1 -->
                    <div class="bg-gray-800 p-6 rounded-lg transform transition-all hover:-translate-y-2">
                        <h3 class="text-yellow-500 text-xl font-bold mb-4">How does it work?</h3>
                        <p class="text-gray-300">Experience a beautiful celebration of life through our carefully curated video memorial service.</p>
                    </div>

                    <!-- FAQ Card 2 -->
                    <div class="bg-gray-800 p-6 rounded-lg transform transition-all hover:-translate-y-2">
                        <h3 class="text-yellow-500 text-xl font-bold mb-4">What's included?</h3>
                        <p class="text-gray-300">Get at least one year long access to the memorial video, downloadable content, and sharing capabilities.</p>
                    </div>

                    <!-- FAQ Card 3 -->
                    <div class="bg-gray-800 p-6 rounded-lg transform transition-all hover:-translate-y-2">
                        <h3 class="text-yellow-500 text-xl font-bold mb-4">Can I share this?</h3>
                        <p class="text-gray-300">Yes! Share this celebration of life with family and friends worldwide.</p>
                    </div>
                </div>
            </div>
        </section>
    </main>
{/if}

<style>
    /* Custom animations and transitions can be added here */
    :global(html) {
        scroll-behavior: smooth;
    }
</style>
