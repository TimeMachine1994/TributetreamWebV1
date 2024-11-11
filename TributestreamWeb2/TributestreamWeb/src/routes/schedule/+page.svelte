<script lang="ts">
    import { goto } from '$app/navigation';
    let lovedOneName = '';
    let fullName = '';
    let email = '';
    let phone = '';
    let error = '';
  
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
  
        if (!registerResponse.ok) {
          throw new Error('Failed to register user');
        }
  
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
          console.log('Page slug successfully added:', pageSlug);
        } else {
          throw new Error(updateData.message || 'Failed to update slug');
        }
  
        // Redirect to new celebration page
        goto(`/celebration-of-life-for-${pageSlug}`);
      } catch (err) {
        error = err.message;
      }
    }
    function getUserId(): number {
    const token = getToken();
    if (!token) return null;
    
    // Decode the JWT token (it's base64 encoded)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    return payload.user_id;
}
    async function updateSlug(slug: string): Promise<{ message: string, success?: boolean }> {
    try {
        const response = await fetch('https://wp.tributestream.com/wp-json/tributestream/v1/tribute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                user_id: getUserId(),
                loved_one_name: lovedOneName,
                slug: slug
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create tribute');
        }

        return { message: 'Tribute created successfully', success: true };
    } catch (error) {
        console.error('Error creating tribute:', error);
        return { message: 'Error creating tribute', success: false };
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
  