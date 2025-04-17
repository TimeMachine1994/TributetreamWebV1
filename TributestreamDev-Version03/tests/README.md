# Running Tests for TributeStream API v2

This guide explains how to run the tests for the TributeStream API v2 endpoints.

## Prerequisites

Make sure you have Node.js and npm installed on your system. The project uses Vitest for unit testing and Playwright for end-to-end testing.

## Available Test Commands

The following npm scripts are available for running tests:

### Running All Tests

To run all tests (unit tests and end-to-end tests):

```bash
cd TributestreamDev-Version03
npm run test:ci
```

### Running Unit Tests

To run all unit tests once:

```bash
cd TributestreamDev-Version03
npm run test
```

To run unit tests in watch mode (tests will re-run when files change):

```bash
cd TributestreamDev-Version03
npm run test:watch
```

To run unit tests with coverage report:

```bash
cd TributestreamDev-Version03
npm run test:coverage
```

### Running End-to-End Tests

To run end-to-end tests:

```bash
cd TributestreamDev-Version03
npm run test:e2e
```

To run end-to-end tests with UI:

```bash
cd TributestreamDev-Version03
npm run test:e2e:ui
```

## Running Specific Tests

### Running a Specific Test File

To run a specific test file, you can use the Vitest CLI:

```bash
cd TributestreamDev-Version03
npx vitest run tests/unit/api/v2/users/users.test.ts
```

### Running Tests with a Specific Pattern

To run tests that match a specific pattern:

```bash
cd TributestreamDev-Version03
npx vitest run --testNamePattern="User Management"
```

## Test Structure

The tests are organized as follows:

- `tests/unit/`: Unit tests
  - `tests/unit/api/v2/`: API v2 unit tests
    - `tests/unit/api/v2/setup.ts`: Common setup for API v2 tests
    - `tests/unit/api/v2/users/`: User management endpoint tests
    - `tests/unit/api/v2/auth/`: Authentication tests
- `tests/integration/`: Integration tests
  - `tests/integration/api/v2/`: API v2 integration tests

## Test Environment

The tests use a mocked environment:

- WordPress API calls are mocked
- Authentication is mocked
- Database operations are mocked

This allows the tests to run quickly and reliably without requiring a real WordPress instance or database.

## Troubleshooting

### Tests Failing Due to TypeScript Errors

If tests are failing due to TypeScript errors, try running:

```bash
cd TributestreamDev-Version03
npm run check
```

This will check for TypeScript errors in the project.

### Tests Failing Due to Missing Dependencies

If tests are failing due to missing dependencies, try running:

```bash
cd TributestreamDev-Version03
npm install
```

### Tests Timing Out

If tests are timing out, you may need to increase the timeout in the test configuration. You can do this by adding a timeout option to the test:

```typescript
it('should do something', async () => {
  // Test code
}, { timeout: 10000 }); // 10 seconds
```

Or you can set a global timeout in the Vitest configuration:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    timeout: 10000 // 10 seconds
  }
});
