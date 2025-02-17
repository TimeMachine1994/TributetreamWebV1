<script lang="ts">
import Hero from '$lib/components/layout/hero.svelte';

const benefits = [
  {
    title: 'Preserve Precious Memories',
    description: 'Capture and share cherished memories of your loved ones in a beautiful, digital format that lasts forever.',
    icon: '📸'
  },
  {
    title: 'Easy Collaboration',
    description: 'Invite family and friends to contribute their own memories, photos, and stories to create a rich, collective tribute.',
    icon: '👥'
  },
  {
    title: 'Professional Support',
    description: 'Our dedicated team helps guide you through the process, ensuring a meaningful and respectful memorial.',
    icon: '🤝'
  },
  {
    title: 'Accessible Anywhere',
    description: 'Access and share your tribute from any device, making it easy for loved ones near and far to stay connected.',
    icon: '🌐'
  }
];
</script>

<svelte:head>
  <title>Why Choose TributeStream | Preserving Memories Together</title>
  <meta name="description" content="Discover why TributeStream is the trusted choice for creating lasting digital memorials. Learn about our unique features and benefits that help preserve precious memories." />
</svelte:head>

<div class="min-h-screen bg-background">
  <Hero 
    title="Why Choose TributeStream" 
    subtitle="Creating Meaningful Digital Memorials Together"
  />

  <main class="container mx-auto px-4 py-12">
    <section class="max-w-4xl mx-auto mb-16">
      <h2 class="text-3xl font-bold text-center mb-8">Our Commitment to Your Memories</h2>
      <p class="text-lg text-muted-foreground text-center mb-12">
        TributeStream provides a thoughtful, dignified way to preserve and share the stories of your loved ones. 
        We combine cutting-edge technology with compassionate support to create lasting digital memorials.
      </p>
    </section>

    <section class="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
      {#each benefits as benefit}
        <div class="bg-card p-6 rounded-lg shadow-sm border">
          <div class="text-4xl mb-4">{benefit.icon}</div>
          <h3 class="text-xl font-semibold mb-2">{benefit.title}</h3>
          <p class="text-muted-foreground">{benefit.description}</p>
        </div>
      {/each}
    </section>

    <section class="max-w-4xl mx-auto text-center">
      <h2 class="text-3xl font-bold mb-6">Ready to Begin Your Tribute?</h2>
      <p class="text-lg text-muted-foreground mb-8">
        Join thousands of families who have chosen TributeStream to honor their loved ones.
      </p>
      <a 
        href="/schedule-now" 
        class="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
      >
        Start Your Tribute
      </a>
    </section>
  </main>
</div>