import { test, expect } from '@playwright/test';

test.describe('Basic E2E Setup Test', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Agence/i);
  });
  
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/.*login/);
  });
  
  test('should navigate to register page', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveURL(/.*register/);
  });
});
