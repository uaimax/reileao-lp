const { chromium } = require('playwright');

// Nome do site - configurável via variável de ambiente
const SITE_NAME = process.env.SITE_NAME || process.env.VITE_SITE_NAME || 'Meu Evento';

async function testBioPage() {
  console.log('🚀 Starting bio page test...');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('📍 Navigating to http://localhost:8080/bio');
    await page.goto('http://localhost:8080/bio', { waitUntil: 'networkidle' });

    console.log('⏳ Waiting for content to load...');
    await page.waitForTimeout(3000);

    // Check if page title is set
    const title = await page.title();
    console.log('📄 Page title:', title);

    // Check for bio content (nome do site)
    const hasSiteName = await page.locator(`text=${SITE_NAME}`).first().isVisible();
    console.log(`🎯 ${SITE_NAME} text visible:`, hasSiteName);

    // Check for bio links
    const linkCount = await page.locator('button').count();
    console.log('🔗 Button count:', linkCount);

    // Check for specific elements
    const hasLinks = await page.locator('text=Inscrições').isVisible();
    console.log('📝 Has Inscrições link:', hasLinks);

    // Take a screenshot
    await page.screenshot({ path: '/tmp/bio-page.png', fullPage: true });
    console.log('📸 Screenshot saved to /tmp/bio-page.png');

    // Check console logs
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));

    await page.reload();
    await page.waitForTimeout(2000);

    console.log('📋 Console logs:');
    logs.forEach(log => console.log('  ', log));

  } catch (error) {
    console.error('❌ Error testing bio page:', error.message);
  } finally {
    await browser.close();
  }
}

testBioPage();