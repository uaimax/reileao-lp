require('dotenv').config();
const { Client } = require('pg');

const dbName = process.env.DATABASE_URL.split('/').pop().split('?')[0];

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function terminateConnections() {
  try {
    await client.connect();
    const terminateSQL = `
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = '${dbName}'
        AND pid <> pg_backend_pid();
    `;
    await client.query(terminateSQL);
    console.log('Conexões do banco Neon encerradas com sucesso!');
  } catch (err) {
    console.error('Erro ao encerrar conexões:', err);
  } finally {
    await client.end();
  }
}

terminateConnections();