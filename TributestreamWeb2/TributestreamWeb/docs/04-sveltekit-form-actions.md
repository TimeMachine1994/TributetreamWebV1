# Understanding SvelteKit Form Actions

## Introduction
SvelteKit form actions provide a way to handle form submissions, interact with server-side logic, and update both state and props in your components. This document explains how form actions work, how to define and invoke them, and how to enhance them progressively.

## Defining Form Actions
Form actions are defined in a `+page.server.ts` file. They allow you to handle form submissions on the server.

Example:
```typescript
import type { Actions } from './$types';

export const actions: Actions = {
  login: async ({ request }) => {
    const data = await request.formData();
    const email = data.get('email');
    const password = data.get('password');

    // Process login logic
    return { success: true };
  }
};
```

## Invoking Named Actions
To invoke a named action, add a query parameter prefixed by `/`:
```svelte
<form method="POST" action="?/register">
```
Or from a different route:
```svelte
<form method="POST" action="/login?/register">
```

## Using `formaction` Attribute
The `formaction` attribute allows different actions for buttons:
```svelte
<form method="POST" action="?/login">
  <label>
    Email
    <input name="email" type="email">
  </label>
  <label>
    Password
    <input name="password" type="password">
  </label>
  <button>Log in</button>
  <button formaction="?/register">Register</button>
</form>
```

## Anatomy of an Action
Each action receives a `RequestEvent` object, allowing access to form data:
```typescript
export const actions: Actions = {
  login: async ({ request }) => {
    const data = await request.formData();
    const email = data.get('email');
    const password = data.get('password');

    return { success: true };
  }
};
```

## Handling State and Props
After an action runs, the page re-renders, and the action's return value is available as the `form` prop:
```svelte
<script lang="ts">
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();
</script>

{#if form?.success}
  <p>Successfully logged in!</p>
{/if}
```

## Validation and Error Handling
Use `fail()` to return validation errors:
```typescript
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
  login: async ({ request }) => {
    const data = await request.formData();
    const email = data.get('email');

    if (!email) {
      return fail(400, { error: 'Email is required' });
    }

    return { success: true };
  }
};
```

## Progressive Enhancement
SvelteKit provides `use:enhance` to improve form handling without full-page reloads:
```svelte
<form method="POST" use:enhance>
```

### Customizing `use:enhance`
You can provide a `SubmitFunction` to customize behavior:
```svelte
<form method="POST" use:enhance={(form, { result }) => {
  if (result.type === 'success') {
    console.log('Form submitted successfully');
  }
}}>
```

## Alternatives to Form Actions
- **API Routes (`+server.ts`)**: Use for JSON APIs.
- **Form Actions**: Preferred for progressive enhancement.

## Conclusion
SvelteKit form actions provide a powerful way to handle form submissions while supporting progressive enhancement. For more details, refer to the [SvelteKit documentation](https://kit.svelte.dev/docs/form-actions).