<script lang="ts">
  import PageLayout from '$lib/components/page-templates/page-layout.svelte';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  // Initialize superForm with the data from load function
  const { form, errors, constraints, message, enhance, submitting } = superForm(data.form, {
    // Form is valid but there was a server error
    onError: ({ result }) => {
      console.error('Error submitting form:', result);
    },
    // Form is valid and was successfully submitted
    onUpdate: ({ form }) => {
      console.log('Form updated:', form);
    }
  });
</script>

<PageLayout 
  title="Contact Us" 
  metaDescription="Get in touch with TributeStream for livestreaming services for celebrations of life. We're here to answer your questions and provide information."
>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
    <!-- Contact Form -->
    <div class="bg-zinc-900 p-8 rounded-lg border border-[#D4AF37]/20">
      <h2 class="text-2xl text-[#D4AF37] font-semibold mb-6">Send Us a Message</h2>
      
      {#if $message}
        <div class="bg-emerald-900/30 p-4 rounded-md mb-6 border border-emerald-500/30">
          <p class="text-emerald-300">{$message}</p>
        </div>
      {/if}
      
      <form method="POST" action="?/default" use:enhance class="space-y-6">
        <div>
          <label for="name" class="block text-sm font-medium mb-2">Your Name</label>
          <input 
            type="text" 
            id="name" 
            bind:value={$form.name} name="name"
            aria-invalid={$errors.name ? 'true' : undefined}
            {...$constraints.name}
            class="w-full bg-black border border-zinc-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
          />
        </div>
        
        <div>
          <label for="email" class="block text-sm font-medium mb-2">Email Address</label>
          <input 
            type="email" 
            id="email" 
            bind:value={$form.email} name="email"
            aria-invalid={$errors.email ? 'true' : undefined}
            {...$constraints.email}
            class="w-full bg-black border border-zinc-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
          />
        </div>
        
        <div>
          <label for="phone" class="block text-sm font-medium mb-2">Phone Number</label>
          <input 
            type="tel" 
            id="phone" 
            bind:value={$form.phone} name="phone"
            aria-invalid={$errors.phone ? 'true' : undefined}
            {...$constraints.phone}
            class="w-full bg-black border border-zinc-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
          />
        </div>
        
        <div>
          <label for="message" class="block text-sm font-medium mb-2">Your Message</label>
          <textarea 
            id="message" 
            bind:value={$form.message} name="message"
            aria-invalid={$errors.message ? 'true' : undefined}
            {...$constraints.message}
            rows="5"
            class="w-full bg-black border border-zinc-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
          ></textarea>
        </div>
        
        <div>
          <button 
            type="submit" 
            class="gold-btn w-full flex items-center justify-center"
            disabled={$submitting}
          >
            {#if $submitting}
              <span>Sending...</span>
            {:else}
              <span>Send Message</span>
            {/if}
          </button>
        </div>
      </form>
    </div>
    
    <!-- Contact Information -->
    <div>
      <h2 class="text-2xl text-[#D4AF37] font-semibold mb-6">Get in Touch</h2>
      
      <div class="space-y-8">
        <div>
          <h3 class="text-lg font-medium mb-2">Contact Information</h3>
          <p class="mb-2">
            <span class="text-[#D4AF37] mr-2">Phone:</span> 
            <a href="tel:+14072215922" class="hover:text-[#D4AF37] transition-colors">+1 (407) 221-5922</a>
          </p>
          <p>
            <span class="text-[#D4AF37] mr-2">Email:</span> 
            <a href="mailto:Contact@tributestream.com" class="hover:text-[#D4AF37] transition-colors">Contact@tributestream.com</a>
          </p>
        </div>
        
        <div>
          <h3 class="text-lg font-medium mb-2">Office Hours</h3>
          <p class="mb-1">Monday – Friday: 10:00AM – 5:00PM EST</p>
          <p>Saturday – Sunday: 12:00PM – 5:00PM EST</p>
          <p class="mt-3 text-sm text-gray-400">
            If you need to contact us after hours, feel free to reach out via text or email.
          </p>
        </div>
        
        <div>
          <h3 class="text-lg font-medium mb-2">Coverage Areas</h3>
          <p>
            TributeStream currently serves the following Florida counties: Orange, Lake, Osceola, 
            Seminole, Marion, Sumter, Volusia, Flagler, and Brevard.
          </p>
          <p class="mt-3 text-sm text-gray-400">
            Please call if your location is not listed to inquire about service availability.
          </p>
        </div>
        
        <div class="pt-6">
          <a href="/schedule-now" class="gold-btn inline-block">
            Schedule a Consultation
          </a>
        </div>
      </div>
    </div>
  </div>
</PageLayout>