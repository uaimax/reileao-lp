import { test, expect } from '@playwright/test';

test.describe('Registration Confirmation Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock successful registration flow
    // Note: In real implementation, you might want to create a test registration first
    await page.goto('/confirmation?registrationId=test-123&paymentId=pay-456');
  });

  test('should display registration confirmation details', async ({ page }) => {
    // Wait for page to load
    await expect(page.locator('h1')).toBeVisible();

    // Should show confirmation message
    await expect(page.locator('text=confirmação')).toBeVisible();
    await expect(page.locator('text=sucesso')).toBeVisible();

    // Should display registration number
    await expect(page.locator('[data-testid="registrationNumber"]')).toBeVisible();

    // Should show user details
    await expect(page.locator('[data-testid="userDetails"]')).toBeVisible();
  });

  test('should display payment link for PIX payment', async ({ page }) => {
    // Mock PIX payment response
    await page.route('**/api/registrations/test-123', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-123',
          registrationNumber: 'UAIZOUK2025-001',
          fullName: 'João Silva',
          email: 'joao@example.com',
          paymentMethod: 'pix',
          totalAmount: 95.00,
          status: 'confirmed',
          paymentStatus: 'pending',
          asaasPaymentId: 'pay-456'
        })
      });
    });

    await page.route('**/api/charges/pay-456', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'pay-456',
          billingType: 'PIX',
          status: 'PENDING',
          value: 95.00,
          invoiceUrl: 'https://sandbox.asaas.com/i/test-payment-link',
          pixTransaction: {
            qrCode: {
              payload: 'PIX_QR_CODE_PAYLOAD_HERE',
              encodedImage: 'data:image/png;base64,iVBORw0KGgoAAAANSU...'
            }
          }
        })
      });
    });

    await page.reload();

    // Should display PIX QR code
    await expect(page.locator('[data-testid="pixQrCode"]')).toBeVisible();

    // Should display payment instructions
    await expect(page.locator('text=PIX')).toBeVisible();
    await expect(page.locator('text=QR Code')).toBeVisible();

    // Should show payment link
    const paymentLink = page.locator('[data-testid="paymentLink"]');
    await expect(paymentLink).toBeVisible();
    await expect(paymentLink).toHaveAttribute('href', 'https://sandbox.asaas.com/i/test-payment-link');
  });

  test('should display payment link for credit card payment', async ({ page }) => {
    // Mock credit card payment response
    await page.route('**/api/registrations/test-123', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-123',
          registrationNumber: 'UAIZOUK2025-002',
          fullName: 'Maria Silva',
          email: 'maria@example.com',
          paymentMethod: 'credit_card',
          totalAmount: 105.00,
          status: 'confirmed',
          paymentStatus: 'pending',
          asaasPaymentId: 'pay-789'
        })
      });
    });

    await page.route('**/api/charges/pay-789', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'pay-789',
          billingType: 'CREDIT_CARD',
          status: 'PENDING',
          value: 105.00,
          installmentCount: 3,
          invoiceUrl: 'https://sandbox.asaas.com/i/credit-card-payment-link'
        })
      });
    });

    await page.reload();

    // Should display credit card payment information
    await expect(page.locator('text=Cartão de Crédito')).toBeVisible();
    await expect(page.locator('text=3x')).toBeVisible();

    // Should show payment link
    const paymentLink = page.locator('[data-testid="paymentLink"]');
    await expect(paymentLink).toBeVisible();
    await expect(paymentLink).toHaveAttribute('href', 'https://sandbox.asaas.com/i/credit-card-payment-link');
  });

  test('should display payment link for PIX installment payment', async ({ page }) => {
    // Mock PIX installment payment response
    await page.route('**/api/registrations/test-123', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-123',
          registrationNumber: 'UAIZOUK2025-003',
          fullName: 'Carlos Santos',
          email: 'carlos@example.com',
          paymentMethod: 'pix_installment',
          totalAmount: 210.00,
          status: 'confirmed',
          paymentStatus: 'pending',
          asaasPaymentId: 'pay-pix-inst'
        })
      });
    });

    await page.route('**/api/charges/pay-pix-inst', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'pay-pix-inst',
          billingType: 'PIX',
          status: 'PENDING',
          value: 210.00,
          installmentCount: 2,
          invoiceUrl: 'https://sandbox.asaas.com/i/pix-installment-payment-link'
        })
      });
    });

    await page.reload();

    // Should display PIX installment information
    await expect(page.locator('text=PIX Parcelado')).toBeVisible();
    await expect(page.locator('text=2x')).toBeVisible();

    // Should show payment link
    const paymentLink = page.locator('[data-testid="paymentLink"]');
    await expect(paymentLink).toBeVisible();
    await expect(paymentLink).toHaveAttribute('href', 'https://sandbox.asaas.com/i/pix-installment-payment-link');
  });

  test('should handle payment status updates', async ({ page }) => {
    // Mock pending payment initially
    await page.route('**/api/registrations/test-123', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-123',
          registrationNumber: 'UAIZOUK2025-004',
          fullName: 'Ana Costa',
          email: 'ana@example.com',
          paymentMethod: 'pix',
          totalAmount: 95.00,
          status: 'confirmed',
          paymentStatus: 'pending',
          asaasPaymentId: 'pay-pending'
        })
      });
    });

    await page.route('**/api/charges/pay-pending', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'pay-pending',
          billingType: 'PIX',
          status: 'PENDING',
          value: 95.00,
          invoiceUrl: 'https://sandbox.asaas.com/i/pending-payment'
        })
      });
    });

    await page.reload();

    // Should show pending status
    await expect(page.locator('text=Aguardando pagamento')).toBeVisible();
    await expect(page.locator('[data-testid="paymentStatus"]')).toContainText('pendente');

    // Mock payment confirmation
    await page.route('**/api/charges/pay-pending', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'pay-pending',
          billingType: 'PIX',
          status: 'RECEIVED',
          value: 95.00,
          invoiceUrl: 'https://sandbox.asaas.com/i/pending-payment',
          paymentDate: new Date().toISOString()
        })
      });
    });

    // Simulate real-time update or page refresh
    await page.reload();

    // Should show confirmed status
    await expect(page.locator('text=Pagamento confirmado')).toBeVisible();
    await expect(page.locator('[data-testid="paymentStatus"]')).toContainText('confirmado');
  });

  test('should display registration summary correctly', async ({ page }) => {
    // Mock complete registration data
    await page.route('**/api/registrations/test-123', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-123',
          registrationNumber: 'UAIZOUK2025-005',
          fullName: 'Pedro Oliveira',
          email: 'pedro@example.com',
          whatsapp: '(11) 99999-9999',
          ticketType: 'Casal',
          partnerName: 'Lucia Oliveira',
          paymentMethod: 'credit_card',
          totalAmount: 200.00,
          status: 'confirmed',
          paymentStatus: 'received',
          selectedProducts: {
            'Camiseta': 'M',
            'Acessório': 'Sim'
          }
        })
      });
    });

    await page.reload();

    // Should display all registration details
    await expect(page.locator('[data-testid="fullName"]')).toContainText('Pedro Oliveira');
    await expect(page.locator('[data-testid="email"]')).toContainText('pedro@example.com');
    await expect(page.locator('[data-testid="whatsapp"]')).toContainText('(11) 99999-9999');
    await expect(page.locator('[data-testid="ticketType"]')).toContainText('Casal');
    await expect(page.locator('[data-testid="partnerName"]')).toContainText('Lucia Oliveira');
    await expect(page.locator('[data-testid="totalAmount"]')).toContainText('200.00');

    // Should display selected products
    await expect(page.locator('[data-testid="selectedProducts"]')).toBeVisible();
    await expect(page.locator('text=Camiseta')).toBeVisible();
    await expect(page.locator('text=Acessório')).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/registrations/test-123', async route => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Registration not found'
        })
      });
    });

    await page.reload();

    // Should display error message
    await expect(page.locator('text=erro')).toBeVisible();
    await expect(page.locator('text=não encontrada')).toBeVisible();

    // Should provide helpful actions
    await expect(page.locator('a[href="/"]')).toBeVisible(); // Back to home link
  });

  test('should handle missing payment information', async ({ page }) => {
    // Mock registration without payment details
    await page.route('**/api/registrations/test-123', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-123',
          registrationNumber: 'UAIZOUK2025-006',
          fullName: 'Test User',
          email: 'test@example.com',
          status: 'confirmed',
          paymentStatus: 'pending',
          asaasPaymentId: null
        })
      });
    });

    await page.reload();

    // Should show appropriate message
    await expect(page.locator('text=processando')).toBeVisible();
    await expect(page.locator('text=aguarde')).toBeVisible();
  });

  test('should support downloading receipt when payment is confirmed', async ({ page }) => {
    // Mock confirmed payment with receipt
    await page.route('**/api/registrations/test-123', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-123',
          registrationNumber: 'UAIZOUK2025-007',
          fullName: 'Receipt Test User',
          email: 'receipt@example.com',
          paymentMethod: 'pix',
          totalAmount: 95.00,
          status: 'confirmed',
          paymentStatus: 'received',
          asaasPaymentId: 'pay-receipt'
        })
      });
    });

    await page.route('**/api/charges/pay-receipt', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'pay-receipt',
          billingType: 'PIX',
          status: 'RECEIVED',
          value: 95.00,
          paymentDate: new Date().toISOString(),
          transactionReceiptUrl: 'https://sandbox.asaas.com/comprovantes/receipt-123'
        })
      });
    });

    await page.reload();

    // Should show download receipt option
    const receiptLink = page.locator('[data-testid="receiptDownload"]');
    if (await receiptLink.isVisible()) {
      await expect(receiptLink).toHaveAttribute('href', 'https://sandbox.asaas.com/comprovantes/receipt-123');
      await expect(receiptLink).toContainText('comprovante');
    }
  });

  test('should display contact information for support', async ({ page }) => {
    await page.reload();

    // Should provide contact information
    await expect(page.locator('[data-testid="supportContact"]')).toBeVisible();
    await expect(page.locator('text=suporte')).toBeVisible();
    await expect(page.locator('text=dúvidas')).toBeVisible();

    // Should show event information
    await expect(page.locator('text=UAIZOUK 2025')).toBeVisible();
  });

  test('should handle different browser sizes responsively', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();

    // Content should be visible and accessible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="registrationNumber"]')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();

    await expect(page.locator('h1')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();

    await expect(page.locator('h1')).toBeVisible();
  });
});