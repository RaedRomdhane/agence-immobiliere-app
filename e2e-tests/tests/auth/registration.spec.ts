import { test, expect } from '@playwright/test';
import { RegisterPage } from '../fixtures/RegisterPage';
import { generateUserData } from '../fixtures/testData';

test.describe('User Registration Tests', () => {
  let registerPage: RegisterPage;
  
  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  test('should successfully register with valid data', async ({ page }) => {
    const userData = generateUserData();
    await registerPage.fillForm(userData);
    await registerPage.submit();
    await page.waitForTimeout(5000);
    const currentUrl = page.url();
    const hasError = await registerPage.getErrorText();
    console.log(`After registration - URL: ${currentUrl}, Error: ${hasError}`);
  });

  test('should show Google signup button', async () => {
    await expect(registerPage.googleSignupButton).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await registerPage.loginLink.click();
    await expect(page).toHaveURL(/.*login/);
  });

  test('should validate required fields', async () => {
    await registerPage.submit();
    expect(registerPage.page.url()).toContain('/register');
  });

  test('should register without optional phone', async ({ page }) => {
    const userData = generateUserData();
    delete userData.phone;
    await registerPage.fillForm(userData);
    await registerPage.submit();
    await page.waitForTimeout(3000);
  });
});
