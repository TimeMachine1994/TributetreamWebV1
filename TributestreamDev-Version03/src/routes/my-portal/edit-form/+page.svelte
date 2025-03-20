<script lang="ts">
  import { enhance } from "$app/forms";
  import type { ActionResult } from "@sveltejs/kit";
  import type { PageData } from "./$types";

  // Define types for form fields - same as fd-form
  type FormField = 
    | "director-first-name" 
    | "director-last-name" 
    | "family-member-first-name" 
    | "family-member-last-name" 
    | "family-member-dob" 
    | "deceased-first-name" 
    | "deceased-last-name" 
    | "deceased-dob" 
    | "deceased-dop" 
    | "email-address" 
    | "phone-number" 
    | "location-name" 
    | "location-address" 
    | "memorial-time" 
    | "memorial-date";

  type FormData = Record<FormField, string>;
  type ErrorMap = Partial<Record<FormField, string>>;
  type TouchedMap = Partial<Record<FormField, boolean>>;

  // Component props
  let { form, data } = $props<{ 
    form?: ActionResult;
    data: PageData;
  }>();
  
  // Form data state initialized with data from server
  let formData = $state<FormData>({
    "director-first-name": "",
    "director-last-name": "",
    "family-member-first-name": "",
    "family-member-last-name": "",
    "family-member-dob": "",
    "deceased-first-name": "",
    "deceased-last-name": "",
    "deceased-dob": "",
    "deceased-dop": "",
    "email-address": "",
    "phone-number": "",
    "location-name": "",
    "location-address": "",
    "memorial-time": "",
    "memorial-date": ""
  });
  
  // Prefill with loaded data
  if (data.fdForm) {
    formData = { ...formData, ...data.fdForm };
  }
  
  // Error state management
  let errors = $state<ErrorMap>({});
  let formError = $state<string>("");
  let formSuccess = $state<string>("");
  let isSubmitting = $state<boolean>(false);
  let touched = $state<TouchedMap>({});

  // Set touched state when field is focused
  function markAsTouched(fieldName: FormField): void {
    touched[fieldName] = true;
  }
  
  // Client-side validation
  function validateField(fieldName: FormField, value: string): void {
    // Only validate if the field has been touched
    if (!touched[fieldName]) return;
    
    // Clear existing error for this field
    delete errors[fieldName];
    
    // Perform validation based on field type
    switch (fieldName) {
      case "director-first-name":
        if (!value) errors[fieldName] = "Director's first name is required";
        break;
      case "director-last-name":
        if (!value) errors[fieldName] = "Director's last name is required";
        break;
      case "deceased-first-name":
        if (!value) errors[fieldName] = "Deceased's first name is required";
        break;
      case "deceased-last-name":
        if (!value) errors[fieldName] = "Deceased's last name is required";
        break;
      case "email-address":
        if (!value) {
          errors[fieldName] = "Email address is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors[fieldName] = "Invalid email format";
        }
        break;
      case "phone-number":
        if (value && !/^[0-9\-\+\(\)\s]{7,20}$/.test(value)) {
          errors[fieldName] = "Invalid phone number format";
        }
        break;
      case "location-name":
        if (!value) errors[fieldName] = "Location name is required";
        break;
      case "deceased-dob":
      case "deceased-dop":
      case "memorial-date":
        if (value && isNaN(new Date(value).getTime())) {
          errors[fieldName] = "Invalid date format";
        }
        break;
    }
  }
  
  // Validate all fields at once
  function validateForm(): boolean {
    // Mark all fields as touched
    Object.keys(formData).forEach(key => {
      const fieldName = key as FormField;
      touched[fieldName] = true;
      validateField(fieldName, formData[fieldName]);
    });
    
    // Return true if no errors
    return Object.keys(errors).length === 0;
  }
  
  // Get input class based on error state
  function getInputClass(fieldName: FormField): string {
    const baseClass = "border rounded w-full py-2 px-3 text-gray-700";
    return touched[fieldName] && errors[fieldName] 
      ? `${baseClass} border-red-500 focus:ring-red-500` 
      : baseClass;
  }
  
  // Handle form submission with enhanced client-side validation
  function handleSubmit(event: Event): void {
    // Reset form error and success
    formError = "";
    formSuccess = "";
    
    // Validate all fields
    if (!validateForm()) {
      event.preventDefault();
      formError = "Please correct the errors before submitting.";
      return;
    }
    
    // Submission will continue naturally if validation passes
    isSubmitting = true;
  }

  // Handle server-side form errors
  function processServerResponse(result: any): void {
    if (result?.error) {
      formError = result.message || "An error occurred during submission.";
      
      // If the server returned field-specific errors, map them to our errors object
      if (result.errors) {
        Object.entries(result.errors).forEach(([key, message]) => {
          errors[key as FormField] = message as string;
        });
      }
    } else if (result?.success) {
      formSuccess = result.message || "Form updated successfully!";
    }
    isSubmitting = false;
  }

  // Create link to tribute page - fix the derived value to be a string or undefined
  // This fixes the TypeScript error when using it as an href attribute
  let tributeUrl = $derived(
    data.tribute?.slug ? `/celebration-of-life-for-${data.tribute.slug}` : undefined
  );
</script>

<svelte:head>
  <title>Edit Memorial Information | My Portal | Tributestream</title>
  <meta name="description" content="Edit your memorial information in your personal Tributestream portal." />
</svelte:head>

<section class="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-4">
  <div class="w-full max-w-4xl">
    <!-- Header area with navigation and informational buttons -->
    <div class="bg-white shadow-md rounded px-8 pt-6 pb-4 mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Edit Memorial Information</h1>
        <p class="text-gray-600">Update information for your tribute page</p>
      </div>
      <div class="space-x-2">
        <a href="/my-portal" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
          Back to Dashboard
        </a>
        {#if tributeUrl}
          <a href={tributeUrl} class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            View Tribute Page
          </a>
        {/if}
      </div>
    </div>

    <!-- Main form area -->
    <form 
      method="POST" 
      class="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full space-y-4"
      on:submit={handleSubmit}
      use:enhance={() => {
        return async ({ result, update }) => {
          if (result.type === 'success' || result.type === 'failure') {
            processServerResponse(result.data);
          }
          await update();
        };
      }}
    >
      {#if formError}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span class="block sm:inline">{formError}</span>
        </div>
      {/if}
      
      {#if formSuccess}
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span class="block sm:inline">{formSuccess}</span>
        </div>
      {/if}
      
      {#if form?.error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span class="block sm:inline">{form.message}</span>
        </div>
      {/if}

      <!-- Director's Name -->
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2" for="director-first-name">Director's Name</label>
        <div class="flex space-x-4">
          <div class="w-full">
            <input
              name="director-first-name"
              type="text"
              id="director-first-name"
              placeholder="First Name"
              class={getInputClass("director-first-name")}
              bind:value={formData["director-first-name"]}
              on:blur={() => validateField("director-first-name", formData["director-first-name"])}
              on:focus={() => markAsTouched("director-first-name")}
              aria-invalid={errors["director-first-name"] ? "true" : "false"}
              aria-describedby={errors["director-first-name"] ? "director-first-name-error" : undefined}
            />
            {#if errors["director-first-name"]}
              <p id="director-first-name-error" class="text-red-500 text-xs mt-1">{errors["director-first-name"]}</p>
            {/if}
          </div>
          <div class="w-full">
            <input
              name="director-last-name"
              type="text"
              id="directors-last-name"
              placeholder="Last Name"
              class={getInputClass("director-last-name")}
              bind:value={formData["director-last-name"]}
              on:blur={() => validateField("director-last-name", formData["director-last-name"])}
              on:focus={() => markAsTouched("director-last-name")}
              aria-invalid={errors["director-last-name"] ? "true" : "false"}
              aria-describedby={errors["director-last-name"] ? "director-last-name-error" : undefined}
            />
            {#if errors["director-last-name"]}
              <p id="director-last-name-error" class="text-red-500 text-xs mt-1">{errors["director-last-name"]}</p>
            {/if}
          </div>
        </div>
      </div>

      <!-- Family Member Name -->
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2" for="family-member-first-name">Family Member Name</label>
        <div class="flex space-x-4">
          <div class="w-full">
            <input
              name="family-member-first-name"
              type="text"
              id="family-member-first-name"
              placeholder="First Name"
              class={getInputClass("family-member-first-name")}
              bind:value={formData["family-member-first-name"]}
              on:blur={() => validateField("family-member-first-name", formData["family-member-first-name"])}
              on:focus={() => markAsTouched("family-member-first-name")}
            />
            {#if errors["family-member-first-name"]}
              <p class="text-red-500 text-xs mt-1">{errors["family-member-first-name"]}</p>
            {/if}
          </div>
          <div class="w-full">
            <input
              name="family-member-last-name"
              type="text"
              id="family-member-last-name"
              placeholder="Last Name"
              class={getInputClass("family-member-last-name")}
              bind:value={formData["family-member-last-name"]}
              on:blur={() => validateField("family-member-last-name", formData["family-member-last-name"])}
              on:focus={() => markAsTouched("family-member-last-name")}
            />
            {#if errors["family-member-last-name"]}
              <p class="text-red-500 text-xs mt-1">{errors["family-member-last-name"]}</p>
            {/if}
          </div>
        </div>
      </div>

      <!-- Family Member Date of Birth -->
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2" for="family-member-dob">Family Member Date of Birth</label>
        <input
          name="family-member-dob"
          type="date"
          id="family-member-dob"
          class={getInputClass("family-member-dob")}
          bind:value={formData["family-member-dob"]}
          on:blur={() => validateField("family-member-dob", formData["family-member-dob"])}
          on:focus={() => markAsTouched("family-member-dob")}
        />
        {#if errors["family-member-dob"]}
          <p class="text-red-500 text-xs mt-1">{errors["family-member-dob"]}</p>
        {/if}
      </div>

      <!-- Deceased Name -->
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2" for="deceased-first-name">Deceased Name</label>
        <div class="flex space-x-4">
          <div class="w-full">
            <input
              name="deceased-first-name"
              type="text"
              id="deceased-first-name"
              placeholder="First Name"
              class={getInputClass("deceased-first-name")}
              bind:value={formData["deceased-first-name"]}
              on:blur={() => validateField("deceased-first-name", formData["deceased-first-name"])}
              on:focus={() => markAsTouched("deceased-first-name")}
              aria-invalid={errors["deceased-first-name"] ? "true" : "false"}
              aria-describedby={errors["deceased-first-name"] ? "deceased-first-name-error" : undefined}
            />
            {#if errors["deceased-first-name"]}
              <p id="deceased-first-name-error" class="text-red-500 text-xs mt-1">{errors["deceased-first-name"]}</p>
            {/if}
          </div>
          <div class="w-full">
            <input
              name="deceased-last-name"
              type="text"
              id="deceased-last-name"
              placeholder="Last Name"
              class={getInputClass("deceased-last-name")}
              bind:value={formData["deceased-last-name"]}
              on:blur={() => validateField("deceased-last-name", formData["deceased-last-name"])}
              on:focus={() => markAsTouched("deceased-last-name")}
              aria-invalid={errors["deceased-last-name"] ? "true" : "false"}
              aria-describedby={errors["deceased-last-name"] ? "deceased-last-name-error" : undefined}
            />
            {#if errors["deceased-last-name"]}
              <p id="deceased-last-name-error" class="text-red-500 text-xs mt-1">{errors["deceased-last-name"]}</p>
            {/if}
          </div>
        </div>
      </div>

      <!-- Deceased Date of Birth -->
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2" for="deceased-dob">Deceased Date of Birth</label>
        <input
          name="deceased-dob"
          type="date"
          id="deceased-dob"
          class={getInputClass("deceased-dob")}
          bind:value={formData["deceased-dob"]}
          on:blur={() => validateField("deceased-dob", formData["deceased-dob"])}
          on:focus={() => markAsTouched("deceased-dob")}
        />
        {#if errors["deceased-dob"]}
          <p class="text-red-500 text-xs mt-1">{errors["deceased-dob"]}</p>
        {/if}
      </div>

      <!-- Deceased Date of Passing -->
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2" for="deceased-dop">Deceased Date of Passing</label>
        <input
          name="deceased-dop"
          type="date"
          id="deceased-dop"
          class={getInputClass("deceased-dop")}
          bind:value={formData["deceased-dop"]}
          on:blur={() => validateField("deceased-dop", formData["deceased-dop"])}
          on:focus={() => markAsTouched("deceased-dop")}
        />
        {#if errors["deceased-dop"]}
          <p class="text-red-500 text-xs mt-1">{errors["deceased-dop"]}</p>
        {/if}
      </div>

      <!-- Contact Information -->
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2" for="email-address">Contact Information</label>
        <div class="flex space-x-4">
          <div class="w-full">
            <input
              name="email-address"
              type="email"
              id="email-address"
              placeholder="Email Address"
              class={getInputClass("email-address")}
              bind:value={formData["email-address"]}
              on:blur={() => validateField("email-address", formData["email-address"])}
              on:focus={() => markAsTouched("email-address")}
              aria-invalid={errors["email-address"] ? "true" : "false"}
              aria-describedby={errors["email-address"] ? "email-address-error" : undefined}
            />
            {#if errors["email-address"]}
              <p id="email-address-error" class="text-red-500 text-xs mt-1">{errors["email-address"]}</p>
            {/if}
          </div>
          <div class="w-full">
            <input
              name="phone-number"
              type="tel"
              id="phone-number"
              placeholder="Phone Number"
              class={getInputClass("phone-number")}
              bind:value={formData["phone-number"]}
              on:blur={() => validateField("phone-number", formData["phone-number"])}
              on:focus={() => markAsTouched("phone-number")}
            />
            {#if errors["phone-number"]}
              <p class="text-red-500 text-xs mt-1">{errors["phone-number"]}</p>
            {/if}
          </div>
        </div>
      </div>

      <!-- Memorial Information -->
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2" for="location-name">Memorial Information</label>
        <div class="flex space-x-4">
          <div class="w-full">
            <input
              name="location-name"
              type="text"
              id="location-name"
              placeholder="Location Name"
              class={getInputClass("location-name")}
              bind:value={formData["location-name"]}
              on:blur={() => validateField("location-name", formData["location-name"])}
              on:focus={() => markAsTouched("location-name")}
              aria-invalid={errors["location-name"] ? "true" : "false"}
              aria-describedby={errors["location-name"] ? "location-name-error" : undefined}
            />
            {#if errors["location-name"]}
              <p id="location-name-error" class="text-red-500 text-xs mt-1">{errors["location-name"]}</p>
            {/if}
          </div>
          <div class="w-full">
            <input
              name="location-address"
              type="text"
              id="location-address"
              placeholder="Location Address"
              class={getInputClass("location-address")}
              bind:value={formData["location-address"]}
              on:blur={() => validateField("location-address", formData["location-address"])}
              on:focus={() => markAsTouched("location-address")}
            />
            {#if errors["location-address"]}
              <p class="text-red-500 text-xs mt-1">{errors["location-address"]}</p>
            {/if}
          </div>
        </div>
      </div>
      <div class="flex space-x-4">
        <div class="w-full">
          <input
            name="memorial-time"
            type="time"
            id="memorial-time"
            class={getInputClass("memorial-time")}
            bind:value={formData["memorial-time"]}
            on:blur={() => validateField("memorial-time", formData["memorial-time"])}
            on:focus={() => markAsTouched("memorial-time")}
          />
          {#if errors["memorial-time"]}
            <p class="text-red-500 text-xs mt-1">{errors["memorial-time"]}</p>
          {/if}
        </div>
        <div class="w-full">
          <input
            name="memorial-date"
            type="date"
            id="memorial-date"
            class={getInputClass("memorial-date")}
            bind:value={formData["memorial-date"]}
            on:blur={() => validateField("memorial-date", formData["memorial-date"])}
            on:focus={() => markAsTouched("memorial-date")}
          />
          {#if errors["memorial-date"]}
            <p class="text-red-500 text-xs mt-1">{errors["memorial-date"]}</p>
          {/if}
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end mt-6">
        <button
          type="submit"
          class="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-6 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  </div>
</section>