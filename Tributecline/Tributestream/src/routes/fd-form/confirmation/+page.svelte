<script lang="ts">
  let data = $props();

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
        Name: {data.formData.director.firstName} {data.formData.director.lastName}
      </p>
    </div>

    <!-- Family Member Information -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-3">Family Member Information</h2>
      <p class="text-gray-700">
        Name: {data.formData.familyMember.firstName} {data.formData.familyMember.lastName}
      </p>
      <p class="text-gray-700">
        Date of Birth: {formatDate(data.formData.familyMember.dob)}
      </p>
    </div>

    <!-- Deceased Information -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-3">Deceased Information</h2>
      <p class="text-gray-700">
        Name: {data.formData.deceased.firstName} {data.formData.deceased.lastName}
      </p>
      <p class="text-gray-700">
        Date of Birth: {formatDate(data.formData.deceased.dob)}
      </p>
      <p class="text-gray-700">
        Date of Passing: {formatDate(data.formData.deceased.dop)}
      </p>
    </div>

    <!-- Contact Information -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-3">Contact Information</h2>
      <p class="text-gray-700">Email: {data.formData.contact.email}</p>
      <p class="text-gray-700">Phone: {data.formData.contact.phone}</p>
    </div>

    <!-- Memorial Information -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-3">Memorial Information</h2>
      <p class="text-gray-700">Location: {data.formData.memorial.locationName}</p>
      <p class="text-gray-700">Address: {data.formData.memorial.locationAddress}</p>
      <p class="text-gray-700">
        Date: {formatDate(data.formData.memorial.date)}
      </p>
      <p class="text-gray-700">
        Time: {formatTime(data.formData.memorial.time)}
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
