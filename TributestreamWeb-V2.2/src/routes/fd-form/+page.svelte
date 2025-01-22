<script lang="ts">
  import { goto } from '$app/navigation';

  // Initialize error and loading state management
  let error = '';
  let loading = false;

  /**
   * Form data structure that holds all the information collected from the form
   * This structured approach makes it easier to manage and validate the data
   */
  // Generate random test data
  function generateTestData() {
    const randomNum = Math.floor(Math.random() * 1000);
    const today = new Date();
    const pastDate = new Date();
    pastDate.setFullYear(today.getFullYear() - 80);
    const recentDate = new Date();
    recentDate.setDate(today.getDate() - 5);

    return {
      director: {
        firstName: 'Director',
        lastName: `Test${randomNum}`
      },
      familyMember: {
        firstName: 'Family',
        lastName: `Member${randomNum}`,
        dateOfBirth: '1980-01-01'
      },
      deceased: {
        firstName: 'Loved',
        lastName: `One${randomNum}`,
        dateOfBirth: pastDate.toISOString().split('T')[0],
        dateOfPassing: recentDate.toISOString().split('T')[0]
      },
      contact: {
        email: `test${randomNum}@example.com`,
        phone: '555-555-5555'
      },
      memorial: {
        locationName: 'Test Memorial Home',
        locationAddress: '123 Test Street, Test City, TS 12345',
        time: '14:00',
        date: today.toISOString().split('T')[0]
      }
    };
  }

  let formData = generateTestData();

  /**
   * Handles the form submission
   * 1. Prevents default form submission
   * 2. Sets loading state
   * 3. Submits data to API
   * 4. Redirects to confirmation page on success
   * 5. Handles any errors that occur
   */
  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    loading = true;
    error = '';

    // Log the form data being submitted
    console.log('Submitting form data:', formData);

    try {
      // Convert form data to match server-side field names
      const formDataForServer = new FormData();
      formDataForServer.append('director-first-name', formData.director.firstName);
      formDataForServer.append('director-last-name', formData.director.lastName);
      formDataForServer.append('family-member-first-name', formData.familyMember.firstName);
      formDataForServer.append('family-member-last-name', formData.familyMember.lastName);
      formDataForServer.append('family-member-dob', formData.familyMember.dateOfBirth);
      formDataForServer.append('deceased-first-name', formData.deceased.firstName);
      formDataForServer.append('deceased-last-name', formData.deceased.lastName);
      formDataForServer.append('deceased-dob', formData.deceased.dateOfBirth);
      formDataForServer.append('deceased-dop', formData.deceased.dateOfPassing);
      formDataForServer.append('email-address', formData.contact.email);
      formDataForServer.append('phone-number', formData.contact.phone);
      formDataForServer.append('location-name', formData.memorial.locationName);
      formDataForServer.append('location-address', formData.memorial.locationAddress);
      formDataForServer.append('memorial-time', formData.memorial.time);
      formDataForServer.append('memorial-date', formData.memorial.date);

      console.log('Submitting form to server action...');
      const response = await fetch('?/default', {
        method: 'POST',
        body: formDataForServer
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('API error response:', data);
        throw new Error(data.message || 'Failed to submit form');
      }

      // The server action will handle the redirect
      console.log('Form submitted successfully, server will redirect');
    } catch (err) {
      console.error('Form submission error:', err);
      error = err instanceof Error ? err.message : 'Failed to submit form';
      loading = false;
    }
  };
</script>

<!-- Main form container with responsive padding and centering -->
<section class="bg-gray-100 min-h-screen flex items-center justify-center p-4">
  <form on:submit={handleSubmit} class="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-2xl space-y-4">
    <h1 class="text-2xl font-bold mb-4 text-gray-800">Memorial Information Form</h1>

    <!-- Error display section -->
    {#if error}
      <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <p class="text-red-700">{error}</p>
      </div>
    {/if}

    <!-- Director's Information Section -->
    <div>
      <label class="block text-gray-700 text-sm font-bold mb-2">Director's Name</label>
      <div class="flex space-x-4">
        <input
          bind:value={formData.director.firstName}
          type="text"
          placeholder="First Name"
          required
          class="border rounded w-full py-2 px-3 text-gray-700"
          on:input={() => console.log('Director first name updated:', formData.director.firstName)}
        />
        <input
          bind:value={formData.director.lastName}
          type="text"
          placeholder="Last Name"
          required
          class="border rounded w-full py-2 px-3 text-gray-700"
          on:input={() => console.log('Director last name updated:', formData.director.lastName)}
        />
      </div>
    </div>

    <!-- Family Member Information Section -->
    <div>
      <label class="block text-gray-700 text-sm font-bold mb-2">Family Member Name</label>
      <div class="flex space-x-4">
        <input
          bind:value={formData.familyMember.firstName}
          type="text"
          placeholder="First Name"
          required
          class="border rounded w-full py-2 px-3 text-gray-700"
          on:input={() => console.log('Family member first name updated:', formData.familyMember.firstName)}
        />
        <input
          bind:value={formData.familyMember.lastName}
          type="text"
          placeholder="Last Name"
          required
          class="border rounded w-full py-2 px-3 text-gray-700"
          on:input={() => console.log('Family member last name updated:', formData.familyMember.lastName)}
        />
      </div>
    </div>

    <!-- Family Member Date of Birth -->
    <div>
      <label class="block text-gray-700 text-sm font-bold mb-2">Family Member Date of Birth</label>
      <input
        bind:value={formData.familyMember.dateOfBirth}
        type="date"
        required
        class="border rounded w-full py-2 px-3 text-gray-700"
        on:change={() => console.log('Family member DOB updated:', formData.familyMember.dateOfBirth)}
      />
    </div>

    <!-- Deceased Information Section -->
    <div>
      <label class="block text-gray-700 text-sm font-bold mb-2">Deceased Name</label>
      <div class="flex space-x-4">
        <input
          bind:value={formData.deceased.firstName}
          type="text"
          placeholder="First Name"
          required
          class="border rounded w-full py-2 px-3 text-gray-700"
          on:input={() => console.log('Deceased first name updated:', formData.deceased.firstName)}
        />
        <input
          bind:value={formData.deceased.lastName}
          type="text"
          placeholder="Last Name"
          required
          class="border rounded w-full py-2 px-3 text-gray-700"
          on:input={() => console.log('Deceased last name updated:', formData.deceased.lastName)}
        />
      </div>
    </div>

    <!-- Deceased Dates Section -->
    <div>
      <label class="block text-gray-700 text-sm font-bold mb-2">Deceased Date of Birth</label>
      <input
        bind:value={formData.deceased.dateOfBirth}
        type="date"
        required
        class="border rounded w-full py-2 px-3 text-gray-700"
        on:change={() => console.log('Deceased DOB updated:', formData.deceased.dateOfBirth)}
      />
    </div>

    <div>
      <label class="block text-gray-700 text-sm font-bold mb-2">Deceased Date of Passing</label>
      <input
        bind:value={formData.deceased.dateOfPassing}
        type="date"
        required
        class="border rounded w-full py-2 px-3 text-gray-700"
        on:change={() => console.log('Deceased date of passing updated:', formData.deceased.dateOfPassing)}
      />
    </div>

    <!-- Contact Information Section -->
    <div>
      <label class="block text-gray-700 text-sm font-bold mb-2">Contact Information</label>
      <div class="flex space-x-4">
        <input
          bind:value={formData.contact.email}
          type="email"
          placeholder="Email Address"
          required
          class="border rounded w-full py-2 px-3 text-gray-700"
          on:input={() => console.log('Contact email updated:', formData.contact.email)}
        />
        <input
          bind:value={formData.contact.phone}
          type="tel"
          placeholder="Phone Number"
          required
          class="border rounded w-full py-2 px-3 text-gray-700"
          on:input={() => console.log('Contact phone updated:', formData.contact.phone)}
        />
      </div>
    </div>

    <!-- Memorial Information Section -->
    <div>
      <label class="block text-gray-700 text-sm font-bold mb-2">Memorial Information</label>
      <div class="flex space-x-4">
        <input
          bind:value={formData.memorial.locationName}
          type="text"
          placeholder="Location Name"
          required
          class="border rounded w-full py-2 px-3 text-gray-700"
          on:input={() => console.log('Memorial location name updated:', formData.memorial.locationName)}
        />
        <input
          bind:value={formData.memorial.locationAddress}
          type="text"
          placeholder="Location Address"
          required
          class="border rounded w-full py-2 px-3 text-gray-700"
          on:input={() => console.log('Memorial location address updated:', formData.memorial.locationAddress)}
        />
      </div>
    </div>

    <!-- Memorial Date and Time -->
    <div class="flex space-x-4">
      <input
        bind:value={formData.memorial.time}
        type="time"
        required
        class="border rounded w-full py-2 px-3 text-gray-700"
        on:change={() => console.log('Memorial time updated:', formData.memorial.time)}
      />
      <input
        bind:value={formData.memorial.date}
        type="date"
        required
        class="border rounded w-full py-2 px-3 text-gray-700"
        on:change={() => console.log('Memorial date updated:', formData.memorial.date)}
      />
    </div>

    <!-- Submit Button Section -->
    <div class="flex justify-end">
      <button
        type="submit"
        disabled={loading}
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </div>
  </form>
</section>
