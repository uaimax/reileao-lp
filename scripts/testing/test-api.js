#!/usr/bin/env node

// Script simples para testar a API ASAAS
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3002';

async function testAPI() {
  console.log('🧪 Iniciando testes da API ASAAS...\n');

  try {
    // Teste 1: Health check
    console.log('1️⃣ Testando health check...');
    const healthResponse = await fetch(`${API_BASE}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    console.log('');

    // Teste 2: Criar registro
    console.log('2️⃣ Criando registro de teste...');
    const registrationData = {
      eventId: 1,
      fullName: 'Test User API',
      email: `test.api.${Date.now()}@example.com`,
      whatsapp: '+55 11 99999-9999',
      birthDate: '1990-01-01',
      cpf: '12345678901',
      state: 'SP',
      city: 'São Paulo',
      ticketType: 'Individual',
      selectedProducts: {},
      paymentMethod: 'pix',
      total: 100.00,
      isForeigner: false,
      termsAccepted: true
    };

    const registrationResponse = await fetch(`${API_BASE}/api/registrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registrationData)
    });

    const registrationResult = await registrationResponse.json();
    console.log('✅ Registro criado:', {
      status: registrationResponse.status,
      id: registrationResult.id,
      fullName: registrationResult.fullName
    });
    console.log('');

    // Teste 3: Criar cobrança
    console.log('3️⃣ Criando cobrança ASAAS...');
    const chargeResponse = await fetch(`${API_BASE}/api/charges/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ registrationId: registrationResult.id })
    });

    const chargeResult = await chargeResponse.json();
    console.log('📊 Resposta da cobrança:', {
      status: chargeResponse.status,
      success: chargeResult.success,
      error: chargeResult.error,
      type: chargeResult.type
    });

    if (chargeResponse.ok) {
      console.log('✅ Cobrança criada com sucesso!');
      console.log('💰 Charge ID:', chargeResult.charge?.id);
      console.log('🔗 Invoice URL:', chargeResult.invoiceUrl);
    } else {
      console.log('❌ Erro na criação da cobrança:', chargeResult.error);
      if (chargeResult.details) {
        console.log('📋 Detalhes do erro:', chargeResult.details);
      }
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

// Executar teste
testAPI();