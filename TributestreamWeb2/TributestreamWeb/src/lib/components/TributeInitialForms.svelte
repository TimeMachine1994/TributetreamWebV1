<script lang="ts">
    export let tributeName: string;
    export let error: string;
    export let handleStepNavigation: (direction: 'next' | 'back') => void;
    export let handleSearch: () => void;
    </script>
    
    <form on:submit|preventDefault={() => handleStepNavigation('next')}>
      <div class="flex flex-col items-center justify-center mb-4">
        <p class="text-center mb-8">
          Tributestream broadcasts high quality audio and video of your loved
          one's celebration of life. Enter your loved one's name below to begin.
        </p>
        
        <input
          type="text"
          placeholder="Loved One's Name Here"
          class="w-full px-4 py-2 text-gray-900 rounded-md mb-4 text-center max-w-md"
          class:invalid-input={!!error}
          bind:value={tributeName}
        />
        
        {#if error}
          <p class="error-text">{error}</p>
        {/if}
    
        <div class="flex space-x-4 justify-center">
          <button type="submit" class="tribute-button">
            Create Tribute
          </button>
          <button on:click={handleSearch} class="tribute-button">
            Search Streams
          </button>
        </div>
      </div>
    </form>
    