#!/usr/bin/env node

/**
 * Script de Restauração do Banco de Dados
 *
 * Este script lê a variável de ambiente RL_DB_URL e restaura um backup
 * do banco de dados PostgreSQL usando pg_restore.
 *
 * Uso:
 *   node scripts/restore-db.js [arquivo-backup]
 *   ou
 *   npm run restore:db [arquivo-backup]
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
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
    // Decodificar a senha (pode conter caracteres especiais como %40 para @)
    const decodedPassword = decodeURIComponent(urlObj.password || '');
    return {
      host: urlObj.hostname,
      port: urlObj.port || '5432',
      database: urlObj.pathname.slice(1), // Remove a barra inicial
      user: decodeURIComponent(urlObj.username || ''),
      password: decodedPassword,
    };
  } catch (error) {
    throw new Error(`Erro ao parsear URL do banco de dados: ${error.message}`);
  }
}

// Função para encontrar o backup mais recente
function findLatestBackup(backupsDir) {
  if (!existsSync(backupsDir)) {
    return null;
  }

  const files = readdirSync(backupsDir)
    .filter(file => file.endsWith('.sql.gz') || file.endsWith('.sql'))
    .map(file => {
      const filePath = join(backupsDir, file);
      return {
        name: file,
        path: filePath,
        mtime: statSync(filePath).mtime,
      };
    })
    .sort((a, b) => b.mtime - a.mtime);

  return files.length > 0 ? files[0] : null;
}

// Função para restaurar o backup
function restoreBackup() {
  console.log('🔄 Iniciando restauração do banco de dados...\n');

  // Aceitar variável de ambiente como parâmetro (padrão: RL_DB_URL)
  const envVarName = process.argv[2] === '--env' ? process.argv[3] : 'RL_DB_URL';
  const dbUrl = process.env[envVarName];

  if (!dbUrl) {
    console.error(`❌ Erro: Variável de ambiente ${envVarName} não encontrada!`);
    console.error(`   Certifique-se de que o arquivo .env contém ${envVarName}`);
    console.error('\n💡 Debug: Variáveis de ambiente disponíveis:');
    const envKeys = Object.keys(process.env).filter(key =>
      key.includes('DB') || key.includes('DATABASE') || key.includes('RL') || key.includes('UZ')
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

  // Verificar arquivo de backup (ignorar --env e nome da variável se presentes)
  let backupFileArgIndex = 2;
  if (process.argv[2] === '--env') {
    backupFileArgIndex = 4; // Pular --env e nome da variável
  }
  const backupFile = process.argv[backupFileArgIndex];
  let backupPath;

  if (backupFile) {
    // Backup especificado pelo usuário
    if (existsSync(backupFile)) {
      backupPath = backupFile;
    } else if (existsSync(join(projectRoot, backupFile))) {
      backupPath = join(projectRoot, backupFile);
    } else {
      console.error(`❌ Erro: Arquivo de backup não encontrado: ${backupFile}`);
      process.exit(1);
    }
  } else {
    // Procurar o backup mais recente
    const backupsDir = join(projectRoot, 'backups');
    const latestBackup = findLatestBackup(backupsDir);

    if (!latestBackup) {
      console.error('❌ Erro: Nenhum backup encontrado!');
      console.error(`   Procurando em: ${backupsDir}`);
      console.error('\n💡 Dica: Execute primeiro o backup com: npm run backup:db');
      process.exit(1);
    }

    backupPath = latestBackup.path;
    console.log(`📦 Usando backup mais recente: ${latestBackup.name}`);
    console.log(`   Criado em: ${latestBackup.mtime.toLocaleString()}\n`);
  }

  // Verificar se pg_restore está instalado
  try {
    execSync('which pg_restore', { stdio: 'ignore' });
  } catch (error) {
    console.error('❌ Erro: pg_restore não está instalado!');
    console.error('\n💡 Instale o PostgreSQL client tools:');
    console.error('   Ubuntu/Debian: sudo apt-get install postgresql-client');
    console.error('   macOS: brew install postgresql');
    process.exit(1);
  }

  console.log('⚠️  ATENÇÃO: Esta operação irá SOBRESCREVER o banco de dados!');
  console.log(`   Banco: ${dbConfig.database}`);
  console.log(`   Host: ${dbConfig.host}`);
  console.log(`   Backup: ${backupPath}\n`);

  // Confirmar restauração (em modo não-interativo, prosseguir)
  console.log('🔄 Iniciando restauração...\n');

  try {
    // Verificar se o arquivo está comprimido
    const isCompressed = backupPath.endsWith('.gz');
    let finalBackupPath = backupPath;
    let isTempFile = false;

    if (isCompressed) {
      console.log('🗜️  Descomprimindo backup...');
      // Descomprimir para um arquivo temporário
      const tempBackupPath = backupPath.replace('.gz', '');
      execSync(`gunzip -c "${backupPath}" > "${tempBackupPath}"`, { stdio: 'inherit' });
      finalBackupPath = tempBackupPath;
      isTempFile = true;
    }

    // Verificar se é formato SQL plain text ou custom
    const isSQLFormat = finalBackupPath.endsWith('.sql');

    if (isSQLFormat) {
      // Filtrar comandos incompatíveis do backup SQL
      console.log('🔧 Filtrando comandos incompatíveis do backup...');
      const sqlContent = readFileSync(finalBackupPath, 'utf8');

      // Remover linhas problemáticas
      const filteredSQL = sqlContent
        .split('\n')
        .filter((line, index) => {
          // Remover comandos de configuração específicos do Neon
          if (line.includes('SET transaction_timeout')) return false;
          if (line.includes('SET idle_in_transaction_session_timeout')) return false;
          if (line.includes('SET statement_timeout')) return false;
          // Remover comandos \connect que tentam conectar ao banco original
          if (line.trim().startsWith('\\connect')) return false;
          // Remover comandos DROP DATABASE e CREATE DATABASE (já estamos conectados)
          if (line.includes('DROP DATABASE') && line.includes('uaizouklp')) return false;
          if (line.includes('CREATE DATABASE') && line.includes('uaizouklp')) return false;
          // Remover comentários de pg_dump sobre conexão
          if (line.includes('connecting to new database')) return false;
          // Remover comandos SET que podem causar problemas
          if (line.trim().startsWith('SET ') && (
            line.includes('search_path') ||
            line.includes('standard_conforming_strings') ||
            line.includes('client_encoding')
          )) {
            // Manter apenas se não for problemático
            return !line.includes('transaction_timeout');
          }
          return true;
        })
        .join('\n');

      // Salvar versão filtrada
      const filteredPath = finalBackupPath.replace('.sql', '.filtered.sql');
      writeFileSync(filteredPath, filteredSQL);
      const useFiltered = filteredPath;
      if (isTempFile) {
        // Se era temporário, marcar para limpar ambos
        finalBackupPath = useFiltered;
      }

      // Usar psql para arquivos SQL plain text
      console.log('⏳ Executando psql para restaurar backup SQL (isso pode levar alguns minutos)...\n');

      // Usar psql com ON_ERROR_STOP=0 para continuar mesmo com erros
      const psqlCommand = [
        'PGPASSWORD=' + dbConfig.password,
        'psql',
        `-h ${dbConfig.host}`,
        `-p ${dbConfig.port}`,
        `-U ${dbConfig.user}`,
        `-d ${dbConfig.database}`,
        '--no-password', // Não pedir senha (usa PGPASSWORD)
        '-v', 'ON_ERROR_STOP=0', // Continuar mesmo com erros
        '-f', // Arquivo
        `"${useFiltered}"`,
      ].join(' ');

      console.log('⚠️  Nota: Alguns erros podem aparecer, mas a restauração continuará...\n');

      execSync(psqlCommand, {
        stdio: 'inherit',
        env: {
          ...process.env,
          PGPASSWORD: dbConfig.password,
        },
      });

      // Limpar arquivo filtrado
      if (existsSync(useFiltered) && useFiltered !== finalBackupPath) {
        execSync(`rm "${useFiltered}"`, { stdio: 'ignore' });
      }
    } else {
      // Usar pg_restore para formato custom
      console.log('⏳ Executando pg_restore (isso pode levar alguns minutos)...\n');

      const pgRestoreCommand = [
        'PGPASSWORD=' + dbConfig.password,
        'pg_restore',
        `-h ${dbConfig.host}`,
        `-p ${dbConfig.port}`,
        `-U ${dbConfig.user}`,
        `-d ${dbConfig.database}`,
        '--no-password', // Não pedir senha (usa PGPASSWORD)
        '--verbose', // Mostrar progresso
        '--clean', // Limpar objetos antes de criar
        '--if-exists', // Usar IF EXISTS nos DROPs
        '--no-owner', // Não restaurar ownership
        '--no-privileges', // Não restaurar privilégios
        '--no-tablespaces', // Não restaurar tablespaces
        `"${finalBackupPath}"`,
      ].join(' ');

      execSync(pgRestoreCommand, {
        stdio: 'inherit',
        env: {
          ...process.env,
          PGPASSWORD: dbConfig.password,
        },
      });
    }

    // Limpar arquivo temporário se foi descomprimido
    if (isTempFile && existsSync(finalBackupPath)) {
      console.log('\n🧹 Removendo arquivo temporário...');
      execSync(`rm "${finalBackupPath}"`, { stdio: 'ignore' });
    }

    console.log('\n✅ Backup restaurado com sucesso!');
    console.log(`   Banco: ${dbConfig.database}`);
    console.log(`   Host: ${dbConfig.host}`);

  } catch (error) {
    console.error('\n❌ Erro ao restaurar backup:');
    console.error(error.message);

    if (error.message.includes('pg_restore: command not found')) {
      console.error('\n💡 Dica: Instale o PostgreSQL client tools:');
      console.error('   Ubuntu/Debian: sudo apt-get install postgresql-client');
      console.error('   macOS: brew install postgresql');
    }

    process.exit(1);
  }
}

// Executar a restauração
restoreBackup();

