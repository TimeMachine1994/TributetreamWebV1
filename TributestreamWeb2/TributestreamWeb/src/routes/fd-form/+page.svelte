<script>
  let directorFirstName = '';
</script>

<form method="POST">
  <label for="directorFirstName">Director's First Name:</label>
  <input type="text" id="directorFirstName" name="directorFirstName" bind:value={directorFirstName} />
  <button type="submit">Submit</button>
</form>
