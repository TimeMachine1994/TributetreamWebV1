# Login Routing Fix Plan
Last Updated: 2/16/2025

## Current Issue
The login page (`src/routes/login/+page.svelte`) is redirecting to '/dashboard' after successful authentication, but this route doesn't exist in the application. Instead, there is a 'family-dashboard' route that appears to be the intended destination.

## Analysis
1. Current implementation in login page:
```typescript
const returnUrl = $page.url.searchParams.get('returnUrl') || '/dashboard';
goto(returnUrl);
```

2. Available routes:
- /
- /calculator
- /family-dashboard
- /fd-form
- /login
- /send-email-test

## Proposed Solution

### 1. Update Default Redirect
Change the default redirect in the login page from '/dashboard' to '/family-dashboard' to match the existing route structure.

### 2. Implementation Steps
1. Modify `src/routes/login/+page.svelte`:
   ```typescript
   const returnUrl = $page.url.searchParams.get('returnUrl') || '/family-dashboard';
   ```

### 3. Additional Considerations
1. Update any other components or utilities that might be referencing the '/dashboard' route
2. Consider adding proper route guards to '/family-dashboard' to ensure authenticated access
3. Update documentation to reflect the correct route naming

## Recommendations
1. **Immediate Fix**: Update the login redirect to use the correct route
2. **Long-term**: Consider implementing a proper routing configuration file to centralize route definitions
3. **Documentation**: Update relevant documentation to reflect the correct route names

## Next Steps
1. Switch to Code mode to implement the fix
2. Test the login flow to ensure proper redirection
3. Update the application audit to include this routing issue and its resolution