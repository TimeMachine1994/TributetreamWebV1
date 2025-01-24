# TributeStream API Test Page Documentation

## Overview
The TributeStream API Test Page is a comprehensive testing interface designed to validate all endpoints of the TributeStream WordPress plugin's REST API. This tool provides an easy way to test API functionality with automatically generated test data.

## Features

### 1. User Registration Testing
- **Endpoint**: `/wp-json/tributestream/v1/register`
- **Method**: POST
- **Features**:
  - Automatic generation of random usernames
  - Random email address generation
  - Secure password generation
  - Real-time display of registration results

### 2. Tribute Page Creation
- **Endpoint**: `/wp-json/tributestream/v1/create-tributepage`
- **Method**: POST
- **Features**:
  - Random loved one name generation
  - Automatic slug creation
  - Custom HTML content generation
  - JWT authentication handling
  - Response display with creation status

### 3. Tribute Listing
- **Endpoint**: `/wp-json/tributestream/v1/tributes`
- **Method**: GET
- **Features**:
  - Retrieves all available tributes
  - Formatted display of tribute list
  - User authentication verification

### 4. Single Tribute Retrieval
- **Endpoint**: `/wp-json/tributestream/v1/tribute/{slug}`
- **Method**: GET
- **Features**:
  - Slug-based tribute lookup
  - Input field for custom slug testing
  - Detailed tribute information display

### 5. Tribute HTML Update
- **Endpoint**: `/wp-json/tributestream/v1/tributes/{id}/custom-html`
- **Method**: PUT
- **Features**:
  - Tribute ID input field
  - Random HTML content generation
  - Update confirmation display

### 6. Form Data Submission
- **Endpoint**: `/wp-json/tributestream/v1/form-data`
- **Method**: POST
- **Features**:
  - Random form data generation
  - JSON data formatting
  - Submission result display

## Installation

1. Place the `api-test.html` file in your WordPress root directory
2. Access through your WordPress installation:
   ```
   http://your-wordpress-site.com/api-test.html
   ```
3. Obtain a JWT token from your WordPress installation (you can use the JWT Authentication plugin's token endpoint)
4. Enter the JWT token in the authentication section at the top of the page

## JWT Authentication

The test page now includes a dedicated JWT authentication section:
- Input field for JWT token
- Token validation for protected endpoints
- Clear error messages for authentication issues
- Token persistence during testing session

## Usage Instructions

### Testing User Registration
1. Click "Test Register Random User"
2. View generated user data and registration response
3. Check for successful user creation in WordPress

### Testing Tribute Creation
1. Enter your JWT token in the authentication section
2. Click "Test Create Random Tribute"
3. Review the creation response
   - If you see a JWT error, verify your token is valid and properly formatted
   - The token should be in the format: `header.payload.signature`
4. Verify tribute appears in WordPress admin

### Testing Tribute Retrieval
1. Click "Test Get All Tributes" to view all tributes
2. Use the slug input to test individual tribute retrieval
3. Verify retrieved data matches WordPress database

### Testing HTML Updates
1. Enter a valid tribute ID
2. Click "Test Update HTML"
3. Verify the HTML update in WordPress

### Testing Form Submission
1. Click "Test Submit Random Form Data"
2. Review the submission response
3. Verify data storage in WordPress

## Error Handling
- All API responses are displayed in formatted JSON
- Errors are highlighted in red
- Successful responses are highlighted in green
- Network errors and API failures are caught and displayed

## Development Notes
- The test page uses vanilla JavaScript
- Fetch API is used for all requests
- Random data generation ensures unique test cases
- JWT token storage is handled in-memory
- All endpoints are tested against the v1 API version

## Security Considerations
- Test page should not be deployed to production
- Remove test page after completing API validation
- JWT tokens should be properly secured
- Use test data only in development environment

## Troubleshooting
- Ensure WordPress is running and accessible
- Verify API endpoints are properly registered
- Check WordPress permalinks are configured
- Confirm proper JWT token configuration
- Monitor browser console for detailed errors

## Contributing
Feel free to enhance the test page with additional features:
- More sophisticated test data generation
- Additional error handling scenarios
- Enhanced response visualization
- Batch testing capabilities
- Test result logging
