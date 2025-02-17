<script lang="ts">
import Hero from '$lib/components/layout/hero.svelte';

const steps = [
  {
    number: 1,
    title: 'Schedule a Consultation',
    description: 'Book a free consultation with our team to discuss your vision and requirements for the tribute.',
    icon: '📅'
  },
  {
    number: 2,
    title: 'Share Your Story',
    description: 'Provide photos, videos, and stories that capture the essence of your loved one\'s life and legacy.',
    icon: '📸'
  },
  {
    number: 3,
    title: 'Collaborate with Family',
    description: 'Invite family members to contribute their memories and media to create a rich, collective tribute.',
    icon: '👨‍👩‍👧‍👦'
  },
  {
    number: 4,
    title: 'Review and Refine',
    description: 'Work with our team to perfect the tribute, ensuring every detail honors your loved one\'s memory.',
    icon: '✨'
  }
];
</script>

<svelte:head>
  <title>How TributeStream Works | Creating Your Digital Memorial</title>
  <meta name="description" content="Learn how TributeStream helps you create meaningful digital memorials. Our step-by-step process makes it easy to preserve and share precious memories." />
</svelte:head>

<div class="min-h-screen bg-background">
  <Hero 
    title="How It Works" 
    subtitle="Your Journey to Creating a Lasting Memorial"
    showButtons={false}
  />

  <main class="container mx-auto px-4 py-12">
    <section class="max-w-4xl mx-auto mb-16">
      <h2 class="text-3xl font-bold text-center mb-8">Simple Steps to Preserve Your Memories</h2>
      <p class="text-lg text-muted-foreground text-center mb-12">
        Our streamlined process makes it easy to create a beautiful, meaningful tribute that honors your loved one's legacy.
      </p>
    </section>

    <section class="max-w-5xl mx-auto mb-16">
      <div class="relative">
        <!-- Connection line -->
        <div class="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 -translate-x-1/2 hidden md:block"></div>
        
        <!-- Steps -->
        <div class="space-y-12">
          {#each steps as step, index}
            <div class="relative flex flex-col md:flex-row items-center gap-8 {index % 2 === 0 ? 'md:flex-row-reverse' : ''}">
              <!-- Step number with icon -->
              <div class="flex-1 text-center md:text-left {index % 2 === 0 ? 'md:text-right' : ''}">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-4xl relative z-10">
                  {step.icon}
                </div>
                <h3 class="text-2xl font-semibold mt-4 mb-2">Step {step.number}: {step.title}</h3>
                <p class="text-muted-foreground">{step.description}</p>
              </div>
              
              <!-- Spacer for timeline -->
              <div class="hidden md:block w-16"></div>
              
              <!-- Empty space for alternating layout -->
              <div class="flex-1"></div>
            </div>
          {/each}
        </div>
      </div>
    </section>

    <section class="max-w-4xl mx-auto text-center bg-card p-8 rounded-lg border">
      <h2 class="text-3xl font-bold mb-6">Ready to Begin?</h2>
      <p class="text-lg text-muted-foreground mb-8">
        Start your journey today and create a lasting tribute that celebrates life's precious moments.
      </p>
      <div class="flex flex-col sm:flex-row justify-center gap-4">
        <a 
          href="/schedule-now" 
          class="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Schedule a Consultation
        </a>
        <a 
          href="/contact-us" 
          class="inline-block border border-primary text-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          Contact Us
        </a>
      </div>
    </section>
  </main>
</div>