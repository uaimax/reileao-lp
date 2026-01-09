/**
 * Script de Teste do Meta Pixel
 * Execute este script no console do navegador para testar todos os eventos
 * Configurar SITE_NAME via variável de ambiente antes de executar
 */

// Nome do evento/site - para testes, usar valor de exemplo ou configurar
const SITE_NAME = typeof process !== 'undefined' && process.env
  ? (process.env.SITE_NAME || process.env.VITE_SITE_NAME || 'Meu Evento')
  : 'Meu Evento';

console.log(`🧪 INICIANDO TESTE DO META PIXEL - ${SITE_NAME}`);
console.log('Dataset ID: 630477477390150');

// Verificar se o Meta Pixel está carregado
if (typeof window.fbq !== 'undefined') {
  console.log('✅ Meta Pixel carregado com sucesso');
  console.log('fbq disponível:', typeof window.fbq);
} else {
  console.error('❌ Meta Pixel não encontrado');
}

// Função para testar eventos
function testMetaPixelEvents() {
  console.log('\n🎯 TESTANDO EVENTOS DO META PIXEL...\n');

  // 1. Teste PageView
  console.log('1. Testando PageView...');
  window.fbq('track', 'PageView', {
    page_name: 'Test Page'
  });
  console.log('✅ PageView enviado');

  // 2. Teste Lead
  console.log('2. Testando Lead...');
  window.fbq('track', 'Lead', {
    value: 449,
    currency: 'BRL',
    content_name: `${SITE_NAME} Event Registration`,
    content_category: 'event'
  });
  console.log('✅ Lead enviado');

  // 3. Teste ViewContent
  console.log('3. Testando ViewContent...');
  window.fbq('track', 'ViewContent', {
    content_name: `${SITE_NAME} 2026`,
    content_ids: ['landing-page'],
    content_type: 'product',
    content_category: 'event'
  });
  console.log('✅ ViewContent enviado');

  // 4. Teste InitiateCheckout
  console.log('4. Testando InitiateCheckout...');
  window.fbq('track', 'InitiateCheckout', {
    value: 449,
    currency: 'BRL',
    content_ids: ['event-ticket'],
    content_type: 'product'
  });
  console.log('✅ InitiateCheckout enviado');

  // 5. Teste CompleteRegistration
  console.log('5. Testando CompleteRegistration...');
  window.fbq('track', 'CompleteRegistration', {
    value: 449,
    currency: 'BRL',
    content_name: 'Event Registration'
  });
  console.log('✅ CompleteRegistration enviado');

  // 6. Teste Purchase
  console.log('6. Testando Purchase...');
  window.fbq('track', 'Purchase', {
    value: 449,
    currency: 'BRL',
    content_ids: ['event-ticket'],
    content_type: 'product'
  });
  console.log('✅ Purchase enviado');

  // 7. Teste Search
  console.log('7. Testando Search...');
  window.fbq('track', 'Search', {
    search_string: SITE_NAME.toLowerCase()
  });
  console.log('✅ Search enviado');

  // 8. Teste eventos customizados
  console.log('8. Testando eventos customizados...');

  // LandingPageView
  window.fbq('trackCustom', 'LandingPageView', {
    content_name: `${SITE_NAME} 2026`,
    content_category: 'event',
    event_name: `${SITE_NAME} 2026`,
    event_date: '5–7 SET 2025'
  });
  console.log('✅ LandingPageView customizado enviado');

  // NoEscuroPageView
  window.fbq('trackCustom', 'NoEscuroPageView', {
    content_name: 'O Pacote no Escuro',
    content_category: 'special-offer',
    event_name: `${SITE_NAME} 2026`,
    offer_type: 'early-bird',
    price: 449,
    currency: 'BRL'
  });
  console.log('✅ NoEscuroPageView customizado enviado');

  // CTAClick
  window.fbq('trackCustom', 'CTAClick', {
    content_name: 'QUERO PARTICIPAR',
    content_category: 'cta',
    button_text: 'QUERO PARTICIPAR',
    event_name: `${SITE_NAME} 2026`,
    cta_type: 'primary'
  });
  console.log('✅ CTAClick customizado enviado');

  // RegistrationFormView
  window.fbq('trackCustom', 'RegistrationFormView', {
    content_name: 'Event Registration Form',
    content_category: 'form',
    event_name: `${SITE_NAME} 2026`
  });
  console.log('✅ RegistrationFormView customizado enviado');

  // RegistrationSubmit
  window.fbq('trackCustom', 'RegistrationSubmit', {
    content_name: 'Event Registration',
    content_category: 'form',
    event_name: `${SITE_NAME} 2026`,
    ticket_type: 'full-pass',
    payment_method: 'pix',
    total_value: 449,
    currency: 'BRL',
    is_foreigner: false,
    has_partner: false
  });
  console.log('✅ RegistrationSubmit customizado enviado');

  // RegistrationComplete
  window.fbq('trackCustom', 'RegistrationComplete', {
    content_name: 'Event Registration Complete',
    content_category: 'conversion',
    event_name: `${SITE_NAME} 2026`,
    registration_id: 'TEST123',
    ticket_type: 'full-pass',
    payment_method: 'pix',
    total_value: 449,
    currency: 'BRL',
    is_foreigner: false,
    has_partner: false
  });
  console.log('✅ RegistrationComplete customizado enviado');

  // RegistrationConfirmationView
  window.fbq('trackCustom', 'RegistrationConfirmationView', {
    content_name: 'Registration Confirmation',
    content_category: 'conversion',
    registration_id: 'TEST123',
    ticket_type: 'full-pass',
    payment_method: 'pix',
    total_value: 449,
    currency: 'BRL',
    is_foreigner: false,
    has_partner: false,
    installments: 1,
    payment_status: 'pending'
  });
  console.log('✅ RegistrationConfirmationView customizado enviado');

  // RegistrationSearch
  window.fbq('trackCustom', 'RegistrationSearch', {
    content_name: 'Registration Search',
    content_category: 'search',
    search_string: 'test@example.com',
    search_type: 'email'
  });
  console.log('✅ RegistrationSearch customizado enviado');

  // HeroCTAClick
  window.fbq('trackCustom', 'HeroCTAClick', {
    content_name: 'QUERO SABER MAIS',
    content_category: 'cta',
    button_text: 'QUERO SABER MAIS',
    event_name: `${SITE_NAME} 2026`,
    cta_type: 'primary'
  });
  console.log('✅ HeroCTAClick customizado enviado');

  console.log('\n🎉 TODOS OS TESTES CONCLUÍDOS!');
  console.log('Verifique no Meta Events Manager se os eventos apareceram.');
}

// Executar os testes
testMetaPixelEvents();

// Função para testar eventos específicos de uma página
function testPageSpecificEvents(pageName) {
  console.log(`\n🎯 TESTANDO EVENTOS ESPECÍFICOS DA PÁGINA: ${pageName}`);

  switch(pageName.toLowerCase()) {
    case 'landing':
    case 'home':
    case '/':
      window.fbq('trackCustom', 'LandingPageView', {
        content_name: `${SITE_NAME} 2026`,
        content_category: 'event',
        event_name: `${SITE_NAME} 2026`
      });
      console.log('✅ LandingPageView testado');
      break;

    case 'no-escuro':
    case 'noescuro':
      window.fbq('trackCustom', 'NoEscuroPageView', {
        content_name: 'O Pacote no Escuro',
        content_category: 'special-offer',
        offer_type: 'early-bird',
        price: 449,
        currency: 'BRL'
      });
      console.log('✅ NoEscuroPageView testado');
      break;

    case 'inscricao':
    case 'registration':
      window.fbq('trackCustom', 'RegistrationFormView', {
        content_name: 'Event Registration Form',
        content_category: 'form'
      });
      console.log('✅ RegistrationFormView testado');
      break;

    default:
      console.log('Página não reconhecida. Use: landing, no-escuro, inscricao');
  }
}

// Disponibilizar funções globalmente para teste manual
window.testMetaPixelEvents = testMetaPixelEvents;
window.testPageSpecificEvents = testPageSpecificEvents;

console.log('\n📋 COMANDOS DISPONÍVEIS:');
console.log('- testMetaPixelEvents() - Testa todos os eventos');
console.log('- testPageSpecificEvents("landing") - Testa eventos específicos');
console.log('- testPageSpecificEvents("no-escuro") - Testa página No Escuro');
console.log('- testPageSpecificEvents("inscricao") - Testa formulário');

