/**
 * Test data utilities for E2E tests
 * Generates unique test data to ensure test independence
 */

export const generateUniqueEmail = (prefix = 'test') => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}.${timestamp}.${random}@e2etest.com`;
};

export const generateValidPassword = () => {
  return 'Test123!@#';
};

export const generateUserData = () => {
  return {
    email: generateUniqueEmail(),
    password: generateValidPassword(),
    firstName: 'Test',
    lastName: 'User',
    phone: '+21698765432',
    role: 'client',
  };
};

export const TEST_CONSTANTS = {
  BACKEND_URL: process.env.BACKEND_URL || 'https://illustrious-cooperation-production-52c2.up.railway.app',
  FRONTEND_URL: process.env.STAGING_URL || 'https://agence-immobiliere-app-4naj-git-feature-aw-21-raed-raedromdhanes-projects.vercel.app',
  
  MIN_PASSWORD_LENGTH: 8,
  PASSWORD_MUST_HAVE_UPPERCASE: true,
  PASSWORD_MUST_HAVE_NUMBER: true,
  PASSWORD_MUST_HAVE_SPECIAL: true,
  
  PHONE_REGEX: /^(\+216)?[2-9]\d{7}$/,
  
  DEFAULT_TIMEOUT: 10000,
  NAVIGATION_TIMEOUT: 30000,
  API_TIMEOUT: 5000,
};

export const INVALID_TEST_DATA = {
  invalidEmails: [
    'notanemail',
    '@missing-local.com',
  ],
  weakPasswords: [
    '123',
    'password',
    'Password1',
  ],
  invalidPhones: [
    '123',
    '+21612345678',
  ],
};
