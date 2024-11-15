<script>
  import { onMount } from 'svelte';

  let username = '';
  let password = '';

 
  async function handleLogin() {
        console.log('Login submitted:', { username, password });

        try {
            const response = await fetch('https://wp.tributestream.com/wp-json/jwt-auth/v1/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();
            console.log('Login successful:', data);

            // Store the token for future requests
            localStorage.setItem('token', data.token);

            // Redirect to the admin page
            window.location.href = '/admin'; // Change '/admin' to the actual path of your admin page
        } catch (error) {
            console.error('Error during login:', error);
        }
    }
</script>

<main>
  <div class="card p-4">
      <div class="hero">
          <p class="text-2xl p-4 text-center">Login</p>
          <p class="text-center">Please enter your credentials to log in to your account.</p>
      </div>
  </div>

  <section class="card p-4 mt-4">
      <form on:submit|preventDefault={handleLogin}>
          <label class="label">
              <span>Username</span>
              <input class="input" type="text" bind:value={username} placeholder="Your username" required />
          </label>
          <label class="label">
              <span>Password</span>
              <input class="input" type="password" bind:value={password} placeholder="Your password" required />
          </label>
          <button type="submit" class="bg-[#D5BA7F] text-black py-2 px-4 border border-transparent rounded-lg hover:text-black">Login</button>
      </form>
  </section>
</main>

<style>
  main {
      max-width: 400px;
      margin: 0 auto;
      padding: 20px;
  }

  .card {
      background-color: white;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
  }

  .hero {
      text-align: center;
      margin-bottom: 20px;
  }

  .label {
      display: flex;
      flex-direction: column;
      margin-bottom: 15px;
  }

  .input {
      width: 100%;
      padding: 12px;
      margin-top: 5px;
      border: 1px solid #ccc;
      border-radius: 8px;
  }

  button {
      align-self: flex-start;
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.3s ease;
  }

  button:hover {
      background-color: #CFCFCE;
  }
</style>
