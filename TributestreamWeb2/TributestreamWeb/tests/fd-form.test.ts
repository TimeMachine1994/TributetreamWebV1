import { faker } from '@faker-js/faker';
import { test, expect } from '@playwright/test';

test('Form submits with unique data', async ({ page }) => {
    // Navigate to the form page
    await page.goto('/fd-form'); // Replace with your form's actual path

    // Generate unique fake data
    const directorFirstName = faker.name.firstName();
    const directorLastName = faker.name.lastName();
    const email = faker.internet.email();
    const phone = faker.phone.number('###-###-####');
    const locationName = faker.company.companyName();

    // Fill out the form
    await page.fill('#director-first-name', directorFirstName);
    await page.fill('#director-last-name', directorLastName);
    await page.fill('#email-address', email);
    await page.fill('#phone-number', phone);
    await page.fill('#location-name', locationName);

    // Submit the form
    await page.click('button[type="submit"]');

    // Assert that the form submission was successful
    await expect(page).toHaveURL('/success'); // Replace with your actual success page
    await expect(page.locator('text=Form submitted successfully')).toBeVisible(); // Replace with your actual success message
});
