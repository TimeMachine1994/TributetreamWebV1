<script lang="ts">
  import PageLayout from '$lib/components/page-templates/page-layout.svelte';
  
  let formData = {
    name: "",
    email: "",
    phone: "",
    serviceDate: "",
    serviceTime: "",
    serviceLocation: "",
    attendees: "",
    additionalInfo: "",
    serviceType: "funeral",
    preferredContactMethod: "email"
  };
  
  let isSubmitting = false;
  let formSubmitted = false;
  let formError = false;
  
  const dateOptions = {
    min: new Date().toISOString().split('T')[0] // Today's date as minimum
  };
  
  const handleSubmit = async () => {
    isSubmitting = true;
    formError = false;
    formSubmitted = false;
    
    try {
      // Simulate a form submission with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      formSubmitted = true;
      // Reset form
      formData = {
        name: "",
        email: "",
        phone: "",
        serviceDate: "",
        serviceTime: "",
        serviceLocation: "",
        attendees: "",
        additionalInfo: "",
        serviceType: "funeral",
        preferredContactMethod: "email"
      };
    } catch (error) {
      formError = true;
    } finally {
      isSubmitting = false;
    }
  };
</script>

<PageLayout 
  title="Schedule Now" 
  metaDescription="Schedule a consultation for TributeStream's professional livestreaming service for celebrations of life and memorial services."
>
  <section class="content-section">
    <p class="text-lg mb-10">
      Ready to provide a meaningful livestreaming experience for your celebration of life event? 
      Fill out the form below to request a consultation with our team. We'll respond within 24 hours 
      to discuss your needs and arrange our livestreaming services.
    </p>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <!-- Booking Form -->
      <div class="col-span-2 bg-zinc-900 p-8 rounded-lg border border-[#D4AF37]/20">
        <h2 class="text-2xl text-[#D4AF37] font-semibold mb-6">Request a Consultation</h2>
        
        {#if formSubmitted}
          <div class="bg-emerald-900/30 p-4 rounded-md mb-6 border border-emerald-500/30">
            <p class="text-emerald-300">Thank you for your request. We'll contact you within 24 hours to discuss your event.</p>
          </div>
        {/if}
        
        {#if formError}
          <div class="bg-red-900/30 p-4 rounded-md mb-6 border border-red-500/30">
            <p class="text-red-300">There was an error submitting your request. Please try again or contact us directly at +1 (407) 221-5922.</p>
          </div>
        {/if}
        
        <form on:submit|preventDefault={handleSubmit} class="space-y-6">
          <!-- Contact Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="name" class="block text-sm font-medium mb-2">Your Name*</label>
              <input 
                type="text" 
                id="name" 
                bind:value={formData.name} 
                required
                class="w-full bg-black border border-zinc-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              />
            </div>
            
            <div>
              <label for="phone" class="block text-sm font-medium mb-2">Phone Number*</label>
              <input 
                type="tel" 
                id="phone" 
                bind:value={formData.phone}
                required
                class="w-full bg-black border border-zinc-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium mb-2">Email Address*</label>
            <input 
              type="email" 
              id="email" 
              bind:value={formData.email} 
              required
              class="w-full bg-black border border-zinc-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">Preferred Contact Method</label>
            <div class="flex space-x-4">
              <label class="inline-flex items-center">
                <input 
                  type="radio" 
                  bind:group={formData.preferredContactMethod} 
                  value="email"
                  class="form-radio text-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <span class="ml-2">Email</span>
              </label>
              <label class="inline-flex items-center">
                <input 
                  type="radio" 
                  bind:group={formData.preferredContactMethod} 
                  value="phone"
                  class="form-radio text-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <span class="ml-2">Phone</span>
              </label>
              <label class="inline-flex items-center">
                <input 
                  type="radio" 
                  bind:group={formData.preferredContactMethod} 
                  value="text"
                  class="form-radio text-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <span class="ml-2">Text</span>
              </label>
            </div>
          </div>
          
          <hr class="border-zinc-700" />
          
          <!-- Service Details -->
          <div>
            <h3 class="text-lg font-medium mb-4 text-[#D4AF37]">Event Details</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label for="serviceDate" class="block text-sm font-medium mb-2">Event Date</label>
                <input 
                  type="date" 
                  id="serviceDate" 
                  bind:value={formData.serviceDate}
                  min={dateOptions.min}
                  class="w-full bg-black border border-zinc-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                />
              </div>
              
              <div>
                <label for="serviceTime" class="block text-sm font-medium mb-2">Event Time</label>
                <input 
                  type="time" 
                  id="serviceTime" 
                  bind:value={formData.serviceTime}
                  class="w-full bg-black border border-zinc-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label for="serviceLocation" class="block text-sm font-medium mb-2">Event Location</label>
              <input 
                type="text" 
                id="serviceLocation" 
                placeholder="Venue Name and Address"
                bind:value={formData.serviceLocation}
                class="w-full bg-black border border-zinc-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label for="attendees" class="block text-sm font-medium mb-2">Estimated Number of Remote Viewers</label>
            <input 
              type="number" 
              id="attendees" 
              bind:value={formData.attendees}
              placeholder="Approximate number"
              min="0"
              class="w-full bg-black border border-zinc-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
            />
          </div>
          
          <div>
            <label for="serviceType" class="block text-sm font-medium mb-2">Type of Service</label>
            <select 
              id="serviceType" 
              bind:value={formData.serviceType}
              class="w-full bg-black border border-zinc-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
            >
              <option value="funeral">Funeral Service</option>
              <option value="memorial">Memorial Service</option>
              <option value="graveside">Graveside Service</option>
              <option value="celebration">Celebration of Life</option>
              <option value="other">Other (Please specify in notes)</option>
            </select>
          </div>
          
          <div>
            <label for="additionalInfo" class="block text-sm font-medium mb-2">Additional Information</label>
            <textarea 
              id="additionalInfo" 
              bind:value={formData.additionalInfo}
              rows="4"
              placeholder="Please share any special requests or questions you may have."
              class="w-full bg-black border border-zinc-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
            ></textarea>
          </div>
          
          <div>
            <button 
              type="submit" 
              class="gold-btn w-full flex items-center justify-center"
              disabled={isSubmitting}
            >
              {#if isSubmitting}
                <span>Submitting Request...</span>
              {:else}
                <span>Request Consultation</span>
              {/if}
            </button>
          </div>
        </form>
      </div>
      
      <!-- Sidebar Information -->
      <div>
        <div class="bg-zinc-900 p-6 rounded-lg border border-[#D4AF37]/20 mb-8">
          <h3 class="text-xl text-[#D4AF37] font-medium mb-4">Our Process</h3>
          <ol class="space-y-4 pl-6 list-decimal">
            <li>Fill out the scheduling request form</li>
            <li>Receive a confirmation call or email within 24 hours</li>
            <li>Schedule a detailed consultation to discuss your needs</li>
            <li>Finalize service details and receive a confirmation</li>
            <li>Our team arrives early on the service day for setup</li>
          </ol>
        </div>
        
        <div class="bg-zinc-900 p-6 rounded-lg border border-[#D4AF37]/20">
          <h3 class="text-xl text-[#D4AF37] font-medium mb-4">Need Help?</h3>
          <p class="mb-4">If you prefer to schedule by phone or have immediate questions, please call us directly:</p>
          <p class="text-xl">
            <a href="tel:+14072215922" class="hover:text-[#D4AF37] transition-colors">+1 (407) 221-5922</a>
          </p>
          <p class="mt-4 text-sm text-gray-400">
            Available Monday – Friday: 10:00AM – 5:00PM EST<br>
            Saturday – Sunday: 12:00PM – 5:00PM EST
          </p>
        </div>
      </div>
    </div>
  </section>
</PageLayout>