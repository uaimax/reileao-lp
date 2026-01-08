require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const sqlFile = path.join(__dirname, '../migrations/add-faq-tables.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function run() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await client.connect();
    
    console.log('🔄 Executando migração das tabelas FAQ...');
    await client.query(sql);
    
    console.log('✅ Migração FAQ executada com sucesso!');
    console.log('📝 Tabelas criadas:');
    console.log('  - faqs (perguntas frequentes)');
    console.log('  - faq_content (configuração da seção)');
    console.log('🎉 Sistema FAQ pronto para uso!');
  } catch (err) {
    console.error('❌ Erro ao rodar migração FAQ:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();