import { chromium } from 'playwright';

async function quickTest() {
  console.log('🚀 Teste rápido...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.text().includes('RAW VALUE') || msg.text().includes('📋')) {
      console.log(`📱 ${msg.text()}`);
    }
  });

  try {
    await page.goto('http://localhost:8081/inscricao');
    await page.click('button:has-text("🧪 Preencher Teste")');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Continuar")');
    await page.waitForTimeout(1000);

    const ticketRadios = await page.locator('input[type="radio"][name="ticketType"]').all();
    if (ticketRadios.length > 0) {
      await ticketRadios[0].click();
    }

    await page.click('button:has-text("Continuar")');
    await page.waitForTimeout(1000);

    console.log('🛍️ Na página de produtos, clicando Adicionar...');
    const addButton = page.locator('button:has-text("+ Adicionar")').first();
    await addButton.click();
    await page.waitForTimeout(3000);

  } catch (error) {
    console.log('❌ Erro:', error.message);
  } finally {
    await browser.close();
  }
}

quickTest();