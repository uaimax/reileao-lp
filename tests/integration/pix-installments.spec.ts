/**
 * Testes de integração para sistema de parcelas PIX
 * Validação completa do fluxo de parcelas PIX
 */

import { test, expect } from '@playwright/test';

test.describe('PIX Installments System Integration', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navegar para a página de inscrição
    await page.goto('/inscricao');
    
    // Aguardar carregamento da página
    await page.waitForLoadState('networkidle');
  });

  test('deve exibir opção PIX Parcelado quando configurado', async ({ page }) => {
    // Verificar se a opção PIX Parcelado está visível
    const pixInstallmentOption = page.locator('[data-testid="payment-pix_installment"]');
    await expect(pixInstallmentOption).toBeVisible();
    
    // Verificar se tem o texto correto
    await expect(pixInstallmentOption).toContainText('PIX Parcelado');
  });

  test('deve calcular número máximo de parcelas corretamente', async ({ page }) => {
    // Selecionar PIX Parcelado
    await page.click('[data-testid="payment-pix_installment"]');
    
    // Verificar se o número máximo de parcelas é exibido
    const installmentInfo = page.locator('text=/Até \\d+x/');
    await expect(installmentInfo).toBeVisible();
    
    // Verificar se o número está dentro do range esperado (1-12)
    const installmentText = await installmentInfo.textContent();
    const installmentNumber = parseInt(installmentText?.match(/\d+/)?.[0] || '0');
    
    expect(installmentNumber).toBeGreaterThanOrEqual(1);
    expect(installmentNumber).toBeLessThanOrEqual(12);
  });

  test('deve aplicar taxa correta para PIX Parcelado', async ({ page }) => {
    // Preencher dados básicos para chegar na seção de pagamento
    await page.fill('[data-testid="fullName"]', 'João Silva');
    await page.fill('[data-testid="email"]', 'joao@test.com');
    await page.fill('[data-testid="whatsapp"]', '11999999999');
    await page.fill('[data-testid="birthDate"]', '1990-01-01');
    await page.fill('[data-testid="cpf"]', '12345678901');
    await page.selectOption('[data-testid="state"]', 'SP');
    await page.selectOption('[data-testid="city"]', 'São Paulo');
    await page.selectOption('[data-testid="ticketType"]', 'Individual');
    
    // Avançar para seção de produtos
    await page.click('text=Continuar');
    await page.waitForLoadState('networkidle');
    
    // Avançar para seção de pagamento
    await page.click('text=Continuar');
    await page.waitForLoadState('networkidle');
    
    // Selecionar PIX Parcelado
    await page.click('[data-testid="payment-pix_installment"]');
    
    // Verificar se a taxa é aplicada corretamente
    const baseValue = page.locator('[data-testid="baseTotal"]');
    const finalValue = page.locator('[data-testid="finalTotal"]');
    
    await expect(baseValue).toBeVisible();
    await expect(finalValue).toBeVisible();
    
    // Verificar se o valor final é maior que o valor base (devido à taxa)
    const baseValueText = await baseValue.textContent();
    const finalValueText = await finalValue.textContent();
    
    const baseAmount = parseFloat(baseValueText?.replace(/[^\d,]/g, '').replace(',', '.') || '0');
    const finalAmount = parseFloat(finalValueText?.replace(/[^\d,]/g, '').replace(',', '.') || '0');
    
    expect(finalAmount).toBeGreaterThan(baseAmount);
  });

  test('deve exibir checkbox de juros para PIX Parcelado', async ({ page }) => {
    // Preencher dados e chegar na seção de pagamento
    await page.fill('[data-testid="fullName"]', 'João Silva');
    await page.fill('[data-testid="email"]', 'joao@test.com');
    await page.fill('[data-testid="whatsapp"]', '11999999999');
    await page.fill('[data-testid="birthDate"]', '1990-01-01');
    await page.fill('[data-testid="cpf"]', '12345678901');
    await page.selectOption('[data-testid="state"]', 'SP');
    await page.selectOption('[data-testid="city"]', 'São Paulo');
    await page.selectOption('[data-testid="ticketType"]', 'Individual');
    
    await page.click('text=Continuar');
    await page.waitForLoadState('networkidle');
    await page.click('text=Continuar');
    await page.waitForLoadState('networkidle');
    
    // Selecionar PIX Parcelado
    await page.click('[data-testid="payment-pix_installment"]');
    
    // Avançar para seção de resumo
    await page.click('text=Continuar');
    await page.waitForLoadState('networkidle');
    
    // Verificar se o checkbox de juros aparece
    const interestCheckbox = page.locator('[data-testid="interestAccepted"]');
    await expect(interestCheckbox).toBeVisible();
    
    // Verificar se o texto contém informações sobre juros
    const interestLabel = page.locator('text=/juros.*10%.*mês/');
    await expect(interestLabel).toBeVisible();
  });

  test('deve validar que checkbox de juros é obrigatório para PIX Parcelado', async ({ page }) => {
    // Preencher dados e chegar na seção de resumo
    await page.fill('[data-testid="fullName"]', 'João Silva');
    await page.fill('[data-testid="email"]', 'joao@test.com');
    await page.fill('[data-testid="whatsapp"]', '11999999999');
    await page.fill('[data-testid="birthDate"]', '1990-01-01');
    await page.fill('[data-testid="cpf"]', '12345678901');
    await page.selectOption('[data-testid="state"]', 'SP');
    await page.selectOption('[data-testid="city"]', 'São Paulo');
    await page.selectOption('[data-testid="ticketType"]', 'Individual');
    
    await page.click('text=Continuar');
    await page.waitForLoadState('networkidle');
    await page.click('text=Continuar');
    await page.waitForLoadState('networkidle');
    
    // Selecionar PIX Parcelado
    await page.click('[data-testid="payment-pix_installment"]');
    
    await page.click('text=Continuar');
    await page.waitForLoadState('networkidle');
    
    // Aceitar outros termos mas não o de juros
    await page.check('[data-testid="termsAccepted"]');
    await page.check('[data-testid="noRefundAccepted"]');
    await page.check('[data-testid="rescheduleAccepted"]');
    await page.check('[data-testid="withdrawalAccepted"]');
    
    // Tentar finalizar sem aceitar juros
    const finishButton = page.locator('text=💳 Finalizar Pagamento');
    await expect(finishButton).toBeDisabled();
    
    // Aceitar juros
    await page.check('[data-testid="interestAccepted"]');
    
    // Agora o botão deve estar habilitado
    await expect(finishButton).toBeEnabled();
  });

  test('deve exibir informações corretas sobre parcelas', async ({ page }) => {
    // Preencher dados e chegar na seção de pagamento
    await page.fill('[data-testid="fullName"]', 'João Silva');
    await page.fill('[data-testid="email"]', 'joao@test.com');
    await page.fill('[data-testid="whatsapp"]', '11999999999');
    await page.fill('[data-testid="birthDate"]', '1990-01-01');
    await page.fill('[data-testid="cpf"]', '12345678901');
    await page.selectOption('[data-testid="state"]', 'SP');
    await page.selectOption('[data-testid="city"]', 'São Paulo');
    await page.selectOption('[data-testid="ticketType"]', 'Individual');
    
    await page.click('text=Continuar');
    await page.waitForLoadState('networkidle');
    await page.click('text=Continuar');
    await page.waitForLoadState('networkidle');
    
    // Selecionar PIX Parcelado
    await page.click('[data-testid="payment-pix_installment"]');
    
    // Verificar se as informações sobre parcelas são exibidas
    const installmentInfo = page.locator('text=/O numero máximo de parcelas é/');
    await expect(installmentInfo).toBeVisible();
    
    // Verificar se há aviso sobre parcelas
    const installmentWarning = page.locator('text=/ℹ/');
    await expect(installmentWarning).toBeVisible();
  });

  test('deve permitir alternar entre métodos de pagamento', async ({ page }) => {
    // Preencher dados e chegar na seção de pagamento
    await page.fill('[data-testid="fullName"]', 'João Silva');
    await page.fill('[data-testid="email"]', 'joao@test.com');
    await page.fill('[data-testid="whatsapp"]', '11999999999');
    await page.fill('[data-testid="birthDate"]', '1990-01-01');
    await page.fill('[data-testid="cpf"]', '12345678901');
    await page.selectOption('[data-testid="state"]', 'SP');
    await page.selectOption('[data-testid="city"]', 'São Paulo');
    await page.selectOption('[data-testid="ticketType"]', 'Individual');
    
    await page.click('text=Continuar');
    await page.waitForLoadState('networkidle');
    await page.click('text=Continuar');
    await page.waitForLoadState('networkidle');
    
    // Selecionar PIX à vista primeiro
    await page.click('[data-testid="payment-pix"]');
    
    // Verificar se PIX à vista está selecionado
    const pixSelected = page.locator('[data-testid="payment-pix"]');
    await expect(pixSelected).toHaveClass(/border-green-400/);
    
    // Alternar para PIX Parcelado
    await page.click('[data-testid="payment-pix_installment"]');
    
    // Verificar se PIX Parcelado está selecionado
    const pixInstallmentSelected = page.locator('[data-testid="payment-pix_installment"]');
    await expect(pixInstallmentSelected).toHaveClass(/border-blue-400/);
    
    // Verificar se PIX à vista não está mais selecionado
    await expect(pixSelected).not.toHaveClass(/border-green-400/);
  });

  test('deve calcular valores corretamente para diferentes cenários', async ({ page }) => {
    // Preencher dados e chegar na seção de pagamento
    await page.fill('[data-testid="fullName"]', 'João Silva');
    await page.fill('[data-testid="email"]', 'joao@test.com');
    await page.fill('[data-testid="whatsapp"]', '11999999999');
    await page.fill('[data-testid="birthDate"]', '1990-01-01');
    await page.fill('[data-testid="cpf"]', '12345678901');
    await page.selectOption('[data-testid="state"]', 'SP');
    await page.selectOption('[data-testid="city"]', 'São Paulo');
    await page.selectOption('[data-testid="ticketType"]', 'Individual');
    
    await page.click('text=Continuar');
    await page.waitForLoadState('networkidle');
    await page.click('text=Continuar');
    await page.waitForLoadState('networkidle');
    
    // Testar PIX à vista
    await page.click('[data-testid="payment-pix"]');
    const pixBaseValue = await page.locator('[data-testid="baseTotal"]').textContent();
    const pixFinalValue = await page.locator('[data-testid="finalTotal"]').textContent();
    
    // Testar PIX Parcelado
    await page.click('[data-testid="payment-pix_installment"]');
    const pixInstallmentBaseValue = await page.locator('[data-testid="baseTotal"]').textContent();
    const pixInstallmentFinalValue = await page.locator('[data-testid="finalTotal"]').textContent();
    
    // Verificar se os valores base são iguais
    expect(pixBaseValue).toBe(pixInstallmentBaseValue);
    
    // Verificar se PIX Parcelado tem valor final maior (devido à taxa)
    const pixAmount = parseFloat(pixFinalValue?.replace(/[^\d,]/g, '').replace(',', '.') || '0');
    const pixInstallmentAmount = parseFloat(pixInstallmentFinalValue?.replace(/[^\d,]/g, '').replace(',', '.') || '0');
    
    expect(pixInstallmentAmount).toBeGreaterThan(pixAmount);
  });
});