#!/usr/bin/env node

// Script para Corrigir Telefones usando campo mobilePhone do ASAAS
// Versão corrigida que usa o campo correto

const https = require('https');
const postgres = require('postgres');

const ASAAS_URL = 'https://api.asaas.com/v3';
const API_KEY = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjJlMDA3YWEwLWNiNDEtNDMxYy1hMmQ0LTAzOTBmNDRkY2Q3NTo6JGFhY2hfNGU5YzliMzMtY2M3MC00MWRmLTgyZDQtNzViZGQ3ZTY2OWZh';

// Configuração do banco
const connectionString = 'postgresql://uaizouklp_owner:npg_BgyoHlKF1Tu3@ep-mute-base-a8dewk2d-pooler.eastus2.azure.neon.tech:5432/uaizouklp?sslmode=require';
const client = postgres(connectionString);

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout da requisição'));
    }, 15000);

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
        clearTimeout(timeout);
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          reject(new Error(`Erro ao fazer parse do JSON: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    req.setTimeout(15000, () => {
      clearTimeout(timeout);
      req.destroy();
      reject(new Error('Timeout da requisição'));
    });

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

async function fixPhoneNumbersCorrect() {
  console.log('📱 CORRIGINDO TELEFONES USANDO CAMPO mobilePhone DO ASAAS');
  console.log('========================================================');
  
  try {
    // 1. Buscar registros com telefones problemáticos
    console.log('\n🔍 Buscando registros com telefones problemáticos...');
    
    const problematicRegistrations = await client`
      SELECT id, cpf, full_name, email, whatsapp, created_at
      FROM event_registrations 
      WHERE created_at >= '2024-09-01'
      AND (whatsapp = '11999999999' OR whatsapp IS NULL)
      ORDER BY created_at DESC
    `;
    
    console.log(`   - Encontrados ${problematicRegistrations.length} registros com telefones problemáticos`);
    
    if (problematicRegistrations.length === 0) {
      console.log('   ✅ Nenhum telefone problemático encontrado!');
      return;
    }
    
    let fixedCount = 0;
    let notFoundCount = 0;
    let errorCount = 0;
    let noPhoneCount = 0;
    
    // 2. Para cada registro, buscar telefone correto no ASAAS
    for (let i = 0; i < problematicRegistrations.length; i++) {
      const registration = problematicRegistrations[i];
      
      try {
        console.log(`\n📞 [${i + 1}/${problematicRegistrations.length}] Verificando: ${registration.full_name}`);
        console.log(`   - CPF: ${registration.cpf}`);
        console.log(`   - Telefone atual: ${registration.whatsapp}`);
        
        // Buscar cliente no ASAAS por CPF
        const customerResponse = await makeRequest(`${ASAAS_URL}/customers?cpfCnpj=${registration.cpf}`);
        
        if (customerResponse.status === 200 && customerResponse.data.data.length > 0) {
          const asaasCustomer = customerResponse.data.data[0];
          const asaasPhone = asaasCustomer.phone;
          const asaasMobilePhone = asaasCustomer.mobilePhone;
          
          console.log(`   - Telefone (phone): ${asaasPhone || 'Não informado'}`);
          console.log(`   - Telefone (mobilePhone): ${asaasMobilePhone || 'Não informado'}`);
          
          // Usar mobilePhone como prioridade, depois phone
          const phoneToUse = asaasMobilePhone || asaasPhone;
          
          if (phoneToUse && phoneToUse !== 'Não informado') {
            const normalizedPhone = normalizePhone(phoneToUse);
            
            if (normalizedPhone && normalizedPhone !== registration.whatsapp) {
              console.log(`   - Telefone normalizado: ${normalizedPhone}`);
              
              // Atualizar telefone na base local
              try {
                await client`
                  UPDATE event_registrations
                  SET whatsapp = ${normalizedPhone},
                      updated_at = CURRENT_TIMESTAMP
                  WHERE id = ${registration.id}
                `;
                
                console.log(`   ✅ Telefone atualizado com sucesso!`);
                fixedCount++;
                
              } catch (updateError) {
                console.log(`   ❌ Erro ao atualizar telefone: ${updateError.message}`);
                errorCount++;
              }
            } else {
              console.log(`   ⚠️ Telefone já está correto ou não pode ser normalizado`);
            }
          } else {
            console.log(`   ⚠️ Sem telefone no ASAAS (nem phone nem mobilePhone)`);
            noPhoneCount++;
          }
        } else {
          console.log(`   ❌ Cliente não encontrado no ASAAS`);
          notFoundCount++;
        }
        
        // Evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.log(`   ❌ Erro ao processar ${registration.full_name}: ${error.message}`);
        errorCount++;
      }
    }
    
    // 3. Resumo da correção
    console.log('\n📊 RESUMO DA CORREÇÃO DE TELEFONES:');
    console.log('====================================');
    console.log(`   - Registros processados: ${problematicRegistrations.length}`);
    console.log(`   - Telefones corrigidos: ${fixedCount}`);
    console.log(`   - Clientes não encontrados: ${notFoundCount}`);
    console.log(`   - Sem telefone no ASAAS: ${noPhoneCount}`);
    console.log(`   - Erros: ${errorCount}`);
    
    // 4. Verificar resultado final
    console.log('\n🔍 Verificando resultado final...');
    
    const finalStats = await client`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN whatsapp = '11999999999' THEN 1 END) as default_phone,
        COUNT(CASE WHEN whatsapp != '11999999999' AND whatsapp IS NOT NULL THEN 1 END) as correct_phone
      FROM event_registrations 
      WHERE created_at >= '2024-09-01'
    `;
    
    const stats = finalStats[0];
    const correctPercentage = (stats.correct_phone / stats.total * 100).toFixed(1);
    
    console.log(`   - Total de registros: ${stats.total}`);
    console.log(`   - Telefones padrão: ${stats.default_phone}`);
    console.log(`   - Telefones corretos: ${stats.correct_phone}`);
    console.log(`   - Taxa de telefones corretos: ${correctPercentage}%`);
    
    if (stats.default_phone === 0) {
      console.log('\n🎉 SUCESSO! Todos os telefones foram corrigidos!');
    } else {
      console.log(`\n⚠️ Ainda restam ${stats.default_phone} telefones para corrigir`);
    }
    
    // 5. Mostrar telefones corrigidos
    if (fixedCount > 0) {
      console.log('\n📱 TELEFONES CORRIGIDOS:');
      const correctedPhones = await client`
        SELECT full_name, whatsapp, updated_at
        FROM event_registrations 
        WHERE created_at >= '2024-09-01'
        AND whatsapp != '11999999999'
        AND updated_at > NOW() - INTERVAL '1 minute'
        ORDER BY updated_at DESC
      `;
      
      correctedPhones.forEach(phone => {
        console.log(`   - ${phone.full_name}: ${phone.whatsapp}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro durante correção de telefones:', error.message);
  } finally {
    console.log('\n✅ Correção de telefones finalizada');
    process.exit(0);
  }
}

// Executar correção com timeout de segurança
const timeout = setTimeout(() => {
  console.log('\n⏰ Timeout de segurança atingido. Finalizando...');
  process.exit(1);
}, 60000);

fixPhoneNumbersCorrect().finally(() => {
  clearTimeout(timeout);
});