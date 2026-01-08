#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
console.log('🔍 Current working directory:', process.cwd());
console.log('🔍 Looking for .env file...');

const envResult = dotenv.config();
if (envResult.error) {
  console.error('❌ Error loading .env:', envResult.error);
  console.log('🔍 Trying alternative paths...');
  
  // Try different paths
  const paths = ['./.env', '../.env', '.env'];
  for (const path of paths) {
    console.log(`🔍 Trying path: ${path}`);
    const altResult = dotenv.config({ path });
    if (!altResult.error) {
      console.log(`✅ Successfully loaded from: ${path}`);
      break;
    } else {
      console.log(`❌ Failed to load from: ${path}`);
    }
  }
} else {
  console.log('✅ .env loaded successfully');
}

// Debug environment variables
console.log('\n🔧 Environment Variables Debug:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');
console.log('ASAAS_SANDBOX:', process.env.ASAAS_SANDBOX || 'undefined');
console.log('ASAAS_API_KEY_SANDBOX:', process.env.ASAAS_API_KEY_SANDBOX ? '✅ Set' : '❌ Not set');
console.log('VITE_API_URL:', process.env.VITE_API_URL || 'undefined');
console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');

// Create simple Express app
const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
      ASAAS_SANDBOX: process.env.ASAAS_SANDBOX || 'undefined',
      ASAAS_API_KEY_SANDBOX: process.env.ASAAS_API_KEY_SANDBOX ? 'Set' : 'Not set'
    },
    message: 'API Health Check - Environment variables loaded'
  });
});

// Debug endpoint
app.get('/api/debug', (req, res) => {
  res.json({
    workingDirectory: process.cwd(),
    envFileExists: require('fs').existsSync('.env'),
    envFileContents: process.env.DATABASE_URL ? 'Variables loaded' : 'Variables not loaded',
    allEnvVars: Object.keys(process.env).filter(key => 
      key.includes('DATABASE') || 
      key.includes('ASAAS') || 
      key.includes('VITE')
    ).reduce((obj, key) => {
      obj[key] = process.env[key] ? 'Set' : 'Not set';
      return obj;
    }, {})
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Health Check API running on http://localhost:${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Debug Info: http://localhost:${PORT}/api/debug`);
  console.log('\n📋 Environment Status:');
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Loaded' : '❌ Not loaded'}`);
  console.log(`ASAAS_SANDBOX: ${process.env.ASAAS_SANDBOX || '❌ Not set'}`);
  console.log(`ASAAS_API_KEY_SANDBOX: ${process.env.ASAAS_API_KEY_SANDBOX ? '✅ Loaded' : '❌ Not loaded'}`);
});