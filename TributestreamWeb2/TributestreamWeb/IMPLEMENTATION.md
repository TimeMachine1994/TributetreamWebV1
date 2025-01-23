
## 3. Phase 2: Establish/Review Server Endpoints

### Objective
Either create or review your existing SvelteKit endpoints for users and tributes. These endpoints act as intermediaries between the SvelteKit front end and the WordPress plugin.

### Steps

1. **File Structure**  
   - Under `src/routes/api/admin/`, create subfolders for `users` and `tributes`.  
   - For each resource, you’ll have a server file (e.g., `+server.ts` or `+server.js`).

2. **Methods to Implement**  
   - **GET**: Fetch a list of Users/Tributes (include pagination with `?limit=` and `?offset=`).  
   - **POST**: Create a new User/Tribute (receive JSON from the UI, forward to WP).

3. **JWT Authentication**  
   - Retrieve the JWT token (possibly from cookies or session) within these server endpoints.  
   - Attach it to any outgoing fetch calls that hit the WordPress plugin’s endpoints.  

4. **Check or Merge**  
   - If you already have working routes, confirm they align with the WordPress plugin.  
   - Remove duplicates or unify them under a consistent naming scheme.  

Again, no example code is shown, but your endpoint files typically:
- Accept incoming requests
- Parse query parameters or JSON body
- Forward data to WordPress plugin routes (via `fetch()`)
- Return the plugin response back to the front end

---
@