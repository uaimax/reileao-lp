#!/usr/bin/env node

/**
 * Script de Backup do Banco de Dados Neon
 *
 * Este script lê a variável de ambiente UZ_DB_URL_NEON e cria um backup completo
 * do banco de dados PostgreSQL usando pg_dump.
 *
 * Uso:
 *   node scripts/backup-db.js
 *   ou
 *   npm run backup:db
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, statSync } from 'fs';
import { config } from 'dotenv';

// Carregar variáveis de ambiente do .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Tentar carregar .env de múltiplos locais
console.log('🔍 Procurando arquivo .env...');
const envResult = config({ path: join(projectRoot, '.env') });

if (envResult.error) {
  console.log('⚠️  Tentando carregar .env do diretório atual...');
  const altResult = config();
  if (altResult.error) {
    console.log('⚠️  Aviso: Não foi possível carregar .env automaticamente');
    console.log('   Continuando com variáveis de ambiente do sistema...');
  } else {
    console.log('✅ .env carregado do diretório atual');
  }
} else {
  console.log('✅ .env carregado do diretório raiz do projeto');
}

// Função para parsear a URL do PostgreSQL
function parsePostgresUrl(url) {
  try {
    const urlObj = new URL(url);
    return {
      host: urlObj.hostname,
      port: urlObj.port || '5432',
      database: urlObj.pathname.slice(1), // Remove a barra inicial
      user: urlObj.username,
      password: urlObj.password,
    };
  } catch (error) {
    throw new Error(`Erro ao parsear URL do banco de dados: ${error.message}`);
  }
}

// Função para criar o backup
function createBackup() {
  console.log('🔄 Iniciando backup do banco de dados...\n');

  // Verificar se a variável de ambiente existe
  const dbUrl = process.env.UZ_DB_URL_NEON;

  if (!dbUrl) {
    console.error('❌ Erro: Variável de ambiente UZ_DB_URL_NEON não encontrada!');
    console.error('   Certifique-se de que o arquivo .env contém UZ_DB_URL_NEON');
    console.error('\n💡 Debug: Variáveis de ambiente disponíveis:');
    const envKeys = Object.keys(process.env).filter(key =>
      key.includes('DB') || key.includes('DATABASE') || key.includes('UZ')
    );
    if (envKeys.length > 0) {
      console.error('   Variáveis relacionadas encontradas:', envKeys.join(', '));
    } else {
      console.error('   Nenhuma variável relacionada encontrada');
    }
    process.exit(1);
  }

  console.log('✅ URL do banco de dados encontrada');
  console.log(`   Host: ${new URL(dbUrl).hostname}\n`);

  // Parsear a URL
  let dbConfig;
  try {
    dbConfig = parsePostgresUrl(dbUrl);
  } catch (error) {
    console.error(`❌ ${error.message}`);
    process.exit(1);
  }

  // Criar diretório de backups se não existir
  const backupsDir = join(projectRoot, 'backups');
  if (!existsSync(backupsDir)) {
    mkdirSync(backupsDir, { recursive: true });
    console.log('📁 Diretório de backups criado:', backupsDir);
  }

  // Gerar nome do arquivo de backup com timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupFile = join(backupsDir, `backup-${dbConfig.database}-${timestamp}.sql`);
  const backupFileGz = `${backupFile}.gz`;

  console.log('📦 Criando backup...');
  console.log(`   Arquivo: ${backupFileGz}\n`);

  try {
    // Executar pg_dump com compressão
    // Usar PGPASSWORD para evitar prompt de senha
    const pgDumpCommand = [
      'PGPASSWORD=' + dbConfig.password,
      'pg_dump',
      `-h ${dbConfig.host}`,
      `-p ${dbConfig.port}`,
      `-U ${dbConfig.user}`,
      `-d ${dbConfig.database}`,
      '--no-password', // Não pedir senha (usa PGPASSWORD)
      '--verbose', // Mostrar progresso
      '--clean', // Incluir comandos DROP
      '--if-exists', // Usar IF EXISTS nos DROPs
      '--create', // Incluir comando CREATE DATABASE
      '--format=plain', // Formato SQL plain text (mais compatível)
      `-f ${backupFile}`,
    ].join(' ');

    console.log('⏳ Executando pg_dump (isso pode levar alguns minutos)...\n');

    execSync(pgDumpCommand, {
      stdio: 'inherit',
      env: {
        ...process.env,
        PGPASSWORD: dbConfig.password,
      },
    });

    // Comprimir o backup
    console.log('\n🗜️  Comprimindo backup...');
    execSync(`gzip -f "${backupFile}"`, { stdio: 'inherit' });

    const stats = statSync(backupFileGz);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log('\n✅ Backup criado com sucesso!');
    console.log(`   Arquivo: ${backupFileGz}`);
    console.log(`   Tamanho: ${fileSizeMB} MB`);
    console.log(`\n💡 Para restaurar este backup, use:`);
    console.log(`   pg_restore -h ${dbConfig.host} -U ${dbConfig.user} -d ${dbConfig.database} -c "${backupFileGz}"`);

  } catch (error) {
    console.error('\n❌ Erro ao criar backup:');
    console.error(error.message);

    if (error.message.includes('pg_dump: command not found')) {
      console.error('\n💡 Dica: Instale o PostgreSQL client tools:');
      console.error('   Ubuntu/Debian: sudo apt-get install postgresql-client');
      console.error('   macOS: brew install postgresql');
    }

    process.exit(1);
  }
}

// Executar o backup
createBackup();

