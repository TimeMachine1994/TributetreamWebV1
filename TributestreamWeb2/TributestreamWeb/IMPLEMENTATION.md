
## 3. Phase 2: Establish/Review Server Endpoints ✓

### Objective
Create SvelteKit endpoints for users and tributes that act as intermediaries between the SvelteKit front end and the WordPress plugin.

### Implementation Status

1. **File Structure** ✓
   - Created `/src/routes/api/admin/users/+server.ts`
   - Created `/src/routes/api/admin/tributes/+server.ts`
   - Implemented in TypeScript for better type safety

2. **Methods Implemented** ✓
   - **GET**: 
     - List view with pagination using `?page=` and `?per_page=`
     - Single item lookup with `?id=`
     - Search functionality with `?search=`
   - **POST**: Create new resources
   - **PUT**: Update existing resources
   - **DELETE**: Remove resources

3. **JWT Authentication** ✓
   - Added JWT token retrieval from cookies
   - Implemented admin access checks via `locals.user?.isAdmin`
   - Attached tokens to WordPress API requests
   - Added proper error handling for unauthorized access

4. **Route Consolidation** ✓
   - Removed duplicate `/api/user_data` endpoint
   - Unified all user operations under `/api/admin/users`
   - Unified all tribute operations under `/api/admin/tributes`
   - Standardized error responses and status codes

### Implementation Details

Each endpoint follows these patterns:
- Validates admin access and JWT authentication
- Handles query parameters for pagination and search
- Forwards requests to WordPress plugin endpoints:
  - Users: `wp.tributestream.com/wp-json/wp/v2/users`
  - Tributes: `wp.tributestream.com/wp-json/tributestream/v1/tributes`
- Returns formatted responses with proper error handling
- Includes TypeScript types for request/response data

The endpoints are now ready for integration with the frontend admin dashboard.

---
@

## 4. Phase 3: Refine WordPress Plugin

### Objective
Ensure your custom WordPress plugin has REST routes for Users and Tributes, properly handles database operations, and enforces JWT authentication.

### Steps

1. **Define REST Routes**  
   - For example, `myplugin/v1/users` and `myplugin/v1/tributes`.  
   - Register them in your plugin (within `add_action('rest_api_init', ...)`).  

2. **Permission Callback**  
   - Each route should have a `permission_callback` to verify the JWT.  
   - If invalid or missing, return an appropriate HTTP error (403 or 401).

3. **CRUD Logic**  
   - **GET**: Query relevant WordPress tables (e.g., `$wpdb->users` or a custom table for tributes).  
   - **POST**: Insert or create new records.  
   - If needed, add **PUT** or **DELETE** for updates/removals.

4. **Pagination**  
   - Support `limit` and `offset` parameters.  
   - Return data in pages, enabling your SvelteKit app to navigate forward/backward.

5. **JWT Validation**  
   - Implement or integrate a function to check the JWT’s validity (`myplugin_validate_jwt`).  
   - Reject requests lacking a valid token.

No code samples here, but the plugin needs to coordinate with SvelteKit’s endpoints by matching the routes and parameters you expect.

---

## 5. Displaying Data (Users & Tributes)

### Objective
Render fetched data (lists of users, tributes) in your Admin UI, and add basic pagination controls.

### Implementation Notes (No Code)

1. **Users Page**
   - In `src/routes/admin/users/+page.svelte`, fetch data from `/api/admin/users` on mount.  
   - Store the results in a `users` array.  
   - Provide next/previous pagination by adjusting the `offset` parameter in your requests.

2. **Tributes Page**
   - In `src/routes/admin/tributes/+page.svelte`, fetch data from `/api/admin/tributes`.  
   - Use a similar pattern to handle pagination, error messages, etc.

3. **Error Handling**
   - Catch network or server errors.  
   - Display a user-friendly message in the Admin UI.

4. **Future Enhancements**
   - Add create/edit forms.  
   - Show success/error notifications.

---

## 6. Security & Auth Considerations

1. **Token Storage**  
   - Decide whether to store JWT in HTTP-only cookies or in local storage.  
   - If using cookies, your SvelteKit server endpoints can read them automatically server-side.

2. **Route Protection**  
   - Restrict access to `/admin` or `/api/admin` routes in SvelteKit’s `hooks.server.js/ts`.  
   - Check for a valid session or JWT token.  
   - Redirect or throw an error if unauthorized.

3. **WP Plugin Security**  
   - Double-check that the plugin’s permission callbacks properly validate JWT.  
   - Return specific HTTP status codes (401, 403) for clarity.

4. **Role Checks**  
   - You might have different admin roles.  
   - Verify user roles or capabilities (if needed) in addition to simple JWT checks.

---

## 7. Next Steps

**Phase 1**  
- Confirm the `admin/` route structure is in place.  
- Ensure `+layout.svelte` and `+page.svelte` exist for the admin dashboard.

**Phase 2**  
- Verify or create the SvelteKit server endpoints in `src/routes/api/admin/` for `users` and `tributes`.  
- Confirm requests are forwarded correctly to the WordPress plugin (with JWT).

**Phase 3**  
- Refine the WordPress plugin:  
  - Match routes for GET/POST (and possibly PUT/DELETE).  
  - Implement CRUD operations.  
  - Ensure JWT checks work properly.  

**Integration & Testing**  
- Fetch Users and Tributes in your SvelteKit Admin pages.  
- Implement pagination, handle errors, confirm data is displayed.  
- Add forms or buttons to create/update records if desired.

**Enhancements**  
- Introduce sorting or search filters.  
- Fine-tune permissions by user role.  
- Improve styling with Tailwind, Skeleton UI, or other frameworks.

---

### Conclusion

By following these phases, you’ll progressively build and refine a secure, functional admin panel in SvelteKit that leverages WordPress for backend data. Start with establishing the route structure and plugin endpoints, then layer in the details (CRUD, pagination, authentication, UI/UX) to create a robust solution with minimal duplication or confusion.





