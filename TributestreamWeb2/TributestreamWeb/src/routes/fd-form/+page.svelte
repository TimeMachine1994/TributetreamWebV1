<script lang="ts">
  

  let { fdForm } = $props();
  let formData = $state(fdForm);
</script>
 <form method="POST">
	<label>
		Email
		<input name="email" type="email">
	</label>
	<label>
		Password
		<input name="password" type="password">
	</label>
	<button>Log in</button>
</form>
<form method="post">
  <fieldset>
    <legend>Funeral Director Information</legend>
    <label for="directorFirstName">First Name:</label>
    <input 
      id="directorFirstName"
      name="directorFirstName"
      bind:value={formData.directorFirstName}
      required
    />

    <label for="directorLastName">Last Name:</label>
    <input
      id="directorLastName"
      name="directorLastName"
      bind:value={formData.directorLastName}
      required
    />
  </fieldset>

  <fieldset>
    <legend>Deceased Information</legend>
    <label for="deceasedFirstName">First Name:</label>
    <input
      id="deceasedFirstName"
      name="deceasedFirstName"
      bind:value={formData.deceasedFirstName}
      required
    />

    <label for="deceasedLastName">Last Name:</label>
    <input
      id="deceasedLastName"
      name="deceasedLastName"
      bind:value={formData.deceasedLastName}
      required
    />

    <label for="deceasedDOB">Date of Birth:</label>
    <input
      type="date"
      id="deceasedDOB"
      name="deceasedDOB"
      bind:value={formData.deceasedDOB}
      required
    />

    <label for="deceasedDOD">Date of Death:</label>
    <input
      type="date"
      id="deceasedDOD"
      name="deceasedDOD"
      bind:value={formData.deceasedDOD}
      required
    />
  </fieldset>

  <fieldset>
    <legend>Family Member Contact</legend>
    <label for="familyMemberEmail">Email:</label>
    <input
      type="email"
      id="familyMemberEmail"
      name="familyMemberEmail"
      bind:value={formData.familyMemberEmail}
      required
    />

    <label for="familyMemberPhone">Phone:</label>
    <input
      type="tel"
      id="familyMemberPhone"
      name="familyMemberPhone"
      bind:value={formData.familyMemberPhone}
    />

    <label for="familyMemberDOB">Date of Birth:</label>
    <input
      type="date"
      id="familyMemberDOB"
      name="familyMemberDOB"
      bind:value={formData.familyMemberDOB}
    />
  </fieldset>

  <fieldset>
    <legend>Memorial Service Details</legend>
    <label for="initialMemorialName">Name:</label>
    <input
      id="initialMemorialName"
      name="initialMemorialName"
      bind:value={formData.initialMemorialName}
      required
    />

    <label for="initialMemorialAddress">Address:</label>
    <input
      id="initialMemorialAddress"
      name="initialMemorialAddress"
      bind:value={formData.initialMemorialAddress}
    />

    <label for="initialMemorialTime">Time:</label>
    <input
      type="time"
      id="initialMemorialTime"
      name="initialMemorialTime"
      bind:value={formData.initialMemorialTime}
    />

    <label for="initialMemorialDate">Date:</label>
    <input
      type="date"
      id="initialMemorialDate"
      name="initialMemorialDate"
      bind:value={formData.initialMemorialDate}
    />
  </fieldset>

  <button>Submit</button>
</form>
