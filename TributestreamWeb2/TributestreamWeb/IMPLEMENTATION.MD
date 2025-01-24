# Form Submission Implementation Plan

## Current Understanding
- Multi-page form implemented as SPA (Single Page Application)
- First page: Loved one's name input with "Create Tribute" and "Search Streams" buttons
- Second page: User registration form with final submit
- Backend: WordPress REST API with JWT authentication
- Need to maintain current UX while fixing form submission

## Implementation Steps

### 1. Client-Side (+page.svelte)
1. Keep existing onclick handlers for first page navigation
   - Maintain `handleNextPage()` for "Create Tribute" button
   - Keep SPA behavior for form navigation

2. Modify second page form submission
   - Remove onclick handler from final submit button
   - Add proper form action for SvelteKit form handling
   - Update form field names to match server expectations
   ```html
   <form method="POST" action="?/homeRegister">
   ```

3. Update form field names
   - Change from dot notation to flat structure
   - Ensure hidden fields for loved one's data are included

### 2. Server-Side (+page.server.ts)
Implement homeRegister action with sequential steps:

1. User Registration
   - Endpoint: `/api/register`
   - Generate secure password
   - Send registration data
   - Handle registration response
   - Store user_id

2. User Authentication
   - Endpoint: `/api/auth`
   - Use registered credentials
   - Get JWT token
   - Set secure HTTP-only cookies
   - Handle authentication errors

3. User Metadata
   - Endpoint: `/api/user-meta`
   - Include JWT in Authorization header
   - Store form data as metadata
   - Handle metadata storage errors

4. Tribute Data
   - Endpoint: `/api/tribute-table`
   - Include JWT in Authorization header
   - Create tribute record
   - Store slug for redirect
   - Handle tribute creation errors

5. Redirect
   - Success: Redirect to tribute page using slug
   - Failure: Return appropriate error response

### 3. Error Handling
1. Implement proper error handling at each step
2. Return meaningful error messages to the user
3. Roll back changes if a step fails
4. Log errors for debugging

### 4. Security Considerations
1. Validate all input data
2. Use HTTPS for all API requests
3. Implement CSRF protection
4. Secure cookie handling
5. Input sanitization

### 5. Testing Plan
1. Test form navigation
2. Test form submission
3. Verify all API integrations
4. Check error handling
5. Validate security measures
6. Test user flow end-to-end

## Next Steps
1. Update +page.svelte with form changes
2. Implement server-side action handler
3. Test implementation
4. Deploy changes
5. Monitor for issues

This implementation maintains the current user experience while ensuring proper form submission and data handling through the WordPress REST API.
