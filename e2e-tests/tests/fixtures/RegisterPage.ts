import { Page, Locator } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly phoneInput: Locator;
  readonly roleSelect: Locator;
  readonly submitButton: Locator;
  readonly googleSignupButton: Locator;
  readonly loginLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"], input[type="email"]');
    this.passwordInput = page.locator('input[name="password"][type="password"]').first();
    this.confirmPasswordInput = page.locator('input[name="confirmPassword"]');
    this.firstNameInput = page.locator('input[name="firstName"]');
    this.lastNameInput = page.locator('input[name="lastName"]');
    this.phoneInput = page.locator('input[name="phone"], input[type="tel"]');
    this.roleSelect = page.locator('select[name="role"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.googleSignupButton = page.locator('button:has-text("Google")');
    this.loginLink = page.locator('form a[href="/login"]');
    this.errorMessage = page.locator('[role="alert"], .error, .text-red-500');
  }

  async goto() {
    await this.page.goto('/register');
  }

  async fillForm(data: any) {
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    await this.confirmPasswordInput.fill(data.password);
    if (data.firstName) await this.firstNameInput.fill(data.firstName);
    if (data.lastName) await this.lastNameInput.fill(data.lastName);
    if (data.phone) await this.phoneInput.fill(data.phone);
    await this.roleSelect.selectOption(data.role || 'client');
  }

  async submit() {
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
