<script lang="ts">
    let { data } = $props();
    const { tribute } = data;
    
    console.log('Tribute data loaded:', tribute);
</script>

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
                Celebration of Life for {tribute?.loved_one_name || 'Loading...'}
            </h1>
        </div>
    </section>

 


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

<style>
    /* Custom animations and transitions can be added here */
    :global(html) {
        scroll-behavior: smooth;
    }
</style>
