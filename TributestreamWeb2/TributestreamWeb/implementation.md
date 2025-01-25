
### **Implementation Plan**

#### **Phase 1: Validate API Routes**

1. **Tribute Endpoints**:
   - Test `GET /tributes` with and without pagination and search parameters.
   - Validate `POST /tributes` by creating a new tribute with valid and invalid data.
   - Test `GET /tributes/<id>` for existing and non-existing tribute IDs.
   - Validate `PUT /tributes/<id>` by updating an existing tribute.
   - Test `DELETE /tributes/<id>` for proper deletion and non-existing IDs.

2. **User Meta Endpoints**:
   - Test `POST /user-meta` by creating/updating meta fields for an existing user.
   - Validate `GET /user-meta/<user_id>` for retrieving meta fields.

3. **Registration Endpoint**:
   - Test `POST /register` with required fields and optional metadata.
   - Validate email notifications upon registration.

#### **Phase 2: Verify Login Functionality**

1. Confirm JWT tokens are correctly generated upon login.
2. Test `/jwt-auth/v1/token/validate` for valid and expired tokens.
3. Ensure endpoints requiring JWT reject unauthorized requests.

#### **Phase 3: Test Dashboard Data Loading**

1. **Tributes**:
   - Ensure all tributes load correctly with pagination.
   - Test search functionality to filter tributes.

2. **User Meta**:
   - Verify user-specific metadata loads accurately in the dashboard.
   - Check for fallback behavior when no metadata exists.

3. **Performance**:
   - Ensure dashboard data loads within acceptable timeframes.
   - Test for scalability with a large number of tributes/users.

---

### **Notes for Implementation**

1. **Authentication**:
   - Use JWT for securing sensitive endpoints.
   - Ensure the `Authorization` header is properly parsed and validated.

2. **Validation**:
   - Validate and sanitize all input fields using WordPress functions (`sanitize_text_field`, `sanitize_email`, etc.).
   - Return appropriate HTTP status codes for errors (e.g., 400 for bad input, 404 for not found).

3. **Error Handling**:
   - Log all errors and unexpected behavior for easier debugging.
   - Use `WP_Error` for consistent error responses.

4. **Pagination & Search**:
   - Implement pagination parameters (`page` and `per_page`) with fallback defaults.
   - Add search functionality using `LIKE` queries with proper escaping.

5. **Emails**:
   - Customize welcome email content in `handle_tributestream_registration`.

---

This reference document provides a clear guide for implementing the plugin and its endpoints effectively. Ensure to follow WordPress coding standards and best practices throughout development.

