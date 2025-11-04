import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly googleLoginButton: Locator;
  readonly registerLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"], input[type="email"]');
    this.passwordInput = page.locator('input[name="password"][type="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.googleLoginButton = page.locator('button:has-text("Google")');
    this.registerLink = page.locator('form a[href="/register"]');
    this.errorMessage = page.locator('[role="alert"], .error, .text-red-500');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async getErrorText() {
    try {
      await this.errorMessage.waitFor({ timeout: 3000 });
      return await this.errorMessage.textContent();
    } catch {
      return null;
    }
  }
}
