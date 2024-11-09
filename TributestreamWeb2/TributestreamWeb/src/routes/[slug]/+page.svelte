<script lang="ts">
    import CelebrationTemplate from '$lib/components/CelebrationTemplate.svelte';
    export let data;
  </script>
  
  {#if data.template === 'celebration-v2'}
    <CelebrationTemplate {data} />
  {/if}
  