require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const sqlFile = path.join(__dirname, '../migrations/add-seo-fields.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function run() {
  try {
    await client.connect();
    await client.query(sql);
    console.log('Migration executada com sucesso!');
  } catch (err) {
    console.error('Erro ao rodar migration:', err);
  } finally {
    await client.end();
  }
}

run();