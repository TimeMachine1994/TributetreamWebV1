<script lang="ts">
import Hero from '$lib/components/layout/hero.svelte';

const contactMethods = [
  {
    title: 'Phone',
    description: 'Speak directly with our support team',
    value: '1-800-TRIBUTE',
    icon: '📞'
  },
  {
    title: 'Email',
    description: 'Send us a detailed message',
    value: 'support@tributestream.com',
    icon: '📧'
  },
  {
    title: 'Hours',
    description: 'We\'re here to help',
    value: 'Mon-Fri: 9AM-6PM EST',
    icon: '🕒'
  }
];

let formData = {
  name: '',
  email: '',
  phone: '',
  message: ''
};

async function handleSubmit(event: SubmitEvent) {
  event.preventDefault();
  // TODO: Implement form submission logic
  // This would typically send the data to your backend API
  console.log('Form submitted:', formData);
}
</script>

<svelte:head>
  <title>Contact TributeStream | Get in Touch</title>
  <meta name="description" content="Contact TributeStream for support with creating your digital memorial. We're here to help you preserve and share your precious memories." />
</svelte:head>

<div class="min-h-screen bg-background">
  <Hero 
    title="Contact Us" 
    subtitle="We're Here to Support You"
    showButtons={false}
  />

  <main class="container mx-auto px-4 py-12">
    <!-- Contact Methods -->
    <section class="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mb-16">
      {#each contactMethods as method}
        <div class="bg-card p-6 rounded-lg border text-center">
          <div class="text-4xl mb-4">{method.icon}</div>
          <h3 class="text-xl font-semibold mb-2">{method.title}</h3>
          <p class="text-muted-foreground mb-2">{method.description}</p>
          <p class="text-primary font-medium">{method.value}</p>
        </div>
      {/each}
    </section>

    <!-- Contact Form -->
    <section class="max-w-2xl mx-auto">
      <h2 class="text-3xl font-bold text-center mb-8">Send Us a Message</h2>
      
      <form on:submit={handleSubmit} class="space-y-6 bg-card p-8 rounded-lg border">
        <div class="space-y-2">
          <label for="name" class="block text-sm font-medium">Name</label>
          <input
            type="text"
            id="name"
            bind:value={formData.name}
            required
            class="w-full px-3 py-2 border rounded-md bg-background"
            placeholder="Your name"
          />
        </div>

        <div class="space-y-2">
          <label for="email" class="block text-sm font-medium">Email</label>
          <input
            type="email"
            id="email"
            bind:value={formData.email}
            required
            class="w-full px-3 py-2 border rounded-md bg-background"
            placeholder="your.email@example.com"
          />
        </div>

        <div class="space-y-2">
          <label for="phone" class="block text-sm font-medium">Phone (Optional)</label>
          <input
            type="tel"
            id="phone"
            bind:value={formData.phone}
            class="w-full px-3 py-2 border rounded-md bg-background"
            placeholder="Your phone number"
          />
        </div>

        <div class="space-y-2">
          <label for="message" class="block text-sm font-medium">Message</label>
          <textarea
            id="message"
            bind:value={formData.message}
            required
            rows="4"
            class="w-full px-3 py-2 border rounded-md bg-background resize-none"
            placeholder="How can we help you?"
          ></textarea>
        </div>

        <button
          type="submit"
          class="w-full bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Send Message
        </button>
      </form>
    </section>

    <!-- FAQ Note -->
    <section class="max-w-2xl mx-auto mt-16 text-center">
      <p class="text-muted-foreground">
        Have questions? Check out our 
        <a href="/faq" class="text-primary hover:underline">FAQ page</a>
        for quick answers to common questions.
      </p>
    </section>
  </main>
</div>