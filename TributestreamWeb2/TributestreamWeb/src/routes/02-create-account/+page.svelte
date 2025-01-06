<script>
  import { preventDefault } from 'svelte/legacy';

    import { onMount } from 'svelte';
  
    let username = $state('');
    let email = $state('');
    let password = $state('');
    let confirmPassword = $state('');
  
    // Placeholder for account creation logic
    function handleCreateAccount() {
      if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
      }
      console.log('Account created:', { username, email, password });
      // Account creation logic here
    }
  </script>
  
  <main>
      <div class="card p-4">
          <div class="hero">
              <p class="text-2xl p-4 text-center">Create Account</p>
              <p class="text-center">Please fill in the details below to create your account.</p>
          </div>
      </div>
  
      <section class="card p-4 mt-4">
          <form onsubmit={preventDefault(handleCreateAccount)}>
              <label class="label">
                  <span>Username</span>
                  <input class="input" type="text" bind:value={username} placeholder="Choose a username" required />
              </label>
              <label class="label">
                  <span>Email Address</span>
                  <input class="input" type="email" bind:value={email} placeholder="Your email address" required />
              </label>
              <label class="label">
                  <span>Password</span>
                  <input class="input" type="password" bind:value={password} placeholder="Choose a password" required />
              </label>
              <label class="label">
                  <span>Confirm Password</span>
                  <input class="input" type="password" bind:value={confirmPassword} placeholder="Confirm your password" required />
              </label>
                  
              <button type="submit" class="bg-[#D5BA7F] text-black py-2 px-4 border border-transparent rounded-lg hover:text-black">Create Account</button>
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
  