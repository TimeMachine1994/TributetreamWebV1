<script lang="ts">
  import { goto } from '$app/navigation';
   let lovedOneName = '';
  let fullName = '';
  let email = '';
  let phone = '';
  let error = '';
// Example function to retrieve token
function getToken() {
    return localStorage.getItem('jwtToken');
}

  function slugify(text: string): string {
      return text
          .toString()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '')
          .replace(/\-\-+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '');
  }
  
  function generateRandomPassword(): string {
      return Math.random().toString(36).slice(-8);
  }
  async function updateSlug(slug) {
     

    const response = await fetch('/api/update-pages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // Include the token in the request
        },
        body: JSON.stringify({ slug })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Failed to update slug');
    }

    return data;
}





async function handleSubmit() {
    const password = generateRandomPassword();
    const username = email.split('@')[0];
    const pageSlug = slugify(lovedOneName);

    try {
        // Register user
        const registerResponse = await fetch('https://wp.tributestream.com/wp-json/custom-user-registration/v1/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                email,
                password,
                meta: {
                    full_name: fullName,
                    loved_one_name: lovedOneName,
                    phone: phone
                }
            })
        });

        if (registerResponse.ok) {
            // Login and get JWT token
            const loginResponse = await fetch('https://wp.tributestream.com/wp-json/jwt-auth/v1/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const tokenData = await loginResponse.json();
            localStorage.setItem('jwtToken', tokenData.token);

            // Update slug through API endpoint
            const updateData = await updateSlug(pageSlug);
            if (updateData.success) {
                console.log('Page slug successfully added to JSON:', pageSlug);
            } else {
                console.error('Failed to update JSON:', updateData.error);
            }

            // Redirect to new celebration page
            goto(`/celebration-of-life-for-${pageSlug}`);
        }
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
  