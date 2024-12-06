<script>
    import { onMount } from 'svelte';
    import { createForm } from 'svelte-forms-lib'; // Assuming we use a form library for better validation
    import { writable } from 'svelte/store';
  
    // Creating reactive stores for form state and stream data
    let form; 
    let loading = writable(false); // To handle the loading state during async operations
    let streamData = writable({}); // To hold the RTMP link, stream key, and embed code once fetched
  
    // Initial values for the form
    let formValues = {
      streamTitle: '',
      streamDescription: ''
    };
  
    // Initializing the form with form values and submit handler
    onMount(() => {
      form = createForm({
        initialValues: formValues,
        onSubmit: async (values) => {
          // When form is submitted, call generateStream
          await generateStream(values);
        }
      });
    });
  
    // Function to simulate a request to the backend to generate a new stream
    async function generateStream(values) {
      loading.set(true);
      console.log("🚀 Initiating request to generate a stream with values:", values);
      try {
        // Simulate making a request to your backend API endpoint
        // The backend API will securely communicate with Cloudflare
        const response = await fetch('/api/create-livestream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` // Include user JWT token
          },
          body: JSON.stringify(values)
        });
  
        if (!response.ok) {
          throw new Error('Failed to generate livestream. Please check the backend logs.');
        }
  
        // Parsing the response from the backend to get stream data
        const data = await response.json();
        console.log("✅ Successfully generated stream data:", data);
        streamData.set(data); // Update the store with the fetched data
      } catch (error) {
        console.error("❌ An error occurred while generating the stream:", error);
        alert("Failed to generate livestream. Please try again later.");
      } finally {
        loading.set(false);
      }
    }
  </script>
  
  <style>
    /* Some basic styling with TailwindCSS */
    .loading {
      @apply animate-spin;
    }
  </style>
  
  <div class="flex flex-col items-center p-6">
    <!-- Form for stream generation -->
    <form on:submit={form.handleSubmit} class="w-full max-w-lg">
      <div class="mb-6">
        <label class="block text-gray-700 text-sm font-bold mb-2">Stream Title:</label>
        <input
          type="text"
          name="streamTitle"
          bind:value={form.values.streamTitle}
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div class="mb-6">
        <label class="block text-gray-700 text-sm font-bold mb-2">Stream Description:</label>
        <textarea
          name="streamDescription"
          bind:value={form.values.streamDescription}
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <button
        type="submit"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        disabled={$loading}>
        {$loading ? 'Generating Stream...' : 'Generate Livestream'}
      </button>
    </form>
  
    <!-- Loading Spinner -->
    {#if $loading}
      <div class="loading mt-4"></div>
    {/if}
  
    <!-- Display Stream Information -->
    {#if $streamData.rtmpLink}
      <div class="mt-6 p-4 bg-green-100 rounded">
        <h3 class="font-bold mb-2">Livestream Details</h3>
        <p><strong>RTMP Link:</strong> {$streamData.rtmpLink}</p>
        <p><strong>Stream Key:</strong> {$streamData.streamKey}</p>
        <p><strong>Embed Code:</strong> {$streamData.embedCode}</p>
      </div>
    {/if}
  </div>
  
