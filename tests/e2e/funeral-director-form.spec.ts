import { test, expect } from '@playwright/test';

test.describe('Funeral Director Form', () => {
  test('should display validation errors for empty required fields', async ({ page }) => {
    // Navigate to the form page
    await page.goto('/fd-form');
    
    // Submit the empty form
    await page.click('button[type="submit"]');
    
    // Check for validation errors
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('text=Email address is required')).toBeVisible();
    await expect(page.locator('text=Director\'s first name is required')).toBeVisible();
    await expect(page.locator('text=Director\'s last name is required')).toBeVisible();
    await expect(page.locator('text=Deceased\'s first name is required')).toBeVisible();
    await expect(page.locator('text=Deceased\'s last name is required')).toBeVisible();
    await expect(page.locator('text=Phone number is required')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    // Navigate to the form page
    await page.goto('/fd-form');
    
    // Fill in all required fields except email
    await page.fill('input[name="director-first-name"]', 'John');
    await page.fill('input[name="director-last-name"]', 'Doe');
    await page.fill('input[name="deceased-first-name"]', 'Jane');
    await page.fill('input[name="deceased-last-name"]', 'Smith');
    await page.fill('input[name="phone-number"]', '123-456-7890');
    
    // Fill in invalid email
    await page.fill('input[name="email-address"]', 'invalid-email');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Check for email validation error
    await expect(page.locator('text=Invalid email format')).toBeVisible();
    
    // Fix the email and submit again
    await page.fill('input[name="email-address"]', 'valid@example.com');
    
    // For this test, we'll intercept the form submission to avoid actual API calls
    await page.route('**/api/auth', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-token',
          user_id: 123,
          user_display_name: 'Test User'
        })
      });
    });
    
    await page.route('**/wp-json/tributestream/v1/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });
    
    await page.route('**/api/send-email', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });
    
    // Mock the redirect
    await page.route('**/celebration-of-life-for-**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body><h1>Tribute Page</h1></body></html>'
      });
    });
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait for navigation or success message
    await page.waitForURL(/celebration-of-life-for-/);
    
    // Verify we're on the tribute page
    expect(page.url()).toContain('celebration-of-life-for-');
  });

  test('should submit form successfully with all required fields', async ({ page }) => {
    // Navigate to the form page
    await page.goto('/fd-form');
    
    // Fill in all required fields
    await page.fill('input[name="director-first-name"]', 'John');
    await page.fill('input[name="director-last-name"]', 'Doe');
    await page.fill('input[name="deceased-first-name"]', 'Jane');
    await page.fill('input[name="deceased-last-name"]', 'Smith');
    await page.fill('input[name="email-address"]', 'test@example.com');
    await page.fill('input[name="phone-number"]', '123-456-7890');
    
    // Fill in optional fields
    await page.fill('input[name="deceased-dob"]', '1950-01-01');
    await page.fill('input[name="deceased-dop"]', '2023-01-15');
    await page.fill('input[name="memorial-date"]', '2023-02-01');
    await page.fill('input[name="memorial-time"]', '14:00');
    await page.fill('input[name="location-name"]', 'Memorial Chapel');
    await page.fill('input[name="location-address"]', '123 Main St, Anytown, USA');
    
    // Mock API responses
    await page.route('**/api/auth', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-token',
          user_id: 123,
          user_display_name: 'Test User'
        })
      });
    });
    
    await page.route('**/wp-json/tributestream/v1/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          success: true,
          tribute_id: 456,
          slug: 'jane-smith'
        })
      });
    });
    
    await page.route('**/api/send-email', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });
    
    // Mock the redirect
    await page.route('**/celebration-of-life-for-**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body><h1>Celebration of Life for Jane Smith</h1></body></html>'
      });
    });
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait for navigation to the tribute page
    await page.waitForURL(/celebration-of-life-for-/);
    
    // Verify we're on the tribute page
    expect(page.url()).toContain('celebration-of-life-for-');
  });

  test('should show success message when API calls partially succeed', async ({ page }) => {
    // Navigate to the form page
    await page.goto('/fd-form');
    
    // Fill in all required fields
    await page.fill('input[name="director-first-name"]', 'John');
    await page.fill('input[name="director-last-name"]', 'Doe');
    await page.fill('input[name="deceased-first-name"]', 'Jane');
    await page.fill('input[name="deceased-last-name"]', 'Smith');
    await page.fill('input[name="email-address"]', 'test@example.com');
    await page.fill('input[name="phone-number"]', '123-456-7890');
    
    // Mock successful authentication but failed tribute creation
    await page.route('**/api/auth', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-token',
          user_id: 123,
          user_display_name: 'Test User'
        })
      });
    });
    
    // Mock failed tribute creation
    await page.route('**/wp-json/tributestream/v1/tributes', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ 
          success: false,
          error: 'Failed to create tribute'
        })
      });
    });
    
    // Mock successful user meta
    await page.route('**/wp-json/tributestream/v1/user-meta', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });
    
    // Mock successful email
    await page.route('**/api/send-email', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Check for success message
    await expect(page.locator('text=Your form was submitted successfully')).toBeVisible();
    await expect(page.locator('text=Our team will contact you shortly')).toBeVisible();
  });
});