<script lang="ts">
    import { onMount } from 'svelte';
  interface Props {
    form: { message?: string } | null;
  }

  let { form }: Props = $props();
  
    let formData = {
      directorFirstName: '',
      directorLastName: '',
      familyMemberFirstName: '',
      familyMemberLastName: '',
      familyMemberDOB: '',
      deceasedFirstName: '',
      deceasedLastName: '',
      deceasedDOB: '',
      deceasedDOP: '',
      email: '',
      phone: '',
      locationName: '',
      locationAddress: '',
      memorialTime: '',
      memorialDate: '',
    };
  
    let serverError: string | null = null;
  </script>
  
  <section class="bg-gray-100 min-h-screen flex items-center justify-center p-4">
    <form
      method="POST"
      class="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-2xl space-y-4"
      use:enhance={(formData) => {
        if (form?.message) {
          alert(form.message);
        }
      }}
    >
      <h1 class="text-2xl font-bold mb-4 text-gray-800">Memorial Information Form</h1>
  
      <!-- Director's Name -->
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2" for="director-first-name">Director's Name</label>
        <div class="flex space-x-4">
          <input
            name="director-first-name"
            type="text"
            id="director-first-name"
            placeholder="First Name"
            class="border rounded w-full py-2 px-3 text-gray-700"
          />
          <input
            name="director-last-name"
            type="text"
            id="director-last-name"
            placeholder="Last Name"
            class="border rounded w-full py-2 px-3 text-gray-700"
          />
        </div>
      </div>
  
      <!-- Other fields similar to above... -->
  
      <!-- Submit Button -->
      <div class="flex justify-end">
        <button
          type="submit"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Submit
        </button>
      </div>
    </form>
  
    {#if serverError}
      <p class="text-red-500 mt-4">{serverError}</p>
    {/if}
  </section>
  
  <style>
    /* Additional styling if necessary */
  </style>
  