import postgres from 'postgres';
import fs from 'fs';
import dotenv from 'dotenv';

// Read environment variables
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = postgres(connectionString);

async function setupDatabase() {
  try {
    // Read and execute schema
    const schema = fs.readFileSync('./schema.sql', 'utf8');
    
    console.log('Setting up database...');
    await sql.unsafe(schema);
    console.log('Database setup completed successfully!');
    
  } catch (error) {
    console.error('Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

setupDatabase();