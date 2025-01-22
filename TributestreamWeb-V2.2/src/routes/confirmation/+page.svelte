<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  let formData: any;
  let error = '';

  try {
    const data = $page.url.searchParams.get('data');
    if (data) {
      formData = JSON.parse(decodeURIComponent(data));
    } else {
      error = 'No form data found';
    }
  } catch (err) {
    error = 'Failed to load form data';
    console.error('Error parsing form data:', err);
  }
</script>

<div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-3xl mx-auto">
    <div class="bg-white shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h1 class="text-3xl font-bold text-gray-900 text-center mb-8">
          Form Submission Confirmation
        </h1>

        {#if error}
          <div class="rounded-md bg-red-50 p-4 mb-6">
            <div class="text-sm text-red-700">
              {error}
            </div>
          </div>
        {:else if !formData}
          <div class="flex justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        {:else}
          <div class="space-y-6">
            <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Submission Date</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {new Date().toLocaleDateString()}
              </dd>
            </div>

            <!-- Director Information -->
            <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Director's Name</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {formData.director.firstName} {formData.director.lastName}
              </dd>
            </div>

            <!-- Family Member Information -->
            <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Family Member</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <div>{formData.familyMember.firstName} {formData.familyMember.lastName}</div>
                <div class="text-gray-600">Born: {formData.familyMember.dateOfBirth}</div>
              </dd>
            </div>

            <!-- Deceased Information -->
            <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Deceased Information</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <div>{formData.deceased.firstName} {formData.deceased.lastName}</div>
                <div class="text-gray-600">Born: {formData.deceased.dateOfBirth}</div>
                <div class="text-gray-600">Passed: {formData.deceased.dateOfPassing}</div>
              </dd>
            </div>

            <!-- Contact Information -->
            <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Contact Information</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <div>Email: {formData.contact.email}</div>
                <div>Phone: {formData.contact.phone}</div>
              </dd>
            </div>

            <!-- Memorial Information -->
            <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Memorial Information</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <div>{formData.memorial.locationName}</div>
                <div>{formData.memorial.locationAddress}</div>
                <div>Date: {formData.memorial.date}</div>
                <div>Time: {formData.memorial.time}</div>
              </dd>
            </div>
          </div>

          <div class="mt-8 flex justify-center">
            <button
              on:click={() => goto('/')}
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Return to Home
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
