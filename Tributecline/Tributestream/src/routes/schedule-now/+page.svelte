<script lang="ts">
import Hero from '$lib/components/layout/hero.svelte';

interface TimeSlot {
  time: string;
  available: boolean;
}

// Mock available time slots (this would typically come from an API)
const generateTimeSlots = (startHour: number, endHour: number): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute of ['00', '30']) {
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:${minute}`,
        available: Math.random() > 0.3 // Randomly mark some slots as unavailable
      });
    }
  }
  return slots;
};

let selectedDate = '';
let selectedTime = '';
let formData = {
  name: '',
  email: '',
  phone: '',
  preferredMethod: 'video',
  notes: ''
};

$: timeSlots = generateTimeSlots(9, 17); // 9 AM to 5 PM

const handleSubmit = async (event: SubmitEvent) => {
  event.preventDefault();
  // TODO: Implement booking submission logic
  console.log('Booking submitted:', {
    date: selectedDate,
    time: selectedTime,
    ...formData
  });
};
</script>

<svelte:head>
  <title>Schedule a Consultation | TributeStream</title>
  <meta name="description" content="Schedule a free consultation with TributeStream. Let us help you create a meaningful digital memorial for your loved one." />
</svelte:head>

<div class="min-h-screen bg-background">
  <Hero 
    title="Schedule a Consultation" 
    subtitle="Take the First Step in Preserving Your Memories"
    showButtons={false}
  />

  <main class="container mx-auto px-4 py-12">
    <section class="max-w-4xl mx-auto mb-16">
      <h2 class="text-3xl font-bold text-center mb-8">Book Your Free Consultation</h2>
      <p class="text-lg text-muted-foreground text-center mb-12">
        Choose a convenient time to speak with our memorial specialists. We'll discuss your vision and guide you through the process.
      </p>
    </section>

    <section class="max-w-2xl mx-auto">
      <form on:submit={handleSubmit} class="space-y-8 bg-card p-8 rounded-lg border">
        <!-- Personal Information -->
        <div class="grid md:grid-cols-2 gap-6">
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
        </div>

        <div class="space-y-2">
          <label for="phone" class="block text-sm font-medium">Phone</label>
          <input
            type="tel"
            id="phone"
            bind:value={formData.phone}
            required
            class="w-full px-3 py-2 border rounded-md bg-background"
            placeholder="Your phone number"
          />
        </div>

        <!-- Date and Time Selection -->
        <div class="grid md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label for="date" class="block text-sm font-medium">Preferred Date</label>
            <input
              type="date"
              id="date"
              bind:value={selectedDate}
              required
              min={new Date().toISOString().split('T')[0]}
              class="w-full px-3 py-2 border rounded-md bg-background"
            />
          </div>

          <div class="space-y-2">
            <label for="time" class="block text-sm font-medium">Preferred Time</label>
            <select
              id="time"
              bind:value={selectedTime}
              required
              class="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="">Select a time</option>
              {#each timeSlots as slot}
                <option value={slot.time} disabled={!slot.available}>
                  {slot.time} {!slot.available ? '(Unavailable)' : ''}
                </option>
              {/each}
            </select>
          </div>
        </div>

        <!-- Consultation Method -->
        <div class="space-y-2">
          <label class="block text-sm font-medium">Preferred Consultation Method</label>
          <div class="grid grid-cols-2 gap-4">
            <label class="flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-primary/5">
              <input
                type="radio"
                name="method"
                value="video"
                bind:group={formData.preferredMethod}
                class="text-primary"
              />
              <span>Video Call</span>
            </label>
            <label class="flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-primary/5">
              <input
                type="radio"
                name="method"
                value="phone"
                bind:group={formData.preferredMethod}
                class="text-primary"
              />
              <span>Phone Call</span>
            </label>
          </div>
        </div>

        <!-- Additional Notes -->
        <div class="space-y-2">
          <label for="notes" class="block text-sm font-medium">Additional Notes (Optional)</label>
          <textarea
            id="notes"
            bind:value={formData.notes}
            rows="3"
            class="w-full px-3 py-2 border rounded-md bg-background resize-none"
            placeholder="Any specific questions or concerns?"
          ></textarea>
        </div>

        <button
          type="submit"
          class="w-full bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Schedule Consultation
        </button>
      </form>
    </section>

    <!-- Additional Information -->
    <section class="max-w-2xl mx-auto mt-16 text-center">
      <p class="text-muted-foreground">
        Need to reschedule? Contact us at 
        <a href="tel:1-800-TRIBUTE" class="text-primary hover:underline">1-800-TRIBUTE</a>
        or email 
        <a href="mailto:support@tributestream.com" class="text-primary hover:underline">support@tributestream.com</a>
      </p>
    </section>
  </main>
</div>