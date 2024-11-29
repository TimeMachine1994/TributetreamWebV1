import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test('should load the dashboard page successfully', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText(/Dashboard/i);
  });
});
