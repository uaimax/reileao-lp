/**
 * Script para recalcular valores de breakdown usando ENGENHARIA REVERSA
 *
 * Como os preços dos ingressos/produtos podem ter mudado desde as inscrições antigas,
 * vamos calcular o base_total a partir do total pago + método de pagamento:
 *
 * - Se PIX à vista: total = base * 0.95 → base = total / 0.95
 * - Se parcelado/cartão: total = base * 1.05 → base = total / 1.05
 * - Se paypal: total = base (sem alteração)
 */

import postgres from 'postgres';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const client = postgres(process.env.DATABASE_URL);

// Configurações padrão de taxas
const PIX_DISCOUNT = 5; // 5%
const FEE_PERCENTAGE = 5; // 5%

function reverseCalculateBreakdown(total, paymentMethod) {
  const totalNum = parseFloat(total);
  let baseTotal = 0;
  let discountAmount = 0;
  let feeAmount = 0;
  let feePercentage = 0;

  if (paymentMethod === 'pix') {
    // PIX à vista: total = base * 0.95
    // base = total / 0.95
    baseTotal = totalNum / (1 - PIX_DISCOUNT / 100);
    discountAmount = baseTotal - totalNum;
    feePercentage = PIX_DISCOUNT;
    console.log(`   ✅ PIX: Base ${baseTotal.toFixed(2)} - Desconto ${discountAmount.toFixed(2)} = ${totalNum.toFixed(2)}`);
  } else if (paymentMethod === 'pix_installment' || paymentMethod === 'credit_card') {
    // Parcelado: total = base * 1.05
    // base = total / 1.05
    baseTotal = totalNum / (1 + FEE_PERCENTAGE / 100);
    feeAmount = totalNum - baseTotal;
    feePercentage = FEE_PERCENTAGE;
    console.log(`   💳 ${paymentMethod}: Base ${baseTotal.toFixed(2)} + Taxa ${feeAmount.toFixed(2)} = ${totalNum.toFixed(2)}`);
  } else {
    // PayPal ou outros: sem alteração
    baseTotal = totalNum;
    console.log(`   💰 ${paymentMethod}: Base = Total (sem alteração)`);
  }

  return {
    baseTotal: baseTotal.toFixed(2),
    discountAmount: discountAmount.toFixed(2),
    feeAmount: feeAmount.toFixed(2),
    feePercentage: feePercentage.toFixed(2)
  };
}

async function recalculateBreakdowns() {
  try {
    console.log('🚀 Iniciando recálculo REVERSO de breakdowns...\n');

    // Buscar inscrições que precisam de recálculo
    const registrations = await client`
      SELECT
        id, full_name, payment_method, total, installments
      FROM event_registrations
      WHERE base_total IS NULL
         OR (base_total = 0 AND fee_amount = 0 AND discount_amount = 0)
      ORDER BY created_at ASC
    `;

    if (registrations.length === 0) {
      console.log('✅ Nenhuma inscrição precisa de recálculo!');
      return;
    }

    console.log(`📊 Encontradas ${registrations.length} inscrições para recalcular\n`);
    console.log('─'.repeat(80));

    let successCount = 0;
    let errorCount = 0;

    // Processar cada inscrição
    for (const registration of registrations) {
      console.log(`\n🔄 ID ${registration.id} - ${registration.full_name}`);
      console.log(`   Método: ${registration.payment_method} | Parcelas: ${registration.installments}x`);
      console.log(`   Total pago: R$ ${parseFloat(registration.total).toFixed(2)}`);

      try {
        // Calcular breakdown usando engenharia reversa
        const breakdown = reverseCalculateBreakdown(registration.total, registration.payment_method);

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

