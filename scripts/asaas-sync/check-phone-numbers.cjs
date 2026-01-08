#!/usr/bin/env node

// Script para verificar telefones não aplicados corretamente

const https = require('https');
const postgres = require('postgres');

const ASAAS_URL = 'https://api.asaas.com/v3';
const API_KEY = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjJlMDA3YWEwLWNiNDEtNDMxYy1hMmQ0LTAzOTBmNDRkY2Q3NTo6JGFhY2hfNGU5YzliMzMtY2M3MC00MWRmLTgyZDQtNzViZGQ3ZTY2OWZh';

// Configuração do banco
const connectionString = 'postgresql://uaizouklp_owner:npg_BgyoHlKF1Tu3@ep-mute-base-a8dewk2d-pooler.eastus2.azure.neon.tech:5432/uaizouklp?sslmode=require';
const client = postgres(connectionString);

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: options.method || 'GET',
      headers: {
        'access_token': API_KEY,
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          reject(new Error(`Erro ao fazer parse do JSON: ${error.message}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function normalizePhone(phone) {
  if (!phone) return null;

  // Remover caracteres especiais e espaços
  const cleaned = phone.replace(/[^\d]/g, '');

  // Se tem 11 dígitos e começa com 11, manter como está
  if (cleaned.length === 11 && cleaned.startsWith('11')) {
    return cleaned;
  }

  // Se tem 10 dígitos, adicionar 11 no início
  if (cleaned.length === 10) {
    return '11' + cleaned;
  }

  // Se tem 13 dígitos e começa com 55, remover o 55
  if (cleaned.length === 13 && cleaned.startsWith('55')) {
    return cleaned.substring(2);
  }

  // Se tem 12 dígitos e começa com 55, remover o 55
  if (cleaned.length === 12 && cleaned.startsWith('55')) {
    return cleaned.substring(2);
  }

  return cleaned;
}

async function checkPhoneNumbers() {
  console.log('📱 VERIFICANDO TELEFONES NÃO APLICADOS CORRETAMENTE');

  try {
    // Buscar todos os registros da nossa base
    const ourRegistrations = await client`
      SELECT id, cpf, full_name, email, whatsapp, created_at
      FROM event_registrations
      WHERE created_at >= '2024-09-01'
      ORDER BY created_at DESC
    `;

    console.log(`\n📋 Encontrados ${ourRegistrations.length} registros na nossa base`);

    let customersWithPhoneIssues = [];
    let processedCount = 0;

    for (const registration of ourRegistrations) {
      try {
        // Buscar cliente no ASAAS por CPF
        const customersResponse = await makeRequest(`${ASAAS_URL}/customers?cpfCnpj=${registration.cpf}`);

        if (customersResponse.status === 200 && customersResponse.data.data.length > 0) {
          const asaasCustomer = customersResponse.data.data[0];
          processedCount++;

          console.log(`\n👤 Verificando: ${registration.full_name}`);
          console.log(`   - CPF: ${registration.cpf}`);
          console.log(`   - Telefone na nossa base: ${registration.whatsapp}`);
          console.log(`   - Telefone no ASAAS: ${asaasCustomer.phone || 'Não informado'}`);

          // Verificar se há discrepância
          const ourPhone = registration.whatsapp;
          const asaasPhone = asaasCustomer.phone;
          const normalizedAsaasPhone = normalizePhone(asaasPhone);

          if (asaasPhone && asaasPhone !== 'Não informado') {
            if (ourPhone === '11999999999' || ourPhone !== normalizedAsaasPhone) {
              customersWithPhoneIssues.push({
                id: registration.id,
                name: registration.full_name,
                cpf: registration.cpf,
                ourPhone: ourPhone,
                asaasPhone: asaasPhone,
                normalizedAsaasPhone: normalizedAsaasPhone,
                email: registration.email
              });

              console.log(`   ❌ PROBLEMA ENCONTRADO:`);
              console.log(`   - Telefone nossa base: ${ourPhone}`);
              console.log(`   - Telefone ASAAS: ${asaasPhone}`);
              console.log(`   - Telefone normalizado: ${normalizedAsaasPhone}`);
            } else {
              console.log(`   ✅ Telefone correto`);
            }
          } else {
            console.log(`   ⚠️ Sem telefone no ASAAS`);
          }
        }

        // Evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));

      } catch (error) {
        console.log(`❌ Erro ao verificar ${registration.full_name}: ${error.message}`);
      }
    }

    console.log(`\n📊 RESUMO DA VERIFICAÇÃO:`);
    console.log(`   - Registros verificados: ${processedCount}`);
    console.log(`   - Clientes com problemas de telefone: ${customersWithPhoneIssues.length}`);

    if (customersWithPhoneIssues.length > 0) {
      console.log(`\n📱 CLIENTES COM PROBLEMAS DE TELEFONE:`);

      customersWithPhoneIssues.forEach((customer, index) => {
        console.log(`\n${index + 1}. ${customer.name}`);
        console.log(`   - CPF: ${customer.cpf}`);
        console.log(`   - Email: ${customer.email}`);
        console.log(`   - Telefone nossa base: ${customer.ourPhone}`);
        console.log(`   - Telefone ASAAS: ${customer.asaasPhone}`);
        console.log(`   - Telefone normalizado: ${customer.normalizedAsaasPhone}`);
      });

      console.log(`\n🔧 CORREÇÕES NECESSÁRIAS:`);
      console.log(`   - Atualizar telefones na base local`);
      console.log(`   - Usar telefones do ASAAS como fonte da verdade`);
      console.log(`   - Aplicar normalização correta`);
    }

  } catch (error) {
    console.error('❌ Erro durante verificação:', error.message);
  } finally {
    console.log('✅ Verificação finalizada');
  }
}

// Executar verificação
checkPhoneNumbers();
