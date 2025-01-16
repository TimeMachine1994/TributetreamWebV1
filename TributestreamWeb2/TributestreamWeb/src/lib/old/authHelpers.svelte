<!-- @migration-task Error while migrating Svelte code: Unexpected token
https://svelte.dev/e/js_parse_error -->
<!-- @migration-task Error while migrating Svelte code: Unexpected token
https://svelte.dev/e/js_parse_error -->
<!-- @migration-task Error while migrating Svelte code: Unexpected token
https://svelte.dev/e/js_parse_error -->
<!-- @migration-task Error while migrating Svelte code: Unexpected token
https://svelte.dev/e/js_parse_error -->
import { userIdStore } from '$lib/stores/userStore';
import { generateRandomPassword, slugify } from '$lib/utils/createAccount';
import { goto } from '$app/navigation';


export async function createCelebrationPage(email, fullName, lovedOneName, phone) {
  const password = generateRandomPassword();
  const username = email.split('@')[0];
  const pageSlug = slugify(lovedOneName);

  try {
    // Register user
    const userId = await registerUser(username, email, password, fullName, lovedOneName, phone);
    console.log('Registered User ID:', userId);

    // Update the store with the user ID
    userIdStore.set(userId);

    // Login and get JWT token
    const token = await loginUser(username, password);
    localStorage.setItem('jwtToken', token);

    // Update slug
    await updateSlug(pageSlug, userId);
    console.log('Page slug successfully added:', pageSlug);

    // Redirect to the new celebration page
    goto(`/celebration-of-life-for-${pageSlug}`);
  } catch (err) {
    console.error('Error creating celebration page:', err.message);
    throw err; // Can handle this error in calling components if needed
  }
}


async function registerUser(username, email, password, fullName, lovedOneName, phone) {
    const response = await fetch('https://wp.tributestream.com/wp-json/custom-user-registration/v1/register', {
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
  
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Registration failed');
    return data.user_id; // Returns the registered user ID
  }
  async function loginUser(username, password) {
    const response = await fetch('https://wp.tributestream.com/wp-json/jwt-auth/v1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
  
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    return data.token; // Returns the JWT token
  }
  async function updateSlug(pageSlug, userId) {
    const response = await fetch(`https://wp.tributestream.com/wp-json/custom-slug/v1/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
      },
      body: JSON.stringify({ pageSlug, userId })
    });
  
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Failed to update slug');
    return data;
  }
  