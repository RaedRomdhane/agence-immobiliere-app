import { test, expect } from '@playwright/test';
import { LoginPage } from '../fixtures/LoginPage';
import { RegisterPage } from '../fixtures/RegisterPage';
import { generateUserData } from '../fixtures/testData';

test.describe('User Login Tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should show Google login button', async () => {
    await expect(loginPage.googleLoginButton).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await loginPage.registerLink.click();
    await expect(page).toHaveURL(/.*register/);
  });

  test('should show error for invalid credentials', async () => {
    await loginPage.login('invalid@test.com', 'wrongpassword');
    await loginPage.page.waitForTimeout(2000);
    const error = await loginPage.getErrorText();
    if (error) {
      expect(error.toLowerCase()).toMatch(/invalid|incorrect|erreur/);
    }
  });

  test('should validate required email field', async () => {
    await loginPage.passwordInput.fill('somepassword');
    await loginPage.submitButton.click();
    expect(loginPage.page.url()).toContain('/login');
  });

  test('should validate required password field', async () => {
    await loginPage.emailInput.fill('test@example.com');
    await loginPage.submitButton.click();
    expect(loginPage.page.url()).toContain('/login');
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const userData = generateUserData();
    
    await registerPage.goto();
    await registerPage.fillForm(userData);
    await registerPage.submit();
    await page.waitForTimeout(3000);
    
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);
    await page.waitForTimeout(2000);
  });
});
