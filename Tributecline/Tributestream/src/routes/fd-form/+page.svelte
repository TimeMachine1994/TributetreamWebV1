<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  let { form } = $props<{ form: ActionData }>();
  let isSubmitting = $state(false);

  // Utility functions for generating random data
  function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function getRandomFirstName(): string {
    const firstNames = [
      'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
      'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
      'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
      'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley'
    ];
    return firstNames[Math.floor(Math.random() * firstNames.length)];
  }

  function getRandomLastName(): string {
    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
      'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
      'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White'
    ];
    return lastNames[Math.floor(Math.random() * lastNames.length)];
  }

  function getRandomPhoneNumber(): string {
    const areaCode = getRandomInt(200, 999);
    const prefix = getRandomInt(200, 999);
    const lineNumber = getRandomInt(1000, 9999);
    return `${areaCode}-${prefix}-${lineNumber}`;
  }

  function getRandomEmail(firstName: string, lastName: string): string {
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'example.com'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
  }

  function getRandomDate(startYear: number, endYear: number): string {
    const start = new Date(startYear, 0, 1);
    const end = new Date(endYear, 11, 31);
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return randomDate.toISOString().split('T')[0];
  }

  function getRandomLocation(): { name: string; address: string } {
    const locations = [
      { name: 'Peaceful Gardens Memorial', address: '123 Memorial Drive' },
      { name: 'Serenity Chapel', address: '456 Chapel Lane' },
      { name: 'Highland Memorial Park', address: '789 Highland Avenue' },
      { name: 'Valley View Funeral Home', address: '321 Valley Road' },
      { name: 'Riverside Memorial Gardens', address: '654 Riverside Drive' }
    ];
    const cities = ['Springfield', 'Rivertown', 'Lakeside', 'Hillcrest', 'Maplewood'];
    const states = ['NY', 'CA', 'TX', 'FL', 'IL'];
    const zipCodes = Array.from({ length: 5 }, () => getRandomInt(10000, 99999));

    const location = locations[Math.floor(Math.random() * locations.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const state = states[Math.floor(Math.random() * states.length)];
    const zip = zipCodes[Math.floor(Math.random() * zipCodes.length)];

    return {
      name: location.name,
      address: `${location.address}, ${city}, ${state} ${zip}`
    };
  }

  function fillTestData() {
    // Get today's date for reference
    const today = new Date();
    const oneWeekFromNow = new Date(today);
    oneWeekFromNow.setDate(today.getDate() + 7);

    // Format dates and time
    const formatDate = (date: Date): string => date.toISOString().split('T')[0];
    const formatTime = (date: Date): string => date.toTimeString().slice(0, 5);

    // Helper function to safely set input value
    const setInputValue = (id: string, value: string) => {
      const element = document.getElementById(id) as HTMLInputElement | null;
      if (element) {
        element.value = value;
      }
    };

    // Generate random data
    const directorFirst = getRandomFirstName();
    const directorLast = getRandomLastName();
    const familyFirst = getRandomFirstName();
    const familyLast = getRandomLastName();
    const deceasedFirst = getRandomFirstName();
    const deceasedLast = getRandomLastName();
    const location = getRandomLocation();

    // Director Info
    setInputValue('director-first-name', directorFirst);
    setInputValue('director-last-name', directorLast);
    
    // Family Member Info
    setInputValue('family-member-first-name', familyFirst);
    setInputValue('family-member-last-name', familyLast);
    setInputValue('family-member-dob', getRandomDate(1960, 1990));
    
    // Deceased Info
    setInputValue('deceased-first-name', deceasedFirst);
    setInputValue('deceased-last-name', deceasedLast);
    setInputValue('deceased-dob', getRandomDate(1930, 1960));
    setInputValue('deceased-dop', formatDate(today));
    
    // Contact Info
    setInputValue('email-address', getRandomEmail(familyFirst, familyLast));
    setInputValue('phone-number', getRandomPhoneNumber());
    
    // Memorial Info
    setInputValue('location-name', location.name);
    setInputValue('location-address', location.address);
    setInputValue('memorial-time', formatTime(today));
    setInputValue('memorial-date', formatDate(oneWeekFromNow));
  }
</script>

<section class="bg-gray-100 min-h-screen flex items-center justify-center p-4">
  {#if form?.error}
    <div class="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline">{form.message}</span>
    </div>
  {/if}

  <form 
    method="POST" 
    class="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-2xl space-y-4"
    use:enhance={() => {
      isSubmitting = true;
      return async ({ update }) => {
        await update();
        isSubmitting = false;
      };
    }}
  >
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
        onclick={() => fillTestData()}
      >
        Fill Test Data
      </button>
      <button
        type="submit"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </div>
  </form>
</section>
