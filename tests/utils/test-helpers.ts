import { Page, Locator, expect } from '@playwright/test';

/**
 * Test data generators and helpers for Event registration form testing
 * Note: Event name is configured via VITE_SITE_NAME environment variable
 */

export interface TestUserData {
  fullName: string;
  email: string;
  whatsapp: string;
  birthDate: string;
  cpf: string;
  state: string;
  city: string;
  partnerName?: string;
  isForeigner?: boolean;
}

export interface TestPaymentData {
  method: 'pix' | 'pix_installment' | 'credit_card';
  installments?: number;
  expectedBaseTotal?: number;
  expectedFinalTotal?: number;
}

/**
 * Generate test user data for Brazilian users
 */
export function generateTestUserData(overrides: Partial<TestUserData> = {}): TestUserData {
  return {
    fullName: 'João Silva dos Santos',
    email: `test.user.${Date.now()}@example.com`,
    whatsapp: '(11) 99999-9999',
    birthDate: '1990-01-15',
    cpf: '123.456.789-10', // Valid format but fake CPF
    state: 'São Paulo',
    city: 'São Paulo',
    isForeigner: false,
    ...overrides
  };
}

/**
 * Generate test user data for foreign users
 */
export function generateForeignTestUserData(overrides: Partial<TestUserData> = {}): TestUserData {
  return {
    fullName: 'John Smith',
    email: `foreign.test.${Date.now()}@example.com`,
    whatsapp: '+1 555-123-4567',
    birthDate: '1985-05-20',
    cpf: '',
    state: '',
    city: '',
    isForeigner: true,
    ...overrides
  };
}

/**
 * Fill the registration form with test data
 */
export async function fillRegistrationForm(page: Page, userData: TestUserData): Promise<void> {
  // Fill identification section
  await page.fill('[data-testid="fullName"]', userData.fullName);
  await page.fill('[data-testid="email"]', userData.email);
  await page.fill('[data-testid="whatsapp"]', userData.whatsapp);
  await page.fill('[data-testid="birthDate"]', userData.birthDate);

  // Handle foreign users checkbox
  if (userData.isForeigner) {
    await page.click('[data-testid="isForeigner"]', { force: true });
  } else {
    await page.fill('[data-testid="cpf"]', userData.cpf);

    // Try multiple approaches for state selection
    await page.click('[data-testid="state"]');

    // Approach 1: Use keyboard navigation
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Wait for cities to load
    await page.waitForTimeout(1000);

    // Try multiple approaches for city selection
    await page.click('[data-testid="city"]');

    // Approach 1: Use keyboard navigation for city
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
  }

  // Partner name if provided
  if (userData.partnerName) {
    await page.fill('[data-testid="partnerName"]', userData.partnerName);
  }
}

/**
 * Navigate through form steps
 */
export async function navigateToStep(page: Page, stepName: 'tickets' | 'products' | 'payment' | 'summary'): Promise<void> {
  // Click continue button to advance through steps
  const continueButton = page.locator('button', { hasText: 'Continue' });

  switch (stepName) {
    case 'tickets':
      // Should already be on identification, click continue
      await continueButton.click();
      break;
    case 'products':
      // From tickets to products
      await continueButton.click();
      break;
    case 'payment':
      // From products to payment
      await continueButton.click();
      break;
    case 'summary':
      // From payment to summary
      await continueButton.click();
      break;
  }

  // Wait for step to load
  await page.waitForTimeout(500);
}

/**
 * Select ticket type
 */
export async function selectTicketType(page: Page, ticketType: string): Promise<void> {
  const ticketSelector = `[data-testid="ticket-${ticketType}"]`;
  await page.click(ticketSelector);
}

/**
 * Select payment method and validate display
 */
export async function selectPaymentMethod(page: Page, paymentData: TestPaymentData): Promise<void> {
  const methodSelector = `[data-testid="payment-${paymentData.method}"]`;
  await page.click(methodSelector);

  // Validate conditional interest checkbox appears for installment methods
  if (paymentData.method === 'credit_card' || paymentData.method === 'pix_installment') {
    await expect(page.locator('[data-testid="interestAccepted"]')).toBeVisible();
    // Check the interest acceptance checkbox
    await page.click('[data-testid="interestAccepted"]', { force: true });
  } else {
    // For PIX à vista, interest checkbox should not be visible
    await expect(page.locator('[data-testid="interestAccepted"]')).not.toBeVisible();
  }
}

/**
 * Validate payment calculation display
 */
export async function validatePaymentCalculation(page: Page, paymentData: TestPaymentData): Promise<void> {
  if (paymentData.expectedBaseTotal) {
    const baseTotalElement = page.locator('[data-testid="baseTotal"]');
    await expect(baseTotalElement).toContainText(`R$ ${paymentData.expectedBaseTotal.toFixed(2)}`);
  }

  if (paymentData.expectedFinalTotal) {
    const finalTotalElement = page.locator('[data-testid="finalTotal"]');
    await expect(finalTotalElement).toContainText(`R$ ${paymentData.expectedFinalTotal.toFixed(2)}`);
  }

  // Validate PIX advantage display
  if (paymentData.method === 'pix') {
    await expect(page.locator('text=PIX sem taxa do sistema')).toBeVisible();
  }

  // Validate fee display for installment methods
  if (paymentData.method === 'credit_card' || paymentData.method === 'pix_installment') {
    await expect(page.locator('text=Taxa sistema')).toBeVisible();
  }
}

/**
 * Complete terms acceptance
 */
export async function acceptTerms(page: Page): Promise<void> {
  await page.click('[data-testid="termsAccepted"]', { force: true });
  await page.click('[data-testid="noRefundAccepted"]', { force: true });
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(page: Page, endpoint: string): Promise<void> {
  await page.waitForResponse(response =>
    response.url().includes(endpoint) && response.status() === 200
  );
}

/**
 * Generate test ticket types
 */
export const TEST_TICKET_TYPES = {
  INDIVIDUAL: 'Individual',
  COUPLE: 'Casal',
  GROUP: 'Grupo'
};

/**
 * Generate test payment methods
 */
export const TEST_PAYMENT_METHODS = {
  PIX: 'pix',
  PIX_INSTALLMENT: 'pix_installment',
  CREDIT_CARD: 'credit_card'
} as const;

/**
 * Expected test outcomes for different scenarios
 */
export const TEST_SCENARIOS = {
  BASIC_PIX: {
    userData: generateTestUserData(),
    ticketType: TEST_TICKET_TYPES.INDIVIDUAL,
    paymentMethod: TEST_PAYMENT_METHODS.PIX,
    shouldShowInterestCheckbox: false,
    expectedSuccessRedirect: true
  },
  COUPLE_CREDIT_CARD: {
    userData: generateTestUserData({ partnerName: 'Maria Silva' }),
    ticketType: TEST_TICKET_TYPES.COUPLE,
    paymentMethod: TEST_PAYMENT_METHODS.CREDIT_CARD,
    shouldShowInterestCheckbox: true,
    expectedSuccessRedirect: true
  },
  FOREIGN_PIX_INSTALLMENT: {
    userData: generateForeignTestUserData(),
    ticketType: TEST_TICKET_TYPES.INDIVIDUAL,
    paymentMethod: TEST_PAYMENT_METHODS.PIX_INSTALLMENT,
    shouldShowInterestCheckbox: true,
    expectedSuccessRedirect: true
  }
};

/**
 * Utility to take screenshots during test execution
 */
export async function takeTestScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({
    path: `tests/screenshots/${name}-${Date.now()}.png`,
    fullPage: true
  });
}

/**
 * Cleanup test data
 */
export async function cleanupTestData(): Promise<void> {
  // This would connect to test database and clean up any test records
  // Implementation depends on your database setup
  console.log('Cleaning up test data...');
}