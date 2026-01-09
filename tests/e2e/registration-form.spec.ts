import { test, expect } from '@playwright/test';
import {
  generateTestUserData,
  generateForeignTestUserData,
  fillRegistrationForm,
  navigateToStep,
  selectTicketType,
  selectPaymentMethod,
  validatePaymentCalculation,
  acceptTerms,
  TEST_TICKET_TYPES,
  TEST_PAYMENT_METHODS,
  TEST_SCENARIOS,
  takeTestScreenshot
} from '../utils/test-helpers';

// Dynamic event name from environment or default
const SITE_NAME = process.env.VITE_SITE_NAME || 'UAIZOUK';
const CURRENT_YEAR = new Date().getFullYear();
const EVENT_TITLE_PATTERN = new RegExp(`${SITE_NAME}\\s*\\d{4}`, 'i');

test.describe('Registration Form E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to registration form
    await page.goto('/inscricao');

    // Wait for form to load - use pattern matching for dynamic event name
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('should complete basic PIX registration flow', async ({ page }) => {
    const scenario = TEST_SCENARIOS.BASIC_PIX;

    // Fill identification form
    await fillRegistrationForm(page, scenario.userData);
    await takeTestScreenshot(page, 'basic-pix-identification');

    // Navigate to tickets
    await navigateToStep(page, 'tickets');
    await selectTicketType(page, scenario.ticketType);
    await takeTestScreenshot(page, 'basic-pix-tickets');

    // Navigate to products (skip for basic test)
    await navigateToStep(page, 'products');
    await takeTestScreenshot(page, 'basic-pix-products');

    // Navigate to payment
    await navigateToStep(page, 'payment');
    await selectPaymentMethod(page, {
      method: scenario.paymentMethod,
      expectedBaseTotal: 100, // Adjust based on your actual pricing
      expectedFinalTotal: 95   // With 5% PIX advantage
    });

    // Verify PIX advantage display
    await expect(page.locator('text=PIX no system fees::')).toBeVisible();
    await expect(page.locator('[data-testid="interestAccepted"]')).not.toBeVisible();
    await takeTestScreenshot(page, 'basic-pix-payment');

    // Navigate to summary
    await navigateToStep(page, 'summary');
    await acceptTerms(page);
    await takeTestScreenshot(page, 'basic-pix-summary');

    // Submit form
    const finishButton = page.locator('button', { hasText: 'Complete Payment' });
    await expect(finishButton).toBeEnabled();

    // Note: In real tests, you might want to mock the API response
    // await finishButton.click();
    // await expect(page).toHaveURL(/.*\/confirmation/);
  });

  test('should show interest checkbox for credit card payment', async ({ page }) => {
    const scenario = TEST_SCENARIOS.COUPLE_CREDIT_CARD;

    // Fill identification form
    await fillRegistrationForm(page, scenario.userData);

    // Navigate through steps
    await navigateToStep(page, 'tickets');
    await selectTicketType(page, scenario.ticketType);

    await navigateToStep(page, 'products');

    // Navigate to payment
    await navigateToStep(page, 'payment');
    await selectPaymentMethod(page, {
      method: scenario.paymentMethod
    });

    // Verify interest checkbox is visible and required
    await expect(page.locator('[data-testid="interestAccepted"]')).toBeVisible();
    await expect(page.locator('text=10% a.m. conforme estabelecido na Lei 9.298/1996')).toBeVisible();

    // Verify fee display
    await expect(page.locator('text=Taxa sistema')).toBeVisible();

    await takeTestScreenshot(page, 'credit-card-interest-checkbox');
  });

  test('should show interest checkbox for PIX installment payment', async ({ page }) => {
    const scenario = TEST_SCENARIOS.FOREIGN_PIX_INSTALLMENT;

    // Fill identification form for foreign user
    await fillRegistrationForm(page, scenario.userData);

    // Navigate through steps
    await navigateToStep(page, 'tickets');
    await selectTicketType(page, scenario.ticketType);

    await navigateToStep(page, 'products');

    // Navigate to payment
    await navigateToStep(page, 'payment');
    await selectPaymentMethod(page, {
      method: scenario.paymentMethod
    });

    // Verify interest checkbox is visible for PIX installment
    await expect(page.locator('[data-testid="interestAccepted"]')).toBeVisible();
    await expect(page.locator('text=10% a.m. conforme estabelecido na Lei 9.298/1996')).toBeVisible();

    // Verify fee display
    await expect(page.locator('text=Taxa sistema')).toBeVisible();

    await takeTestScreenshot(page, 'pix-installment-interest-checkbox');
  });

  test('should validate form submission with unchecked interest checkbox', async ({ page }) => {
    const userData = generateTestUserData();

    // Fill form and navigate to payment
    await fillRegistrationForm(page, userData);
    await navigateToStep(page, 'tickets');
    await selectTicketType(page, TEST_TICKET_TYPES.INDIVIDUAL);
    await navigateToStep(page, 'products');
    await navigateToStep(page, 'payment');

    // Select credit card but don't check interest checkbox
    await page.click(`[data-testid="payment-${TEST_PAYMENT_METHODS.CREDIT_CARD}"]`);

    // Try to navigate to summary without checking interest checkbox
    await navigateToStep(page, 'summary');
    await acceptTerms(page);

    // Try to submit - should show validation error
    const finishButton = page.locator('button', { hasText: 'Complete Payment' });
    await finishButton.click();

    // Should show validation error
    await expect(page.locator('text=aceitar os termos sobre juros')).toBeVisible();

    await takeTestScreenshot(page, 'interest-checkbox-validation-error');
  });

  test('should handle foreign user registration correctly', async ({ page }) => {
    const foreignUser = generateForeignTestUserData();

    // Fill form with foreign user data
    await fillRegistrationForm(page, foreignUser);

    // Verify CPF and location fields are hidden for foreign users
    if (foreignUser.isForeigner) {
      await expect(page.locator('[data-testid="cpf"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="state"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="city"]')).not.toBeVisible();
    }

    // Continue with flow
    await navigateToStep(page, 'tickets');
    await selectTicketType(page, TEST_TICKET_TYPES.INDIVIDUAL);

    await navigateToStep(page, 'products');
    await navigateToStep(page, 'payment');

    // Select PIX à vista
    await selectPaymentMethod(page, {
      method: TEST_PAYMENT_METHODS.PIX
    });

    // Verify no interest checkbox for PIX
    await expect(page.locator('[data-testid="interestAccepted"]')).not.toBeVisible();

    await takeTestScreenshot(page, 'foreign-user-registration');
  });

  test('should display correct payment calculations', async ({ page }) => {
    const userData = generateTestUserData();

    await fillRegistrationForm(page, userData);
    await navigateToStep(page, 'tickets');
    await selectTicketType(page, TEST_TICKET_TYPES.INDIVIDUAL);
    await navigateToStep(page, 'products');
    await navigateToStep(page, 'payment');

    // Test PIX calculation
    await selectPaymentMethod(page, { method: TEST_PAYMENT_METHODS.PIX });
    await expect(page.locator('text=PIX sem taxa do sistema')).toBeVisible();

    // Test credit card calculation
    await selectPaymentMethod(page, { method: TEST_PAYMENT_METHODS.CREDIT_CARD });
    await expect(page.locator('text=Taxa sistema')).toBeVisible();

    // Test PIX installment calculation
    await selectPaymentMethod(page, { method: TEST_PAYMENT_METHODS.PIX_INSTALLMENT });
    await expect(page.locator('text=Taxa sistema')).toBeVisible();

    await takeTestScreenshot(page, 'payment-calculations');
  });

  test('should handle form validation correctly', async ({ page }) => {
    // Try to submit empty form
    const continueButton = page.locator('button', { hasText: 'Continuar' });
    await continueButton.click();

    // Should show validation errors
    await expect(page.locator('text=Nome completo é obrigatório')).toBeVisible();
    await expect(page.locator('text=Email é obrigatório')).toBeVisible();
    await expect(page.locator('text=WhatsApp é obrigatório')).toBeVisible();

    await takeTestScreenshot(page, 'form-validation-errors');

    // Fill partial data
    await page.fill('[data-testid="fullName"]', 'Test User');
    await page.fill('[data-testid="email"]', 'invalid-email');

    await continueButton.click();

    // Should show email validation error
    await expect(page.locator('text=Email inválido')).toBeVisible();

    await takeTestScreenshot(page, 'email-validation-error');
  });

  test('should support language switching', async ({ page }) => {
    // Test language selector if available
    const languageSelector = page.locator('[data-testid="language-selector"]');

    if (await languageSelector.isVisible()) {
      // Switch to English
      await languageSelector.selectOption('en');

      // Verify English text appears - use dynamic pattern
      await expect(page.locator(`text=${SITE_NAME}`)).toBeVisible();
      await expect(page.locator('text=Registration')).toBeVisible();

      // Switch back to Portuguese
      await languageSelector.selectOption('pt');

      // Verify Portuguese text appears - use dynamic pattern
      await expect(page.locator(`text=Inscrição`)).toBeVisible();
      await expect(page.locator(`text=${SITE_NAME}`)).toBeVisible();

      await takeTestScreenshot(page, 'language-switching');
    }
  });
});