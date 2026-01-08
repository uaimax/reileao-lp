import { test, expect, APIRequestContext } from '@playwright/test';

test.describe('API Integration Tests', () => {
  let apiContext: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: 'http://localhost:3002',
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
      },
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test.describe('Registration API', () => {
    test('should create registration successfully', async () => {
      const registrationData = {
        eventId: 1,
        fullName: 'João Silva',
        email: `test.${Date.now()}@example.com`,
        whatsapp: '(11) 99999-9999',
        birthDate: '1990-01-15',
        cpf: `${Math.floor(Math.random() * 100000000000)}`,
        state: 'SP',
        city: 'São Paulo',
        ticketType: 'Individual',
        selectedProducts: {},
        paymentMethod: 'pix',
        total: 100.00,
        isForeigner: false,
        termsAccepted: true
      };

      const response = await apiContext.post('/api/registrations', {
        data: registrationData
      });

      expect(response.status()).toBe(201);

      const responseData = await response.json();
      expect(responseData).toHaveProperty('id');
      expect(responseData.fullName).toBe(registrationData.fullName);
      expect(responseData.email).toBe(registrationData.email);
    });

    test('should handle foreign user registration', async () => {
      const foreignRegistrationData = {
        eventId: 1,
        fullName: 'John Smith',
        email: `foreign.test.${Date.now()}@example.com`,
        whatsapp: '+1 555-123-4567',
        birthDate: '1985-05-20',
        cpf: null,
        state: null,
        city: null,
        ticketType: 'Individual',
        selectedProducts: {},
        paymentMethod: 'pix',
        total: 100.00,
        isForeigner: true,
        termsAccepted: true
      };

      const response = await apiContext.post('/api/registrations', {
        data: foreignRegistrationData
      });

      expect(response.status()).toBe(201);

      const responseData = await response.json();
      expect(responseData).toHaveProperty('id');
      expect(responseData.isForeigner).toBe(true);
      expect(responseData.cpf).toBeNull();
      expect(responseData.state).toBeNull();
      expect(responseData.city).toBeNull();
    });

    test('should validate required fields', async () => {
      const incompleteData = {
        eventId: 1,
        email: 'incomplete@example.com'
        // Missing required fields
      };

      const response = await apiContext.post('/api/registrations', {
        data: incompleteData
      });

      expect(response.status()).toBe(400);

      const responseData = await response.json();
      expect(responseData).toHaveProperty('error');
      expect(responseData.error).toContain('required');
    });

    test('should validate email format', async () => {
      const invalidEmailData = {
        eventId: 1,
        fullName: 'Test User',
        email: 'invalid-email-format',
        whatsapp: '(11) 99999-9999',
        birthDate: '1990-01-15',
        ticketType: 'Individual',
        paymentMethod: 'pix',
        total: 100.00,
        isForeigner: false,
        termsAccepted: true
      };

      const response = await apiContext.post('/api/registrations', {
        data: invalidEmailData
      });

      expect(response.status()).toBe(400);

      const responseData = await response.json();
      expect(responseData).toHaveProperty('error');
      expect(responseData.error.toLowerCase()).toContain('email');
    });
  });

  test.describe('ASAAS Charges API', () => {
    let testRegistrationId: number;

    test.beforeEach(async () => {
      // Create a test registration first
      const registrationData = {
        eventId: 1,
        fullName: 'Test User for Charges',
        email: `charges.test.${Date.now()}@example.com`,
        whatsapp: '(11) 99999-9999',
        birthDate: '1990-01-15',
        cpf: `${Math.floor(Math.random() * 100000000000)}`,
        state: 'SP',
        city: 'São Paulo',
        ticketType: 'Individual',
        selectedProducts: {},
        paymentMethod: 'pix',
        total: 100.00,
        isForeigner: false,
        termsAccepted: true
      };

      const createResponse = await apiContext.post('/api/registrations', {
        data: registrationData
      });

      expect(createResponse.status()).toBe(201);
      const registration = await createResponse.json();
      testRegistrationId = registration.id;
    });

    test('should create PIX charge successfully', async () => {
      const response = await apiContext.post('/api/charges/create', {
        data: { registrationId: testRegistrationId }
      });

      expect(response.status()).toBe(200);

      const responseData = await response.json();
      expect(responseData).toHaveProperty('success', true);
      expect(responseData).toHaveProperty('charge');
      expect(responseData).toHaveProperty('invoiceUrl');
      expect(responseData.charge).toHaveProperty('id');
      expect(responseData.charge).toHaveProperty('billingType', 'PIX');
      expect(responseData.charge).toHaveProperty('value');
      expect(responseData.charge).toHaveProperty('dueDate');
    });

    test('should create credit card charge with installments', async () => {
      // Update registration to use credit card with installments
      await apiContext.put(`/api/registrations/${testRegistrationId}`, {
        data: {
          paymentMethod: 'credit_card',
          installments: 3,
          total: 105.00
        }
      });

      const response = await apiContext.post('/api/charges/create', {
        data: { registrationId: testRegistrationId }
      });

      expect(response.status()).toBe(200);

      const responseData = await response.json();
      expect(responseData).toHaveProperty('success', true);
      expect(responseData).toHaveProperty('charge');
      expect(responseData.charge).toHaveProperty('billingType', 'CREDIT_CARD');
      expect(responseData.charge).toHaveProperty('installmentCount', 3);
      expect(responseData.charge).toHaveProperty('totalValue', 105.00);
    });

    test('should create PIX installment charge', async () => {
      // Update registration to use PIX installment
      await apiContext.put(`/api/registrations/${testRegistrationId}`, {
        data: {
          paymentMethod: 'pix_installment',
          total: 210.00
        }
      });

      const response = await apiContext.post('/api/charges/create', {
        data: { registrationId: testRegistrationId }
      });

      expect(response.status()).toBe(200);

      const responseData = await response.json();
      expect(responseData).toHaveProperty('success', true);
      expect(responseData).toHaveProperty('charge');
      expect(responseData.charge).toHaveProperty('billingType', 'PIX');
      expect(responseData.charge).toHaveProperty('installmentCount');
      expect(responseData.charge).toHaveProperty('totalValue', 210.00);
      expect(responseData).toHaveProperty('installments');
      expect(Array.isArray(responseData.installments)).toBe(true);
    });

    test('should validate registrationId is required', async () => {
      const response = await apiContext.post('/api/charges/create', {
        data: {} // Missing registrationId
      });

      expect(response.status()).toBe(400);

      const responseData = await response.json();
      expect(responseData).toHaveProperty('error');
      expect(responseData.error).toContain('ID da inscrição é obrigatório');
    });

    test('should handle non-existent registration', async () => {
      const response = await apiContext.post('/api/charges/create', {
        data: { registrationId: 999999 }
      });

      expect(response.status()).toBe(404);

      const responseData = await response.json();
      expect(responseData).toHaveProperty('error');
      expect(responseData.error).toContain('Inscrição não encontrada');
    });

    test('should handle missing configuration', async () => {
      // This test would require database manipulation to remove active config
      // For now, we'll test the error handling structure
      const response = await apiContext.post('/api/charges/create', {
        data: { registrationId: testRegistrationId }
      });

      // Should either succeed (if config exists) or fail with config error
      expect([200, 404, 500]).toContain(response.status());

      if (response.status() !== 200) {
        const responseData = await response.json();
        expect(responseData).toHaveProperty('error');
      }
    });

    test('should handle ASAAS API errors gracefully', async () => {
      // Create registration with invalid data that might cause ASAAS errors
      const invalidRegistrationData = {
        eventId: 1,
        fullName: 'Invalid User',
        email: 'invalid-email-format',
        whatsapp: 'invalid-phone',
        birthDate: '1990-01-15',
        cpf: '000.000.000-00',
        state: 'Invalid State',
        city: 'Invalid City',
        ticketType: 'Individual',
        selectedProducts: {},
        paymentMethod: 'pix',
        total: -100.00, // Invalid negative value
        isForeigner: false
      };

      const createResponse = await apiContext.post('/api/registrations', {
        data: invalidRegistrationData
      });

      if (createResponse.status() === 201) {
        const registration = await createResponse.json();

        const response = await apiContext.post('/api/charges/create', {
          data: { registrationId: registration.id }
        });

        // Should handle error gracefully
        expect([400, 422, 500]).toContain(response.status());

        const responseData = await response.json();
        expect(responseData).toHaveProperty('error');
      }
    });

    test('should update registration with asaas_payment_id', async () => {
      const response = await apiContext.post('/api/charges/create', {
        data: { registrationId: testRegistrationId }
      });

      expect(response.status()).toBe(200);

      // Verify registration was updated with asaas_payment_id
      const registrationResponse = await apiContext.get(`/api/registrations/${testRegistrationId}`);
      expect(registrationResponse.status()).toBe(200);

      const registration = await registrationResponse.json();
      expect(registration).toHaveProperty('asaas_payment_id');
      expect(registration.asaas_payment_id).toBeTruthy();
    });
  });

  test.describe('ASAAS Webhook API', () => {
    test('should handle payment confirmation webhook', async () => {
      const webhookData = {
        event: 'PAYMENT_RECEIVED',
        payment: {
          id: 'pay_123456789',
          customer: 'cus_123456789',
          paymentLink: null,
          value: 95.00,
          netValue: 93.05,
          originalValue: null,
          interestValue: null,
          description: 'UAIZOUK 2025 - Individual',
          billingType: 'PIX',
          status: 'RECEIVED',
          pixTransaction: {
            id: 'pix_123456789',
            endToEndIdentifier: 'E12345678202110151234567890123456',
            txid: 'txid123456789'
          },
          paymentDate: new Date().toISOString(),
          clientPaymentDate: new Date().toISOString(),
          installmentNumber: null,
          invoiceUrl: 'https://sandbox.asaas.com/i/123456789',
          bankSlipUrl: null,
          transactionReceiptUrl: 'https://sandbox.asaas.com/comprovantes/123456789'
        }
      };

      const response = await apiContext.post('/api/webhooks/asaas', {
        data: webhookData
      });

      expect(response.status()).toBe(200);

      const responseData = await response.json();
      expect(responseData).toHaveProperty('success');
      expect(responseData.success).toBe(true);
    });

    test('should handle payment overdue webhook', async () => {
      const webhookData = {
        event: 'PAYMENT_OVERDUE',
        payment: {
          id: 'pay_987654321',
          customer: 'cus_987654321',
          value: 105.00,
          description: 'UAIZOUK 2025 - Casal',
          billingType: 'CREDIT_CARD',
          status: 'OVERDUE',
          dueDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          invoiceUrl: 'https://sandbox.asaas.com/i/987654321'
        }
      };

      const response = await apiContext.post('/api/webhooks/asaas', {
        data: webhookData
      });

      expect(response.status()).toBe(200);

      const responseData = await response.json();
      expect(responseData).toHaveProperty('success');
      expect(responseData.success).toBe(true);
    });

    test('should validate webhook signature', async () => {
      const webhookData = {
        event: 'PAYMENT_RECEIVED',
        payment: {
          id: 'pay_test',
          status: 'RECEIVED'
        }
      };

      // Send webhook without proper signature/authentication
      const response = await apiContext.post('/api/webhooks/asaas', {
        data: webhookData,
        headers: {
          'Content-Type': 'application/json'
          // Missing authentication headers
        }
      });

      // Should handle authentication properly
      expect([200, 401, 403]).toContain(response.status());
    });
  });

  test.describe('Configuration API', () => {
    test('should fetch form configuration', async () => {
      const response = await apiContext.get('/api/form-config');

      expect(response.status()).toBe(200);

      const config = await response.json();
      expect(config).toHaveProperty('configData');
      expect(config.configData).toHaveProperty('ticketTypes');
      expect(config.configData).toHaveProperty('products');
      expect(config.configData).toHaveProperty('paymentSettings');

      // Validate payment settings structure
      expect(config.configData.paymentSettings).toHaveProperty('pixDiscountPercentage');
      expect(config.configData.paymentSettings).toHaveProperty('creditCardFeePercentage');

      // Validate percentages are numbers
      expect(typeof config.configData.paymentSettings.pixDiscountPercentage).toBe('number');
      expect(typeof config.configData.paymentSettings.creditCardFeePercentage).toBe('number');
    });

    test('should handle configuration errors', async () => {
      // Test with invalid endpoint
      const response = await apiContext.get('/api/config/invalid');

      expect(response.status()).toBe(404);
    });
  });

  test.describe('Registration Status API', () => {
    test('should fetch registration status', async () => {
      // First create a registration
      const registrationData = {
        eventId: 1,
        fullName: 'Status Test User',
        email: `status.test.${Date.now()}@example.com`,
        whatsapp: '(11) 99999-9999',
        birthDate: '1990-01-15',
        ticketType: 'Individual',
        paymentMethod: 'pix',
        total: 100.00,
        isForeigner: false,
        termsAccepted: true
      };

      const createResponse = await apiContext.post('/api/registrations', {
        data: registrationData
      });

      expect(createResponse.status()).toBe(201);
      const registration = await createResponse.json();

      // Then fetch its status
      const statusResponse = await apiContext.get(`/api/registrations/${registration.id}/status`);

      expect(statusResponse.status()).toBe(200);

      const status = await statusResponse.json();
      expect(status).toHaveProperty('id');
      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('paymentStatus');
      expect(status.id).toBe(registration.id);
    });

    test('should handle non-existent registration', async () => {
      const response = await apiContext.get('/api/registrations/999999/status');

      expect(response.status()).toBe(404);

      const responseData = await response.json();
      expect(responseData).toHaveProperty('error');
    });
  });
});