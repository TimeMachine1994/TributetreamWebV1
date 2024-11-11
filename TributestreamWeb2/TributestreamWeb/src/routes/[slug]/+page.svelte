<script lang="ts">
  export let data;

  // Destructure tribute data for easy access
  const { loved_one_name } = data.tribute;
</script>

<div class="tribute-page">
  <header class="tribute-header">
    <h1>Celebrating the Life of {loved_one_name}</h1>
  </header>
</div>

<style>
  .tribute-page {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
  }

  .tribute-header {
    margin-bottom: 2rem;
  }
</style>
