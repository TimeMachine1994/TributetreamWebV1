import { test, expect } from '@playwright/test';

// Test data for registration
const validUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'Password123!',
  role: 'Funeral Director'
};

const invalidUser = {
  username: 'te', // Too short
  email: 'invalid-email',
  password: '123', // Too short
  role: ''
};

test.describe('Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register');
  });

  test('displays registration form', async ({ page }) => {
    // Verify form elements are present
    await expect(page.getByLabel('Username')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.locator('select[name="role"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Register' })).toBeVisible();
  });

  test('shows validation errors for invalid data', async ({ page }) => {
    // Fill form with invalid data
    await page.getByLabel('Username').fill(invalidUser.username);
    await page.getByLabel('Email').fill(invalidUser.email);
    await page.getByLabel('Password').fill(invalidUser.password);
    
    // Submit form
    await page.getByRole('button', { name: 'Register' }).click();
    
    // Check for validation error messages
    await expect(page.getByText(/username must be at least/i)).toBeVisible();
    await expect(page.getByText(/email must be valid/i)).toBeVisible();
    await expect(page.getByText(/password must be at least/i)).toBeVisible();
    await expect(page.getByText(/role is required/i)).toBeVisible();
  });

  test('successful registration redirects to login page', async ({ page }) => {
    // Mock the registration API response
    await page.route('/api/register', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true })
      });
    });
    
    // Fill form with valid data
    await page.getByLabel('Username').fill(validUser.username);
    await page.getByLabel('Email').fill(validUser.email);
    await page.getByLabel('Password').fill(validUser.password);
    await page.selectOption('select[name="role"]', validUser.role);
    
    // Submit form
    await page.getByRole('button', { name: 'Register' }).click();
    
    // Verify redirect to login page
    await expect(page).toHaveURL('/login');
  });

  test('displays error message on registration failure', async ({ page }) => {
    // Mock the registration API error response
    await page.route('/api/register', async (route) => {
      await route.fulfill({
        status: 400,
        body: JSON.stringify({
          error: {
            message: 'Email or username already taken'
          }
        })
      });
    });
    
    // Fill form with valid data
    await page.getByLabel('Username').fill(validUser.username);
    await page.getByLabel('Email').fill(validUser.email);
    await page.getByLabel('Password').fill(validUser.password);
    await page.selectOption('select[name="role"]', validUser.role);
    
    // Submit form
    await page.getByRole('button', { name: 'Register' }).click();
    
    // Verify error message is displayed
    await expect(page.getByText(/Email or username already taken/i)).toBeVisible();
    
    // Verify we're still on the registration page
    await expect(page).toHaveURL('/register');
  });
});