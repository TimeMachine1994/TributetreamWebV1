/**
 * Test fixtures for form validation and submission tests
 */

/**
 * Valid funeral director form data
 */
export const validFuneralDirectorForm = {
  email: 'test@example.com',
  directorFirstName: 'John',
  directorLastName: 'Doe',
  deceasedFirstName: 'Jane',
  deceasedLastName: 'Smith',
  phone: '123-456-7890',
  deceasedDOB: '1950-01-01',
  deceasedDOP: '2023-01-15',
  memorialDate: '2023-02-01',
  memorialTime: '14:00',
  locationName: 'Memorial Chapel',
  locationAddress: '123 Main St, Anytown, USA',
  familyMemberFirstName: 'James',
  familyMemberLastName: 'Smith',
  familyMemberDOB: '1975-05-15'
};

/**
 * Invalid funeral director form data with validation errors
 */
export const invalidFuneralDirectorForm = {
  email: 'invalid-email',
  directorFirstName: '',
  directorLastName: 'Doe',
  deceasedFirstName: 'Jane',
  deceasedLastName: '',
  phone: '123',
  deceasedDOB: 'invalid-date',
  deceasedDOP: '2023-13-45', // Invalid date
  memorialDate: 'tomorrow', // Invalid date format
  memorialTime: '',
  locationName: '',
  locationAddress: '',
  familyMemberFirstName: '',
  familyMemberLastName: '',
  familyMemberDOB: ''
};

/**
 * Valid simplified memorial form data
 */
export const validSimplifiedMemorialForm = {
  lovedOneName: 'Jane Smith',
  creatorFullName: 'John Doe',
  creatorPhone: '123-456-7890',
  creatorEmail: 'john@example.com'
};

/**
 * Invalid simplified memorial form data with validation errors
 */
export const invalidSimplifiedMemorialForm = {
  lovedOneName: '',
  creatorFullName: 'John Doe',
  creatorPhone: '123', // Invalid phone
  creatorEmail: 'not-an-email' // Invalid email
};

/**
 * Mock API response fixtures
 */

/**
 * Successful authentication response
 */
export const authSuccessResponse = {
  token: 'mock-jwt-token',
  user_id: 123,
  user_display_name: 'Test User',
  user_email: 'test@example.com'
};

/**
 * Authentication error response
 */
export const authErrorResponse = {
  code: 'invalid_username',
  message: 'Unknown username. Check again or try your email address.'
};

/**
 * Successful user registration response
 */
export const registrationSuccessResponse = {
  success: true,
  userId: 123,
  message: 'User registered successfully'
};

/**
 * Duplicate user registration response
 */
export const registrationDuplicateResponse = {
  success: false,
  isDuplicate: true,
  message: 'User already exists'
};

/**
 * Failed user registration response
 */
export const registrationFailureResponse = {
  success: false,
  isDuplicate: false,
  message: 'Registration failed due to server error'
};

/**
 * Successful tribute creation response
 */
export const tributeSuccessResponse = {
  success: true,
  tribute_id: 456,
  slug: 'jane-smith'
};

/**
 * Failed tribute creation response
 */
export const tributeFailureResponse = {
  success: false,
  error: 'Failed to create tribute'
};

/**
 * Successful email sending response
 */
export const emailSuccessResponse = {
  success: true,
  message: 'Email sent successfully'
};

/**
 * Failed email sending response
 */
export const emailFailureResponse = {
  success: false,
  error: 'Failed to send email'
};

/**
 * Form data conversion helpers
 */

/**
 * Convert funeral director form data to FormData object for testing
 * @param data Object containing form data
 * @returns FormData object
 */
export function funeralDirectorFormToFormData(data: any): FormData {
  const formData = new FormData();
  
  if (data.directorFirstName !== undefined) formData.append('director-first-name', data.directorFirstName);
  if (data.directorLastName !== undefined) formData.append('director-last-name', data.directorLastName);
  if (data.familyMemberFirstName !== undefined) formData.append('family-member-first-name', data.familyMemberFirstName);
  if (data.familyMemberLastName !== undefined) formData.append('family-member-last-name', data.familyMemberLastName);
  if (data.familyMemberDOB !== undefined) formData.append('family-member-dob', data.familyMemberDOB);
  if (data.deceasedFirstName !== undefined) formData.append('deceased-first-name', data.deceasedFirstName);
  if (data.deceasedLastName !== undefined) formData.append('deceased-last-name', data.deceasedLastName);
  if (data.deceasedDOB !== undefined) formData.append('deceased-dob', data.deceasedDOB);
  if (data.deceasedDOP !== undefined) formData.append('deceased-dop', data.deceasedDOP);
  if (data.email !== undefined) formData.append('email-address', data.email);
  if (data.phone !== undefined) formData.append('phone-number', data.phone);
  if (data.locationName !== undefined) formData.append('location-name', data.locationName);
  if (data.locationAddress !== undefined) formData.append('location-address', data.locationAddress);
  if (data.memorialTime !== undefined) formData.append('memorial-time', data.memorialTime);
  if (data.memorialDate !== undefined) formData.append('memorial-date', data.memorialDate);
  
  return formData;
}