<script lang="ts">
  let { fdForm } = $props();
  let formData = $state(fdForm);

  function fillTestData() {
    // Get today's date for reference
    const today = new Date();
    const oneWeekFromNow = new Date(today);
    oneWeekFromNow.setDate(today.getDate() + 7);

    // Format dates
    const formatDate = (date: Date): string => date.toISOString().split('T')[0];
    const formatTime = (date: Date): string => date.toTimeString().slice(0, 5);

    // Helper function to safely set input value
    const setInputValue = (id: string, value: string) => {
      const element = document.getElementById(id) as HTMLInputElement | null;
      if (element) {
        element.value = value;
      }
    };

    // Director Info
    setInputValue('director-first-name', 'John');
    setInputValue('director-last-name', 'Smith');
    
    // Family Member Info
    setInputValue('family-member-first-name', 'Mary');
    setInputValue('family-member-last-name', 'Johnson');
    setInputValue('family-member-dob', '1985-06-15');
    
    // Deceased Info
    setInputValue('deceased-first-name', 'Robert');
    setInputValue('deceased-last-name', 'Johnson');
    setInputValue('deceased-dob', '1945-03-22');
    setInputValue('deceased-dop', formatDate(today));
    
    // Contact Info
    setInputValue('email-address', 'test@example.com');
    setInputValue('phone-number', '555-123-4567');
    
    // Memorial Info
    setInputValue('location-name', 'Peaceful Gardens Memorial');
    setInputValue('location-address', '123 Memorial Drive, Springfield, ST 12345');
    setInputValue('memorial-time', formatTime(today));
    setInputValue('memorial-date', formatDate(oneWeekFromNow));
  }
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

    <!-- Buttons -->
    <div class="flex justify-end space-x-4">
      <button
        type="button"
        class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        onclick={fillTestData}
      >
        Fill Test Data
      </button>
      <button
        type="submit"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Submit
      </button>
    </div>
  </form>
</section>
