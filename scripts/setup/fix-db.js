import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();
const sql = postgres(process.env.DATABASE_URL);

// Nome do evento/site - configurável via variável de ambiente
const SITE_NAME = process.env.SITE_NAME || process.env.VITE_SITE_NAME || 'Meu Evento';

async function fixDatabase() {
  try {
    console.log('Adding missing WhatsApp columns...');

    // Add missing columns
    await sql`
      ALTER TABLE event_config
      ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20) DEFAULT ''
    `;

    await sql`
      ALTER TABLE event_config
      ADD COLUMN IF NOT EXISTS whatsapp_message TEXT DEFAULT ${`Oi! Quero mais informações sobre o ${SITE_NAME}`}
    `;

    await sql`
      ALTER TABLE event_config
      ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT true
    `;

    console.log('Columns added successfully!');

    // Now update the record with default values
    await sql`
      UPDATE event_config
      SET
        whatsapp_number = '5534988364084',
        whatsapp_message = ${`Oi! Quero mais informações sobre o ${SITE_NAME}`},
        whatsapp_enabled = true,
        hero_video_url = 'https://www.youtube.com/watch?v=U2QPiVaMAVc'
      WHERE id = 1
    `;

    console.log('Default values updated!');

    // Check the result
    const result = await sql`SELECT * FROM event_config WHERE id = 1`;
    console.log('Updated record:', result[0]);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.end();
  }
}

fixDatabase();