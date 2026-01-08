#!/usr/bin/env node

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Testing environment variables loading...');
console.log('📁 Current directory:', process.cwd());
console.log('📁 Script directory:', __dirname);
console.log('📁 Looking for .env in:', join(process.cwd(), '.env'));

// Try loading .env
const result = dotenv.config();
if (result.error) {
  console.error('❌ Error loading .env:', result.error);
} else {
  console.log('✅ .env loaded successfully');
  console.log('📋 Parsed variables:', Object.keys(result.parsed || {}));
}

// Check specific variables
console.log('\n🔧 Environment Variables:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');
console.log('ASAAS_SANDBOX:', process.env.ASAAS_SANDBOX || 'undefined');
console.log('ASAAS_API_KEY_SANDBOX:', process.env.ASAAS_API_KEY_SANDBOX ? '✅ Set' : '❌ Not set');
console.log('VITE_API_URL:', process.env.VITE_API_URL || 'undefined');