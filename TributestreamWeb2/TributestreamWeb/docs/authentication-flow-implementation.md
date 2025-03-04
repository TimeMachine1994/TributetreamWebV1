# Implementing Authentication Flow with Conditional Role-Based Redirects

## **Step 1: Understand the Existing Authentication Flow**
- The login process is handled in `+page.server.ts` under `actions.default`.
- The user credentials are sent to `/api/auth`, and upon success, a JWT token and `user_id` are stored in cookies.
- The `getRole()` function is invoked via `/api/getRole?id={user_id}` to fetch the user's roles.
- The current redirection logic is based on roles but does not match the required behavior.

---

## **Step 2: Modify `+page.server.ts` to Implement Role-Based Redirects**
- Update the redirection logic to:
  - Redirect to `/family-dashboard` if the user has the `admin` role.
  - Redirect to `/calculate-livestream` for all other roles.
- Ensure proper error handling if the role retrieval fails.

### **Implementation Plan**
1. **Modify the redirection logic in `+page.server.ts`**:
   - Change the default redirection path to `/calculate-livestream`.
   - If the user has the `admin` role, override the redirect path to `/family-dashboard`.
   - Ensure that the redirection occurs immediately after role retrieval.

2. **Handle Errors Gracefully**:
   - If the role retrieval fails, return an error message instead of redirecting.
   - Log errors for debugging.

---

## **Step 3: Update `+page.svelte` to Handle Form Submission Correctly**
- Ensure the form uses `use:enhance` for progressive enhancement.
- Modify the form to correctly handle the redirection logic.

### **Implementation Plan**
1. **Ensure `use:enhance` is properly applied**:
   - This ensures that the form submission is handled efficiently without a full page reload.

2. **Handle form submission results**:
   - If the form submission fails, display an error message.
   - If successful, allow the server-side redirection to take effect.

---

## **Step 4: Ensure Data Persistence in the Master Store**
- The master store should be updated with the authenticated user’s details.
- Use `$effect` to synchronize the user’s authentication state.

### **Implementation Plan**
1. **Modify the master store to store user authentication data**:
   - Store the user’s role and authentication status.
   - Ensure that the data persists across page reloads.

2. **Use `$effect` to synchronize authentication state**:
   - Automatically update the store when the user logs in.
   - Ensure that the stored data is used for subsequent requests.

---

## **Step 5: Test the Implementation**
- **Test Cases**:
  - ✅ Successful login as an admin should redirect to `/family-dashboard`.
  - ✅ Successful login as a non-admin should redirect to `/calculate-livestream`.
  - ✅ Invalid credentials should return an error message.
  - ✅ API failures should be handled gracefully.

---

## **Step 6: Documentation**
- Update `IMPLEMENTATION.md` to document the authentication flow.
- Ensure that future developers understand the redirection logic.

---

### **Mermaid Diagram: Authentication Flow**
```mermaid
sequenceDiagram
    participant User
    participant LoginPage
    participant Server
    participant API
    participant MasterStore

    User->>LoginPage: Submit login form
    LoginPage->>Server: Send credentials to /api/auth
    Server->>API: Validate credentials
    API-->>Server: Return user_id and token
    Server->>API: Fetch roles using user_id
    API-->>Server: Return user roles
    Server->>MasterStore: Store user data
    alt User is Admin
        Server->>LoginPage: Redirect to /family-dashboard
    else User is Non-Admin
        Server->>LoginPage: Redirect to /calculate-livestream
    end