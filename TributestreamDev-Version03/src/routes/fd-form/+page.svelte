<script lang="ts">
  import { enhance } from "$app/forms";
  import type { PageData } from "./$types";
  
  // Define standalone interface for form action results
  interface FormActionResult {
    type: "success" | "failure" | "redirect" | "error";
    status: number;
    data?: {
      success?: boolean;
      error?: boolean;
      message?: string;
      errors?: Record<string, string>;
      formData?: Record<string, string>;
      isPartialSuccess?: boolean;
    };
    location?: string;
    error?: any;
    message?: string;
  }

  // Define types for form fields
  type FormField =
    | "director-first-name"
    | "director-last-name"
    | "family-member-first-name"
    | "family-member-last-name"
    | "deceased-first-name"
    | "deceased-last-name"
    | "email-address"
    | "phone-number"
    | "contact-preference"
    | "location-name"
    | "location-address"
    | "memorial-time"
    | "memorial-date";

  type FormData = Record<FormField, string>;
  type ErrorMap = Partial<Record<FormField, string>>;
  type TouchedMap = Partial<Record<FormField, boolean>>;

  // Component props
  let { fdForm, form } = $props<{
    fdForm?: FormData;
    form?: FormActionResult;
  }>();
  
  // Form data state with default empty values
  let formData = $state<FormData>({
    "director-first-name": "",
    "director-last-name": "",
    "family-member-first-name": "",
    "family-member-last-name": "",
    "deceased-first-name": "",
    "deceased-last-name": "",
    "email-address": "",
    "phone-number": "",
    "contact-preference": "follow-up", // Default to follow up
    "location-name": "",
    "location-address": "",
    "memorial-time": "",
    "memorial-date": ""
  });
  
  // Prefill with passed-in data if available
  if (fdForm) {
    formData = { ...formData, ...fdForm };
  }
  
  // Error state management
  let errors = $state<ErrorMap>({});
  let formError = $state<string>("");
  let isPartialSuccess = $state<boolean>(false);
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
        if (!value) {
          errors[fieldName] = "Phone number is required";
        } else if (!/^[0-9\-\+\(\)\s]{7,20}$/.test(value)) {
          errors[fieldName] = "Invalid phone number format";
        }
        break;
      case "location-name":
        // Location name is no longer required
        break;
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
    // Reset form error
    formError = "";
    
    // Validate all fields
    if (!validateForm()) {
      event.preventDefault();
      formError = "Please correct the errors before submitting.";
      return;
    }
    
    // Submission will continue naturally if validation passes
    isSubmitting = true;
  }

  // Handle server-side form errors and status messages
  function processServerErrors(result: any): void {
    if (result?.error) {
      formError = result.message || "An error occurred during submission.";
      isPartialSuccess = false;
      
      // If the server returned field-specific errors, map them to our errors object
      if (result.errors) {
        Object.entries(result.errors).forEach(([key, message]) => {
          errors[key as FormField] = message as string;
        });
      }
    } else if (result?.success) {
      // Handle success with possible message
      formError = ""; // Clear any previous errors
      if (result.message) {
        formError = result.message; // Use the message field for notifications
        isPartialSuccess = !!result.isPartialSuccess; // Set partial success flag if present
      }
    }
    
    isSubmitting = false;
  }

  // Format dates to YYYY-MM-DD for date inputs
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
</script>

<section class="bg-gray-100 min-h-screen flex items-center justify-center p-4">
  <form
    method="POST"
    class="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-2xl space-y-4"
    onsubmit={handleSubmit}
    use:enhance={() => {
      return async ({ result, update }) => {
        // Cast the ActionResult to our FormActionResult type
        const formResult = result as unknown as FormActionResult;
        if (formResult.type === 'failure') {
          processServerErrors(formResult.data);
          isSubmitting = false;
        } else if (formResult.type === 'redirect') {
          // First, make sure the DOM is updated before the navigation happens
          await update();
          
          // Reset the submitting state to avoid the UI being stuck if navigation is delayed
          isSubmitting = false;
          
          // We don't need to manually handle the redirect as SvelteKit will do it automatically
        } else if (formResult.type === 'success') {
          // Process any success data, including registration status
          processServerErrors(formResult.data);
          await update();
        } else {
          // Other cases
          isSubmitting = false;
        }
      };
    }}
  >
<!-- Black text, sans‑serif font -->
<p style="font-family: Arial, Helvetica, sans-serif; color:#000; margin:0 0 1em 0;">
  Please enter your family’s information, and they will receive:
</p>

<ol style="font-family: Arial, Helvetica, sans-serif; color:#000; padding-left:1.25em;">
  <li>1. A <b>free</b> custom link so they can preview our platform.</li>
  <li>2. Downloadable price borchure with detailed informaiton.</li>
  <li>3. A phone call within 24 hours to answer any questions directly <em>(if desired)</em>.</li>
</ol>


     <h1 class="text-2xl font-bold mb-4 text-gray-800">Memorial Information Form</h1>
    
    {#if formError && !isPartialSuccess}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <span class="block sm:inline">{formError}</span>
      </div>
    {/if}
    
    {#if formError && isPartialSuccess}
      <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
        <span class="block sm:inline">{formError}</span>
      </div>
    {/if}
    
    {#if form?.error}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <span class="block sm:inline">{form.message}</span>
      </div>
    {/if}
    
    {#if form?.data?.success && form?.data?.isPartialSuccess}
      <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
        <span class="block sm:inline">{form.data.message}</span>
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
            onblur={() => validateField("director-first-name", formData["director-first-name"])}
            onfocus={() => markAsTouched("director-first-name")}
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
            onblur={() => validateField("director-last-name", formData["director-last-name"])}
            onfocus={() => markAsTouched("director-last-name")}
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
            onblur={() => validateField("family-member-first-name", formData["family-member-first-name"])}
            onfocus={() => markAsTouched("family-member-first-name")}
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
            onblur={() => validateField("family-member-last-name", formData["family-member-last-name"])}
            onfocus={() => markAsTouched("family-member-last-name")}
          />
          {#if errors["family-member-last-name"]}
            <p class="text-red-500 text-xs mt-1">{errors["family-member-last-name"]}</p>
          {/if}
        </div>
      </div>
    </div>

    <!-- Family Member Date of Birth -->

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
            onblur={() => validateField("deceased-first-name", formData["deceased-first-name"])}
            onfocus={() => markAsTouched("deceased-first-name")}
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
            onblur={() => validateField("deceased-last-name", formData["deceased-last-name"])}
            onfocus={() => markAsTouched("deceased-last-name")}
            aria-invalid={errors["deceased-last-name"] ? "true" : "false"}
            aria-describedby={errors["deceased-last-name"] ? "deceased-last-name-error" : undefined}
          />
          {#if errors["deceased-last-name"]}
            <p id="deceased-last-name-error" class="text-red-500 text-xs mt-1">{errors["deceased-last-name"]}</p>
          {/if}
        </div>
      </div>
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
            onblur={() => validateField("email-address", formData["email-address"])}
            onfocus={() => markAsTouched("email-address")}
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
            onblur={() => validateField("phone-number", formData["phone-number"])}
            onfocus={() => markAsTouched("phone-number")}
            aria-invalid={errors["phone-number"] ? "true" : "false"}
            aria-describedby={errors["phone-number"] ? "phone-number-error" : undefined}
          />
          {#if errors["phone-number"]}
            <p id="phone-number-error" class="text-red-500 text-xs mt-1">{errors["phone-number"]}</p>
          {/if}
        </div>
      </div>
    </div>

    <!-- Contact Preference - Now positioned above memorial info -->
    <div>
      <label class="block text-gray-700 text-sm font-bold mb-2">Contact Preference</label>
      <div class="flex space-x-6 mb-4">
        <div class="flex items-center">
          <input
            type="radio"
            id="follow-up"
            name="contact-preference"
            value="follow-up"
            class="mr-2 h-4 w-4 border-gray-300 text-[#d5ba7f] focus:ring-[#d5ba7f]"
            checked={formData["contact-preference"] === "follow-up"}
            onclick={() => formData["contact-preference"] = "follow-up"}
          />
          <label for="follow-up" class="text-gray-700">Phone call</label>
        </div>
        <div class="flex items-center">
          <input
            type="radio"
            id="email-only"
            name="contact-preference"
            value="dual"
            class="mr-2 h-4 w-4 border-gray-300 text-[#d5ba7f] focus:ring-[#d5ba7f]"
            checked={formData["contact-preference"] === "dual"}
            onclick={() => formData["contact-preference"] = "dual"}
          />
          <label for="email-only" class="text-gray-700">Email Only</label>
        </div>
      </div>
      <p class="text-sm text-gray-600 mb-2">
  
      </p>
    </div>

    <!-- Memorial Information -->
    <div>
      <label class="block text-gray-700 text-sm font-bold mb-2" for="location-name">Memorial Information (Optional)</label>
      <div class="flex space-x-4">
        <div class="w-full">
          <input
            name="location-name"
            type="text"
            id="location-name"
            placeholder="Location Name"
            class={getInputClass("location-name")}
            bind:value={formData["location-name"]}
            onblur={() => validateField("location-name", formData["location-name"])}
            onfocus={() => markAsTouched("location-name")}
            aria-required="false"
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
            placeholder="Location Address (Optional)"
            class={getInputClass("location-address")}
            bind:value={formData["location-address"]}
            onblur={() => validateField("location-address", formData["location-address"])}
            onfocus={() => markAsTouched("location-address")}
            aria-required="false"
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
          placeholder="Time (Optional)"
          class={getInputClass("memorial-time")}
          bind:value={formData["memorial-time"]}
          onblur={() => validateField("memorial-time", formData["memorial-time"])}
          onfocus={() => markAsTouched("memorial-time")}
          aria-required="false"
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
          onblur={() => validateField("memorial-date", formData["memorial-date"])}
          onfocus={() => markAsTouched("memorial-date")}
          aria-required="false"
        />
        {#if errors["memorial-date"]}
          <p class="text-red-500 text-xs mt-1">{errors["memorial-date"]}</p>
        {/if}
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-center">
      <!-- Submit Button -->
      <button
        type="submit"
        class="bg-[#d5ba7f] hover:bg-[#c5aa6f] text-white font-bold py-3 px-6 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        style="background-color: rgb(213, 186, 127); hover:background-color: rgb(193, 166, 107);"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </div>
  </form>
</section>
