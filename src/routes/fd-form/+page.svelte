<script>
  // Form data using Svelte 5 runes
  let lovedOneName = $state('');
  let familyContactName = $state('');
  let familyContactPhone = $state('');
  let familyContactEmail = $state('');
  let funeralDirectorName = $state('');
  let funeralHome = $state('');
  let memorialLocation = $state('');
  let memorialDate = $state('');

  // Validation states
  let touched = $state({
    lovedOneName: false,
    familyContactName: false,
    familyContactPhone: false,
    familyContactEmail: false,
    funeralDirectorName: false,
    funeralHome: false,
    memorialLocation: false,
    memorialDate: false
  });

  // Validation functions
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    // Accept formats like: (123) 456-7890, 123-456-7890, 1234567890
    const re = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
    return re.test(phone);
  };
  
  // Validation errors
  let errors = $derived({
    lovedOneName: touched.lovedOneName && !lovedOneName ? 'Please enter loved one\'s name' : '',
    familyContactName: touched.familyContactName && !familyContactName ? 'Please enter family contact name' : '',
    familyContactPhone: touched.familyContactPhone && !validatePhone(familyContactPhone) ? 'Please enter a valid phone number' : '',
    familyContactEmail: touched.familyContactEmail && !validateEmail(familyContactEmail) ? 'Please enter a valid email address' : '',
    funeralDirectorName: touched.funeralDirectorName && !funeralDirectorName ? 'Please enter funeral director name' : '',
    funeralHome: touched.funeralHome && !funeralHome ? 'Please enter funeral home name' : '',
    memorialLocation: touched.memorialLocation && !memorialLocation ? 'Please enter memorial location' : '',
    memorialDate: touched.memorialDate && !memorialDate ? 'Please enter memorial date' : ''
  });

  // Mark field as touched when it loses focus
  function handleBlur(field) {
    touched[field] = true;
    console.log(`🔍 Field "${field}" touched and validating...`);
  }
  
  // Check if form is valid
  let isFormValid = $derived(
    lovedOneName &&
    familyContactName &&
    validatePhone(familyContactPhone) &&
    validateEmail(familyContactEmail) &&
    funeralDirectorName &&
    funeralHome &&
    memorialLocation &&
    memorialDate
  );

  $effect(() => {
    console.log(`🧪 Form validation status: ${isFormValid ? '✅ Valid' : '❌ Invalid'}`);
  });

  // Handle form submission (client-side validation)
  function handleSubmit(event) {
    console.log('📋 Processing form submission...');
    
    // Mark all fields as touched to show validation errors
    Object.keys(touched).forEach(key => {
      touched[key] = true;
    });

    // If form is invalid, prevent submission
    if (!isFormValid) {
      event.preventDefault();
      console.log("❌ Form submission blocked: validation failed");
      return;
    }
    
    // Log form data (for debugging)
    console.log("✅ Form validation passed, submitting data:", {
      "👤 Loved One": lovedOneName,
      "👪 Family Contact": familyContactName,
      "📱 Phone": familyContactPhone,
      "📧 Email": familyContactEmail,
      "👔 Funeral Director": funeralDirectorName,
      "🏢 Funeral Home": funeralHome,
      "📍 Location": memorialLocation,
      "📅 Date": memorialDate
    });
    // Form will submit to server endpoint
  }
</script>

<div class="container">
  <h1>Create Memorial Page</h1>
  
  <form method="POST" on:submit={handleSubmit}>
    <div class="form-group">
      <label for="lovedOneName">Loved One's Name <span class="required">*</span></label>
      <input 
        type="text" 
        id="lovedOneName" 
        name="lovedOneName"
        placeholder="Enter full name" 
        bind:value={lovedOneName}
        on:blur={() => handleBlur('lovedOneName')}
        class:error={errors.lovedOneName}
      />
      {#if errors.lovedOneName}
        <div class="error-message">{errors.lovedOneName}</div>
      {/if}
    </div>
    
    <div class="form-group">
      <label for="familyContactName">Family Contact Name <span class="required">*</span></label>
      <input 
        type="text" 
        id="familyContactName" 
        name="familyContactName"
        placeholder="Enter contact name" 
        bind:value={familyContactName}
        on:blur={() => handleBlur('familyContactName')}
        class:error={errors.familyContactName}
      />
      {#if errors.familyContactName}
        <div class="error-message">{errors.familyContactName}</div>
      {/if}
    </div>
    
    <div class="form-group">
      <label for="familyContactPhone">Family Contact Phone <span class="required">*</span></label>
      <input 
        type="tel" 
        id="familyContactPhone" 
        name="familyContactPhone"
        placeholder="(123) 456-7890" 
        bind:value={familyContactPhone}
        on:blur={() => handleBlur('familyContactPhone')}
        class:error={errors.familyContactPhone}
      />
      {#if errors.familyContactPhone}
        <div class="error-message">{errors.familyContactPhone}</div>
      {/if}
    </div>
    
    <div class="form-group">
      <label for="familyContactEmail">Family Contact Email <span class="required">*</span></label>
      <input 
        type="email" 
        id="familyContactEmail" 
        name="familyContactEmail"
        placeholder="email@example.com" 
        bind:value={familyContactEmail}
        on:blur={() => handleBlur('familyContactEmail')}
        class:error={errors.familyContactEmail}
      />
      {#if errors.familyContactEmail}
        <div class="error-message">{errors.familyContactEmail}</div>
      {/if}
    </div>
    
    <div class="form-group">
      <label for="funeralDirectorName">Funeral Director Name <span class="required">*</span></label>
      <input 
        type="text" 
        id="funeralDirectorName" 
        name="funeralDirectorName"
        placeholder="Enter funeral director name" 
        bind:value={funeralDirectorName}
        on:blur={() => handleBlur('funeralDirectorName')}
        class:error={errors.funeralDirectorName}
      />
      {#if errors.funeralDirectorName}
        <div class="error-message">{errors.funeralDirectorName}</div>
      {/if}
    </div>
    
    <div class="form-group">
      <label for="funeralHome">Funeral Home <span class="required">*</span></label>
      <input 
        type="text" 
        id="funeralHome" 
        name="funeralHome"
        placeholder="Enter funeral home name" 
        bind:value={funeralHome}
        on:blur={() => handleBlur('funeralHome')}
        class:error={errors.funeralHome}
      />
      {#if errors.funeralHome}
        <div class="error-message">{errors.funeralHome}</div>
      {/if}
    </div>
    
    <div class="form-group">
      <label for="memorialLocation">Memorial Location <span class="required">*</span></label>
      <input 
        type="text" 
        id="memorialLocation" 
        name="memorialLocation"
        placeholder="Enter memorial location" 
        bind:value={memorialLocation}
        on:blur={() => handleBlur('memorialLocation')}
        class:error={errors.memorialLocation}
      />
      {#if errors.memorialLocation}
        <div class="error-message">{errors.memorialLocation}</div>
      {/if}
    </div>
    
    <div class="form-group">
      <label for="memorialDate">Memorial Date <span class="required">*</span></label>
      <input 
        type="date" 
        id="memorialDate" 
        name="memorialDate"
        bind:value={memorialDate}
        on:blur={() => handleBlur('memorialDate')}
        class:error={errors.memorialDate}
      />
      {#if errors.memorialDate}
        <div class="error-message">{errors.memorialDate}</div>
      {/if}
    </div>
    
    <div class="form-actions">
      <button type="submit" class="submit-button" disabled={!isFormValid}>
        Create Memorial Page
      </button>
    </div>
  </form>
</div>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  
  h1 {
    margin-bottom: 2rem;
    color: #333;
    text-align: center;
  }
  
  form {
    display: grid;
    gap: 1.5rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  label {
    font-weight: 600;
    color: #333;
  }
  
  .required {
    color: #e53e3e;
  }
  
  input {
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    font-size: 1rem;
    transition: border-color 0.15s ease-in-out;
  }
  
  input:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
  
  input.error {
    border-color: #e53e3e;
  }
  
  .error-message {
    color: #e53e3e;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }
  
  .form-actions {
    margin-top: 1rem;
    display: flex;
    justify-content: center;
  }
  
  .submit-button {
    background-color: #4f46e5;
    color: #fff;
    font-weight: 600;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: background-color 0.15s ease-in-out;
    font-size: 1rem;
    min-width: 200px;
  }
  
  .submit-button:hover {
    background-color: #4338ca;
  }
  
  .submit-button:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
</style>