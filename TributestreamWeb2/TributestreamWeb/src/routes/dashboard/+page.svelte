<script lang="ts">
  export let data;
  console.log('Page data:', data);
</script>

<div class="container mx-auto p-4">
  <h1 class="text-2xl mb-4">Dashboard Data</h1>
  
  <div class="mb-8">
      <h2 class="text-xl mb-2">Tributes ({data.tributes.length})</h2>
      {#each data.tributes as tribute}
          <div class="border p-4 mb-2 rounded">
              <p>Name: {tribute.loved_one_name}</p>
              <p>Created: {tribute.created_at}</p>
              <p>Streams: {tribute.number_of_streams}</p>
          </div>
      {/each}
  </div>

  <div>
      <h2 class="text-xl mb-2">Streams ({data.streams.length})</h2>
      {#each data.streams as stream}
          <div class="border p-4 mb-2 rounded">
              <p>ID: {stream.id}</p>
              <p>Tribute ID: {stream.tribute_id}</p>
          </div>
      {/each}
  </div>
</div>
