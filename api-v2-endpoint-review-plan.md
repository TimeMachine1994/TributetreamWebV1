# Tributestream API v2 Review Plan

## Overview

This document outlines a systematic approach for reviewing the WordPress plugin REST API endpoints (`pluginV2.php`) and comparing them with the existing SvelteKit API v2 server endpoints. This review will help ensure consistent implementation, identify gaps or inconsistencies, and establish a clear path forward for completing the API v2 development.

## Review Objectives

1. Ensure all WordPress REST API endpoints have corresponding SvelteKit proxy endpoints
2. Verify consistent error handling and response formatting across all endpoints
3. Validate proper implementation of authentication and authorization
4. Confirm TypeScript interfaces accurately represent API data structures
5. Identify any missing functionality or endpoints
6. Verify proper request validation and parameter sanitization

## Systematic Review Process

### Phase 1: Endpoint Inventory and Mapping

Create a comprehensive inventory mapping WordPress plugin endpoints to SvelteKit endpoints:

1. **Extract WordPress Endpoints**
   - List all REST API routes registered in `pluginV2.php`
   - Document HTTP methods, parameters, and permission callbacks for each

2. **Catalog SvelteKit Endpoints**
   - Review existing implementation in `/routes/api/v2/`
   - Document current server endpoints and their handlers

3. **Create Mapping Table**
   ```
   | WordPress Endpoint                    | SvelteKit Endpoint             | Status      | Notes             |
   |---------------------------------------|--------------------------------|-------------|-------------------|
   | /funeral/v2/tribute-pages             | /api/v2/tributes               | ✓ Complete  | GET, POST methods |
   | /funeral/v2/tribute-pages/[id]        | /api/v2/tributes/[id]          | ⚠️ Partial   | Missing DELETE    |
   ```

### Phase 2: Detailed Endpoint Analysis

For each endpoint pair, review these aspects:

1. **Request Handling**
   - URL structure and parameter handling
   - HTTP methods implemented (GET, POST, PUT, DELETE)
   - Body parsing and validation
   - Query parameter handling

2. **Authentication & Authorization**
   - Permission callbacks in WordPress
   - Token extraction and validation in SvelteKit
   - Role-based access control implementation

3. **Error Handling**
   - Error response structure
   - HTTP status codes used
   - Validation error formatting
   - Error logging and details exposure

4. **Response Formatting**
   - Consistency of success responses
   - Pagination implementation
   - Data transformation between WordPress and client

5. **TypeScript Interface Compliance**
   - Verify response data matches defined TypeScript interfaces
   - Check for missing properties or incorrect types

### Phase 3: Gap Analysis and Remediation Planning

Identify gaps and create prioritized implementation plan:

1. **Missing Endpoints**
   - List WordPress endpoints with no SvelteKit counterpart
   - Prioritize by importance to application functionality

2. **Incomplete Implementations**
   - Endpoints missing specific HTTP methods
   - Incomplete parameter handling
   - Insufficient validation

3. **TypeScript Interface Gaps**
   - Missing or incomplete interfaces
   - Interfaces that don't match actual response data

4. **Helper Function Review**
   - Client-side helper functions for API access
   - Consistent error handling in helpers

## Category-Specific Review Checklist

### 1. Authentication Endpoints

- [ ] `/wp-json/jwt-auth/v1/token` → `/api/v2/auth`
- [ ] Cookie-based authentication
- [ ] Token refresh
- [ ] User registration
- [ ] Logout functionality

### 2. User Endpoints

- [ ] User listing with pagination
- [ ] User creation, retrieval, update, deletion
- [ ] Current user information
- [ ] User role assignment

### 3. Role Endpoints

- [ ] Role listing
- [ ] Role capability checking
- [ ] Role assignment permissions

### 4. Tribute Endpoints

- [ ] Tribute page CRUD operations
- [ ] Slug-based tribute lookup
- [ ] Tribute metadata handling

### 5. Location Endpoints

- [ ] Location CRUD operations
- [ ] Locations by tribute
- [ ] Address handling

### 6. Event Endpoints

- [ ] Event CRUD operations
- [ ] Active event filtering
- [ ] Events by location and tribute
- [ ] Date/time handling

### 7. Schedule Endpoints

- [ ] Schedule creation and management
- [ ] Schedule association with tributes

### 8. Funeral Home Endpoints

- [ ] Funeral home CRUD operations
- [ ] Association with tributes and events

## Implementation Review Worksheet

For each endpoint, complete this worksheet:

```
Endpoint: /api/v2/[category]/[specific-endpoint]

WordPress Counterpart: /funeral/v2/[endpoint]

HTTP Methods:
- GET: ✓ Implemented | ⚠️ Partial | ❌ Missing
- POST: ✓ Implemented | ⚠️ Partial | ❌ Missing
- PUT: ✓ Implemented | ⚠️ Partial | ❌ Missing
- DELETE: ✓ Implemented | ⚠️ Partial | ❌ Missing

Request Parameters:
- Path parameters correctly extracted? ✓/❌
- Query parameters handled? ✓/❌
- Body parsing implemented? ✓/❌

Validation:
- Required fields checked? ✓/❌
- Data types validated? ✓/❌
- Business rules enforced? ✓/❌

Authentication:
- Token extraction? ✓/❌
- Role/permission checking? ✓/❌

Response:
- Success format matches standard? ✓/❌
- Error format matches standard? ✓/❌
- Matches TypeScript interface? ✓/❌

TypeScript Interface:
- Interface exists and is complete? ✓/❌
- Request type defined? ✓/❌
- Response type defined? ✓/❌

Client Helper Function:
- Helper function exists? ✓/❌
- Properly typed? ✓/❌
- Error handling implemented? ✓/❌

Notes:
- Issues identified:
- Suggested improvements:
- Priority (High/Medium/Low):
```

## Final Deliverables

1. **Endpoint Mapping Document**
   - Complete mapping between WordPress and SvelteKit endpoints
   - Status of each endpoint implementation

2. **Gap Analysis Report**
   - Prioritized list of missing or incomplete endpoints
   - Required TypeScript interfaces

3. **Implementation Recommendations**
   - Best practices for consistent implementation
   - Error handling standardization
   - Authentication flow improvements

4. **Development Roadmap**
   - Prioritized tasks for completing the API v2 implementation
   - Estimated effort for each task

## Process Example: Reviewing Tribute Endpoints

To illustrate the process, here's how you would review tribute endpoints:

1. In `pluginV2.php`, locate all routes starting with `/funeral/v2/tribute-pages`
2. Document HTTP methods, parameters, and permission callbacks
3. Check `/routes/api/v2/tributes` directory for corresponding SvelteKit endpoints
4. Review implementation of each HTTP method (GET, POST, PUT, DELETE)
5. Verify validation, error handling, and response formatting
6. Check TypeScript interfaces in `/routes/api/v2/types/tributes.ts`
7. Review client helper functions for tribute operations
8. Document any gaps or inconsistencies
9. Make recommendations for improvements

By following this systematic approach, your team will be able to thoroughly review the API implementation and ensure consistency between the WordPress plugin and SvelteKit endpoints.
