import { chromium } from 'playwright';

async function testProductsSection() {
  console.log('🚀 Iniciando teste de diagnóstico...');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000 // Slower for debugging
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Capturar console logs
  page.on('console', msg => {
    console.log(`📱 CONSOLE [${msg.type()}]:`, msg.text());
  });

  // Capturar erros
  page.on('pageerror', error => {
    console.log(`❌ ERROR:`, error.message);
  });

  try {
    console.log('📍 Navegando para /inscricao...');
    await page.goto('http://localhost:8081/inscricao');

    // Aguardar a página carregar
    await page.waitForSelector('h1');
    console.log('✅ Página carregada');

    // Usar o botão de teste para preencher dados
    console.log('🧪 Preenchendo dados de teste...');
    await page.click('button:has-text("🧪 Preencher Teste")');
    await page.waitForTimeout(2000);

    // Avançar para etapa 2 (tickets)
    console.log('➡️ Avançando para etapa de tickets...');
    await page.click('button:has-text("Continuar")');
    await page.waitForTimeout(1000);

    // Selecionar um ticket
    console.log('🎫 Selecionando ticket...');
    const ticketRadios = await page.locator('input[type="radio"][name="ticketType"]').all();
    if (ticketRadios.length > 0) {
      await ticketRadios[0].click();
      await page.waitForTimeout(1000);
    }

    // Avançar para etapa 3 (produtos)
    console.log('➡️ Avançando para etapa de produtos...');
    await page.click('button:has-text("Continuar")');
    await page.waitForTimeout(2000);

    console.log('🛍️ Chegou na etapa de produtos!');

    // Verificar se existem produtos
    const productCards = await page.locator('[key*="product"]').count();
    console.log(`📦 Encontrados ${productCards} cards de produto`);

    // Tentar encontrar botões "Adicionar"
    const addButtons = await page.locator('button:has-text("+ Adicionar")').all();
    console.log(`🔘 Encontrados ${addButtons.length} botões "Adicionar"`);

    if (addButtons.length > 0) {
      console.log('🎯 Tentando clicar no primeiro botão "Adicionar"...');

      // Verificar se o botão está visível e habilitado
      const firstButton = addButtons[0];
      const isVisible = await firstButton.isVisible();
      const isEnabled = await firstButton.isEnabled();

      console.log(`👁️ Botão visível: ${isVisible}, habilitado: ${isEnabled}`);

      if (isVisible && isEnabled) {
        console.log('🖱️ Clicando no botão...');
        await firstButton.click();
        await page.waitForTimeout(2000);

        // Verificar mudanças após click
        const newAddButtons = await page.locator('button:has-text("+ Adicionar")').all();
        const selectingButtons = await page.locator('button:has-text("✕ Cancelar")').all();
        const confirmedButtons = await page.locator('button:has-text("✕ Remover")').all();

        console.log(`📊 Após click - Adicionar: ${newAddButtons.length}, Cancelar: ${selectingButtons.length}, Remover: ${confirmedButtons.length}`);

        // Verificar se apareceu um select
        const selects = await page.locator('select, [role="combobox"]').all();
        console.log(`📋 Selects encontrados: ${selects.length}`);

      } else {
        console.log('❌ Botão não está clicável');
      }
    } else {
      console.log('❌ Nenhum botão "Adicionar" encontrado');

      // Verificar o HTML atual
      const html = await page.locator('main').innerHTML();
      console.log('🔍 HTML da página:', html.substring(0, 500) + '...');
    }

    // Esperar um pouco para observar
    await page.waitForTimeout(5000);

  } catch (error) {
    console.log('💥 Erro durante teste:', error.message);
  } finally {
    await browser.close();
    console.log('🏁 Teste finalizado');
  }
}

testProductsSection();