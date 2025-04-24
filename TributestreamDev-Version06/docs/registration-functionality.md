# User Registration Functionality

## Overview

The user registration system allows new users to create accounts with appropriate roles in the Tributestream application. The implementation follows a multi-layered approach with client-side validation, server-side validation, and API integration with the Strapi backend.

## Architecture

The registration flow consists of several components:

1. **Registration Form (`/src/routes/register/+page.svelte`)**
   - Client-side form with validation
   - Collects username, email, password, and role
   - Uses SvelteKit's enhance for progressive enhancement

2. **Form Actions (`/src/routes/register/+page.server.ts`)**
   - Server-side validation
   - Form submission handling
   - Forwards requests to the API endpoint

3. **API Integration (`/src/routes/api/register/+server.ts`)**
   - Communicates with Strapi backend
   - Sets authentication cookies
   - Returns structured user data

4. **Authentication API Utilities (`/src/lib/api/auth.api.ts`)**
   - Functions to interact with Strapi auth endpoints
   - Error handling and formatting

## Registration Flow

1. User visits `/register` route
2. User fills out the registration form
3. Client-side validation occurs on form input
4. On submission, the form is processed by the server action
5. Server-side validation confirms the data is valid
6. Request is forwarded to the API endpoint
7. API endpoint communicates with Strapi
8. On success, a JWT token is stored in an HTTP-only cookie
9. User is redirected to the login page
10. User can now log in with their new credentials

## Form Validation

### Client-side Validation
- Username must be at least 3 characters
- Password must be at least 8 characters
- Passwords must match (confirmation field)
- Email must be a valid format
- Role must be selected

### Server-side Validation
- Same validation rules apply
- Protects against bypassing client-side validation
- Returns structured error messages to the client

## API Error Handling

The system handles various error types:
- Validation errors (invalid input)
- Duplicate username errors
- Duplicate email errors
- Network errors
- Unexpected server errors

Each error type is properly communicated back to the user with clear feedback.

## Role Management

During registration, users can select from predefined roles:
- Family Contact
- Funeral Director
- Guest

The selected role is stored with the user account and determines access permissions throughout the application.

## Testing

### Manual Testing
To test the registration functionality:
1. Visit `/register` route
2. Try submitting the form with invalid data to verify validation
3. Submit with valid data to create an account
4. Verify redirection to the login page
5. Try logging in with the new credentials

### E2E Tests
End-to-end tests are available in `/tests/e2e/registration-form.spec.ts`:
- Tests the form display
- Tests validation error display
- Tests successful registration flow
- Tests error handling

### Unit Tests
Unit tests for form validation are in `/src/routes/register/register.test.ts`:
- Tests validation of individual fields
- Tests multiple validation errors

## Security Considerations

1. **Password Security:**
   - Passwords are never logged
   - Passwords are transmitted securely
   - Strapi handles password hashing

2. **JWT Storage:**
   - JWT tokens are stored in HTTP-only cookies
   - Prevents JavaScript access to tokens

3. **CSRF Protection:**
   - SvelteKit's built-in CSRF protection is used

4. **Input Validation:**
   - All user input is validated on both client and server

## Future Improvements

1. **Email Verification:**
   - Add email verification step after registration

2. **Password Strength Requirements:**
   - Enhance password validation with complexity rules

3. **Social Authentication:**
   - Add options for OAuth login (Google, Facebook, etc.)

4. **Account Recovery:**
   - Implement password reset functionality

5. **Role-specific Onboarding:**
   - Customize post-registration flow based on selected role