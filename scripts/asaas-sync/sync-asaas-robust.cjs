#!/usr/bin/env node

// Sistema de Sincronização Robusto ASAAS -> Base Local
// Integra todas as funcionalidades: normalização, matching, cálculo de status

const https = require('https');
const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

const ASAAS_URL = 'https://api.asaas.com/v3';
const API_KEY = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjJlMDA3YWEwLWNiNDEtNDMxYy1hMmQ0LTAzOTBmNDRkY2Q3NTo6JGFhY2hfNGU5YzliMzMtY2M3MC00MWRmLTgyZDQtNzViZGQ3ZTY2OWZh';

// Configuração do banco
const connectionString = 'postgresql://uaizouklp_owner:npg_BgyoHlKF1Tu3@ep-mute-base-a8dewk2d-pooler.eastus2.azure.neon.tech:5432/uaizouklp?sslmode=require';
const client = postgres(connectionString);

// Configuração de logs
const LOG_DIR = './logs';
const LOG_FILE = path.join(LOG_DIR, `sync-${new Date().toISOString().split('T')[0]}.log`);

// Criar diretório de logs se não existir
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  console.log(logMessage);
  
  // Salvar no arquivo de log
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

function makeRequest(url, options = {}, retries = 3) {
  return new Promise((resolve, reject) => {
    const attempt = (retryCount) => {
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
            
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ status: res.statusCode, data: jsonData });
            } else if (res.statusCode === 429 && retryCount > 0) {
              // Rate limiting - aguardar e tentar novamente
              log(`Rate limit atingido, aguardando 2 segundos... (tentativa ${4 - retryCount})`, 'WARN');
              setTimeout(() => attempt(retryCount - 1), 2000);
            } else {
              reject(new Error(`Erro HTTP ${res.statusCode}: ${jsonData.message || 'Erro desconhecido'}`));
            }
          } catch (error) {
            reject(new Error(`Erro ao fazer parse do JSON: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        clearTimeout(timeout);
        if (retryCount > 0) {
          log(`Erro de conexão, tentando novamente... (tentativa ${4 - retryCount})`, 'WARN');
          setTimeout(() => attempt(retryCount - 1), 1000);
        } else {
          reject(error);
        }
      });

      req.setTimeout(15000, () => {
        clearTimeout(timeout);
        req.destroy();
        if (retryCount > 0) {
          log(`Timeout, tentando novamente... (tentativa ${4 - retryCount})`, 'WARN');
          setTimeout(() => attempt(retryCount - 1), 1000);
        } else {
          reject(new Error('Timeout da requisição'));
        }
      });

      req.end();
    };

    attempt(retries);
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

function parseDescription(description) {
  if (!description) return null;

  const result = {
    isInstallment: false,
    installmentNumber: null,
    totalInstallments: null,
    eventName: null,
    year: null,
    hasProducts: false,
    rawDescription: description
  };

  // Verificar se é parcela
  const installmentMatch = description.match(/Parcela (\d+) de (\d+)/);
  if (installmentMatch) {
    result.isInstallment = true;
    result.installmentNumber = parseInt(installmentMatch[1]);
    result.totalInstallments = parseInt(installmentMatch[2]);
  }

  // Verificar evento UAIZOUK
  if (/UAIZOUK|Uaizouk/i.test(description)) {
    result.eventName = 'UAIZOUK';
  }

  // Verificar ano
  const yearMatch = description.match(/202[4-6]/);
  if (yearMatch) {
    result.year = yearMatch[0];
  }

  // Verificar produtos
  if (/(?:aulas|bailes|oficiais|edição)/i.test(description)) {
    result.hasProducts = true;
  }

  return result;
}

function calculatePaymentStatus(payments) {
  if (!payments || payments.length === 0) {
    return { status: 'pending', paidValue: 0, totalValue: 0, paidInstallments: 0, totalInstallments: 0 };
  }

  let totalValue = 0;
  let paidValue = 0;
  let totalInstallments = 0;
  let paidInstallments = 0;

  // Calcular valores e parcelas
  for (const payment of payments) {
    totalValue += payment.value;
    
    if (payment.status === 'RECEIVED' || payment.status === 'CONFIRMED') {
      paidValue += payment.value;
    }

    const parsed = parseDescription(payment.description);
    if (parsed && parsed.isInstallment) {
      totalInstallments = Math.max(totalInstallments, parsed.totalInstallments);
      
      if (payment.status === 'RECEIVED' || payment.status === 'CONFIRMED') {
        paidInstallments++;
      }
    }
  }

  // Se não há parcelas, tratar como pagamento único
  if (totalInstallments === 0) {
    totalInstallments = 1;
    if (paidValue > 0) {
      paidInstallments = 1;
    }
  }

  // Determinar status
  let status = 'pending';
  
  if (paidValue >= totalValue) {
    status = 'received';
  } else if (paidValue > 0) {
    status = 'partial';
  }

  return {
    status,
    paidValue,
    totalValue,
    paidInstallments,
    totalInstallments,
    paymentPercentage: totalValue > 0 ? (paidValue / totalValue * 100).toFixed(1) : 0
  };
}

async function syncAsaasRobust() {
  log('🚀 INICIANDO SINCRONIZAÇÃO ROBUSTA ASAAS -> BASE LOCAL');
  log('=====================================================');
  
  const startTime = Date.now();
  let stats = {
    totalPayments: 0,
    uaizoukPayments: 0,
    customersProcessed: 0,
    customersCreated: 0,
    customersUpdated: 0,
    phonesFixed: 0,
    statusFixed: 0,
    errors: 0
  };

  try {
    // 1. Buscar cobranças do UAIZOUK
    log('📅 Buscando cobranças do UAIZOUK...');
    
    let offset = 0;
    const limit = 100;
    const processedCustomers = new Set();
    const uaizoukPayments = [];

    while (true) {
      try {
        const paymentsResponse = await makeRequest(`${ASAAS_URL}/payments?dateCreated[ge]=2024-09-01&limit=${limit}&offset=${offset}`);
        
        if (paymentsResponse.status !== 200) {
          throw new Error(`Erro ao buscar cobranças: ${paymentsResponse.status}`);
        }

        const payments = paymentsResponse.data.data || [];
        if (payments.length === 0) break;

        stats.totalPayments += payments.length;

        // Processar cada cobrança
        for (const payment of payments) {
          const parsed = parseDescription(payment.description);
          
          if (parsed && parsed.eventName === 'UAIZOUK') {
            uaizoukPayments.push(payment);
            stats.uaizoukPayments++;
          }
        }

        offset += limit;
        
        // Evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Limitar para não sobrecarregar
        if (offset >= 1000) break;
        
      } catch (error) {
        log(`Erro ao buscar cobranças (offset ${offset}): ${error.message}`, 'ERROR');
        stats.errors++;
        break;
      }
    }

    log(`✅ Encontradas ${stats.uaizoukPayments} cobranças do UAIZOUK`);

    // 2. Processar clientes únicos
    const uniqueCustomers = new Set(uaizoukPayments.map(p => p.customer));
    log(`👥 Processando ${uniqueCustomers.size} clientes únicos...`);

    for (const customerId of uniqueCustomers) {
      try {
        stats.customersProcessed++;
        
        // Buscar dados do cliente
        const customerResponse = await makeRequest(`${ASAAS_URL}/customers/${customerId}`);
        
        if (customerResponse.status !== 200) {
          log(`Erro ao buscar cliente ${customerId}: ${customerResponse.status}`, 'ERROR');
          stats.errors++;
          continue;
        }

        const customer = customerResponse.data;
        log(`👤 Processando cliente: ${customer.name} (${customer.cpfCnpj})`);

        // Buscar cobranças do cliente
        const customerPaymentsResponse = await makeRequest(`${ASAAS_URL}/payments?customer=${customerId}&limit=20`);
        
        if (customerPaymentsResponse.status !== 200) {
          log(`Erro ao buscar cobranças do cliente ${customerId}: ${customerPaymentsResponse.status}`, 'ERROR');
          stats.errors++;
          continue;
        }

        const allPayments = customerPaymentsResponse.data.data || [];
        const customerUaizoukPayments = allPayments.filter(payment => {
          const parsed = parseDescription(payment.description);
          return parsed && parsed.eventName === 'UAIZOUK';
        });

        // Calcular status real
        const realStatus = calculatePaymentStatus(customerUaizoukPayments);
        
        // Normalizar telefone
        const phoneToUse = customer.mobilePhone || customer.phone;
        const normalizedPhone = normalizePhone(phoneToUse);

        // Verificar se cliente já existe na nossa base
        const existingCustomer = await client`
          SELECT id, cpf, full_name, email, whatsapp, payment_status, total, installments
          FROM event_registrations
          WHERE cpf = ${customer.cpfCnpj}
          LIMIT 1
        `;

        if (existingCustomer.length === 0) {
          // Cliente não existe, criar novo registro
          try {
            await client`
              INSERT INTO event_registrations (
                event_id, cpf, is_foreigner, full_name, email, whatsapp,
                birth_date, state, city, ticket_type, partner_name,
                selected_products, total, terms_accepted, payment_method,
                installments, created_at, payment_status, asaas_payment_id
              ) VALUES (
                1, ${customer.cpfCnpj}, false, ${customer.name}, ${customer.email},
                ${normalizedPhone || '11999999999'}, '1990-01-01', 
                ${customer.state || 'SP'}, ${customer.cityName || 'São Paulo'},
                'Individual', null, '{}', ${realStatus.totalValue}, true,
                'pix', ${realStatus.totalInstallments},
                ${customer.dateCreated}, ${realStatus.status}, ${customerUaizoukPayments[0]?.id || null}
              )
            `;

            stats.customersCreated++;
            log(`✅ Cliente criado: ${customer.name}`);
            
          } catch (error) {
            log(`Erro ao criar cliente ${customer.name}: ${error.message}`, 'ERROR');
            stats.errors++;
          }
        } else {
          // Cliente existe, verificar se precisa atualizar
          const existing = existingCustomer[0];
          let needsUpdate = false;
          const updates = {};

          // Verificar telefone
          if (normalizedPhone && normalizedPhone !== existing.whatsapp && existing.whatsapp === '11999999999') {
            updates.whatsapp = normalizedPhone;
            stats.phonesFixed++;
            needsUpdate = true;
          }

          // Verificar status de pagamento
          if (realStatus.status !== existing.payment_status || 
              realStatus.totalValue !== parseFloat(existing.total) ||
              realStatus.totalInstallments !== existing.installments) {
            updates.payment_status = realStatus.status;
            updates.total = realStatus.totalValue;
            updates.installments = realStatus.totalInstallments;
            stats.statusFixed++;
            needsUpdate = true;
          }

          if (needsUpdate) {
            try {
              await client`
                UPDATE event_registrations
                SET ${client(updates)},
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ${existing.id}
              `;

              stats.customersUpdated++;
              log(`✅ Cliente atualizado: ${customer.name}`);
              
            } catch (error) {
              log(`Erro ao atualizar cliente ${customer.name}: ${error.message}`, 'ERROR');
              stats.errors++;
            }
          } else {
            log(`✅ Cliente ${customer.name} já está atualizado`);
          }
        }

        // Evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        log(`Erro ao processar cliente ${customerId}: ${error.message}`, 'ERROR');
        stats.errors++;
      }
    }

    // 3. Resumo final
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    log('\n📊 RESUMO DA SINCRONIZAÇÃO:');
    log('============================');
    log(`   - Duração: ${duration} segundos`);
    log(`   - Cobranças analisadas: ${stats.totalPayments}`);
    log(`   - Cobranças UAIZOUK: ${stats.uaizoukPayments}`);
    log(`   - Clientes processados: ${stats.customersProcessed}`);
    log(`   - Clientes criados: ${stats.customersCreated}`);
    log(`   - Clientes atualizados: ${stats.customersUpdated}`);
    log(`   - Telefones corrigidos: ${stats.phonesFixed}`);
    log(`   - Status corrigidos: ${stats.statusFixed}`);
    log(`   - Erros: ${stats.errors}`);

    // 4. Verificar estado final da base
    const finalStats = await client`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN payment_status = 'received' THEN 1 END) as paid,
        COUNT(CASE WHEN payment_status = 'partial' THEN 1 END) as partial,
        COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN whatsapp = '11999999999' THEN 1 END) as default_phone,
        SUM(total) as total_revenue
      FROM event_registrations 
      WHERE created_at >= '2024-09-01'
    `;

    const final = finalStats[0];
    const correctPhonePercentage = ((final.total - final.default_phone) / final.total * 100).toFixed(1);
    
    log('\n📈 ESTADO FINAL DA BASE:');
    log('========================');
    log(`   - Total de registros: ${final.total}`);
    log(`   - Pagos: ${final.paid}`);
    log(`   - Parciais: ${final.partial}`);
    log(`   - Pendentes: ${final.pending}`);
    log(`   - Telefones corretos: ${correctPhonePercentage}%`);
    log(`   - Receita total: R$ ${parseFloat(final.total_revenue).toFixed(2)}`);

    log('\n✅ SINCRONIZAÇÃO CONCLUÍDA COM SUCESSO!');
    
  } catch (error) {
    log(`❌ Erro crítico durante sincronização: ${error.message}`, 'ERROR');
    stats.errors++;
  } finally {
    // Salvar estatísticas finais
    const finalStats = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
      ...stats
    };
    
    const statsFile = path.join(LOG_DIR, `sync-stats-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(statsFile, JSON.stringify(finalStats, null, 2));
    
    log(`📁 Logs salvos em: ${LOG_FILE}`);
    log(`📊 Estatísticas salvas em: ${statsFile}`);
    log('✅ Sincronização finalizada');
    process.exit(0);
  }
}

// Executar sincronização com timeout de segurança
const timeout = setTimeout(() => {
  log('⏰ Timeout de segurança atingido. Finalizando...', 'ERROR');
  process.exit(1);
}, 300000); // 5 minutos máximo

syncAsaasRobust().finally(() => {
  clearTimeout(timeout);
});