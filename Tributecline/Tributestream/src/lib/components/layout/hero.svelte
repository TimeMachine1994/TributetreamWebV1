<script lang="ts">
  import { goto } from '$app/navigation';

  export let title: string = "Preserve Your Legacy";
  export let subtitle: string = "Create timeless video tributes that celebrate life's most precious moments";
  export let showButtons: boolean = true;

  function handleScheduleClick(): void {
    goto('/schedule');
  }

  function handleLearnMoreClick(): void {
    goto('/how-it-works');
  }
</script>

<section class="relative bg-black text-white min-h-[80vh] flex items-center">
  <!-- Background gradient overlay -->
  <div class="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black/90"></div>
  
  <!-- Content container -->
  <div class="container mx-auto px-4 py-16 relative z-10">
    <div class="max-w-4xl mx-auto text-center">
      <!-- Main heading -->
      <h1 class="font-great-vibes text-6xl md:text-7xl lg:text-8xl mb-6">
        {title}
      </h1>
      
      <!-- Subheading -->
      <p class="text-xl md:text-2xl mb-8 text-gray-300 font-fanwood">
        {subtitle}
      </p>
      
      <!-- Call to action buttons -->
      {#if showButtons}
        <div class="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
          <button
            on:click={handleScheduleClick}
            class="bg-[#D5BA7F] text-black px-8 py-3 rounded-lg text-lg font-medium
            hover:shadow-[0_0_15px_5px_#D5BA7F] transition-all duration-300 ease-in-out"
          >
            Schedule Now
          </button>
          
          <button
            on:click={handleLearnMoreClick}
            class="border-2 border-[#D5BA7F] text-[#D5BA7F] px-8 py-3 rounded-lg text-lg
            hover:bg-[#D5BA7F] hover:text-black transition-all duration-300 ease-in-out"
          >
            Learn More
          </button>
        </div>
      {/if}
      
      <!-- Feature highlights -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        <div class="text-center">
          <i class="fas fa-video text-[#D5BA7F] text-3xl mb-4"></i>
          <h3 class="text-xl font-semibold mb-2">Professional Quality</h3>
          <p class="text-gray-400">Stunning HD video tributes crafted with care</p>
        </div>
        
        <div class="text-center">
          <i class="fas fa-heart text-[#D5BA7F] text-3xl mb-4"></i>
          <h3 class="text-xl font-semibold mb-2">Meaningful Stories</h3>
          <p class="text-gray-400">Share memories that touch hearts forever</p>
        </div>
        
        <div class="text-center">
          <i class="fas fa-lock text-[#D5BA7F] text-3xl mb-4"></i>
          <h3 class="text-xl font-semibold mb-2">Secure Storage</h3>
          <p class="text-gray-400">Your memories safely preserved for generations</p>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Decorative bottom fade -->
  <div class="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent"></div>
</section>

<style>
  /* Import Google Fonts */
  @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Fanwood+Text&display=swap');

  :global(body) {
    font-family: 'Fanwood Text', serif;
  }

  /* Add smooth scroll behavior */
  :global(html) {
    scroll-behavior: smooth;
  }
</style>
