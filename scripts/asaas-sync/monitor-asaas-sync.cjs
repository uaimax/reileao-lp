#!/usr/bin/env node

// Sistema de Monitoramento e Relatórios para Sincronização ASAAS
// Gera relatórios detalhados e monitora a qualidade dos dados

const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

// Configuração do banco
const connectionString = 'postgresql://uaizouklp_owner:npg_BgyoHlKF1Tu3@ep-mute-base-a8dewk2d-pooler.eastus2.azure.neon.tech:5432/uaizouklp?sslmode=require';
const client = postgres(connectionString);

// Configuração de relatórios
const REPORTS_DIR = './reports';
const REPORT_FILE = path.join(REPORTS_DIR, `monitor-${new Date().toISOString().split('T')[0]}.json`);

// Criar diretório de relatórios se não existir
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

async function generateMonitorReport() {
  log('📊 GERANDO RELATÓRIO DE MONITORAMENTO');
  log('=====================================');
  
  try {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {},
      dataQuality: {},
      financialMetrics: {},
      syncStatus: {},
      recommendations: []
    };

    // 1. Resumo geral
    log('📈 Calculando métricas gerais...');
    
    const generalStats = await client`
      SELECT 
        COUNT(*) as total_registrations,
        COUNT(CASE WHEN created_at >= '2024-09-01' THEN 1 END) as recent_registrations,
        COUNT(CASE WHEN payment_status = 'received' THEN 1 END) as paid_registrations,
        COUNT(CASE WHEN payment_status = 'partial' THEN 1 END) as partial_registrations,
        COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_registrations,
        COUNT(CASE WHEN whatsapp = '11999999999' THEN 1 END) as default_phone_count,
        COUNT(CASE WHEN asaas_payment_id IS NOT NULL THEN 1 END) as with_asaas_id,
        AVG(total) as avg_total,
        SUM(total) as total_revenue,
        MIN(created_at) as first_registration,
        MAX(created_at) as last_registration
      FROM event_registrations
    `;

    const stats = generalStats[0];
    
    report.summary = {
      totalRegistrations: parseInt(stats.total_registrations),
      recentRegistrations: parseInt(stats.recent_registrations),
      paidRegistrations: parseInt(stats.paid_registrations),
      partialRegistrations: parseInt(stats.partial_registrations),
      pendingRegistrations: parseInt(stats.pending_registrations),
      totalRevenue: parseFloat(stats.total_revenue),
      averageValue: parseFloat(stats.avg_total),
      firstRegistration: stats.first_registration,
      lastRegistration: stats.last_registration
    };

    // 2. Qualidade dos dados
    log('🔍 Analisando qualidade dos dados...');
    
    const phoneQuality = await client`
      SELECT 
        whatsapp,
        COUNT(*) as count
      FROM event_registrations 
      WHERE created_at >= '2024-09-01'
      GROUP BY whatsapp
      ORDER BY count DESC
    `;

    const correctPhones = phoneQuality.filter(p => p.whatsapp !== '11999999999').length;
    const totalPhones = phoneQuality.length;
    const phoneQualityPercentage = totalPhones > 0 ? (correctPhones / totalPhones * 100).toFixed(1) : 0;

    report.dataQuality = {
      phoneQuality: {
        percentage: parseFloat(phoneQualityPercentage),
        correctPhones: correctPhones,
        totalPhones: totalPhones,
        defaultPhones: parseInt(stats.default_phone_count),
        distribution: phoneQuality.map(p => ({
          phone: p.whatsapp,
          count: parseInt(p.count),
          isDefault: p.whatsapp === '11999999999'
        }))
      },
      asaasIntegration: {
        withAsaasId: parseInt(stats.with_asaas_id),
        withoutAsaasId: parseInt(stats.recent_registrations) - parseInt(stats.with_asaas_id),
        integrationRate: parseInt(stats.recent_registrations) > 0 ? 
          (parseInt(stats.with_asaas_id) / parseInt(stats.recent_registrations) * 100).toFixed(1) : 0
      }
    };

    // 3. Métricas financeiras
    log('💰 Calculando métricas financeiras...');
    
    const financialStats = await client`
      SELECT 
        payment_status,
        COUNT(*) as count,
        AVG(total) as avg_value,
        SUM(total) as total_value,
        MIN(total) as min_value,
        MAX(total) as max_value
      FROM event_registrations 
      WHERE created_at >= '2024-09-01'
      GROUP BY payment_status
      ORDER BY total_value DESC
    `;

    const paidRevenue = financialStats.find(s => s.payment_status === 'received')?.total_value || 0;
    const partialRevenue = financialStats.find(s => s.payment_status === 'partial')?.total_value || 0;
    const pendingRevenue = financialStats.find(s => s.payment_status === 'pending')?.total_value || 0;
    const totalRevenue = parseFloat(stats.total_revenue);
    
    const collectionRate = totalRevenue > 0 ? (paidRevenue / totalRevenue * 100).toFixed(1) : 0;

    report.financialMetrics = {
      totalRevenue: totalRevenue,
      paidRevenue: parseFloat(paidRevenue),
      partialRevenue: parseFloat(partialRevenue),
      pendingRevenue: parseFloat(pendingRevenue),
      collectionRate: parseFloat(collectionRate),
      statusBreakdown: financialStats.map(s => ({
        status: s.payment_status,
        count: parseInt(s.count),
        averageValue: parseFloat(s.avg_value),
        totalValue: parseFloat(s.total_value),
        minValue: parseFloat(s.min_value),
        maxValue: parseFloat(s.max_value)
      }))
    };

    // 4. Análise de parcelas
    log('📅 Analisando distribuição de parcelas...');
    
    const installmentStats = await client`
      SELECT 
        installments,
        COUNT(*) as count,
        AVG(total) as avg_total,
        SUM(total) as total_value
      FROM event_registrations 
      WHERE created_at >= '2024-09-01'
      GROUP BY installments
      ORDER BY installments
    `;

    report.installmentAnalysis = {
      distribution: installmentStats.map(s => ({
        installments: parseInt(s.installments),
        count: parseInt(s.count),
        averageValue: parseFloat(s.avg_total),
        totalValue: parseFloat(s.total_value)
      })),
      mostCommonInstallments: installmentStats
        .sort((a, b) => parseInt(b.count) - parseInt(a.count))
        .slice(0, 3)
        .map(s => ({
          installments: parseInt(s.installments),
          count: parseInt(s.count)
        }))
    };

    // 5. Análise temporal
    log('📈 Analisando tendências temporais...');
    
    const monthlyStats = await client`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as registrations,
        SUM(total) as revenue,
        COUNT(CASE WHEN payment_status = 'received' THEN 1 END) as paid_count
      FROM event_registrations 
      WHERE created_at >= '2024-09-01'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `;

    report.temporalAnalysis = {
      monthlyBreakdown: monthlyStats.map(s => ({
        month: s.month.toISOString().split('T')[0],
        registrations: parseInt(s.registrations),
        revenue: parseFloat(s.revenue),
        paidCount: parseInt(s.paid_count)
      }))
    };

    // 6. Status da sincronização
    log('🔄 Verificando status da sincronização...');
    
    const lastSync = await client`
      SELECT MAX(updated_at) as last_sync
      FROM event_registrations 
      WHERE created_at >= '2024-09-01'
    `;

    const syncAge = lastSync[0].last_sync ? 
      Math.floor((new Date() - new Date(lastSync[0].last_sync)) / (1000 * 60 * 60)) : null;

    report.syncStatus = {
      lastSync: lastSync[0].last_sync,
      syncAgeHours: syncAge,
      isStale: syncAge > 24, // Considera stale se mais de 24h
      needsSync: syncAge > 6 // Considera que precisa sincronizar se mais de 6h
    };

    // 7. Recomendações
    log('💡 Gerando recomendações...');
    
    const recommendations = [];

    if (parseFloat(phoneQualityPercentage) < 95) {
      recommendations.push({
        type: 'data_quality',
        priority: 'high',
        message: `Taxa de telefones corretos está em ${phoneQualityPercentage}%. Execute correção de telefones.`,
        action: 'node fix-phone-numbers-correct.cjs'
      });
    }

    if (parseFloat(collectionRate) < 50) {
      recommendations.push({
        type: 'financial',
        priority: 'medium',
        message: `Taxa de recebimento está em ${collectionRate}%. Verifique status de pagamentos.`,
        action: 'node fix-payment-status.cjs'
      });
    }

    if (syncAge > 6) {
      recommendations.push({
        type: 'sync',
        priority: 'high',
        message: `Última sincronização foi há ${syncAge} horas. Execute sincronização.`,
        action: 'node sync-asaas-robust.cjs'
      });
    }

    if (parseInt(stats.partial_registrations) > 10) {
      recommendations.push({
        type: 'status',
        priority: 'medium',
        message: `${stats.partial_registrations} registros com status parcial. Verifique parcelas.`,
        action: 'node fix-payment-status.cjs'
      });
    }

    report.recommendations = recommendations;

    // 8. Salvar relatório
    log('💾 Salvando relatório...');
    
    fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
    
    // 9. Exibir resumo
    log('\n📊 RESUMO DO RELATÓRIO:');
    log('========================');
    log(`   - Total de registros: ${report.summary.totalRegistrations}`);
    log(`   - Registros recentes: ${report.summary.recentRegistrations}`);
    log(`   - Receita total: R$ ${report.summary.totalRevenue.toFixed(2)}`);
    log(`   - Taxa de recebimento: ${report.financialMetrics.collectionRate}%`);
    log(`   - Qualidade de telefones: ${report.dataQuality.phoneQuality.percentage}%`);
    log(`   - Integração ASAAS: ${report.dataQuality.asaasIntegration.integrationRate}%`);
    log(`   - Última sincronização: ${syncAge ? `${syncAge} horas atrás` : 'Nunca'}`);
    log(`   - Recomendações: ${recommendations.length}`);

    if (recommendations.length > 0) {
      log('\n🔧 RECOMENDAÇÕES:');
      recommendations.forEach((rec, index) => {
        const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
        log(`   ${index + 1}. ${priority} ${rec.message}`);
        log(`      Ação: ${rec.action}`);
      });
    }

    log(`\n📁 Relatório salvo em: ${REPORT_FILE}`);
    log('✅ Relatório de monitoramento concluído!');

    return report;

  } catch (error) {
    log(`❌ Erro ao gerar relatório: ${error.message}`);
    throw error;
  } finally {
    log('✅ Monitoramento finalizado');
    process.exit(0);
  }
}

// Executar monitoramento
generateMonitorReport();