<script lang="ts">
    import UrlEditor from './UrlEditor.svelte';
    import FormFields from './FormFields.svelte';
    import type { FormState, UIState, ValidationState } from '../types';
    
    export let formState: FormState;
    export let validationState: ValidationState;
    export let uiState: UIState;
    export let handleStepNavigation: (direction: 'next' | 'back') => void;
    export let handleTributeCreation: () => void;
    </script>
    
    <div class="w-full max-w-md">
      <div class="mb-4">
        <h2 class="text-xl mb-2">Your Loved One's Custom Link:</h2>
        <UrlEditor
          slug={formState.urlSlug}
          isEditing={uiState.isEditing}
        />
      </div>
    
      <FormFields
        {formState}
        {validationState}
      />
    
      <div class="flex justify-between items-center">
        <button
          type="button"
          on:click={() => handleStepNavigation('back')}
          class="back-button"
        >
          <i class="fas fa-arrow-left"></i>
        </button>
    
        <button
          type="button"
          on:click={handleTributeCreation}
          class="tribute-button"
          disabled={uiState.isLoading}
        >
          {uiState.isLoading ? 'Creating...' : 'See Custom Link'}
        </button>
      </div>
    </div>
    