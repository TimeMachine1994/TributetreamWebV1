# Step-by-Step Development Guide for Tribute Creation Workflow

This guide outlines the implementation of the Tribute creation workflow on the home page. The process includes:

1. **Capturing form data and writing new tributes to the master store**
2. **Registering the user submitting the form**
3. **Automatically authenticating the user after registration**
4. **Redirecting them to their newly created custom tribute URL**

---

## **1. Capturing Form Data and Writing to the Master Store**

### **Form Structure in `src/routes/+page.svelte`**
Modify the home page form to bind input fields to the master store.

```svelte
<script lang="ts">
  import { getMasterStoreContext } from '$lib/stores/master-store.svelte';
  import { enhance } from '$app/forms';

  const masterStore = getMasterStoreContext();
</script>

<form method="POST" action="?/createTribute" use:enhance>
  <label>
    Loved One's Full Name:
    <input type="text" bind:value={masterStore.lovedOneInfo.fullName} required />
  </label>

  <label>
    Your Full Name:
    <input type="text" bind:value={masterStore.userInfo.fullName} required />
  </label>

  <label>
    Your Email:
    <input type="email" bind:value={masterStore.userInfo.email} required />
  </label>

  <label>
    Your Phone Number:
    <input type="tel" bind:value={masterStore.userInfo.phone} required />
  </label>

  <button type="submit">Create Tribute</button>
</form>
```

---

## **2. Implementing the Form Action in `+page.server.ts`**
Create a form action to handle tribute creation, user registration, and authentication.

```typescript
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createTributeSlug, getTributeUrl } from '$lib/utils/string-helper';
import { saveTribute } from '$lib/utils/api-helpers';
import { registerUser, authenticateUser } from '$lib/utils/auth-helpers';

export const actions: Actions = {
  createTribute: async ({ request }) => {
    const formData = await request.formData();

    const tributeData = {
      fullName: formData.get('lovedOneInfo.fullName') as string,
      userFullName: formData.get('userInfo.fullName') as string,
      userEmail: formData.get('userInfo.email') as string,
      userPhone: formData.get('userInfo.phone') as string
    };

    if (!tributeData.fullName || !tributeData.userFullName || !tributeData.userEmail) {
      return fail(400, { error: 'Missing required fields' });
    }

    // Generate tribute slug and URL
    const tributeSlug = createTributeSlug(tributeData.fullName);
    const tributeUrl = getTributeUrl(tributeSlug);

    // Register the user
    const userResponse = await registerUser({
      fullName: tributeData.userFullName,
      email: tributeData.userEmail,
      phone: tributeData.userPhone
    });

    if (!userResponse.success) {
      return fail(400, { error: 'User registration failed' });
    }

    // Authenticate the user
    const authResponse = await authenticateUser(tributeData.userEmail);

    if (!authResponse.success) {
      return fail(400, { error: 'Authentication failed' });
    }

    // Save tribute to the database
    const tributeResponse = await saveTribute({
      fullName: tributeData.fullName,
      slug: tributeSlug,
      createdBy: tributeData.userEmail
    }, authResponse.token);

    if (!tributeResponse.success) {
      return fail(400, { error: 'Tribute creation failed' });
    }

    // Redirect to the newly created tribute page
    throw redirect(303, tributeUrl);
  }
};
```

---

## **3. Implementing API Helper Functions**
Modify `src/lib/utils/api-helpers.ts` to include tribute creation.

```typescript
export async function saveTribute(tributeData: any, token: string): Promise<any> {
  const response = await fetch('/api/tributes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(tributeData)
  });

  return response.ok ? await response.json() : { success: false };
}
```

---

## **4. Implementing User Registration and Authentication**
Modify `src/lib/utils/auth-helpers.ts` to handle user registration and authentication.

```typescript
export async function registerUser(userData: any): Promise<any> {
  const response = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });

  return response.ok ? await response.json() : { success: false };
}

export async function authenticateUser(email: string): Promise<any> {
  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  return response.ok ? await response.json() : { success: false };
}
```

---

## **5. Redirecting to the Custom Tribute URL**
Modify `src/lib/utils/string-helper.ts` to generate tribute URLs.

```typescript
export function createTributeSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export function getTributeUrl(slug: string): string {
  return `/celebration-of-life-for-${slug}`;
}
```

---

## **6. Persisting Tribute Data in the Master Store**
Modify `src/lib/stores/master-store.svelte.ts` to update the store.

```typescript
export class MasterStore {
  lovedOneInfo = $state({ fullName: '' });
  userInfo = $state({ fullName: '', email: '', phone: '' });

  updateLovedOneInfo(data: any) {
    this.lovedOneInfo = { ...this.lovedOneInfo, ...data };
  }

  updateUserInfo(data: any) {
    this.userInfo = { ...this.userInfo, ...data };
  }
}
```

---

## **7. Testing the Workflow**
1. **Navigate to the home page** and fill out the tribute creation form.
2. **Submit the form** and verify that:
   - The tribute is saved in the master store.
   - The user is registered and authenticated.
   - The user is redirected to their custom tribute page.

---

## **Conclusion**
This guide provides a structured approach to implementing the Tribute creation workflow. It ensures seamless integration with the master store, user authentication, and navigation to the custom tribute page.