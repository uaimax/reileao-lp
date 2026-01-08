/**
 * Script para recalcular valores de breakdown para inscrições retroativas
 *
 * Este script:
 * 1. Busca a configuração do formulário para obter preços de tickets e produtos
 * 2. Para cada inscrição onde base_total == total (inscrições antigas)
 * 3. Recalcula o valor base somando ticket + produtos
 * 4. Calcula desconto (PIX) ou taxa (parcelado/cartão)
 * 5. Atualiza os campos de breakdown no banco
 */

import postgres from 'postgres';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const client = postgres(process.env.DATABASE_URL);

// Configurações padrão de taxas (caso não encontre no config)
const DEFAULT_PIX_DISCOUNT = 5; // 5%
const DEFAULT_FEE_PERCENTAGE = 5; // 5%

async function getFormConfig() {
  console.log('📋 Buscando configuração do formulário...');

  const config = await client`
    SELECT config_data
    FROM event_form_configs
    WHERE event_id = 1 AND is_active = true
    LIMIT 1
  `;

  if (config.length === 0) {
    throw new Error('❌ Configuração do formulário não encontrada');
  }

  // Parse if string
  const configData = typeof config[0].config_data === 'string'
    ? JSON.parse(config[0].config_data)
    : config[0].config_data;

  console.log(`📊 Config carregado:`);
  console.log(`   - ${configData.ticketTypes?.length || 0} tipos de ingresso`);
  console.log(`   - ${configData.products?.length || 0} produtos`);

  return configData;
}

function calculateBaseTotal(registration, formConfig) {
  let baseTotal = 0;

  // 1. Adicionar valor do ingresso
  const ticketType = formConfig.ticketTypes?.find(t => t.name === registration.ticket_type);
  if (ticketType) {
    baseTotal += ticketType.price || 0;
    console.log(`   💰 Ingresso (${registration.ticket_type}): R$ ${ticketType.price}`);
  } else {
    console.log(`   ⚠️  Tipo de ingresso não encontrado no config: ${registration.ticket_type}`);
  }

  // 2. Adicionar valor dos produtos
  if (registration.selected_products) {
    const products = typeof registration.selected_products === 'string'
      ? JSON.parse(registration.selected_products)
      : registration.selected_products;

    Object.entries(products).forEach(([productName, option]) => {
      if (option !== 'Não' && option) {
        const product = formConfig.products?.find(p => p.name === productName);
        if (product) {
          // Para produtos boolean, só adicionar se a opção for 'Sim'
          if (product.isBoolean) {
            if (option === 'Sim') {
              baseTotal += product.price || 0;
              console.log(`   🛍️  Produto (${productName}): R$ ${product.price}`);
            }
          } else {
            baseTotal += product.price || 0;
            console.log(`   🛍️  Produto (${productName}: ${option}): R$ ${product.price}`);
          }
        } else {
          console.log(`   ⚠️  Produto não encontrado no config: ${productName}`);
        }
      }
    });
  }

  return baseTotal;
}

function calculateBreakdown(baseTotal, paymentMethod, formConfig) {
  const pixDiscount = formConfig.paymentSettings?.pixDiscountPercentage || DEFAULT_PIX_DISCOUNT;
  const feePercentage = formConfig.paymentSettings?.creditCardFeePercentage || DEFAULT_FEE_PERCENTAGE;

  let discountAmount = 0;
  let feeAmount = 0;
  let appliedPercentage = 0;
  let finalTotal = baseTotal;

  if (paymentMethod === 'pix') {
    // PIX à vista: aplicar desconto
    discountAmount = baseTotal * (pixDiscount / 100);
    finalTotal = baseTotal - discountAmount;
    appliedPercentage = pixDiscount;
    console.log(`   ✅ PIX à vista: Desconto de ${pixDiscount}% (-R$ ${discountAmount.toFixed(2)})`);
  } else if (paymentMethod === 'pix_installment' || paymentMethod === 'credit_card') {
    // PIX parcelado ou Cartão: aplicar taxa
    feeAmount = baseTotal * (feePercentage / 100);
    finalTotal = baseTotal + feeAmount;
    appliedPercentage = feePercentage;
    console.log(`   💳 ${paymentMethod}: Taxa de ${feePercentage}% (+R$ ${feeAmount.toFixed(2)})`);
  } else if (paymentMethod === 'paypal') {
    // PayPal: sem alteração no valor base
    console.log(`   💰 PayPal: Sem taxa do sistema`);
  }

  return {
    baseTotal: baseTotal.toFixed(2),
    discountAmount: discountAmount.toFixed(2),
    feeAmount: feeAmount.toFixed(2),
    feePercentage: appliedPercentage.toFixed(2),
    finalTotal: finalTotal.toFixed(2)
  };
}

async function recalculateBreakdowns() {
  try {
    console.log('🚀 Iniciando recálculo de breakdowns...\n');

    // 1. Buscar configuração do formulário
    const formConfig = await getFormConfig();
    console.log(`✅ Configuração carregada\n`);

    // 2. Buscar inscrições que precisam de recálculo
    // Critério: Apenas inscrições recentes (ID >= 186) com preços atuais
    const registrations = await client`
      SELECT
        id, ticket_type, selected_products, payment_method,
        base_total, total, installments, full_name
      FROM event_registrations
      WHERE id >= 186
        AND (base_total IS NULL OR (base_total = 0 AND fee_amount = 0 AND discount_amount = 0))
      ORDER BY id ASC
    `;

    if (registrations.length === 0) {
      console.log('✅ Nenhuma inscrição precisa de recálculo!');
      return;
    }

    console.log(`📊 Encontradas ${registrations.length} inscrições para recalcular\n`);
    console.log('─'.repeat(80));

    let successCount = 0;
    let errorCount = 0;

    // 3. Processar cada inscrição
    for (const registration of registrations) {
      console.log(`\n🔄 Processando ID ${registration.id} - ${registration.full_name}`);
      console.log(`   Método: ${registration.payment_method} | Parcelas: ${registration.installments}x`);
      console.log(`   Total atual: R$ ${parseFloat(registration.total).toFixed(2)}`);

      try {
        // Calcular valor base
        const baseTotal = calculateBaseTotal(registration, formConfig);
        console.log(`   📊 Valor base calculado: R$ ${baseTotal.toFixed(2)}`);

        // Calcular breakdown
        const breakdown = calculateBreakdown(baseTotal, registration.payment_method, formConfig);

        // Verificar se o total final bate com o total registrado
        const currentTotal = parseFloat(registration.total);
        const calculatedTotal = parseFloat(breakdown.finalTotal);
        const diff = Math.abs(currentTotal - calculatedTotal);

        if (diff > 0.01) {
          console.log(`   ⚠️  AVISO: Diferença de R$ ${diff.toFixed(2)} entre total atual e calculado`);
          console.log(`      Atual: R$ ${currentTotal.toFixed(2)} | Calculado: R$ ${calculatedTotal.toFixed(2)}`);
        }

        // Atualizar no banco
        await client`
          UPDATE event_registrations
          SET
            base_total = ${breakdown.baseTotal},
            discount_amount = ${breakdown.discountAmount},
            fee_amount = ${breakdown.feeAmount},
            fee_percentage = ${breakdown.feePercentage},
            updated_at = NOW()
          WHERE id = ${registration.id}
        `;

        console.log(`   ✅ Atualizado com sucesso!`);
        successCount++;

      } catch (error) {
        console.error(`   ❌ Erro ao processar: ${error.message}`);
        errorCount++;
      }

      console.log('─'.repeat(80));
    }

    console.log(`\n📈 RESUMO:`);
    console.log(`   ✅ Sucesso: ${successCount}`);
    console.log(`   ❌ Erros: ${errorCount}`);
    console.log(`   📊 Total: ${registrations.length}`);

  } catch (error) {
    console.error('❌ Erro fatal:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Executar script
recalculateBreakdowns()
  .then(() => {
    console.log('\n🎉 Script concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script falhou:', error);
    process.exit(1);
  });

