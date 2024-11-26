<script>
    import { superForm } from 'sveltekit-superforms';
  
    export let data;
  
    // Create the form on the client
    const { form, enhance } = superForm(data.form);
  </script>
  
  <div class="bg-white shadow-md rounded p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Add Livestream</h1>
  
    <form method="POST" use:enhance>
      <!-- Event Name -->
      <div>
        <label for="event_name" class="block text-gray-700 font-medium mb-2">Event Name</label>
        <input
          type="text"
          id="event_name"
          name="event_name"
          class="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          bind:value={$form.event_name}
          aria-invalid={$form.errors.event_name ? 'true' : undefined}
        />
        {#if $form.errors.event_name}
          <p class="text-red-500 text-sm">{$form.errors.event_name}</p>
        {/if}
      </div>
  
      <!-- Event Address -->
      <div>
        <label for="event_address" class="block text-gray-700 font-medium mb-2">Event Address</label>
        <input
          type="text"
          id="event_address"
          name="event_address"
          class="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          bind:value={$form.event_address}
        />
      </div>
  
      <!-- Event Date -->
      <div>
        <label for="event_date" class="block text-gray-700 font-medium mb-2">Event Date</label>
        <input
          type="datetime-local"
          id="event_date"
          name="event_date"
          class="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          bind:value={$form.event_date}
          aria-invalid={$form.errors.event_date ? 'true' : undefined}
        />
        {#if $form.errors.event_date}
          <p class="text-red-500 text-sm">{$form.errors.event_date}</p>
        {/if}
      </div>
  
      <!-- Description -->
      <div>
        <label for="description" class="block text-gray-700 font-medium mb-2">Description</label>
        <textarea
          id="description"
          name="description"
          class="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          rows="4"
          bind:value={$form.description}
        ></textarea>
      </div>
  
      <!-- Submit Button -->
      <div>
        <button
          type="submit"
          class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          Add Livestream
        </button>
      </div>
  
      <!-- Success Message -->
      {#if $form.message}
        <p class="text-green-500 text-sm mt-2">{$form.message}</p>
      {/if}
  
      <!-- Global Form Errors -->
      {#if $form.errors.form}
        <p class="text-red-500 text-sm mt-2">{$form.errors.form}</p>
      {/if}
    </form>
  </div>
  