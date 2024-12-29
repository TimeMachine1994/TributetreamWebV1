<!-- *****************************************************************************************
     +page.svelte (Svelte 5 / Dashboard)
     This file is the main Dashboard page in Svelte 5. It demonstrates:
       1. Using Runes ($state) for reactivity.
       2. Handling props via $props().
       3. Managing editing and saving logic for tribute objects.
       4. Tailwind CSS utility classes for styling.
       5. Extensive console logging to debug data flow.
*******************************d********************************************************** -->

<script lang="ts">
  /******************************************************************************
   * 1. Imports and Declarations

  /**
   * Svelte 5's new approach: $props(), $state, etc.
   * We can console.log to confirm we’re getting the correct server data (tributes, status).
   */
  const { data } = $props(); // The `load` function in +page.server.ts returns this
  console.log('[dashboard/+page.svelte] data from +page.server.ts:', data);

  /******************************************************************************
   * 2. Reactive State Declarations using $state
   *****************************************************************************/
  // tributes: the array of Tribute items, initialized from data.tributes
 
  // FILE: src/routes/dashboard/+page.server.ts

 
</script>

 