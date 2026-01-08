import { test, expect } from '@playwright/test';

test.describe('Installment Calculation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to registration form
    await page.goto('/inscricao');
    await expect(page.locator('h1', { hasText: 'UAIZOUK 2025' })).toBeVisible();
  });

  test('should calculate correct installments for PIX payments', async ({ page }) => {
    // Fill basic form data to reach payment section
    await page.fill('[data-testid="fullName"]', 'Test User');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="whatsapp"]', '(11) 99999-9999');
    await page.fill('[data-testid="birthDate"]', '1990-01-15');
    await page.fill('[data-testid="cpf"]', '123.456.789-10');
    await page.selectOption('[data-testid="state"]', 'São Paulo');
    await page.fill('[data-testid="city"]', 'São Paulo');

    // Navigate to tickets
    await page.click('button:has-text("Continuar")');
    await page.click('[data-testid="ticket-Individual"]'); // Adjust selector based on actual implementation

    // Navigate to products
    await page.click('button:has-text("Continuar")');

    // Navigate to payment
    await page.click('button:has-text("Continuar")');

    // Test PIX à vista - should not show installments
    await page.click('[data-testid="payment-pix"]');
    await expect(page.locator('text=1x')).toBeVisible();
    await expect(page.locator('text=2x')).not.toBeVisible();

    // Test PIX installment - should show available installments
    await page.click('[data-testid="payment-pix_installment"]');

    // Should show installment options based on calculateMaxInstallments
    const installmentOptions = page.locator('[data-testid^="installment-option-"]');
    const count = await installmentOptions.count();

    // Verify installment options are displayed
    expect(count).toBeGreaterThan(1);
    expect(count).toBeLessThanOrEqual(12); // Assuming max 12 installments

    // Test specific installment values
    await expect(page.locator('[data-testid="installment-option-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="installment-option-2"]')).toBeVisible();

    // Verify installment calculation matches expected values
    const baseTotal = await page.locator('[data-testid="baseTotal"]').textContent();
    const baseValue = parseFloat(baseTotal?.replace(/[^\d.,]/g, '').replace(',', '.') || '0');

    if (baseValue > 0) {
      // Test 2x installment
      await page.click('[data-testid="installment-option-2"]');
      const installmentValue = await page.locator('[data-testid="installment-value-2"]').textContent();
      const expectedInstallmentValue = (baseValue * 1.05) / 2; // With 5% fee divided by 2

      // Allow for small rounding differences
      const actualValue = parseFloat(installmentValue?.replace(/[^\d.,]/g, '').replace(',', '.') || '0');
      expect(Math.abs(actualValue - expectedInstallmentValue)).toBeLessThan(0.01);
    }
  });

  test('should calculate correct installments for credit card payments', async ({ page }) => {
    // Fill form and navigate to payment
    await page.fill('[data-testid="fullName"]', 'Credit Card User');
    await page.fill('[data-testid="email"]', 'cc@example.com');
    await page.fill('[data-testid="whatsapp"]', '(11) 88888-8888');
    await page.fill('[data-testid="birthDate"]', '1985-05-20');
    await page.fill('[data-testid="cpf"]', '987.654.321-00');
    await page.selectOption('[data-testid="state"]', 'Rio de Janeiro');
    await page.fill('[data-testid="city"]', 'Rio de Janeiro');

    // Navigate to payment section
    await page.click('button:has-text("Continuar")'); // To tickets
    await page.click('[data-testid="ticket-Individual"]');
    await page.click('button:has-text("Continuar")'); // To products
    await page.click('button:has-text("Continuar")'); // To payment

    // Select credit card payment
    await page.click('[data-testid="payment-credit_card"]');

    // Check interest acceptance checkbox
    await page.check('[data-testid="interestAccepted"]');

    // Verify installment options are available
    const installmentOptions = page.locator('[data-testid^="installment-option-"]');
    const count = await installmentOptions.count();

    expect(count).toBeGreaterThan(1);

    // Test different installment amounts
    for (let i = 1; i <= Math.min(count, 6); i++) {
      await page.click(`[data-testid="installment-option-${i}"]`);

      // Verify the installment calculation
      const installmentDisplayed = await page.locator(`[data-testid="installment-value-${i}"]`).textContent();

      if (installmentDisplayed) {
        const installmentValue = parseFloat(installmentDisplayed.replace(/[^\d.,]/g, '').replace(',', '.'));
        expect(installmentValue).toBeGreaterThan(0);

        // For credit card, total should be base + fee
        const totalElement = page.locator('[data-testid="finalTotal"]');
        if (await totalElement.isVisible()) {
          const totalText = await totalElement.textContent();
          const totalValue = parseFloat(totalText?.replace(/[^\d.,]/g, '').replace(',', '.') || '0');

          // Verify installment * count approximately equals total
          const calculatedTotal = installmentValue * i;
          expect(Math.abs(calculatedTotal - totalValue)).toBeLessThan(1.00); // Allow small rounding differences
        }
      }
    }
  });

  test('should handle edge cases in installment calculation', async ({ page }) => {
    // Test with minimum viable amount
    await page.fill('[data-testid="fullName"]', 'Edge Case User');
    await page.fill('[data-testid="email"]', 'edge@example.com');
    await page.fill('[data-testid="whatsapp"]', '(11) 77777-7777');
    await page.fill('[data-testid="birthDate"]', '1995-12-01');
    await page.fill('[data-testid="cpf"]', '111.222.333-44');
    await page.selectOption('[data-testid="state"]', 'Minas Gerais');
    await page.fill('[data-testid="city"]', 'Belo Horizonte');

    // Navigate to payment
    await page.click('button:has-text("Continuar")');
    await page.click('[data-testid="ticket-Individual"]');
    await page.click('button:has-text("Continuar")');
    await page.click('button:has-text("Continuar")');

    // Test PIX installment edge cases
    await page.click('[data-testid="payment-pix_installment"]');
    await page.check('[data-testid="interestAccepted"]');

    // Verify maximum installments are limited
    const maxInstallmentOption = page.locator('[data-testid="installment-option-12"]');
    const installmentOptions = page.locator('[data-testid^="installment-option-"]');
    const count = await installmentOptions.count();

    // Should not exceed configured maximum
    expect(count).toBeLessThanOrEqual(12);

    // Test minimum installment value constraint
    if (count > 1) {
      await page.click(`[data-testid="installment-option-${count}"]`);

      const minInstallmentValue = await page.locator(`[data-testid="installment-value-${count}"]`).textContent();
      const minValue = parseFloat(minInstallmentValue?.replace(/[^\d.,]/g, '').replace(',', '.') || '0');

      // Minimum installment should be reasonable (e.g., at least R$ 10)
      expect(minValue).toBeGreaterThanOrEqual(10.00);
    }
  });

  test('should validate installment display consistency across payment methods', async ({ page }) => {
    // Complete form setup
    await page.fill('[data-testid="fullName"]', 'Consistency Test');
    await page.fill('[data-testid="email"]', 'consistency@example.com');
    await page.fill('[data-testid="whatsapp"]', '(11) 66666-6666');
    await page.fill('[data-testid="birthDate"]', '1988-07-10');
    await page.fill('[data-testid="cpf"]', '555.444.333-22');
    await page.selectOption('[data-testid="state"]', 'Bahia');
    await page.fill('[data-testid="city"]', 'Salvador');

    await page.click('button:has-text("Continuar")');
    await page.click('[data-testid="ticket-Individual"]');
    await page.click('button:has-text("Continuar")');
    await page.click('button:has-text("Continuar")');

    // Test PIX à vista (no installments)
    await page.click('[data-testid="payment-pix"]');
    await expect(page.locator('[data-testid="installment-option-2"]')).not.toBeVisible();

    // Test PIX installment
    await page.click('[data-testid="payment-pix_installment"]');
    await page.check('[data-testid="interestAccepted"]');

    const pixInstallmentOptions = await page.locator('[data-testid^="installment-option-"]').count();

    // Test credit card
    await page.click('[data-testid="payment-credit_card"]');
    await page.check('[data-testid="interestAccepted"]');

    const creditCardInstallmentOptions = await page.locator('[data-testid^="installment-option-"]').count();

    // Both installment methods should offer similar options
    expect(Math.abs(pixInstallmentOptions - creditCardInstallmentOptions)).toBeLessThanOrEqual(1);

    // Verify fee display for both methods
    await page.click('[data-testid="payment-pix_installment"]');
    await expect(page.locator('text=Taxa sistema')).toBeVisible();

    await page.click('[data-testid="payment-credit_card"]');
    await expect(page.locator('text=Taxa sistema')).toBeVisible();
  });

  test('should update totals dynamically when installments change', async ({ page }) => {
    // Setup form
    await page.fill('[data-testid="fullName"]', 'Dynamic Test');
    await page.fill('[data-testid="email"]', 'dynamic@example.com');
    await page.fill('[data-testid="whatsapp"]', '(11) 55555-5555');
    await page.fill('[data-testid="birthDate"]', '1992-03-25');
    await page.fill('[data-testid="cpf"]', '999.888.777-66');
    await page.selectOption('[data-testid="state"]', 'Paraná');
    await page.fill('[data-testid="city"]', 'Curitiba');

    await page.click('button:has-text("Continuar")');
    await page.click('[data-testid="ticket-Individual"]');
    await page.click('button:has-text("Continuar")');
    await page.click('button:has-text("Continuar")');

    // Select credit card with installments
    await page.click('[data-testid="payment-credit_card"]');
    await page.check('[data-testid="interestAccepted"]');

    // Get base total
    const baseTotal = await page.locator('[data-testid="baseTotal"]').textContent();
    const baseValue = parseFloat(baseTotal?.replace(/[^\d.,]/g, '').replace(',', '.') || '0');

    // Test 1x installment
    await page.click('[data-testid="installment-option-1"]');
    let finalTotal = await page.locator('[data-testid="finalTotal"]').textContent();
    let finalValue = parseFloat(finalTotal?.replace(/[^\d.,]/g, '').replace(',', '.') || '0');

    // 1x should include fee
    expect(finalValue).toBeGreaterThan(baseValue);

    // Test 3x installment
    if (await page.locator('[data-testid="installment-option-3"]').isVisible()) {
      await page.click('[data-testid="installment-option-3"]');

      finalTotal = await page.locator('[data-testid="finalTotal"]').textContent();
      finalValue = parseFloat(finalTotal?.replace(/[^\d.,]/g, '').replace(',', '.') || '0');

      // Should still include fee
      expect(finalValue).toBeGreaterThan(baseValue);

      // Installment value should be displayed
      const installmentValueElement = page.locator('[data-testid="installment-value-3"]');
      if (await installmentValueElement.isVisible()) {
        const installmentText = await installmentValueElement.textContent();
        const installmentValue = parseFloat(installmentText?.replace(/[^\d.,]/g, '').replace(',', '.') || '0');

        // 3 installments should equal final total
        expect(Math.abs((installmentValue * 3) - finalValue)).toBeLessThan(0.05);
      }
    }
  });
});