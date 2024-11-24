<script lang="ts">
    import { writable } from 'svelte/store';
  
    // Define the formData writable store
    let formData = writable({
      name: '',
      email: '',
      phone: '',
      funeralDirector: '',
      message: ''
    });
  
    // Writable store for tracking submission status or error messages
    let submissionStatus = writable('');
  // Function to handle form submission
const handleSubmit = async (event) => {
  event.preventDefault();

  // Read current form data from the writable store
  let data;
  formData.subscribe(value => {
    data = value;
  })();

  // Prepare the request payload in JSON format
  const requestBody = {
    funeral_director_name: data.funeralDirector,
    family_member_name: data.name,
    email: data.email,
    phone_number: data.phone,
    additional_information: data.message
  };

  // Send POST request to the WordPress REST API endpoint
  try {
    const response = await fetch('https://wp.tributestream.com/wp-json/funeral/v1/service', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
    });

    // Log the response status to help debug
    console.log('Response Status:', response.status);

    if (!response.ok) {
      // Handle any server errors
      const errorData = await response.json();
      console.error('Server Error:', errorData);
      submissionStatus.set(`Error: ${errorData.message || 'Failed to submit the form'}`);
    } else {
      // If successful, reset the form and display a success message
      formData.set({
        name: '',
        email: '',
        phone: '',
        funeralDirector: '',
        message: ''
      });
      submissionStatus.set('Form submitted successfully! We will contact you soon.');
    }
  } catch (error) {
    // Handle client-side errors (e.g., network issues)
    console.error('Submission error:', error);
    submissionStatus.set('An unexpected error occurred. Please try again later.');
  }
};
  </script>
  
  <style>
    /* Add your TailwindCSS classes and any custom styles here */
  </style>
  
  <!-- Main Container -->
  <div class="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="mt-3 text-3xl font-extrabold text-gray-900">Tributestream</h1>
      </div>
  
      <div class="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div class="px-4 py-5 sm:p-6">
          <h2 class="text-lg leading-6 font-medium text-gray-900">
            What is Tributestream
          </h2>
          <div class="mt-2 max-w-xl text-sm text-gray-500">
            <p>Welcome to Tributestream. Here's what you need to know:</p>
            <ul class="list-disc pl-5 mt-2">
              <li>Once this form is submitted, a representative will contact you within 24-48hrs</li>
              <li>Tributestream personnel will come to record and broadcast on the day of memorial</li>
              <li>Broadcast will be available to anyone with a mobile device or computer</li>
              <li>Recorded broadcast will be available to you and your family for 1 year</li>
            </ul>
          </div>
        </div>
      </div>
  
      <!-- Client Information Form -->
      <form on:submit|preventDefault={handleSubmit} class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 class="text-2xl font-bold mb-6 text-gray-900">Client Information</h2>
  
        <!-- Funeral Director Name -->
        <div class="mb-4">
          <label for="funeralDirector" class="block text-sm font-medium text-gray-700">Funeral Director Name</label>
          <input
            type="text"
            id="funeralDirector"
            name="funeralDirector"
            class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            bind:value={$formData.funeralDirector}
            placeholder="Jane Smith" />
        </div>
  
        <!-- Family Member's Name -->
        <div class="mb-4">
          <label for="name" class="block text-sm font-medium text-gray-700">Family Member's Name</label>
          <input
            type="text"
            id="name"
            name="name"
            class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            bind:value={$formData.name}
            placeholder="John Doe"
            required />
        </div>
  
        <!-- Email Address -->
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            bind:value={$formData.email}
            placeholder="john@example.com"
            required />
        </div>
  
        <!-- Phone Number -->
        <div class="mb-4">
          <label for="phone" class="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            bind:value={$formData.phone}
            placeholder="(123) 456-7890" />
        </div>
  
        <!-- Additional Information -->
        <div class="mb-6">
          <label for="message" class="block text-sm font-medium text-gray-700">Additional Information</label>
          <textarea
            id="message"
            name="message"
            class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            bind:value={$formData.message}
            placeholder="Tell us more about your needs..."
            rows="4"></textarea>
        </div>
  
        <!-- Submit Button -->
        <div class="flex items-center justify-end">
          <button type="submit" class="bg-primary text-white px-4 py-2 rounded shadow hover:bg-primary-dark">
            Submit Information
          </button>
        </div>
  
        <!-- Submission Status -->
        {#if $submissionStatus}
          <p class="mt-4 text-sm text-red-500">{$submissionStatus}</p>
        {/if}
      </form>
    </div>
  </div>
  