<script lang="ts">
    export let slug: string;
    export let isEditing: boolean;
    </script>
    
    <div class="flex items-center space-x-2">
      <span class="text-gray-400">tributestream.com/</span>
      {#if isEditing}
        <input
          type="text"
          bind:value={slug}
          class="px-2 py-1 rounded border border-gray-300"
        />
      {:else}
        <span class="font-semibold">{slug}</span>
      {/if}
      <button
        on:click={() => isEditing = !isEditing}
        class="text-sm text-blue-500 hover:text-blue-600"
      >
        {isEditing ? 'Save' : 'Edit'}
      </button>
    </div>
    