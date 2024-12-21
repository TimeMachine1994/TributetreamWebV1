<script lang="ts">
    interface Props {
        slug: string;
        isEditing: boolean;
    }

    let { slug = $bindable(), isEditing = $bindable() }: Props = $props();
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
        onclick={() => isEditing = !isEditing}
        class="text-sm text-blue-500 hover:text-blue-600"
      >
        {isEditing ? 'Save' : 'Edit'}
      </button>
    </div>
    