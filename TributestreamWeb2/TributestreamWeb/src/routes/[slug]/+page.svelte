<script lang="ts">
  export let data;
  const { tribute } = data;
</script>

<div class="tribute-container">
  <h1>Tribute Details</h1>
  <pre>{JSON.stringify(tribute, null, 2)}</pre>
  
  <div class="tribute-info">
      <h2>{tribute.loved_one_name}</h2>
      <p>Created by user: {tribute.user_id}</p>
      <p>Tribute ID: {tribute.id}</p>
  </div>
</div>

<style>
  .tribute-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 1rem;
  }

  .tribute-info {
      margin-top: 2rem;
      line-height: 1.6;
  }

  pre {
      background: #f4f4f4;
      padding: 1rem;
      border-radius: 4px;
  }
</style>
