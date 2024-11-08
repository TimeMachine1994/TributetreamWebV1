<script lang="ts">
    let lovedOneName = '';
    let fullName = '';
    let email = '';
    let phone = '';
    let error = '';
  
    function generateRandomPassword(): string {
      return Math.random().toString(36).slice(-8);
    }
  
    async function handleSubmit() {
      const password = generateRandomPassword();
      
      try {
        const response = await fetch('https://wp.tributestream.com/wp-json/my-plugin/v1/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: email.split('@')[0], // Create username from email
            email: email,
            password: password,
            meta: {
              full_name: fullName,
              loved_one_name: lovedOneName,
              phone: phone
            }
          })
        });
  
        if (!response.ok) {
          throw new Error('Registration failed');
        }
  
        // Handle successful registration
        const data = await response.json();
        // You can redirect or show success message here
      } catch (err) {
        error = err.message;
      }
    }
  </script>
  
  <form on:submit|preventDefault={handleSubmit} class="max-w-md mx-auto p-6">
    <div class="space-y-4">
      <div>
        <label for="lovedOneName">Loved One's Name</label>
        <input
          id="lovedOneName"
          type="text"
          bind:value={lovedOneName}
          class="w-full px-4 py-2 rounded-md border"
          required
        />
      </div>
  
      <div>
        <label for="fullName">Your Name</label>
        <input
          id="fullName"
          type="text"
          bind:value={fullName}
          class="w-full px-4 py-2 rounded-md border"
          required
        />
      </div>
  
      <div>
        <label for="email">Email Address</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          class="w-full px-4 py-2 rounded-md border"
          required
        />
      </div>
  
      <div>
        <label for="phone">Phone Number</label>
        <input
          id="phone"
          type="tel"
          bind:value={phone}
          class="w-full px-4 py-2 rounded-md border"
          required
        />
      </div>
  
      {#if error}
        <p class="text-red-500">{error}</p>
      {/if}
  
      <button
        type="submit"
        class="w-full bg-[#D5BA7F] text-black font-bold py-2 px-4 rounded-lg hover:shadow-[0_0_10px_4px_#D5BA7F]"
      >
        Register
      </button>
    </div>
  </form>
  