<script lang="ts">
    import type { FormState, ValidationState } from '../types';
    
    export let formState: FormState;
    export let validationState: ValidationState;
    </script>
    
    <div class="space-y-4">
      <div>
        <label for="fullName" class="block text-sm font-medium">Full Name</label>
        <input
          id="fullName"
          type="text"
          bind:value={formState.userFullName}
          class="w-full px-3 py-2 rounded-md"
          class:invalid-input={!!validationState.nameError}
        />
        {#if validationState.nameError}
          <p class="text-red-500 text-sm mt-1">{validationState.nameError}</p>
        {/if}
      </div>
    
      <div>
        <label for="email" class="block text-sm font-medium">Email</label>
        <input
          id="email"
          type="email"
          bind:value={formState.userEmail}
          class="w-full px-3 py-2 rounded-md"
          class:invalid-input={!!validationState.emailError}
        />
        {#if validationState.emailError}
          <p class="text-red-500 text-sm mt-1">{validationState.emailError}</p>
        {/if}
      </div>
    
      <div>
        <label for="phone" class="block text-sm font-medium">Phone Number</label>
        <input
          id="phone"
          type="tel"
          bind:value={formState.userPhone}
          class="w-full px-3 py-2 rounded-md"
          class:invalid-input={!!validationState.phoneError}
        />
        {#if validationState.phoneError}
          <p class="text-red-500 text-sm mt-1">{validationState.phoneError}</p>
        {/if}
      </div>
    </div>
    