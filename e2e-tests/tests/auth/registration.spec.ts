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
    await page.waitForURL(/\//, { timeout: 10000 });
    expect(page.url()).not.toContain('/register');
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
    const url = registerPage.page.url();
    expect(url).toContain('/register');
  });

  test('should register without optional phone', async ({ page }) => {
    const userData = generateUserData();
    await registerPage.emailInput.fill(userData.email);
    await registerPage.passwordInput.fill(userData.password);
    await registerPage.confirmPasswordInput.fill(userData.password);
    await registerPage.firstNameInput.fill(userData.firstName);
    await registerPage.lastNameInput.fill(userData.lastName);
    await registerPage.submit();
    await page.waitForTimeout(2000);
  });
});
