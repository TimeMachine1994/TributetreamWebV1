<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import TributeInitialForm from '../components/TributeInitialForm.svelte';
    import TributeDetailsForm from '../components/TributeDetailsForm.svelte';
    import { API_CONFIG } from '../config/api';
    import type { FormState, UIState, ValidationState } from '../types';
    
    // Initialize states
    let formState: FormState = {
      tributeName: '',
      userFullName: '',
      userEmail: '',
      userPhone: '',
      username: '',
      urlSlug: '',
      tempUrlSlug: ''
    };
    
    let uiState: UIState = {
      currentStep: 1,
      isLoading: false,
      isEditing: false,
      isBlurred: false
    };
    
    let validationState: ValidationState = {
      nameError: '',
      emailError: '',
      phoneError: '',
      generalError: ''
    };
    
    // URL Slug Generation
    $: formState.urlSlug = generateUrlSlug(formState.tributeName);
    
    // Import all your existing functions here
    // [Previous functions remain the same]
    
    function handleSearch(): void {
      goto(`/search?q=${encodeURIComponent(formState.tributeName)}`);
    }
    
    onMount(() => {
      // Initialize any required resources
    });
    </script>
    
    <main class="overflow-hidden">
      <section class="relative bg-gray-900 text-white">
        <video
          autoplay
          muted
          loop
          playsinline
          class="absolute inset-0 w-full h-full object-cover z-0"
          class:blurred={uiState.isBlurred}
        >
          <source
            src="https://pub-f5d8194fe58b4bb69fc710f4fecb334f.r2.dev/video.mp4"
            type="video/mp4"
          />
        </video>
        
        <div class="absolute inset-0 bg-black opacity-50 z-10"></div>
    
        <div class="relative z-20 flex flex-col items-center justify-start h-screen min-w-screen pt-8 font-['Fanwood_Text']">
          <h1 class="text-4xl md:text-6xl text-center mb-4">
            We Connect Families, One Link at a Time.
          </h1>
    
          {#if uiState.currentStep === 1}
            <TributeInitialForm
              bind:tributeName={formState.tributeName}
              error={validationState.generalError}
              {handleStepNavigation}
              {handleSearch}
            />
          {:else}
            <TributeDetailsForm
              {formState}
              {validationState}
              {uiState}
              {handleStepNavigation}
              {handleTributeCreation}
            />
          {/if}
        </div>
      </section>
    </main>
    
    <style>
      .tribute-button {
        @apply bg-[#D5BA7F] text-black font-bold py-2 px-4 border border-transparent rounded-lg;
        @apply hover:text-black hover:shadow-[0_0_10px_4px_#D5BA7F];
        @apply transition-all duration-300 ease-in-out;
      }
    
      .invalid-input {
        @apply border-2 border-red-500;
        animation: shake 0.5s ease-in-out;
      }
    
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
      }
    
      .blurred {
        @apply filter blur-[10px] transition-all duration-300;
      }
    </style>
    