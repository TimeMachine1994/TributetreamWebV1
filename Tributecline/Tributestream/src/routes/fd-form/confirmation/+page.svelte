<script lang="ts">
  import type { PageData } from './$types';

  // Define interface for form data structure
  interface FormData {
    director: {
      firstName: string;
      lastName: string;
    };
    familyMember: {
      firstName: string;
      lastName: string;
      dob: string;
    };
    deceased: {
      firstName: string;
      lastName: string;
      dob: string;
      dop: string;
    };
    contact: {
      email: string;
      phone: string;
    };
    memorial: {
      locationName: string;
      locationAddress: string;
      date: string;
      time: string;
    };
  }

  let { data } = $props();
  let formData = $state(data.formData as FormData);

  // Format date for display
  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Format time for display
  function formatTime(timeStr: string): string {
    return new Date(`1970-01-01T${timeStr}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  }
</script>

{#if !data}
  <section class="bg-gray-100 min-h-screen flex items-center justify-center p-4">
    <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-2xl text-center">
      <div class="animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
      </div>
    </div>
  </section>
{:else if !data.formData}
  <section class="bg-gray-100 min-h-screen flex items-center justify-center p-4">
    <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-2xl text-center">
      <h2 class="text-xl font-semibold text-gray-800 mb-3">Memorial Information Not Found</h2>
      <p class="text-gray-600 mb-4">We couldn't find the memorial information. This might be because:</p>
      <ul class="text-gray-600 list-disc list-inside mb-6">
        <li>The form hasn't been submitted yet</li>
        <li>Your session has expired</li>
        <li>There was an error saving your information</li>
      </ul>
      <div class="flex justify-center gap-4">
        <a href="/fd-form" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Return to Form
        </a>
        <a href="/" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
          Go to Home
        </a>
      </div>
    </div>
  </section>
{:else}
<section class="bg-gray-100 min-h-screen flex items-center justify-center p-4">
  <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-2xl">
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">Memorial Information Submitted</h1>
      <p class="text-gray-600">Thank you for submitting the memorial information. Here's a summary of the details:</p>
    </div>

    <!-- Director Information -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-3">Director Information</h2>
      <p class="text-gray-700">
        Name: {formData.director.firstName} {formData.director.lastName}
      </p>
    </div>

    <!-- Family Member Information -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-3">Family Member Information</h2>
      <p class="text-gray-700">
        Name: {formData.familyMember.firstName} {formData.familyMember.lastName}
      </p>
      <p class="text-gray-700">
        Date of Birth: {formatDate(formData.familyMember.dob)}
      </p>
    </div>

    <!-- Deceased Information -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-3">Deceased Information</h2>
      <p class="text-gray-700">
        Name: {formData.deceased.firstName} {formData.deceased.lastName}
      </p>
      <p class="text-gray-700">
        Date of Birth: {formatDate(formData.deceased.dob)}
      </p>
      <p class="text-gray-700">
        Date of Passing: {formatDate(formData.deceased.dop)}
      </p>
    </div>

    <!-- Contact Information -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-3">Contact Information</h2>
      <p class="text-gray-700">Email: {formData.contact.email}</p>
      <p class="text-gray-700">Phone: {formData.contact.phone}</p>
    </div>

    <!-- Memorial Information -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-3">Memorial Information</h2>
      <p class="text-gray-700">Location: {formData.memorial.locationName}</p>
      <p class="text-gray-700">Address: {formData.memorial.locationAddress}</p>
      <p class="text-gray-700">
        Date: {formatDate(formData.memorial.date)}
      </p>
      <p class="text-gray-700">
        Time: {formatTime(formData.memorial.time)}
      </p>
    </div>

    <!-- Next Steps -->
    <div class="mt-8 p-4 bg-blue-50 rounded-lg">
      <h2 class="text-xl font-semibold text-blue-800 mb-3">Next Steps</h2>
      <p class="text-blue-700 mb-2">
        1. You will receive a confirmation email with these details.
      </p>
      <p class="text-blue-700 mb-2">
        2. Our team will review the information and contact you if any additional details are needed.
      </p>
      <p class="text-blue-700">
        3. You can access and update this information at any time by logging in with your email address.
      </p>
    </div>

    <!-- Back Button -->
    <div class="mt-8 flex justify-center">
      <a
        href="/"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Return to Home
      </a>
    </div>
  </div>
</section>
{/if}

<!-- Error Boundary -->
<svelte:window 
  on:error={(event) => {
    console.error('Error in confirmation page:', event);
  }}
/>
