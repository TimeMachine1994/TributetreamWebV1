<script>
  let { fdForm } = $props();
  let formData = $state(fdForm);
</script>

<section class="bg-gray-100 min-h-screen flex items-center justify-center p-4">
  <form method="POST" class="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-2xl space-y-4">
    <h1 class="text-2xl font-bold mb-4 text-gray-800">Memorial Information Form</h1>

    <!-- Director's Name -->
    <div>
      <label class="block text-gray-700 text-sm font-bold mb-2" for="director-name">Director's Name</label>
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

    <!-- Family Member Name -->
    <div>
      <label class="block text-gray-700 text-sm font-bold mb-2" for="family-member-name">Family Member Name</label>
      <div class="flex space-x-4">
        <input
          name="family-member-first-name"
          type="text"
          id="family-member-first-name"
          placeholder="First Name"
          class="border rounded w-full py-2 px-3 text-gray-700"
        />
        <input
          name="family-member-last-name"
          type="text"
          id="family-member-last-name"
          placeholder="Last Name"
          class="border rounded w-full py-2 px-3 text-gray-700"
        />
      </div>
    </div>

    <!-- Family Member Date of Birth -->
    <div>
      <label class="block text-gray-700 text-sm font-bold mb-2" for="family-member-dob">Family Member Date of Birth</label>
      <input
        name="family-member-dob"
        type="date"
        id="family-member-dob"
        class="border rounded w-full py-2 px-3 text-gray-700"
      />
    </div>

    <!-- Deceased Name -->
    <div>
      <label class="block text-gray-700 text-sm font-bold mb-2" for="deceased-name">Deceased Name</label>
      <div class="flex space-x-4">
        <input
          name="deceased-first-name"
          type="text"
          id="deceased-first-name"
          placeholder="First Name"
          class="border rounded w-full py-2 px-3 text-gray-700"
        />
        <input
          name="deceased-last-name"
          type="text"
          id="deceased-last-name"
          placeholder="Last Name"
          class="border rounded w-full py-2 px-3 text-gray-700"
        />
      </div>
    </div>

    <!-- Deceased Date of Birth -->
    <div>
      <label class="block text-gray-700 text-sm font-bold mb-2" for="deceased-dob">Deceased Date of Birth</label>
      <input
        name="deceased-dob"
        type="date"
        id="deceased-dob"
        class="border rounded w-full py-2 px-3 text-gray-700"
      />
    </div>

    <!-- Deceased Date of Passing -->
    <div>
      <label class="block text-gray-700 text-sm font-bold mb-2" for="deceased-dop">Deceased Date of Passing</label>
      <input
        name="deceased-dop"
        type="date"
        id="deceased-dop"
        class="border rounded w-full py-2 px-3 text-gray-700"
      />
    </div>

    <!-- Contact Information -->
    <div>
      <label class="block text-gray-700 text-sm font-bold mb-2" for="contact-info">Contact Information</label>
      <div class="flex space-x-4">
        <input
          name="email-address"
          type="email"
          id="email-address"
          placeholder="Email Address"
          class="border rounded w-full py-2 px-3 text-gray-700"
        />
        <input
          name="phone-number"
          type="tel"
          id="phone-number"
          placeholder="Phone Number"
          class="border rounded w-full py-2 px-3 text-gray-700"
        />
      </div>
    </div>

    <!-- Memorial Information -->
    <div>
      <label class="block text-gray-700 text-sm font-bold mb-2" for="memorial-info">Memorial Information</label>
      <div class="flex space-x-4">
        <input
          name="location-name"
          type="text"
          id="location-name"
          placeholder="Location Name"
          class="border rounded w-full py-2 px-3 text-gray-700"
        />
        <input
          name="location-address"
          type="text"
          id="location-address"
          placeholder="Location Address"
          class="border rounded w-full py-2 px-3 text-gray-700"
        />
      </div>
    </div>
    <div class="flex space-x-4">
      <input
        name="memorial-time"
        type="time"
        id="memorial-time"
        class="border rounded w-full py-2 px-3 text-gray-700"
      />
      <input
        name="memorial-date"
        type="date"
        id="memorial-date"
        class="border rounded w-full py-2 px-3 text-gray-700"
      />
    </div>

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
</section>
