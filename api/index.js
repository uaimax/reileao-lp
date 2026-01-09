import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import postgres from 'postgres';
import bcrypt from 'bcrypt';
import multer from 'multer';
import crypto from 'crypto';
import fetch from 'node-fetch';
import { S3Client, HeadBucketCommand, PutObjectCommand } from '@aws-sdk/client-s3';

// Load environment variables
console.log('🔍 Current working directory:', process.cwd());
console.log('🔍 Looking for .env file...');
const envResult = dotenv.config();
if (envResult.error) {
  console.error('❌ Error loading .env:', envResult.error);
} else {
  console.log('✅ .env loaded successfully');
}

// Debug ASAAS environment variables
if (process.env.NODE_ENV !== 'production') {
  console.log('🔧 ASAAS Environment Debug:');
  console.log('📁 ASAAS_SANDBOX:', process.env.ASAAS_SANDBOX || 'undefined');
  console.log('🔑 ASAAS_API_KEY_SANDBOX:', process.env.ASAAS_API_KEY_SANDBOX ? '✅ Yes' : '❌ No');
  console.log('🔑 ASAAS_API_KEY_PRODUCTION:', process.env.ASAAS_API_KEY_PRODUCTION ? '✅ Yes' : '❌ No');
}

// Debug environment in development
if (process.env.NODE_ENV !== 'production') {
  console.log('🔧 Development mode detected');
  console.log('📁 DATABASE_URL loaded:', process.env.DATABASE_URL ? '✅ Yes' : '❌ No');
  console.log('🌐 NODE_ENV:', process.env.NODE_ENV || 'undefined');
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Helper function to convert snake_case to camelCase
function toCamelCase(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  // Handle Date objects specially - return them as ISO strings
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  if (typeof obj !== 'object') return obj;

  const camelObj = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
    camelObj[camelKey] = toCamelCase(value);
  }
  return camelObj;
}

const app = express();
const PORT = process.env.PORT || 3002;

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL is not set');
  console.log('🔧 Running in diagnostic mode - API will start but database features will be disabled');
  // Don't throw error, just log it
}

const client = connectionString ? postgres(connectionString) : null;

// CORS: Use SITE_URL from environment or fallback to localhost origins
// SITE_URL = URL do frontend (origem das requisições)
// VITE_API_URL = URL da API (pode ser usado para extrair o domínio se SITE_URL não estiver definido)
let siteUrl = process.env.SITE_URL || process.env.VITE_SITE_URL || '';

// Se não tiver SITE_URL mas tiver VITE_API_URL, tenta extrair o domínio base
if (!siteUrl && process.env.VITE_API_URL) {
  try {
    const apiUrl = new URL(process.env.VITE_API_URL);
    // Se a API está no mesmo domínio, usa o mesmo domínio para o frontend
    siteUrl = `${apiUrl.protocol}//${apiUrl.host}`;
    console.log('🔧 CORS: Extracted siteUrl from VITE_API_URL:', siteUrl);
  } catch (e) {
    console.warn('⚠️ CORS: Could not parse VITE_API_URL:', process.env.VITE_API_URL);
  }
}

// Log para debug
console.log('🌐 CORS Configuration:');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   SITE_URL:', process.env.SITE_URL || 'not set');
console.log('   VITE_SITE_URL:', process.env.VITE_SITE_URL || 'not set');
console.log('   VITE_API_URL:', process.env.VITE_API_URL || 'not set');
console.log('   Final siteUrl:', siteUrl || 'not set');

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? (siteUrl ? [
      siteUrl,
      siteUrl.replace('https://www.', 'https://'),
      siteUrl.replace('https://', 'https://www.'),
      // Adiciona variações comuns
      siteUrl.replace(/\/$/, ''), // Remove trailing slash
      siteUrl + '/', // Adiciona trailing slash
    ].filter((url, index, self) => self.indexOf(url) === index) : []) // Remove duplicatas
  : [
      'http://localhost:8080',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:3002'
    ];

console.log('✅ CORS Allowed Origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    console.log('🌐 CORS request from origin:', origin);

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('✅ CORS: Allowing request with no origin');
      return callback(null, true);
    }

    if (process.env.NODE_ENV === 'production') {
      // Permite domínios de preview da Vercel
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        console.log('✅ CORS: Production origin allowed:', origin);
        return callback(null, true);
      }
      console.log('❌ CORS: Production origin rejected:', origin);
      return callback(new Error('Not allowed by CORS'));
    } else {
      // In development, allow all localhost origins
      if (origin.startsWith('http://localhost:') || allowedOrigins.includes(origin)) {
        console.log('✅ CORS: Development origin allowed:', origin);
        return callback(null, true);
      }
      console.log('❌ CORS: Development origin rejected:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization,Origin,Accept,X-Requested-With',
  maxAge: 86400
}));

app.options('*', cors());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from dist directory
app.use(express.static('dist'));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    if (client) {
      // Test database connection
      await client`SELECT 1`;
      res.json({
        status: 'OK',
        database: 'Connected',
        timestamp: new Date().toISOString(),
        version: '2.1.0 - AI Instructions Support',
        environment: {
          DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
          ASAAS_SANDBOX: process.env.ASAAS_SANDBOX || 'undefined',
          ASAAS_API_KEY_SANDBOX: process.env.ASAAS_API_KEY_SANDBOX ? 'Set' : 'Not set'
        }
      });
    } else {
      res.json({
        status: 'OK (Diagnostic Mode)',
        database: 'Not connected - DATABASE_URL not set',
        timestamp: new Date().toISOString(),
        environment: {
          DATABASE_URL: 'Not set',
          ASAAS_SANDBOX: process.env.ASAAS_SANDBOX || 'undefined',
          ASAAS_API_KEY_SANDBOX: process.env.ASAAS_API_KEY_SANDBOX ? 'Set' : 'Not set'
        },
        message: 'API is running in diagnostic mode. Check environment variables.'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      database: 'Disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Debug environment variables
app.get('/api/debug-env', (req, res) => {
  res.json({
    asaas_sandbox_key: process.env.ASAAS_API_KEY_SANDBOX ? '✅ Found' : '❌ Missing',
    asaas_prod_key: process.env.ASAAS_API_KEY_PRODUCTION ? '✅ Found' : '❌ Missing',
    database_url: process.env.DATABASE_URL ? '✅ Found' : '❌ Missing',
    node_env: process.env.NODE_ENV || 'undefined'
  });
});

// Debug endpoint for development
app.get('/api/debug', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }

  res.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'undefined',
    port: PORT,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    origin: req.headers.origin,
    headers: {
      host: req.headers.host,
      origin: req.headers.origin,
      referer: req.headers.referer,
      userAgent: req.headers['user-agent']
    },
    allowedOrigins: allowedOrigins
  });
});

// Migration endpoint (only for production setup)
app.post('/api/setup-auth', async (req, res) => {
  try {
    // Check if users table exists
    const tableExists = await client`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      )
    `;

    if (!tableExists[0].exists) {
      // Create users table
      await client`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Create index
      await client`CREATE INDEX idx_users_email ON users (email) WHERE is_active = true`;

      // Insert default user (password: maxmax123)
      const passwordHash = await bcrypt.hash('maxmax123', 12);
      await client`
        INSERT INTO users (email, password_hash)
        VALUES ('lmax00@gmail.com', ${passwordHash})
      `;

      res.json({ success: true, message: 'Authentication setup completed' });
    } else {
      // Check if user exists and show info
      const users = await client`SELECT email, password_hash FROM users WHERE email = 'lmax00@gmail.com'`;
      res.json({
        success: true,
        message: 'Users table already exists',
        userExists: users.length > 0,
        userHash: users.length > 0 ? users[0].password_hash.substring(0, 10) + '...' : null
      });
    }
  } catch (error) {
    console.error('Setup auth failed:', error);
    res.status(500).json({ error: 'Setup failed', details: error.message });
  }
});


// Test endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await client`SELECT NOW() as current_time`;
    res.json({ success: true, time: result[0] });
  } catch (error) {
    console.error('Database test failed:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// S3 Test endpoint
app.post('/api/test-s3', async (req, res) => {
  try {
    const { endpoint, accessKey, secretKey, bucketName, region } = req.body;

    if (!endpoint || !accessKey || !secretKey || !bucketName) {
      return res.status(400).json({ error: 'Missing required S3 configuration' });
    }

    const s3Client = new S3Client({
      endpoint: endpoint,
      region: region || 'auto',
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: true, // Required for Cloudflare R2
    });

    // Test connection by checking if bucket exists
    const command = new HeadBucketCommand({ Bucket: bucketName });
    await s3Client.send(command);

    res.json({ success: true, message: 'S3 connection successful' });
  } catch (error) {
    console.error('S3 test failed:', error);
    res.status(500).json({
      error: 'S3 connection failed',
      details: error.message
    });
  }
});

// File Upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const folder = req.body.folder || 'uploads';

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Get S3 configuration from event_config table
    const eventConfig = await client`
      SELECT
        id,
        event_title,
        event_subtitle,
        event_tagline,
        event_date_display,
        event_countdown_target,
        event_countdown_text,
        hero_video_url,
        registration_url,
        s3_endpoint,
        s3_access_key,
        s3_secret_key,
        s3_bucket_name,
        s3_region,
        s3_public_domain,
        s3_enabled,
        whatsapp_number,
        whatsapp_message,
        whatsapp_enabled,
        meta_title,
        meta_description,
        meta_image_url,
        created_at,
        updated_at
      FROM event_config
      LIMIT 1
    `;

    if (!eventConfig.length || !eventConfig[0].s3_enabled) {
      return res.status(400).json({ error: 'S3 not configured or disabled' });
    }

    const config = eventConfig[0];

    if (!config.s3_endpoint || !config.s3_access_key || !config.s3_secret_key || !config.s3_bucket_name) {
      return res.status(400).json({ error: 'S3 configuration incomplete' });
    }

    // Initialize S3 client
    const s3Client = new S3Client({
      endpoint: config.s3_endpoint,
      region: config.s3_region || 'auto',
      credentials: {
        accessKeyId: config.s3_access_key,
        secretAccessKey: config.s3_secret_key,
      },
      forcePathStyle: true,
    });

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = folder ? `${folder}/${timestamp}_${originalName}` : `${timestamp}_${originalName}`;

    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: config.s3_bucket_name,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(uploadCommand);

    // Construct public URL
    const publicUrl = config.s3_public_domain
      ? `${config.s3_public_domain}/${key}`
      : `${config.s3_endpoint}/${config.s3_bucket_name}/${key}`;

    res.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('Upload failed:', error);
    res.status(500).json({
      error: 'Upload failed',
      details: error.message
    });
  }
});

// Event Config endpoints
app.get('/api/event-config', async (req, res) => {
  try {
    const result = await client`SELECT * FROM event_config LIMIT 1`;
    res.json(toCamelCase(result[0]) || null);
  } catch (error) {
    console.error('Error fetching event config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/event-config', async (req, res) => {
  // Defaults para o event config - usar variáveis de ambiente quando disponível
  const siteName = process.env.SITE_NAME || process.env.VITE_SITE_NAME || 'Meu Evento';
  const defaultWhatsAppMessage = `Oi! Quero mais informações sobre o ${siteName}`;

  try {
    const data = req.body;
    const result = await client`
      UPDATE event_config
      SET
        event_title = ${data.eventTitle || `${siteName} 2025`},
        event_subtitle = ${data.eventSubtitle || 'Uma experiência única'},
        event_tagline = ${data.eventTagline || 'Seu evento especial'},
        event_date_display = ${data.eventDateDisplay || 'Data a definir'},
        event_countdown_target = ${data.eventCountdownTarget || '2025-09-05 14:00:00-03'},
        event_countdown_text = ${data.eventCountdownText || 'O evento inicia em:'},
        hero_video_url = ${data.heroVideoUrl || ''},
        registration_url = ${data.registrationUrl || '/inscricoes'},
        s3_endpoint = ${data.s3Endpoint || ''},
        s3_access_key = ${data.s3AccessKey || ''},
        s3_secret_key = ${data.s3SecretKey || ''},
        s3_bucket_name = ${data.s3BucketName || ''},
        s3_region = ${data.s3Region || ''},
        s3_public_domain = ${data.s3PublicDomain || ''},
        s3_enabled = ${data.s3Enabled || false},
        whatsapp_number = ${data.whatsappNumber || ''},
        whatsapp_message = ${data.whatsappMessage || defaultWhatsAppMessage},
        whatsapp_enabled = ${data.whatsappEnabled !== undefined ? data.whatsappEnabled : true},
        temporary_redirect_url = ${data.temporaryRedirectUrl || null},
        meta_title = ${data.metaTitle || null},
        meta_description = ${data.metaDescription || null},
        meta_image_url = ${data.metaImageUrl || null},
        updated_at = NOW()
      WHERE id = 1
      RETURNING *
    `;

    res.json(toCamelCase(result[0]));
  } catch (error) {
    console.error('Error updating event config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Hero Content endpoints
app.get('/api/hero-content', async (req, res) => {
  try {
    const result = await client`SELECT * FROM hero_content LIMIT 1`;
    res.json(toCamelCase(result[0]) || null);
  } catch (error) {
    console.error('Error fetching hero content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/hero-content', async (req, res) => {
  try {
    const data = req.body;
    const result = await client`
      UPDATE hero_content
      SET
        cta_primary_text = ${data.ctaPrimaryText || 'QUERO SABER MAIS'},
        cta_secondary_text = ${data.ctaSecondaryText || 'PULAR PARA INGRESSOS'},
        updated_at = NOW()
      WHERE id = 1
      RETURNING *
    `;

    res.json(toCamelCase(result[0]));
  } catch (error) {
    console.error('Error updating hero content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Artists endpoints
app.get('/api/artists', async (req, res) => {
  try {
    const { includeInactive } = req.query;

    let result;
    if (includeInactive === 'true') {
      // For admin panel - show all artists
      result = await client`SELECT * FROM artists ORDER BY display_order, created_at`;
    } else {
      // For public site - only show active artists
      result = await client`SELECT * FROM artists WHERE is_active = true ORDER BY display_order, created_at`;
    }

    res.json(toCamelCase(result));
  } catch (error) {
    console.error('Error fetching artists:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/artists', async (req, res) => {
  try {
    const data = req.body;
    const result = await client`
      INSERT INTO artists (name, role, city_state, photo_url, description, promotional_video_url, display_order, is_active)
      VALUES (
        ${data.name || ''},
        ${data.role || ''},
        ${data.cityState || ''},
        ${data.photoUrl || null},
        ${data.description || null},
        ${data.promotionalVideoUrl || null},
        ${data.displayOrder || 0},
        ${data.isActive !== undefined ? data.isActive : true}
      )
      RETURNING *
    `;
    res.json(toCamelCase(result[0]));
  } catch (error) {
    console.error('Error creating artist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/artists/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await client`
      UPDATE artists
      SET
        name = ${data.name || ''},
        role = ${data.role || ''},
        city_state = ${data.cityState || ''},
        photo_url = ${data.photoUrl || null},
        description = ${data.description || null},
        promotional_video_url = ${data.promotionalVideoUrl || null},
        display_order = ${data.displayOrder || 0},
        is_active = ${data.isActive !== undefined ? data.isActive : true},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    res.json(toCamelCase(result[0]));
  } catch (error) {
    console.error('Error updating artist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/artists/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client`
      UPDATE artists
      SET is_active = false, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    res.json({ success: true, message: 'Artist deleted successfully' });
  } catch (error) {
    console.error('Error deleting artist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Testimonials endpoints
app.get('/api/testimonials', async (req, res) => {
  try {
    const result = await client`SELECT * FROM testimonials WHERE is_active = true ORDER BY display_order, created_at`;
    res.json(toCamelCase(result));
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/testimonials', async (req, res) => {
  try {
    const data = req.body;
    const result = await client`
      INSERT INTO testimonials (name, city_state, testimonial_text, photo_url, display_order, is_active)
      VALUES (
        ${data.name || ''},
        ${data.cityState || ''},
        ${data.testimonialText || ''},
        ${data.photoUrl || null},
        ${data.displayOrder || 0},
        ${data.isActive !== undefined ? data.isActive : true}
      )
      RETURNING *
    `;
    res.json(toCamelCase(result[0]));
  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/testimonials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await client`
      UPDATE testimonials
      SET
        name = ${data.name || ''},
        city_state = ${data.cityState || ''},
        testimonial_text = ${data.testimonialText || ''},
        photo_url = ${data.photoUrl || null},
        display_order = ${data.displayOrder || 0},
        is_active = ${data.isActive !== undefined ? data.isActive : true},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    res.json(toCamelCase(result[0]));
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/testimonials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client`
      UPDATE testimonials
      SET is_active = false, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    res.json({ success: true, message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Redirects endpoints
app.get('/api/redirects', async (req, res) => {
  try {
    const result = await client`SELECT * FROM redirects WHERE is_active = true ORDER BY display_order, created_at`;
    res.json(toCamelCase(result));
  } catch (error) {
    console.error('Error fetching redirects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/redirects', async (req, res) => {
  try {
    const data = req.body;

    // Check if alias already exists
    const existing = await client`SELECT id FROM redirects WHERE alias = ${data.alias} AND is_active = true`;
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Alias already exists' });
    }

    const result = await client`
      INSERT INTO redirects (alias, target_url, display_order, is_active)
      VALUES (
        ${data.alias || ''},
        ${data.targetUrl || ''},
        ${data.displayOrder || 0},
        ${data.isActive !== undefined ? data.isActive : true}
      )
      RETURNING *
    `;
    res.json(toCamelCase(result[0]));
  } catch (error) {
    console.error('Error creating redirect:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/redirects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Check if alias already exists (excluding current record)
    const existing = await client`SELECT id FROM redirects WHERE alias = ${data.alias} AND is_active = true AND id != ${id}`;
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Alias already exists' });
    }

    const result = await client`
      UPDATE redirects
      SET
        alias = ${data.alias || ''},
        target_url = ${data.targetUrl || ''},
        display_order = ${data.displayOrder || 0},
        is_active = ${data.isActive !== undefined ? data.isActive : true},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Redirect not found' });
    }

    res.json(toCamelCase(result[0]));
  } catch (error) {
    console.error('Error updating redirect:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/redirects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client`
      UPDATE redirects
      SET is_active = false, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Redirect not found' });
    }

    res.json({ success: true, message: 'Redirect deleted successfully' });
  } catch (error) {
    console.error('Error deleting redirect:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Redirect handling endpoint (for actual redirects)
app.get('/:alias', async (req, res, next) => {
  try {
    const { alias } = req.params;

    // Don't try to redirect reserved paths for the SPA - let them fall through
    if (alias === 'painel' || alias === 'api') {
      return next();
    }

    const result = await client`SELECT target_url FROM redirects WHERE alias = ${alias} AND is_active = true LIMIT 1`;

    if (result.length === 0) {
      return next(); // Let it fall through to SPA fallback
    }

    res.redirect(302, result[0].target_url);
  } catch (error) {
    console.error('Error handling redirect:', error);
    return next(); // Let it fall through to SPA fallback on error
  }
});

// Sprint Management endpoints
app.get('/api/sprints', async (req, res) => {
  try {
    const result = await client`SELECT * FROM sprints ORDER BY created_at DESC`;
    res.json(toCamelCase(result));
  } catch (error) {
    console.error('Error fetching sprints:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/sprints', async (req, res) => {
  try {
    const data = req.body;
    const result = await client`
      INSERT INTO sprints (name, description, status, start_date, end_date, target_completion_date, progress, priority)
      VALUES (
        ${data.name || ''},
        ${data.description || null},
        ${data.status || 'planning'},
        ${data.startDate || null},
        ${data.endDate || null},
        ${data.targetCompletionDate || null},
        ${data.progress || 0},
        ${data.priority || 'medium'}
      )
      RETURNING *
    `;
    res.json(toCamelCase(result[0]));
  } catch (error) {
    console.error('Error creating sprint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/sprints/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await client`
      UPDATE sprints
      SET
        name = ${data.name || ''},
        description = ${data.description || null},
        status = ${data.status || 'planning'},
        start_date = ${data.startDate || null},
        end_date = ${data.endDate || null},
        target_completion_date = ${data.targetCompletionDate || null},
        progress = ${data.progress || 0},
        priority = ${data.priority || 'medium'},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Sprint not found' });
    }

    res.json(toCamelCase(result[0]));
  } catch (error) {
    console.error('Error updating sprint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/sprints/:id/tasks', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client`SELECT * FROM sprint_tasks WHERE sprint_id = ${id} ORDER BY display_order, created_at`;
    res.json(toCamelCase(result));
  } catch (error) {
    console.error('Error fetching sprint tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/sprints/:id/tasks', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await client`
      INSERT INTO sprint_tasks (sprint_id, title, description, status, priority, estimated_hours, actual_hours, assigned_to, tags, dependencies, display_order)
      VALUES (
        ${id},
        ${data.title || ''},
        ${data.description || null},
        ${data.status || 'pending'},
        ${data.priority || 'medium'},
        ${data.estimatedHours || null},
        ${data.actualHours || null},
        ${data.assignedTo || null},
        ${data.tags || null},
        ${data.dependencies || null},
        ${data.displayOrder || 0}
      )
      RETURNING *
    `;
    res.json(toCamelCase(result[0]));
  } catch (error) {
    console.error('Error creating sprint task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await client`
      UPDATE sprint_tasks
      SET
        title = ${data.title || ''},
        description = ${data.description || null},
        status = ${data.status || 'pending'},
        priority = ${data.priority || 'medium'},
        estimated_hours = ${data.estimatedHours || null},
        actual_hours = ${data.actualHours || null},
        assigned_to = ${data.assignedTo || null},
        tags = ${data.tags || null},
        dependencies = ${data.dependencies || null},
        completed_at = ${data.completedAt || null},
        blocked_reason = ${data.blockedReason || null},
        display_order = ${data.displayOrder || 0},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(toCamelCase(result[0]));
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/sprints/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;

    // Mark sprint as active and set start date if not set
    const sprintResult = await client`
      UPDATE sprints
      SET
        status = 'active',
        start_date = COALESCE(start_date, NOW()),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (sprintResult.length === 0) {
      return res.status(404).json({ error: 'Sprint not found' });
    }

    // Execute YOLO methodology: start all pending tasks
    await client`
      UPDATE sprint_tasks
      SET
        status = 'in_progress',
        updated_at = NOW()
      WHERE sprint_id = ${id} AND status = 'pending'
    `;

    // Record execution
    await client`
      INSERT INTO sprint_executions (sprint_id, execution_type, status, results, started_at)
      VALUES (
        ${id},
        'manual',
        'completed',
        '{"type": "yolo", "tasks_started": "all_pending"}',
        NOW()
      )
    `;

    res.json({ success: true, message: 'YOLO Sprint executed successfully', sprint: toCamelCase(sprintResult[0]) });
  } catch (error) {
    console.error('Error executing sprint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bio Links endpoints
app.get('/api/bio-links', async (req, res) => {
  try {
    const { includeInactive, includeExpired } = req.query;
    const now = new Date().toISOString();

    let result;
    if (includeInactive === 'true' && includeExpired === 'true') {
      // For admin panel - show all bio links
      result = await client`SELECT * FROM bio_links ORDER BY display_order, created_at`;
    } else {
      // For public bio pages - only show active links that are not expired
      result = await client`
        SELECT * FROM bio_links
        WHERE is_active = true
        AND (
          is_scheduled = false
          OR (
            is_scheduled = true
            AND (schedule_start IS NULL OR schedule_start <= ${now})
            AND (schedule_end IS NULL OR schedule_end >= ${now})
          )
        )
        ORDER BY display_order, created_at
      `;
    }

    res.json(toCamelCase(result));
  } catch (error) {
    console.error('Error fetching bio links:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/bio-links', async (req, res) => {
  try {
    const data = req.body;
    const result = await client`
      INSERT INTO bio_links (title, url, display_order, is_active, is_scheduled, schedule_start, schedule_end)
      VALUES (
        ${data.title || ''},
        ${data.url || ''},
        ${data.displayOrder || 0},
        ${data.isActive !== undefined ? data.isActive : true},
        ${data.isScheduled !== undefined ? data.isScheduled : false},
        ${data.scheduleStart || null},
        ${data.scheduleEnd || null}
      )
      RETURNING *
    `;
    res.json(toCamelCase(result[0]));
  } catch (error) {
    console.error('Error creating bio link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/bio-links/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await client`
      UPDATE bio_links
      SET
        title = ${data.title || ''},
        url = ${data.url || ''},
        display_order = ${data.displayOrder || 0},
        is_active = ${data.isActive !== undefined ? data.isActive : true},
        is_scheduled = ${data.isScheduled !== undefined ? data.isScheduled : false},
        schedule_start = ${data.scheduleStart || null},
        schedule_end = ${data.scheduleEnd || null},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Bio link not found' });
    }

    res.json(toCamelCase(result[0]));
  } catch (error) {
    console.error('Error updating bio link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/bio-links/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client`
      DELETE FROM bio_links
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Bio link not found' });
    }

    res.json({ success: true, message: 'Bio link deleted successfully' });
  } catch (error) {
    console.error('Error deleting bio link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bio Configuration endpoints
app.get('/api/bio-config', async (req, res) => {
  try {
    const result = await client`SELECT * FROM bio_config LIMIT 1`;
    if (result.length === 0) {
      // Return default config if none exists
      const defaultConfig = {
        id: 1,
        showEventDate: true,
        showTrailerButton: true
      };
      res.json(toCamelCase(defaultConfig));
    } else {
      res.json(toCamelCase(result[0]));
    }
  } catch (error) {
    console.error('Error fetching bio config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/bio-config', async (req, res) => {
  try {
    const data = req.body;
    const result = await client`
      INSERT INTO bio_config (id, event_logo_url, show_event_date, show_trailer_button, bio_title, bio_subtitle)
      VALUES (1, ${data.eventLogoUrl || null}, ${data.showEventDate !== undefined ? data.showEventDate : true}, ${data.showTrailerButton !== undefined ? data.showTrailerButton : true}, ${data.bioTitle || null}, ${data.bioSubtitle || null})
      ON CONFLICT (id) DO UPDATE SET
        event_logo_url = ${data.eventLogoUrl || null},
        show_event_date = ${data.showEventDate !== undefined ? data.showEventDate : true},
        show_trailer_button = ${data.showTrailerButton !== undefined ? data.showTrailerButton : true},
        bio_title = ${data.bioTitle || null},
        bio_subtitle = ${data.bioSubtitle || null},
        updated_at = NOW()
      RETURNING *
    `;
    res.json(toCamelCase(result[0]));
  } catch (error) {
    console.error('Error updating bio config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bio Analytics endpoints
app.post('/api/bio-analytics', async (req, res) => {
  try {
    const data = req.body;
    const userAgent = req.headers['user-agent'];
    const referrer = req.headers.referer || req.headers.referrer;
    const ipAddress = req.ip || req.connection.remoteAddress;

    await client`
      INSERT INTO bio_analytics (bio_link_id, user_agent, referrer, ip_address)
      VALUES (
        ${data.bioLinkId},
        ${userAgent || null},
        ${referrer || null},
        ${ipAddress || null}
      )
    `;

    res.json({ success: true, message: 'Click tracked successfully' });
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/bio-analytics/summary', async (req, res) => {
  try {
    const result = await client`
      SELECT
        bio_link_id,
        COUNT(*) as click_count
      FROM bio_analytics
      GROUP BY bio_link_id
      ORDER BY bio_link_id
    `;
    res.json(toCamelCase(result));
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/bio-analytics/details/:linkId', async (req, res) => {
  try {
    const { linkId } = req.params;
    const result = await client`
      SELECT
        clicked_at,
        user_agent,
        referrer,
        ip_address
      FROM bio_analytics
      WHERE bio_link_id = ${linkId}
      ORDER BY clicked_at DESC
      LIMIT 100
    `;
    res.json(toCamelCase(result));
  } catch (error) {
    console.error('Error fetching analytics details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const user = await client`SELECT * FROM users WHERE email = ${email} AND is_active = true LIMIT 1`;

    if (user.length === 0) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const isPasswordValid = await bcrypt.compare(password, user[0].password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    res.json({
      success: true,
      user: {
        id: user[0].id,
        email: user[0].email
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/auth/verify', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    const user = await client`SELECT id, email FROM users WHERE email = ${email} AND is_active = true LIMIT 1`;

    if (user.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      success: true,
      user: {
        id: user[0].id,
        email: user[0].email
      }
    });
  } catch (error) {
    console.error('Error during verification:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// FAQ endpoints
app.get('/api/faqs', async (req, res) => {
  try {
    const { includeInactive } = req.query;

    let result;
    if (includeInactive === 'true') {
      // For admin panel - show all FAQs
      result = await client`SELECT * FROM faqs ORDER BY display_order, created_at`;
    } else {
      // For public site - only show active FAQs
      result = await client`SELECT * FROM faqs WHERE is_active = true ORDER BY display_order, created_at`;
    }

    res.json(toCamelCase(result));
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/faqs', async (req, res) => {
  try {
    const data = req.body;
    const result = await client`
      INSERT INTO faqs (question, answer, display_order, is_active)
      VALUES (
        ${data.question || ''},
        ${data.answer || ''},
        ${data.displayOrder || 0},
        ${data.isActive !== undefined ? data.isActive : true}
      )
      RETURNING *
    `;
    res.json(toCamelCase(result[0]));
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/faqs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await client`
      UPDATE faqs
      SET
        question = ${data.question || ''},
        answer = ${data.answer || ''},
        display_order = ${data.displayOrder || 0},
        is_active = ${data.isActive !== undefined ? data.isActive : true},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    res.json(toCamelCase(result[0]));
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/faqs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client`
      DELETE FROM faqs
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    res.json({ success: true, message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Debug endpoint for AI Instructions
app.put('/api/debug-ai-instructions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    console.log('Debug AI Instructions Update:');
    console.log('ID:', id);
    console.log('Payload:', JSON.stringify(data, null, 2));
    console.log('data.isActive:', data.isActive);
    console.log('data.isActive !== undefined:', data.isActive !== undefined);

    const result = await client`
      UPDATE ai_instructions
      SET
        title = ${data.title || ''},
        content = ${data.content || ''},
        order_index = ${data.orderIndex || 0},
        is_active = ${data.isActive !== undefined ? data.isActive : true},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    console.log('SQL Result:', result);

    if (result.length === 0) {
      return res.status(404).json({ error: 'AI instruction not found' });
    }

    res.json({
      success: true,
      debug: {
        receivedPayload: data,
        sqlResult: result[0],
        processedData: toCamelCase(result[0])
      }
    });
  } catch (error) {
    console.error('Error updating AI instruction:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Test HTML stripping endpoint
app.get('/api/test-html-strip', (req, res) => {
  const testHtml = '<p>Teste com <a href="https://example.com">link</a> e <strong>negrito</strong></p>';
  const cleaned = stripHtml(testHtml);

  res.json({
    original: testHtml,
    cleaned: cleaned,
    version: '2.2.0 - HTML Stripping Support',
    message: 'HTML stripping function working correctly'
  });
});

// Test AI Instructions endpoint
app.get('/api/test-ai-instructions', async (req, res) => {
  try {
    if (!client || typeof client !== 'function') {
      return res.json({
        error: 'Database not connected',
        mockData: 'AI Instructions feature available but database not connected'
      });
    }

    const instructionsResult = await client`SELECT * FROM ai_instructions WHERE is_active = true ORDER BY order_index, created_at`;

    res.json({
      success: true,
      instructions: instructionsResult,
      count: instructionsResult.length,
      message: 'AI Instructions endpoint working correctly'
    });
  } catch (error) {
    console.error('Error testing AI instructions:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// AI Instructions endpoints
app.get('/api/ai-instructions', async (req, res) => {
  try {
    const { includeInactive } = req.query;

    let result;
    if (includeInactive === 'true') {
      // For admin panel - show all instructions
      result = await client`SELECT * FROM ai_instructions ORDER BY order_index, created_at`;
    } else {
      // For public API - only show active instructions
      result = await client`SELECT * FROM ai_instructions WHERE is_active = true ORDER BY order_index, created_at`;
    }

    res.json(toCamelCase(result));
  } catch (error) {
    console.error('Error fetching AI instructions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/ai-instructions', async (req, res) => {
  try {
    const data = req.body;
    const result = await client`
      INSERT INTO ai_instructions (title, content, order_index, is_active)
      VALUES (
        ${data.title || ''},
        ${data.content || ''},
        ${data.orderIndex || 0},
        ${data.isActive !== undefined ? data.isActive : true}
      )
      RETURNING *
    `;
    res.json(toCamelCase(result[0]));
  } catch (error) {
    console.error('Error creating AI instruction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/ai-instructions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Debug logs
    console.log('AI Instructions Update - ID:', id);
    console.log('AI Instructions Update - Payload:', JSON.stringify(data, null, 2));
    console.log('AI Instructions Update - data.isActive:', data.isActive);
    console.log('AI Instructions Update - data.isActive !== undefined:', data.isActive !== undefined);

    const result = await client`
      UPDATE ai_instructions
      SET
        title = ${data.title || ''},
        content = ${data.content || ''},
        order_index = ${data.orderIndex || 0},
        is_active = ${data.isActive !== undefined ? data.isActive : true},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    console.log('AI Instructions Update - SQL Result:', result);

    if (result.length === 0) {
      return res.status(404).json({ error: 'AI instruction not found' });
    }

    res.json(toCamelCase(result[0]));
  } catch (error) {
    console.error('Error updating AI instruction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/ai-instructions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client`
      DELETE FROM ai_instructions
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'AI instruction not found' });
    }

    res.json({ success: true, message: 'AI instruction deleted successfully' });
  } catch (error) {
    console.error('Error deleting AI instruction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// FAQ Content endpoints
app.get('/api/faq-content', async (req, res) => {
  try {
    const result = await client`SELECT * FROM faq_content LIMIT 1`;
    res.json(toCamelCase(result[0] || {}));
  } catch (error) {
    console.error('Error fetching FAQ content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/faq-content', async (req, res) => {
  try {
    const data = req.body;
    const result = await client`
      UPDATE faq_content
      SET
        section_title = ${data.sectionTitle || 'Perguntas Frequentes'},
        section_subtitle = ${data.sectionSubtitle || 'Tire suas dúvidas sobre o evento'},
        updated_at = NOW()
      WHERE id = 1
      RETURNING *
    `;

    if (result.length === 0) {
      // If no record exists, create one
      const insertResult = await client`
        INSERT INTO faq_content (section_title, section_subtitle)
        VALUES (
          ${data.sectionTitle || 'Perguntas Frequentes'},
          ${data.sectionSubtitle || 'Tire suas dúvidas sobre o evento'}
        )
        RETURNING *
      `;
      res.json(toCamelCase(insertResult[0]));
    } else {
      res.json(toCamelCase(result[0]));
    }
  } catch (error) {
    console.error('Error updating FAQ content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Landing page bulk data endpoint
app.get('/api/landing-data', async (req, res) => {
  try {
    const [
      eventConfig,
      heroContent,
      aboutContent,
      statsContent,
      artists,
      artistsContent,
      testimonials,
      testimonialsContent,
      locationContent,
      participationContent,
      footerContent,
      faqs,
      faqContent
    ] = await Promise.all([
      client`SELECT * FROM event_config LIMIT 1`,
      client`SELECT * FROM hero_content LIMIT 1`,
      client`SELECT * FROM about_content LIMIT 1`,
      client`SELECT * FROM stats_content LIMIT 1`,
      client`SELECT * FROM artists WHERE is_active = true ORDER BY display_order, created_at`,
      client`SELECT * FROM artists_content LIMIT 1`,
      client`SELECT * FROM testimonials WHERE is_active = true ORDER BY display_order, created_at`,
      client`SELECT * FROM testimonials_content LIMIT 1`,
      client`SELECT * FROM location_content LIMIT 1`,
      client`SELECT * FROM participation_content LIMIT 1`,
      client`SELECT * FROM footer_content LIMIT 1`,
      client`SELECT * FROM faqs WHERE is_active = true ORDER BY display_order, created_at`,
      client`SELECT * FROM faq_content LIMIT 1`
    ]);

    const landingData = {
      event: eventConfig[0] || null,
      hero: heroContent[0] || null,
      about: aboutContent[0] || null,
      stats: statsContent[0] || null,
      artists: artists || [],
      artistsSection: artistsContent[0] || null,
      testimonials: testimonials || [],
      testimonialsSection: testimonialsContent[0] || null,
      location: locationContent[0] || null,
      participation: participationContent[0] || null,
      footer: footerContent[0] || null,
      faqs: faqs || [],
      faqSection: faqContent[0] || null
    };

    res.json(toCamelCase(landingData));
  } catch (error) {
    console.error('Error fetching landing page data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Smart cache system for structured data
let structuredDataCache = null;
let cacheTimestamp = null;
let lastDataHash = null;

// Function to get the latest update timestamp from all relevant tables
async function getLatestUpdateTimestamp() {
  try {
    const [
      eventConfigTimestamp,
      heroContentTimestamp,
      aboutContentTimestamp,
      statsContentTimestamp,
      artistsTimestamp,
      artistsContentTimestamp,
      testimonialsTimestamp,
      testimonialsContentTimestamp,
      locationContentTimestamp,
      participationContentTimestamp,
      footerContentTimestamp,
      faqsTimestamp,
      faqContentTimestamp,
      aiInstructionsTimestamp
    ] = await Promise.all([
      client`SELECT MAX(updated_at) as max_updated FROM event_config`,
      client`SELECT MAX(updated_at) as max_updated FROM hero_content`,
      client`SELECT MAX(updated_at) as max_updated FROM about_content`,
      client`SELECT MAX(updated_at) as max_updated FROM stats_content`,
      client`SELECT MAX(updated_at) as max_updated FROM artists`,
      client`SELECT MAX(updated_at) as max_updated FROM artists_content`,
      client`SELECT MAX(updated_at) as max_updated FROM testimonials`,
      client`SELECT MAX(updated_at) as max_updated FROM testimonials_content`,
      client`SELECT MAX(updated_at) as max_updated FROM location_content`,
      client`SELECT MAX(updated_at) as max_updated FROM participation_content`,
      client`SELECT MAX(updated_at) as max_updated FROM footer_content`,
      client`SELECT MAX(updated_at) as max_updated FROM faqs`,
      client`SELECT MAX(updated_at) as max_updated FROM faq_content`,
      client`SELECT MAX(updated_at) as max_updated FROM ai_instructions`
    ]);

    // Get the most recent timestamp from all tables
    const timestamps = [
      eventConfigTimestamp[0]?.max_updated,
      heroContentTimestamp[0]?.max_updated,
      aboutContentTimestamp[0]?.max_updated,
      statsContentTimestamp[0]?.max_updated,
      artistsTimestamp[0]?.max_updated,
      artistsContentTimestamp[0]?.max_updated,
      testimonialsTimestamp[0]?.max_updated,
      testimonialsContentTimestamp[0]?.max_updated,
      locationContentTimestamp[0]?.max_updated,
      participationContentTimestamp[0]?.max_updated,
      footerContentTimestamp[0]?.max_updated,
      faqsTimestamp[0]?.max_updated,
      faqContentTimestamp[0]?.max_updated,
      aiInstructionsTimestamp[0]?.max_updated
    ].filter(Boolean);

    return timestamps.length > 0 ? new Date(Math.max(...timestamps.map(t => new Date(t)))) : new Date();
  } catch (error) {
    console.error('Error getting latest update timestamp:', error);
    return new Date(); // Return current time if error
  }
}

// Function to generate a hash of the data for change detection
function generateDataHash(data) {
  return require('crypto').createHash('md5').update(JSON.stringify(data)).digest('hex');
}

// Function to generate mock structured data for diagnostic mode
function getMockStructuredData() {
  const siteName = process.env.SITE_NAME || process.env.VITE_SITE_NAME || 'Meu Evento';
  const siteUrl = process.env.SITE_URL || process.env.VITE_SITE_URL || '';

  return {
    metadata: {
      generatedAt: new Date().toISOString(),
      version: "1.0",
      purpose: `AI-consumable structured data for ${siteName} event information`,
      source: `${siteName} Mock Data (Diagnostic Mode)`,
      cacheStrategy: "smart-invalidation"
    },
    event: {
      title: `${siteName} 2026`,
      subtitle: "Uma experiência única",
      tagline: "Seu evento especial",
      dateDisplay: "Data a definir",
      countdownTarget: "2026-09-04T20:00:00.000Z",
      countdownText: "O evento inicia em:",
      registrationUrl: `${siteUrl}/inscricoes`,
      whatsappNumber: "",
      whatsappMessage: `Oi! Quero mais informações sobre o ${siteName}`,
      whatsappEnabled: true,
      heroVideoUrl: ""
    },
    hero: {
      ctaPrimaryText: "QUERO SABER MAIS",
      ctaSecondaryText: "ARTISTAS CONFIRMADOS"
    },
    about: {
      sectionTitle: `Sobre o ${siteName}`,
      paragraphs: [
        "Uma experiência única com conteúdo selecionado e profissionais de qualidade.",
        "Contamos com participantes de todos os níveis das mais diversas cidades.",
        "A junção perfeita entre aprendizado e socialização."
      ],
      trailerVideoUrl: "https://www.youtube.com/embed/5Q7hGUc3fMY?autoplay=1&mute=1",
      trailerButtonText: "Veja um breve trailer",
      beginnerTitle: "Se você é iniciante...",
      beginnerText: "prepare-se para aulas que vão desenvolver sua base, mas também a experiência real de uma balada de Zouk com pessoas que praticam em lugares totalmente diferentes.",
      advancedTitle: "Se você é intermediário ou avançado...",
      advancedText: "prepare-se para aprofundar as técnicas e aprender com professores que rodam o mundo levando o Zouk."
    },
    stats: {
      sectionTitle: "Nossos números",
      participants: { count: 0, label: "Participantes" },
      teachers: { count: 0, label: "Professores" },
      djs: { count: 0, label: "DJs" },
      partyHours: { count: 0, label: "Horas de atividades" }
    },
    artists: {
      sectionTitle: "Artistas Confirmados",
      sectionSubtitle: "Profissionais renomados que farão parte desta experiência única",
      list: []
    },
    testimonials: {
      sectionTitle: "Depoimentos",
      sectionSubtitle: "O que nossos participantes dizem sobre a experiência",
      list: [
        { id: 1, name: "Trícia", cityState: "Belém (PA)", photoUrl: null, displayOrder: 1, isActive: true },
        { id: 2, name: "Andressa", cityState: "Uberlândia (MG)", photoUrl: null, displayOrder: 2, isActive: true },
        { id: 3, name: "Fred", cityState: "Ribeirão Preto (SP)", photoUrl: null, displayOrder: 3, isActive: true },
        { id: 4, name: "Paulo Pinto", cityState: "Campinas (SP)", photoUrl: null, displayOrder: 4, isActive: true }
      ]
    },
    location: {
      sectionTitle: "Uberlândia, MG",
      sectionSubtitle: "O evento oficial acontece sempre em Uberlândia (Minas Gerais)",
      city: "Uberlândia",
      state: "MG",
      country: "Brasil",
      description: null,
      imageUrl: null,
      mapEmbedUrl: null
    },
    participation: {
      sectionTitle: "Como Participar",
      sectionSubtitle: null,
      description: null,
      ctaText: null,
      ctaUrl: null
    },
    faq: {
      sectionTitle: "Perguntas Frequentes",
      sectionSubtitle: "Tire suas dúvidas sobre o evento",
      questions: [
        {
          id: 1,
          question: "Preciso ter um par para participar?",
          answer: "<p>Não! Você pode se inscrever individualmente e será muito bem recebido(a). Nosso evento é conhecido pelo ambiente acolhedor e pela facilidade de integração entre os participantes.</p>",
          displayOrder: 1,
          isActive: true
        },
        {
          id: 2,
          question: "Sou iniciante, posso participar?",
          answer: "<p>Claro! O evento é para <strong>participantes de todos os níveis</strong>. Temos atividades específicas para iniciantes em um ambiente totalmente inclusivo.</p>",
          displayOrder: 2,
          isActive: true
        },
        {
          id: 3,
          question: "Onde fica o local do evento?",
          answer: "<p>O local será divulgado em breve. Fique atento às atualizações em nosso site.</p>",
          displayOrder: 3,
          isActive: true
        },
        {
          id: 4,
          question: "Como faço para me inscrever?",
          answer: "<p>As inscrições podem ser feitas através do nosso site oficial. Clique no botão \"QUERO PARTICIPAR\" em qualquer seção da página para ser direcionado ao formulário de inscrição.</p>",
          displayOrder: 4,
          isActive: true
        }
      ]
    },
    footer: {
      description: null,
      socialLinks: {
        instagram: null,
        facebook: null,
        youtube: null,
        tiktok: null
      },
      contactEmail: null,
      copyrightText: `© 2025 ${siteName}. Todos os direitos reservados.`
    }
  };
}

// Function to fetch fresh data
async function fetchFreshStructuredData() {
  // Check if database client is available
  if (!client || typeof client !== 'function') {
    console.warn('Database client not available, using mock data');
    return getMockStructuredData();
  }

  const [
    eventConfig,
    heroContent,
    aboutContent,
    statsContent,
    artists,
    artistsContent,
    testimonials,
    testimonialsContent,
    locationContent,
    participationContent,
    footerContent,
    faqs,
    faqContent
  ] = await Promise.all([
    client`SELECT * FROM event_config LIMIT 1`,
    client`SELECT * FROM hero_content LIMIT 1`,
    client`SELECT * FROM about_content LIMIT 1`,
    client`SELECT * FROM stats_content LIMIT 1`,
    client`SELECT * FROM artists WHERE is_active = true ORDER BY display_order, created_at`,
    client`SELECT * FROM artists_content LIMIT 1`,
    client`SELECT * FROM testimonials WHERE is_active = true ORDER BY display_order, created_at`,
    client`SELECT * FROM testimonials_content LIMIT 1`,
    client`SELECT * FROM location_content LIMIT 1`,
    client`SELECT * FROM participation_content LIMIT 1`,
    client`SELECT * FROM footer_content LIMIT 1`,
    client`SELECT * FROM faqs WHERE is_active = true ORDER BY display_order, created_at`,
    client`SELECT * FROM faq_content LIMIT 1`
  ]);

  // Nome do site para metadata
  const siteName = process.env.SITE_NAME || process.env.VITE_SITE_NAME || 'Meu Evento';

  // Create structured data optimized for AI consumption
  const structuredData = {
    // Metadata
    metadata: {
      generatedAt: new Date().toISOString(),
      version: "1.0",
      purpose: `AI-consumable structured data for ${siteName} event information`,
      source: `${siteName} Landing Page Database`,
      cacheStrategy: "smart-invalidation"
    },

    // Event Core Information
    event: {
      title: eventConfig[0]?.event_title || null,
      subtitle: eventConfig[0]?.event_subtitle || null,
      tagline: eventConfig[0]?.event_tagline || null,
      dateDisplay: eventConfig[0]?.event_date_display || null,
      countdownTarget: eventConfig[0]?.event_countdown_target || null,
      countdownText: eventConfig[0]?.event_countdown_text || null,
      registrationUrl: eventConfig[0]?.registration_url || null,
      whatsappNumber: eventConfig[0]?.whatsapp_number || null,
      whatsappMessage: eventConfig[0]?.whatsapp_message || null,
      whatsappEnabled: eventConfig[0]?.whatsapp_enabled || false,
      heroVideoUrl: eventConfig[0]?.hero_video_url || null
    },

    // Hero Section
    hero: {
      ctaPrimaryText: heroContent[0]?.cta_primary_text || null,
      ctaSecondaryText: heroContent[0]?.cta_secondary_text || null
    },

    // About Section
    about: {
      sectionTitle: aboutContent[0]?.section_title || null,
      paragraphs: [
        aboutContent[0]?.paragraph1,
        aboutContent[0]?.paragraph2,
        aboutContent[0]?.paragraph3
      ].filter(Boolean),
      trailerVideoUrl: aboutContent[0]?.trailer_video_url || null,
      trailerButtonText: aboutContent[0]?.trailer_button_text || null,
      beginnerTitle: aboutContent[0]?.beginner_title || null,
      beginnerText: aboutContent[0]?.beginner_text || null,
      advancedTitle: aboutContent[0]?.advanced_title || null,
      advancedText: aboutContent[0]?.advanced_text || null
    },

    // Statistics
    stats: {
      sectionTitle: statsContent[0]?.section_title || null,
      participants: {
        count: statsContent[0]?.participants_count || 0,
        label: statsContent[0]?.participants_label || null
      },
      teachers: {
        count: statsContent[0]?.teachers_count || 0,
        label: statsContent[0]?.teachers_label || null
      },
      djs: {
        count: statsContent[0]?.djs_count || 0,
        label: statsContent[0]?.djs_label || null
      },
      partyHours: {
        count: statsContent[0]?.party_hours_count || 0,
        label: statsContent[0]?.party_hours_label || null
      }
    },

    // Artists Information
    artists: {
      sectionTitle: artistsContent[0]?.section_title || null,
      sectionSubtitle: artistsContent[0]?.section_subtitle || null,
      list: artists.map(artist => ({
        id: artist.id,
        name: artist.name,
        role: artist.role,
        cityState: artist.city_state,
        photoUrl: artist.photo_url,
        description: artist.description,
        promotionalVideoUrl: artist.promotional_video_url,
        displayOrder: artist.display_order,
        isActive: artist.is_active
      }))
    },

    // Testimonials
    testimonials: {
      sectionTitle: testimonialsContent[0]?.section_title || null,
      sectionSubtitle: testimonialsContent[0]?.section_subtitle || null,
      list: testimonials.map(testimonial => ({
        id: testimonial.id,
        name: testimonial.name,
        role: testimonial.role,
        cityState: testimonial.city_state,
        photoUrl: testimonial.photo_url,
        text: testimonial.text,
        displayOrder: testimonial.display_order,
        isActive: testimonial.is_active
      }))
    },

    // Location Information
    location: {
      sectionTitle: locationContent[0]?.section_title || null,
      sectionSubtitle: locationContent[0]?.section_subtitle || null,
      city: locationContent[0]?.city || null,
      state: locationContent[0]?.state || null,
      country: locationContent[0]?.country || null,
      description: locationContent[0]?.description || null,
      imageUrl: locationContent[0]?.image_url || null,
      mapEmbedUrl: locationContent[0]?.map_embed_url || null
    },

    // Participation Information
    participation: {
      sectionTitle: participationContent[0]?.section_title || null,
      sectionSubtitle: participationContent[0]?.section_subtitle || null,
      description: participationContent[0]?.description || null,
      ctaText: participationContent[0]?.cta_text || null,
      ctaUrl: participationContent[0]?.cta_url || null
    },

    // FAQ Section
    faq: {
      sectionTitle: faqContent[0]?.section_title || null,
      sectionSubtitle: faqContent[0]?.section_subtitle || null,
      questions: faqs.map(faq => ({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        displayOrder: faq.display_order,
        isActive: faq.is_active
      }))
    },

    // Footer Information
    footer: {
      description: footerContent[0]?.description || null,
      socialLinks: {
        instagram: footerContent[0]?.instagram_url || null,
        facebook: footerContent[0]?.facebook_url || null,
        youtube: footerContent[0]?.youtube_url || null,
        tiktok: footerContent[0]?.tiktok_url || null
      },
      contactEmail: footerContent[0]?.contact_email || null,
      copyrightText: footerContent[0]?.copyright_text || null
    }
  };

  return structuredData;
}

// Function to strip HTML tags and clean content
function stripHtml(html) {
  if (!html) return '';

  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, '');

  // Decode HTML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // Clean up extra whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

// Event summary endpoint - returns JSON with single key
app.get('/api/event-summary', async (req, res) => {
  try {
    const now = new Date();
    const maxCacheAge = 30 * 60 * 1000; // 30 minutes maximum cache age

    // Check if we need to refresh the cache
    let shouldRefreshCache = false;

    if (!structuredDataCache || !cacheTimestamp) {
      shouldRefreshCache = true;
    } else if ((now - cacheTimestamp) > maxCacheAge) {
      shouldRefreshCache = true;
    } else {
      try {
        const latestUpdateTimestamp = await getLatestUpdateTimestamp();
        if (latestUpdateTimestamp > cacheTimestamp) {
          shouldRefreshCache = true;
        }
      } catch (error) {
        console.warn('Could not check update timestamp, using cache:', error.message);
      }
    }

    // Fetch fresh data if needed
    if (shouldRefreshCache) {
      console.log('Refreshing event summary cache...');
      structuredDataCache = await fetchFreshStructuredData();
      cacheTimestamp = now;
      lastDataHash = generateDataHash(structuredDataCache);
    }

    // Generate structured summary string
    const data = structuredDataCache;

    // Fetch AI Instructions
    let aiInstructions = '';
    try {
      const instructionsResult = await client`SELECT * FROM ai_instructions WHERE is_active = true ORDER BY order_index, created_at`;
      if (instructionsResult && instructionsResult.length > 0) {
        aiInstructions = '\n\n🤖 INSTRUÇÕES ADICIONAIS PARA IA:\n';
        instructionsResult.forEach((instruction, index) => {
          const cleanContent = stripHtml(instruction.content);
          aiInstructions += `${instruction.title}: ${cleanContent}\n`;
        });
      }
    } catch (error) {
      console.warn('Could not fetch AI instructions:', error.message);
    }

    const summary = `🎉 PACOTE NO ESCURO - ${data.event.title || 'Evento'}
DATA: ${data.event.dateDisplay}
LOCAL: ${data.location.city}, ${data.location.state} (4.000m² de natureza)
INSCRIÇÕES: ${data.event.registrationUrl}
WHATSAPP: ${data.event.whatsappEnabled ? 'Ativo - ' + data.event.whatsappNumber : 'Inativo'}

💰 PREÇO ESPECIAL: A partir de R$ 499 (para quem confia no processo)
⏰ DURAÇÃO: 4 dias de evento (4 a 7 de setembro de 2026)
📍 LOCAL EXATO: Será revelado aos inscritos

🎯 CONCEITO DO PACOTE NO ESCURO:
- Sem grade engessada, sem fórmulas prontas
- Sem ambiente competitivo, COM propósito
- Um espaço onde movimento encontra propósito
- Onde cada pessoa constrói junto e traz sua personalidade
- Onde dançar é consequência, não o único objetivo
- Não é sobre competir, mas sobre se conectar

📊 ESTATÍSTICAS GERAIS:
- ${data.stats.participants.count} ${data.stats.participants.label}
- ${data.stats.teachers.count} ${data.stats.teachers.label}
- ${data.stats.djs.count} ${data.stats.djs.label}
- ${data.stats.partyHours.count} ${data.stats.partyHours.label}

🎭 ARTISTAS: ${data.artists.list.length > 0 ? `${data.artists.list.length} confirmados` : 'Serão revelados conforme o processo evolui'}

❓ FAQ ESPECÍFICO DO PACOTE NO ESCURO:
Q: Por que não revelam os artistas desde o começo?
R: Porque fazemos questão de deixar um período especial para trazer pessoas que vêm pela jornada, não pelo destino.

Q: Teremos campeonato ou competição oficial?
R: Não teremos competições com pontuação. Focaremos em brincadeiras, dinâmicas, momentos de troca e vulnerabilidade. O troféu maior é sair com 50 novos amigos, não com uma medalha.

Q: Quando encerra esse lote no escuro?
R: O lote encerra por número de vagas ou por confirmação de novos detalhes. Pode ser a qualquer momento conforme as inscrições evoluem.${aiInstructions}

ÚLTIMA ATUALIZAÇÃO: ${new Date(cacheTimestamp).toLocaleString('pt-BR')}`;

    // Return JSON with single key
    const response = {
      eventSummary: summary
    };

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=1800'); // 30 minutes cache
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    res.json(response);
  } catch (error) {
    console.error('Error generating event summary:', error);
    res.status(500).send('Erro ao gerar resumo do evento');
  }
});

// ===== PRIMEIRINHO ENDPOINTS =====

// PRIMEIRINHO - Leads
app.post('/api/primeirinho/leads', async (req, res) => {
  try {
    const { nome, email, whatsapp, estado, cidade } = req.body;

    // Generate UUID for the lead
    const uuid = crypto.randomUUID();

    // Check if city is already configured (auto-reject)
    const cidadeConfigurada = await client`
      SELECT id FROM cidades_configuradas
      WHERE estado = ${estado} AND LOWER(nome) = LOWER(${cidade})
    `;

    const status = cidadeConfigurada.length > 0 ? 'rejected' : 'approved';

    const result = await client`
      INSERT INTO primeirinho_leads (uuid, nome, email, whatsapp, estado, cidade, status)
      VALUES (${uuid}, ${nome}, ${email}, ${whatsapp}, ${estado}, ${cidade}, ${status})
      RETURNING *
    `;

    // Create notification for all active users when a new lead is created
    if (status === 'approved') {
      const users = await client`SELECT id FROM users WHERE is_active = true`;

      for (const user of users) {
        await createNotification(
          user.id,
          'new_lead',
          'Novo PRIMEIRINHO cadastrado',
          `${nome} de ${cidade}/${estado} se cadastrou como PRIMEIRINHO`,
          { leadId: result[0].id, leadUuid: uuid, nome, cidade, estado }
        );
      }
    }

    res.json(toCamelCase(result[0]));
  } catch (error) {
    console.error('Error creating PRIMEIRINHO lead:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/primeirinho/leads/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    const result = await client`
      SELECT * FROM primeirinho_leads WHERE uuid = ${uuid}
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json(toCamelCase(result[0]));
  } catch (error) {
    console.error('Error fetching PRIMEIRINHO lead:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/primeirinho/leads', async (req, res) => {
  try {
    const result = await client`
      SELECT * FROM primeirinho_leads
      ORDER BY created_at DESC
    `;

    res.json(toCamelCase(result));
  } catch (error) {
    console.error('Error fetching PRIMEIRINHO leads:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/primeirinho/leads/:uuid/status', async (req, res) => {
  try {
    const { uuid } = req.params;
    const { status } = req.body;

    console.log(`=== DEBUG: Updating lead ${uuid} to status: ${status} ===`);

    // Primeiro, buscar os dados do lead para obter cidade e estado
    console.log('=== DEBUG: Searching for lead data ===');
    const leadData = await client`
      SELECT estado, cidade FROM primeirinho_leads WHERE uuid = ${uuid}
    `;

    console.log('=== DEBUG: Lead data found:', leadData);

    if (leadData.length === 0) {
      console.log('=== DEBUG: Lead not found ===');
      return res.status(404).json({ error: 'Lead not found' });
    }

    const { estado, cidade } = leadData[0];
    console.log(`=== DEBUG: Lead city: ${cidade}, state: ${estado} ===`);

    // Atualizar status do lead
    console.log('=== DEBUG: Updating lead status ===');
    const result = await client`
      UPDATE primeirinho_leads
      SET status = ${status}, updated_at = NOW()
      WHERE uuid = ${uuid}
      RETURNING *
    `;

    console.log('=== DEBUG: Lead updated successfully:', result);

    // Se o status for 'confirmed', registrar a cidade automaticamente
    if (status === 'confirmed') {
      console.log('=== DEBUG: Lead confirmed, checking city registration... ===');
      try {
        // Verificar se a cidade já existe
        const cidadeExistente = await client`
          SELECT id FROM cidades_configuradas
          WHERE estado = ${estado} AND LOWER(nome) = LOWER(${cidade})
        `;

        console.log('=== DEBUG: Existing city check:', cidadeExistente);

        // Se não existir, adicionar
        if (cidadeExistente.length === 0) {
          await client`
            INSERT INTO cidades_configuradas (nome, estado)
            VALUES (${cidade}, ${estado})
          `;
          console.log(`=== DEBUG: Cidade ${cidade}/${estado} registrada automaticamente após confirmação do lead ${uuid} ===`);
        } else {
          console.log(`=== DEBUG: Cidade ${cidade}/${estado} já existe ===`);
        }
      } catch (cityError) {
        console.error('=== DEBUG: Error registering city automatically:', cityError);
        // Não falhar a operação principal por causa do erro na cidade
      }
    }

    console.log('=== DEBUG: Sending response ===');
    res.json(toCamelCase(result[0]));
  } catch (error) {
    console.error('=== DEBUG: Error updating PRIMEIRINHO lead status:', error);
    console.error('=== DEBUG: Error details:', error.message);
    console.error('=== DEBUG: Error stack:', error.stack);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// PRIMEIRINHO - Cidades
app.get('/api/primeirinho/cidades/:estado', async (req, res) => {
  try {
    const { estado } = req.params;

    // Mapeamento de códigos de estado para códigos IBGE
    const codigosIBGE = {
      'AC': '12', 'AL': '27', 'AP': '16', 'AM': '13', 'BA': '29',
      'CE': '23', 'DF': '53', 'ES': '32', 'GO': '52', 'MA': '21',
      'MT': '51', 'MS': '50', 'MG': '31', 'PA': '15', 'PB': '25',
      'PR': '41', 'PE': '26', 'PI': '22', 'RJ': '33', 'RN': '24',
      'RS': '43', 'RO': '11', 'RR': '14', 'SC': '42', 'SP': '35',
      'SE': '28', 'TO': '17'
    };

    const codigoIBGE = codigosIBGE[estado];
    if (!codigoIBGE) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    try {
      // Buscar cidades da API do IBGE
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${codigoIBGE}/municipios`);

      if (!response.ok) {
        throw new Error('Erro ao buscar cidades do IBGE');
      }

      const cidadesIBGE = await response.json();

      // Formatar dados para o frontend
      const cidadesFormatadas = cidadesIBGE.map((cidade, index) => ({
        id: `${estado}-${cidade.id}`,
        nome: cidade.nome,
        estado: estado
      }));

      // Ordenar por nome
      cidadesFormatadas.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

      res.json(cidadesFormatadas);
    } catch (ibgeError) {
      console.error('Erro ao buscar cidades do IBGE:', ibgeError);

      // Fallback para lista básica em caso de erro na API do IBGE
      const cidadesFallback = {
        'AC': ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira'],
        'AL': ['Maceió', 'Arapiraca', 'Palmeira dos Índios'],
        'AP': ['Macapá', 'Santana', 'Laranjal do Jari'],
        'AM': ['Manaus', 'Parintins', 'Itacoatiara'],
        'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Juazeiro'],
        'CE': ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral'],
        'DF': ['Brasília', 'Taguatinga', 'Ceilândia', 'Samambaia', 'Planaltina'],
        'ES': ['Vitória', 'Vila Velha', 'Cariacica', 'Serra', 'Cachoeiro de Itapemirim'],
        'GO': ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia'],
        'MA': ['São Luís', 'Imperatriz', 'Timon', 'Caxias', 'Codó'],
        'MT': ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra'],
        'MS': ['Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã'],
        'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Ribeirão das Neves', 'Uberaba', 'Governador Valadares', 'Ipatinga'],
        'PA': ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Parauapebas'],
        'PB': ['João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux'],
        'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel'],
        'PE': ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina'],
        'PI': ['Teresina', 'Parnaíba', 'Picos', 'Piripiri', 'Campo Maior'],
        'RJ': ['Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Niterói'],
        'RN': ['Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Macaíba'],
        'RS': ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria'],
        'RO': ['Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena', 'Cacoal'],
        'RR': ['Boa Vista', 'Rorainópolis', 'Caracaraí', 'Alto Alegre', 'Mucajaí'],
        'SC': ['Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Criciúma'],
        'SP': ['São Paulo', 'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'Santo André', 'Osasco', 'Ribeirão Preto', 'Sorocaba', 'Mauá', 'São José dos Campos'],
        'SE': ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana', 'São Cristóvão'],
        'TO': ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Paraíso do Tocantins']
      };

      const cidades = cidadesFallback[estado] || [];
      const cidadesFormatadas = cidades.map((nome, index) => ({
        id: `${estado}-${index + 1}`,
        nome,
        estado
      }));

      res.json(cidadesFormatadas);
    }
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/primeirinho/cidades-configuradas', async (req, res) => {
  try {
    const result = await client`
      SELECT * FROM cidades_configuradas
      ORDER BY estado, nome
    `;

    res.json(toCamelCase(result));
  } catch (error) {
    console.error('Error fetching configured cities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/primeirinho/cidades-configuradas', async (req, res) => {
  try {
    const { nome, estado } = req.body;

    const result = await client`
      INSERT INTO cidades_configuradas (nome, estado)
      VALUES (${nome}, ${estado})
      RETURNING *
    `;

    res.json(toCamelCase(result[0]));
  } catch (error) {
    console.error('Error adding configured city:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/primeirinho/cidades-configuradas/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await client`
      DELETE FROM cidades_configuradas
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }

    res.json({ success: true, message: 'City removed successfully' });
  } catch (error) {
    console.error('Error removing configured city:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== EVENT FORM CONFIGURATION ENDPOINTS =====

// Get active form configuration
app.get('/api/form-config', async (req, res) => {
  try {
    const result = await client`
      SELECT * FROM event_form_configs
      WHERE is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'No active configuration found' });
    }

    const config = toCamelCase(result[0]);
    // Parse configData from JSON string to object
    if (config.configData && typeof config.configData === 'string') {
      config.configData = JSON.parse(config.configData);
    }

    // Ensure paymentSettings has all required fields with defaults
    if (!config.configData.paymentSettings) {
      config.configData.paymentSettings = {};
    }

    const paymentSettings = config.configData.paymentSettings;
    paymentSettings.allowPix = paymentSettings.allowPix !== undefined ? paymentSettings.allowPix : true;
    paymentSettings.allowCreditCard = paymentSettings.allowCreditCard !== undefined ? paymentSettings.allowCreditCard : true;
    paymentSettings.pixDiscountPercentage = paymentSettings.pixDiscountPercentage !== undefined ? paymentSettings.pixDiscountPercentage : 5;
    paymentSettings.creditCardFeePercentage = paymentSettings.creditCardFeePercentage !== undefined ? paymentSettings.creditCardFeePercentage : 5;

    res.json(config);
  } catch (error) {
    console.error('Error fetching form config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new form configuration
app.post('/api/form-config', async (req, res) => {
  try {
    const { eventId, configData } = req.body;

    // Validate required fields
    if (!eventId || !configData) {
      return res.status(400).json({ error: 'eventId and configData are required' });
    }

    // Validate JSONB structure
    if (typeof configData !== 'object') {
      return res.status(400).json({ error: 'configData must be a valid JSON object' });
    }

    // Start transaction to ensure only one active config
    const result = await client.begin(async sql => {
      // Deactivate all existing configs for this event
      await sql`UPDATE event_form_configs SET is_active = false WHERE event_id = ${eventId}`;

      // Create new active config
      const newConfig = await sql`
        INSERT INTO event_form_configs (event_id, is_active, config_data)
        VALUES (${eventId}, true, ${JSON.stringify(configData)})
        RETURNING *
      `;

      return newConfig[0];
    });

    res.json(toCamelCase(result));
  } catch (error) {
    console.error('Error creating form config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update existing form configuration
app.put('/api/form-config/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { configData, isActive } = req.body;

    // Validate JSONB structure if provided
    if (configData && typeof configData !== 'object') {
      return res.status(400).json({ error: 'configData must be a valid JSON object' });
    }

    // Build update query dynamically
    let updateFields = [];
    let values = [];

    if (configData !== undefined) {
      updateFields.push('config_data = $' + (values.length + 1));
      values.push(JSON.stringify(configData));
    }

    if (isActive !== undefined) {
      updateFields.push('is_active = $' + (values.length + 1));
      values.push(isActive);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `
      UPDATE event_form_configs
      SET ${updateFields.join(', ')}
      WHERE id = $${values.length}
      RETURNING *
    `;

    const result = await client.query(query, values);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    res.json(toCamelCase(result[0]));
  } catch (error) {
    console.error('Error updating form config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== EVENT REGISTRATION ENDPOINTS =====

// Create new registration
app.post('/api/registrations', async (req, res) => {
  try {
    const {
      eventId,
      cpf,
      isForeigner,
      fullName,
      email,
      whatsapp,
      birthDate,
      state,
      city,
      ticketType,
      ticketPrice,
      partnerName,
      selectedProducts,
      productsSnapshot,
      baseTotal,
      discountAmount = 0,
      feeAmount = 0,
      feePercentage = 0,
      total,
      termsAccepted,
      paymentMethod,
      installments = 1
    } = req.body;

    // Validate required fields
    if (!eventId || !fullName || !email || !whatsapp || !birthDate || !ticketType || !total || !termsAccepted || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate terms acceptance
    if (!termsAccepted) {
      return res.status(400).json({ error: 'Terms must be accepted' });
    }

    // Validate age (18+)
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    if (age < 18) {
      return res.status(400).json({ error: 'Must be 18 years or older' });
    }

    // Note: Removed duplicate checks for CPF and email to allow multiple registrations
    // with same credentials for the same event. Format validation should be handled
    // on the frontend to ensure data quality.

    // Get active config for snapshot
    const activeConfig = await client`
      SELECT config_data FROM event_form_configs
      WHERE event_id = ${eventId} AND is_active = true
      LIMIT 1
    `;

    const configSnapshot = activeConfig.length > 0 ? activeConfig[0].config_data : null;

    // Create registration
    const result = await client`
      INSERT INTO event_registrations (
        event_id, cpf, is_foreigner, full_name, email, whatsapp, birth_date,
        state, city, ticket_type, ticket_price, partner_name, selected_products,
        products_snapshot, base_total, discount_amount, fee_amount, fee_percentage, total,
        terms_accepted, payment_method, installments, asaas_payment_id
      )
      VALUES (
        ${eventId},
        ${isForeigner ? null : cpf},
        ${isForeigner},
        ${fullName},
        ${email},
        ${whatsapp},
        ${birthDate},
        ${isForeigner ? null : state},
        ${isForeigner ? null : city},
        ${ticketType},
        ${ticketPrice || null},
        ${partnerName || null},
        ${selectedProducts ? JSON.stringify(selectedProducts) : null},
        ${productsSnapshot ? JSON.stringify(productsSnapshot) : null},
        ${baseTotal || total},
        ${discountAmount || 0},
        ${feeAmount || 0},
        ${feePercentage || 0},
        ${total},
        ${termsAccepted},
        ${paymentMethod},
        ${installments},
        ${req.body.asaasPaymentId || null}
      )
      RETURNING *
    `;

    // Create notification for all active users when a new registration is created
    const users = await client`SELECT id FROM users WHERE is_active = true`;

    for (const user of users) {
      await createNotification(
        user.id,
        'new_registration',
        'Nova inscrição no evento',
        `${fullName} se inscreveu no evento`,
        { registrationId: result[0].id, fullName, email, ticketType, total }
      );
    }

    res.status(201).json(toCamelCase(result[0]));
  } catch (error) {
    console.error('Error creating registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all registrations
app.get('/api/registrations', async (req, res) => {
  try {
    const result = await client`
      SELECT
        id, event_id, cpf, is_foreigner, full_name, email, whatsapp,
        birth_date, state, city, ticket_type, ticket_price, partner_name, selected_products,
        products_snapshot, base_total, discount_amount, fee_amount, fee_percentage, total,
        terms_accepted, payment_method, installments, created_at,
        payment_status, updated_at, asaas_payment_id
      FROM event_registrations
      ORDER BY created_at DESC
    `;

    const registrations = result.map(registration => {
      const camelCaseRegistration = toCamelCase(registration);

      // Parse selectedProducts from JSON string to object
      if (camelCaseRegistration.selectedProducts && typeof camelCaseRegistration.selectedProducts === 'string') {
        camelCaseRegistration.selectedProducts = JSON.parse(camelCaseRegistration.selectedProducts);
      }

      // Parse productsSnapshot from JSON string to array
      if (camelCaseRegistration.productsSnapshot && typeof camelCaseRegistration.productsSnapshot === 'string') {
        camelCaseRegistration.productsSnapshot = JSON.parse(camelCaseRegistration.productsSnapshot);
      }

      return camelCaseRegistration;
    });

    res.json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get installments for a registration (must come before /:id route)
app.get('/api/registrations/:id/installments', async (req, res) => {
  try {
    const { id } = req.params;

    // First, get the registration to check if it has installments
    const registrationResult = await client`
      SELECT * FROM event_registrations
      WHERE id = ${id}
    `;

    if (registrationResult.length === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    const registration = toCamelCase(registrationResult[0]);

    // Check if this registration has installments
    if (registration.installments <= 1 || !registration.asaasPaymentId) {
      return res.json({
        installments: [],
        message: 'Esta inscrição não possui parcelas'
      });
    }

    // Get installments from ASAAS
    try {
      const asaasUrl = process.env.ASAAS_SANDBOX === 'true'
        ? 'https://api-sandbox.asaas.com/v3'
        : 'https://api.asaas.com/v3';

      const apiKey = process.env.ASAAS_SANDBOX === 'true'
        ? process.env.ASAAS_API_KEY_SANDBOX
        : process.env.ASAAS_API_KEY_PRODUCTION;

      const paymentUrl = `${asaasUrl}/payments/${registration.asaasPaymentId}`;
      console.log('🔍 Fetching payment from Asaas:', {
        url: paymentUrl,
        paymentId: registration.asaasPaymentId,
        sandbox: process.env.ASAAS_SANDBOX === 'true'
      });

      // First, get the payment details to find the installment group ID
      const paymentResponse = await fetch(paymentUrl, {
        headers: {
          'access_token': apiKey,
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 Asaas payment response status:', paymentResponse.status);

      if (!paymentResponse.ok) {
        const errorBody = await paymentResponse.text();
        console.log('❌ Asaas payment error body:', errorBody);
        throw new Error(`ASAAS API Error: ${paymentResponse.status}`);
      }

      const paymentData = await paymentResponse.json();

      if (!paymentData.installment) {
        return res.json({
          installments: [],
          message: 'Nenhuma parcela encontrada'
        });
      }

      // Get all installments from the installment group
      const installmentsResponse = await fetch(`${asaasUrl}/payments?installment=${paymentData.installment}`, {
        headers: {
          'access_token': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!installmentsResponse.ok) {
        throw new Error(`ASAAS API Error: ${installmentsResponse.status}`);
      }

      const installmentsData = await installmentsResponse.json();

      const { simulateAllPaid } = req.query;

      const installments = installmentsData.data.map(installment => ({
        id: installment.id,
        installmentNumber: installment.installmentNumber,
        value: installment.value,
        netValue: installment.netValue,
        dueDate: installment.dueDate,
        status: simulateAllPaid === 'true' ? 'RECEIVED' : installment.status,
        billingType: installment.billingType, // CREDIT_CARD, PIX, BOLETO
        paymentDate: installment.paymentDate || null, // Data efetiva de pagamento
        confirmedDate: installment.confirmedDate || null, // Data de confirmação
        invoiceUrl: installment.invoiceUrl,
        description: installment.description,
        originalValue: installment.originalValue,
        interestValue: installment.interestValue
      }));

      res.json({
        installments: installments.sort((a, b) => a.installmentNumber - b.installmentNumber),
        totalInstallments: installments.length,
        installmentGroup: paymentData.installment
      });

    } catch (asaasError) {
      console.error('Error fetching installments from ASAAS:', asaasError);
      res.status(500).json({
        error: 'Erro ao buscar parcelas do ASAAS',
        details: asaasError.message
      });
    }

  } catch (error) {
    console.error('Error fetching installments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search registrations by email, cpf, or whatsapp
app.post('/api/registrations/search', async (req, res) => {
  try {
    const { email, cpf, whatsapp } = req.body;

    // Validate that at least 2 fields are provided
    const fieldsProvided = [email, cpf, whatsapp].filter(field => field && field.trim() !== '').length;

    if (fieldsProvided < 2) {
      return res.status(400).json({
        error: 'Pelo menos 2 campos devem ser preenchidos (email, cpf ou whatsapp)'
      });
    }

    // Build dynamic query based on provided fields
    let whereConditions = [];
    let queryParams = [];

    if (email && email.trim() !== '') {
      whereConditions.push('email = $' + (queryParams.length + 1));
      queryParams.push(email.trim().toLowerCase());
    }

    if (cpf && cpf.trim() !== '') {
      // Remove formatting from CPF for comparison
      const cleanCpf = cpf.replace(/\D/g, '');
      whereConditions.push('cpf = $' + (queryParams.length + 1));
      queryParams.push(cleanCpf);
    }

    if (whatsapp && whatsapp.trim() !== '') {
      // Keep the WhatsApp number as-is for comparison (it's stored with +)
      const cleanWhatsapp = whatsapp.trim();
      whereConditions.push('whatsapp = $' + (queryParams.length + 1));
      queryParams.push(cleanWhatsapp);
    }

    // Execute query using template literal syntax
    let result = [];

    if (whereConditions.length === 2) {
      // Two conditions
      if (email && cpf) {
        const cleanCpf = cpf.replace(/\D/g, '');
        result = await client`
          SELECT id, full_name, email, ticket_type, created_at
          FROM event_registrations
          WHERE LOWER(email) = LOWER(${email.trim()})
            AND REPLACE(REPLACE(REPLACE(cpf, '.', ''), '-', ''), ' ', '') = ${cleanCpf}
          ORDER BY created_at DESC
        `;
      } else if (email && whatsapp) {
        result = await client`
          SELECT id, full_name, email, ticket_type, created_at
          FROM event_registrations
          WHERE LOWER(email) = LOWER(${email.trim()}) AND whatsapp = ${whatsapp.trim()}
          ORDER BY created_at DESC
        `;
      } else if (cpf && whatsapp) {
        const cleanCpf = cpf.replace(/\D/g, '');
        result = await client`
          SELECT id, full_name, email, ticket_type, created_at
          FROM event_registrations
          WHERE REPLACE(REPLACE(REPLACE(cpf, '.', ''), '-', ''), ' ', '') = ${cleanCpf}
            AND whatsapp = ${whatsapp.trim()}
          ORDER BY created_at DESC
        `;
      }
    } else if (whereConditions.length === 3) {
      // Three conditions
      const cleanCpf = cpf.replace(/\D/g, '');
      result = await client`
        SELECT id, full_name, email, ticket_type, created_at
        FROM event_registrations
        WHERE LOWER(email) = LOWER(${email.trim()})
          AND REPLACE(REPLACE(REPLACE(cpf, '.', ''), '-', ''), ' ', '') = ${cleanCpf}
          AND whatsapp = ${whatsapp.trim()}
        ORDER BY created_at DESC
      `;
    }

    const registrations = result.map(registration => ({
      id: registration.id,
      fullName: registration.full_name,
      email: registration.email,
      ticketType: registration.ticket_type,
      createdAt: registration.created_at
    }));

    res.json({
      registrations,
      count: registrations.length
    });

  } catch (error) {
    console.error('Error searching registrations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get registration by ID
app.get('/api/registrations/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await client`
      SELECT * FROM event_registrations
      WHERE id = ${id}
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    const registration = toCamelCase(result[0]);

    // Parse selectedProducts from JSON string to object
    if (registration.selectedProducts && typeof registration.selectedProducts === 'string') {
      registration.selectedProducts = JSON.parse(registration.selectedProducts);
    }

    res.json(registration);
  } catch (error) {
    console.error('Error fetching registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update registration
app.put('/api/registrations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // For now, let's handle paymentStatus updates specifically
    if (updateData.paymentStatus !== undefined) {
      const result = await client`
        UPDATE event_registrations
        SET payment_status = ${updateData.paymentStatus}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: 'Registration not found' });
      }

      const updatedRegistration = toCamelCase(result[0]);

      // Parse selectedProducts from JSON string to object
      if (updatedRegistration.selectedProducts && typeof updatedRegistration.selectedProducts === 'string') {
        updatedRegistration.selectedProducts = JSON.parse(updatedRegistration.selectedProducts);
      }

      return res.json(updatedRegistration);
    }

    // Handle other field updates
    if (updateData.fullName !== undefined) {
      const result = await client`
        UPDATE event_registrations
        SET full_name = ${updateData.fullName}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: 'Registration not found' });
      }

      const updatedRegistration = toCamelCase(result[0]);

      // Parse selectedProducts from JSON string to object
      if (updatedRegistration.selectedProducts && typeof updatedRegistration.selectedProducts === 'string') {
        updatedRegistration.selectedProducts = JSON.parse(updatedRegistration.selectedProducts);
      }

      return res.json(updatedRegistration);
    }

    if (updateData.email !== undefined) {
      const result = await client`
        UPDATE event_registrations
        SET email = ${updateData.email}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: 'Registration not found' });
      }

      const updatedRegistration = toCamelCase(result[0]);

      // Parse selectedProducts from JSON string to object
      if (updatedRegistration.selectedProducts && typeof updatedRegistration.selectedProducts === 'string') {
        updatedRegistration.selectedProducts = JSON.parse(updatedRegistration.selectedProducts);
      }

      return res.json(updatedRegistration);
    }

    if (updateData.whatsapp !== undefined) {
      const result = await client`
        UPDATE event_registrations
        SET whatsapp = ${updateData.whatsapp}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: 'Registration not found' });
      }

      const updatedRegistration = toCamelCase(result[0]);

      // Parse selectedProducts from JSON string to object
      if (updatedRegistration.selectedProducts && typeof updatedRegistration.selectedProducts === 'string') {
        updatedRegistration.selectedProducts = JSON.parse(updatedRegistration.selectedProducts);
      }

      return res.json(updatedRegistration);
    }

    if (updateData.total !== undefined) {
      const result = await client`
        UPDATE event_registrations
        SET total = ${updateData.total}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: 'Registration not found' });
      }

      const updatedRegistration = toCamelCase(result[0]);

      // Parse selectedProducts from JSON string to object
      if (updatedRegistration.selectedProducts && typeof updatedRegistration.selectedProducts === 'string') {
        updatedRegistration.selectedProducts = JSON.parse(updatedRegistration.selectedProducts);
      }

      return res.json(updatedRegistration);
    }

    return res.status(400).json({ error: 'No valid fields to update' });
  } catch (error) {
    console.error('Error updating registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete registration
app.delete('/api/registrations/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await client`
      DELETE FROM event_registrations
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.json({ message: 'Registration deleted successfully', id: result[0].id });
  } catch (error) {
    console.error('Error deleting registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function: Create or get ASAAS customer
// In-memory cache for customer lookups
const customerCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds
const MAX_CACHE_SIZE = 1000; // Maximum number of entries

// Cache cleanup function
function cleanupCache() {
  const now = Date.now();
  for (const [key, value] of customerCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      customerCache.delete(key);
    }
  }

  // If still over size limit, remove oldest entries
  if (customerCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(customerCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = entries.slice(0, customerCache.size - MAX_CACHE_SIZE);
    toRemove.forEach(([key]) => customerCache.delete(key));
  }
}

// Get customer from cache
function getCachedCustomer(cacheKey) {
  const cached = customerCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    console.log('💾 Cliente encontrado no cache:', cacheKey);
    return cached.customer;
  }
  return null;
}

// Set customer in cache
function setCachedCustomer(cacheKey, customer) {
  // Cleanup old entries before adding new one
  cleanupCache();

  customerCache.set(cacheKey, {
    customer,
    timestamp: Date.now()
  });
  console.log('💾 Cliente adicionado ao cache:', cacheKey);
}

// Generate cache key for customer search
function generateCacheKey(type, value) {
  return `${type}:${value}`;
}

// Enhanced error handling utilities
class AsaasApiError extends Error {
  constructor(message, statusCode, response) {
    super(message);
    this.name = 'AsaasApiError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

// Retry utility with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx) except for rate limiting (429)
      if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
        console.log(`❌ Cliente error (${error.statusCode}), não tentando novamente:`, error.message);
        throw error;
      }

      if (attempt === maxRetries) {
        console.error(`❌ Todas as ${maxRetries} tentativas falharam:`, error.message);
        break;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
      console.log(`⚠️ Tentativa ${attempt} falhou, tentando novamente em ${delay}ms:`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Enhanced fetch with proper error handling
async function fetchWithErrorHandling(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.errors ?
        (Array.isArray(data.errors) ? data.errors.join(', ') : JSON.stringify(data.errors)) :
        (data.message || data.error || `HTTP ${response.status}`);

      throw new AsaasApiError(
        `ASAAS API Error: ${errorMessage}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof AsaasApiError) {
      throw error;
    }

    // Network or parsing errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new AsaasApiError('Network error: Unable to connect to ASAAS API', 0, null);
    }

    if (error.name === 'SyntaxError') {
      throw new AsaasApiError('Invalid response format from ASAAS API', 0, null);
    }

    throw new AsaasApiError(`Unexpected error: ${error.message}`, 0, null);
  }
}

// Utility function to normalize phone numbers
function normalizePhone(phone) {
  if (!phone) return null;
  return phone.replace(/\D/g, '').slice(-11); // Remove non-digits, get last 11 digits
}

// Utility function to normalize name for fuzzy matching
function normalizeName(name) {
  if (!name) return null;
  return name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z\s]/g, '') // Keep only letters and spaces
    .trim();
}

// Individual search functions for different field types with enhanced error handling
async function searchAsaasCustomer(asaasUrl, asaasApiKey, searchParams) {
  const searchUrl = `${asaasUrl}/customers?${new URLSearchParams(searchParams).toString()}`;

  return await retryWithBackoff(async () => {
    try {
      const result = await fetchWithErrorHandling(searchUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'access_token': asaasApiKey
        }
      });

      return result.data || [];
    } catch (error) {
      console.error('❌ Erro na busca ASAAS:', {
        url: searchUrl,
        params: searchParams,
        error: error.message,
        statusCode: error.statusCode
      });

      // For search operations, we can gracefully handle errors by returning empty array
      // but we should still log the error for debugging
      if (error.statusCode === 404 || error.statusCode === 400) {
        console.log('🔍 Nenhum resultado encontrado para:', searchParams);
        return [];
      }

      // Re-throw for server errors and network issues to trigger retry
      throw error;
    }
  }, 2, 500); // Reduced retries for search operations
}

// Customer data merging utilities
function compareCustomerData(existingCustomer, newData) {
  const differences = {};

  // Check each field for differences
  if (newData.name && existingCustomer.name !== newData.name) {
    differences.name = { old: existingCustomer.name, new: newData.name };
  }

  if (newData.email && existingCustomer.email !== newData.email) {
    differences.email = { old: existingCustomer.email, new: newData.email };
  }

  if (newData.mobilePhone && existingCustomer.mobilePhone !== newData.mobilePhone) {
    differences.mobilePhone = { old: existingCustomer.mobilePhone, new: newData.mobilePhone };
  }

  if (newData.cpfCnpj && existingCustomer.cpfCnpj !== newData.cpfCnpj) {
    differences.cpfCnpj = { old: existingCustomer.cpfCnpj, new: newData.cpfCnpj };
  }

  return differences;
}

function shouldUpdateCustomer(differences) {
  // Define rules for when to update customer data
  const updateableFields = ['name', 'email', 'mobilePhone'];

  for (const field of updateableFields) {
    if (differences[field]) {
      const { old, new: newValue } = differences[field];

      // Update if old value is empty/null and new value is provided
      if ((!old || old.trim() === '') && newValue && newValue.trim() !== '') {
        return true;
      }

      // Update if new value is more complete (longer and contains old value)
      if (old && newValue && newValue.length > old.length && newValue.includes(old)) {
        return true;
      }
    }
  }

  // Never update CPF/CNPJ automatically (critical identifier)
  if (differences.cpfCnpj) {
    console.log('⚠️ CPF/CNPJ diferente detectado, mas não será atualizado automaticamente:', differences.cpfCnpj);
  }

  return false;
}

function buildUpdateData(existingCustomer, newData, differences) {
  const updateData = {};

  // Only include fields that should be updated
  if (differences.name && shouldUpdateField('name', differences.name)) {
    updateData.name = newData.name;
  }

  if (differences.email && shouldUpdateField('email', differences.email)) {
    updateData.email = newData.email;
  }

  if (differences.mobilePhone && shouldUpdateField('mobilePhone', differences.mobilePhone)) {
    updateData.mobilePhone = newData.mobilePhone;
  }

  return updateData;
}

function shouldUpdateField(fieldName, difference) {
  const { old, new: newValue } = difference;

  // Update if old is empty and new has value
  if ((!old || old.trim() === '') && newValue && newValue.trim() !== '') {
    return true;
  }

  // Update if new value is more complete for name field
  if (fieldName === 'name' && old && newValue) {
    // Check if new name contains more information (more words, longer)
    const oldWords = old.trim().split(/\s+/);
    const newWords = newValue.trim().split(/\s+/);

    if (newWords.length > oldWords.length) {
      return true;
    }
  }

  // Update if new phone is more complete (has area code, more digits)
  if (fieldName === 'mobilePhone' && old && newValue) {
    if (newValue.length > old.length && newValue.includes(old.slice(-4))) {
      return true;
    }
  }

  return false;
}

async function updateAsaasCustomer(customerId, updateData, asaasUrl, asaasApiKey) {
  console.log('🔄 Atualizando dados do cliente ASAAS:', customerId, updateData);

  return await retryWithBackoff(async () => {
    return await fetchWithErrorHandling(`${asaasUrl}/customers/${customerId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': asaasApiKey
      },
      body: JSON.stringify(updateData)
    });
  }, 3, 1000);
}

// Optimized batch customer management for multiple charges
const recentCustomerRequests = new Map();
const RECENT_REQUEST_TTL = 5000; // 5 seconds

function getRecentCustomerSearch(registrationKey) {
  const cached = recentCustomerRequests.get(registrationKey);
  if (cached && (Date.now() - cached.timestamp < RECENT_REQUEST_TTL)) {
    console.log('⚡ Reutilizando busca de cliente recente:', registrationKey);
    return cached.promise;
  }
  return null;
}

function setRecentCustomerSearch(registrationKey, promise) {
  recentCustomerRequests.set(registrationKey, {
    promise,
    timestamp: Date.now()
  });

  // Cleanup old entries
  setTimeout(() => {
    recentCustomerRequests.delete(registrationKey);
  }, RECENT_REQUEST_TTL);
}

// Generate key for recent customer requests
function generateCustomerRequestKey(registration) {
  return registration.cpf || registration.email || `${registration.fullName}-${registration.whatsapp}`;
}

// Enhanced customer lookup with request deduplication
async function getOrCreateAsaasCustomerOptimized(registration, isSandbox) {
  const requestKey = generateCustomerRequestKey(registration);

  // Check if there's a recent request for the same customer
  const recentRequest = getRecentCustomerSearch(requestKey);
  if (recentRequest) {
    console.log('🔄 Aguardando requisição de cliente em andamento...');
    return await recentRequest;
  }

  // Create new request and cache it
  const customerPromise = getOrCreateAsaasCustomer(registration, isSandbox);
  setRecentCustomerSearch(requestKey, customerPromise);

  return await customerPromise;
}

async function getOrCreateAsaasCustomer(registration, isSandbox) {
  const asaasApiKey = isSandbox ? process.env.ASAAS_API_KEY_SANDBOX : process.env.ASAAS_API_KEY_PRODUCTION;
  const asaasUrl = isSandbox ? 'https://api-sandbox.asaas.com/v3' : 'https://api.asaas.com/v3';

  console.log('🔍 Iniciando busca de cliente ASAAS com cache e múltiplos critérios...');
  console.log('🌐 ASAAS URL:', asaasUrl);
  console.log('🔑 API Key configurada:', asaasApiKey ? '✅ Sim' : '❌ Não');

  try {
    let foundCustomer = null;
    let cacheKey = null;

    // 1. Search by CPF if available (check cache first) - CPF é o identificador principal
    if (registration.cpf) {
      cacheKey = generateCacheKey('cpf', registration.cpf);
      foundCustomer = getCachedCustomer(cacheKey);

      if (!foundCustomer) {
        console.log('🔍 Buscando por CPF:', registration.cpf);
        const customers = await searchAsaasCustomer(asaasUrl, asaasApiKey, { cpfCnpj: registration.cpf });
        if (customers.length > 0) {
          foundCustomer = customers[0];
          setCachedCustomer(cacheKey, foundCustomer);
          console.log('✅ Cliente encontrado por CPF:', foundCustomer.id);
        }
      }
    }

    // IMPORTANTE: Se CPF não existe, criar novo cliente
    // Não usar email/telefone para identificar cliente existente
    if (!foundCustomer) {
      console.log('📝 CPF não encontrado. Criando novo cliente (não usando email/telefone para busca).');
    }


    // If customer found, check if data needs merging/updating
    if (foundCustomer) {
      console.log('✅ Cliente ASAAS encontrado:', foundCustomer.id);

      // Prepare new customer data for comparison
      const newCustomerData = {
        name: registration.fullName,
        email: registration.email,
        mobilePhone: normalizePhone(registration.whatsapp),
        cpfCnpj: registration.cpf || registration.email
      };

      // Compare existing customer data with new registration data
      const differences = compareCustomerData(foundCustomer, newCustomerData);

      if (Object.keys(differences).length > 0) {
        console.log('🔍 Diferenças detectadas nos dados do cliente:', differences);

        if (shouldUpdateCustomer(differences)) {
          const updateData = buildUpdateData(foundCustomer, newCustomerData, differences);

          if (Object.keys(updateData).length > 0) {
            try {
              const updatedCustomer = await updateAsaasCustomer(
                foundCustomer.id,
                updateData,
                asaasUrl,
                asaasApiKey
              );

              console.log('✅ Dados do cliente atualizados:', foundCustomer.id);

              // Update cache with the merged customer data
              const mergedCustomer = { ...foundCustomer, ...updateData };
              if (registration.cpf) {
                setCachedCustomer(generateCacheKey('cpf', registration.cpf), mergedCustomer);
              }
              if (registration.email) {
                setCachedCustomer(generateCacheKey('email', registration.email), mergedCustomer);
              }
              const normalizedPhone = normalizePhone(registration.whatsapp);
              if (normalizedPhone) {
                setCachedCustomer(generateCacheKey('phone', normalizedPhone), mergedCustomer);
              }

            } catch (updateError) {
              console.error('⚠️ Erro ao atualizar cliente, usando dados existentes:', updateError.message);
              // Continue with existing customer data even if update fails
            }
          }
        } else {
          console.log('ℹ️ Diferenças detectadas mas não justificam atualização automática');
        }
      } else {
        console.log('ℹ️ Dados do cliente estão atualizados, nenhuma alteração necessária');
      }

      return foundCustomer.id;
    }

    // If not found, create new customer
    console.log('📝 Nenhum cliente encontrado. Criando novo cliente ASAAS...');

    const customerData = {
      name: registration.fullName,
      email: registration.email,
      mobilePhone: normalizePhone(registration.whatsapp),
      cpfCnpj: registration.cpf || registration.email,
      notificationDisabled: false
    };

    console.log('📋 Dados do cliente a ser criado:', customerData);

    const createResult = await retryWithBackoff(async () => {
      return await fetchWithErrorHandling(`${asaasUrl}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': asaasApiKey
        },
        body: JSON.stringify(customerData)
      });
    }, 3, 1000);

    console.log('✅ Cliente ASAAS criado:', createResult.id);

    // Cache the newly created customer for future lookups
    if (registration.cpf) {
      setCachedCustomer(generateCacheKey('cpf', registration.cpf), createResult);
    }
    if (registration.email) {
      setCachedCustomer(generateCacheKey('email', registration.email), createResult);
    }
    const normalizedPhone = normalizePhone(registration.whatsapp);
    if (normalizedPhone) {
      setCachedCustomer(generateCacheKey('phone', normalizedPhone), createResult);
    }

    return createResult.id;

  } catch (error) {
    // Enhanced error logging with context
    console.error('❌ Erro em getOrCreateAsaasCustomer:', {
      registrationData: {
        cpf: registration.cpf,
        email: registration.email,
        fullName: registration.fullName,
        whatsapp: registration.whatsapp ? 'provided' : 'missing'
      },
      environment: isSandbox ? 'sandbox' : 'production',
      error: {
        name: error.name,
        message: error.message,
        statusCode: error.statusCode
      }
    });

    // Provide specific error messages based on error type
    if (error instanceof AsaasApiError) {
      if (error.statusCode === 401) {
        throw new Error('Falha na autenticação com ASAAS - verifique as credenciais da API');
      } else if (error.statusCode === 403) {
        throw new Error('Acesso negado pela API ASAAS - verifique as permissões');
      } else if (error.statusCode === 429) {
        throw new Error('Limite de requisições excedido - tente novamente mais tarde');
      } else if (error.statusCode >= 500) {
        throw new Error('Erro interno do servidor ASAAS - tente novamente');
      } else if (error.statusCode === 0) {
        throw new Error('Erro de conectividade - verifique a conexão com a internet');
      }
    }

    // Fallback error message
    throw new Error(`Falha ao gerenciar cliente ASAAS: ${error.message}`);
  }
}

// Create ASAAS Charges (cobranças diretas)
app.post('/api/charges/create', async (req, res) => {
  try {
    const { registrationId } = req.body;

    if (!registrationId) {
      return res.status(400).json({ error: 'ID da inscrição é obrigatório' });
    }

    // Buscar a inscrição
    const registrationResult = await client`
      SELECT * FROM event_registrations
      WHERE id = ${registrationId}
    `;

    if (registrationResult.length === 0) {
      return res.status(404).json({ error: 'Inscrição não encontrada' });
    }

    const registration = toCamelCase(registrationResult[0]);

    // Buscar a configuração ativa
    const configResult = await client`
      SELECT * FROM event_form_configs
      WHERE is_active = true
    `;

    if (configResult.length === 0) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }

    const config = toCamelCase(configResult[0]);

    // Parse configData se for string
    let configData = config.configData;
    if (typeof configData === 'string') {
      configData = JSON.parse(configData);
    }

    // Parse selectedProducts se for string
    let selectedProducts = registration.selectedProducts;
    if (typeof selectedProducts === 'string') {
      selectedProducts = JSON.parse(selectedProducts);
    }

    // Construir descrição detalhada
    const siteName = process.env.SITE_NAME || process.env.VITE_SITE_NAME || 'Meu Evento';
    const eventName = configData.eventName || siteName;
    let itemDescription = `Inscrição para ${eventName}`;

    if (registration.ticketType) {
      itemDescription += ` - ${registration.ticketType}`;
    }

    if (selectedProducts && typeof selectedProducts === 'object') {
      const additionalItems = Object.entries(selectedProducts)
        .filter(([productName, option]) => option && option !== 'Não')
        .map(([productName, option]) => `${productName}: ${option}`);

      if (additionalItems.length > 0) {
        itemDescription += ` + ${additionalItems.join(', ')}`;
      }
    }

    // Determinar ambiente
    const isSandbox = process.env.ASAAS_SANDBOX === 'true';
    const asaasApiKey = isSandbox ? process.env.ASAAS_API_KEY_SANDBOX : process.env.ASAAS_API_KEY_PRODUCTION;
    const asaasUrl = isSandbox ? 'https://api-sandbox.asaas.com/v3' : 'https://api.asaas.com/v3';

    console.log(`ASAAS Environment: ${isSandbox ? 'SANDBOX' : 'PRODUCTION'}`);

    if (!asaasApiKey) {
      return res.status(500).json({
        error: `Chave da API ASAAS não configurada para ${isSandbox ? 'sandbox' : 'produção'}`
      });
    }

    // Criar ou buscar cliente no ASAAS (com cache otimizado)
    console.log('🔄 Iniciando busca/criação de cliente para cobrança...');
    console.log('📋 Dados do registro:', {
      id: registration.id,
      fullName: registration.fullName,
      email: registration.email,
      whatsapp: registration.whatsapp,
      cpf: registration.cpf,
      isForeigner: registration.isForeigner
    });
    const customerSearchStart = Date.now();

    const customerId = await getOrCreateAsaasCustomerOptimized(registration, isSandbox);

    const customerSearchTime = Date.now() - customerSearchStart;
    console.log(`⏱️ Busca de cliente completada em ${customerSearchTime}ms`);
    console.log(`🆔 Customer ID obtido: ${customerId}`);

    if (!customerId) {
      throw new Error('Falha ao obter ou criar cliente ASAAS - customerId é null/undefined');
    }

    // Log cache statistics for monitoring
    console.log(`📊 Status do cache: ${customerCache.size} entradas ativas`);

    if (customerSearchTime < 500) {
      console.log('🚀 Busca rápida detectada - provável cache hit');
    } else {
      console.log('🔍 Busca mais lenta - provável API call ou cache miss');
    }

    // Calcular número máximo de parcelas baseado na data limite
    const calculateMaxInstallments = (dueDateLimit) => {
      if (!dueDateLimit) return 1;

      const today = new Date();
      const limitDate = new Date(dueDateLimit);

      const monthsDiff = (limitDate.getFullYear() - today.getFullYear()) * 12 +
                        (limitDate.getMonth() - today.getMonth());

      const maxInstallments = Math.max(1, monthsDiff - 1);
      return Math.min(maxInstallments, 12);
    };

    const maxInstallments = configData.paymentSettings?.dueDateLimit
      ? calculateMaxInstallments(configData.paymentSettings.dueDateLimit)
      : 12; // Default: 12 parcelas se não houver data limite configurada

    console.log(`📅 Data limite: ${configData.paymentSettings?.dueDateLimit || 'não configurada'}`);
    console.log(`📊 Máximo de parcelas: ${maxInstallments}x`);

    // Mapear billingType
    let billingType = 'PIX';
    if (registration.paymentMethod === 'credit_card') {
      billingType = 'CREDIT_CARD';
    } else if (registration.paymentMethod === 'paypal') {
      billingType = 'UNDEFINED'; // PayPal não é suportado diretamente
    }

    // Calcular data de vencimento (hoje + 2 dias)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 2);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    // Preparar payload da cobrança
    const chargePayload = {
      customer: customerId,
      billingType,
      description: itemDescription,
      externalReference: `registration-${registrationId}`,
      dueDate: dueDateStr
    };

    // Determinar se deve criar parcelamento
    const shouldCreateInstallment = (
      registration.paymentMethod === 'pix_installment' && maxInstallments > 1
    ) || (
      registration.paymentMethod === 'credit_card' && registration.installments > 1
    );

    if (shouldCreateInstallment) {
      // Para PIX parcelado: usar maxInstallments (baseado na data limite)
      // Para cartão parcelado: usar o menor entre installments escolhido e maxInstallments
      let effectiveInstallments;

      if (registration.paymentMethod === 'pix_installment') {
        effectiveInstallments = Math.min(registration.installments, maxInstallments);
      } else {
        effectiveInstallments = Math.min(registration.installments, maxInstallments);
      }

      chargePayload.installmentCount = effectiveInstallments;
      chargePayload.totalValue = parseFloat(registration.total);

      console.log(`📊 Criando cobrança parcelada: ${effectiveInstallments}x de R$ ${(parseFloat(registration.total) / effectiveInstallments).toFixed(2)}`);
      console.log('📊 Payload da cobrança parcelada:', JSON.stringify(chargePayload, null, 2));
    } else {
      // Cobrança avulsa (1x)
      chargePayload.value = parseFloat(registration.total);

      console.log(`📊 Criando cobrança única: R$ ${registration.total}`);
    }

    console.log('ASAAS Charge Payload:', JSON.stringify(chargePayload, null, 2));

    // Validar dados antes de enviar para ASAAS
    if (!chargePayload.customer) {
      throw new Error('Customer ID é obrigatório para criar cobrança');
    }

    if (!chargePayload.billingType) {
      throw new Error('Billing type é obrigatório para criar cobrança');
    }

    if (!chargePayload.dueDate) {
      throw new Error('Data de vencimento é obrigatória para criar cobrança');
    }

    // Validar valor ou parcelas
    if (shouldCreateInstallment) {
      if (!chargePayload.installmentCount || chargePayload.installmentCount < 2) {
        throw new Error('Para cobrança parcelada, installmentCount deve ser >= 2');
      }
      if (!chargePayload.totalValue || chargePayload.totalValue <= 0) {
        throw new Error('Para cobrança parcelada, totalValue deve ser > 0');
      }
    } else {
      if (!chargePayload.value || chargePayload.value <= 0) {
        throw new Error('Para cobrança única, value deve ser > 0');
      }
    }

    console.log('✅ Validação de dados concluída');

    // Criar cobrança no ASAAS
    const chargeResponse = await fetch(`${asaasUrl}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': asaasApiKey
      },
      body: JSON.stringify(chargePayload)
    });

    const chargeResult = await chargeResponse.json();

    if (!chargeResponse.ok) {
      console.error('❌ ASAAS API Error:', {
        status: chargeResponse.status,
        statusText: chargeResponse.statusText,
        response: chargeResult
      });

      // Extrair mensagem de erro mais específica
      let errorMessage = 'Erro na API do ASAAS';
      if (chargeResult.errors && Array.isArray(chargeResult.errors)) {
        errorMessage = chargeResult.errors.join(', ');
      } else if (chargeResult.message) {
        errorMessage = chargeResult.message;
      } else if (chargeResult.error) {
        errorMessage = chargeResult.error;
      }

      return res.status(400).json({
        error: errorMessage,
        details: chargeResult,
        statusCode: chargeResponse.status
      });
    }

    console.log('✅ Cobrança ASAAS criada:', chargeResult);

    // Se for parcelamento, buscar todas as parcelas
    let installments = null;
    if (chargeResult.installment) {
      const installmentsResponse = await fetch(`${asaasUrl}/installments/${chargeResult.installment}/payments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'access_token': asaasApiKey
        }
      });

      const installmentsResult = await installmentsResponse.json();
      installments = installmentsResult.data || [];

      console.log(`✅ ${installments.length} parcelas recuperadas`);
    }

    // Atualizar registration com asaas_payment_id (primeira parcela ou cobrança única)
    await client`
      UPDATE event_registrations
      SET asaas_payment_id = ${chargeResult.id}
      WHERE id = ${registrationId}
    `;

    res.status(201).json({
      success: true,
      charge: chargeResult,
      installments: installments,
      invoiceUrl: chargeResult.invoiceUrl,
      bankSlipUrl: chargeResult.bankSlipUrl,
      message: installments ? `Cobrança parcelada criada com ${installments.length} parcelas` : 'Cobrança criada com sucesso'
    });

  } catch (error) {
    console.error('❌ Error creating charge:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    // Se for um erro de validação, retornar 400
    if (error.message.includes('é obrigatório') || error.message.includes('deve ser')) {
      return res.status(400).json({
        error: error.message,
        type: 'validation_error'
      });
    }

    // Se for um erro da API ASAAS, retornar 400
    if (error.name === 'AsaasApiError') {
      return res.status(400).json({
        error: error.message,
        type: 'asaas_api_error',
        statusCode: error.statusCode,
        details: error.response
      });
    }

    res.status(500).json({
      error: 'Erro interno do servidor',
      type: 'internal_error',
      message: error.message
    });
  }
});

// Create ASAAS Checkout (manter para compatibilidade, mas deprecated)
app.post('/api/checkout/create', async (req, res) => {
  try {
    const { registrationId } = req.body;

    if (!registrationId) {
      return res.status(400).json({ error: 'ID da inscrição é obrigatório' });
    }

    // Buscar a inscrição
    const registrationResult = await client`
      SELECT * FROM event_registrations
      WHERE id = ${registrationId}
    `;

    if (registrationResult.length === 0) {
      return res.status(404).json({ error: 'Inscrição não encontrada' });
    }

    const registration = toCamelCase(registrationResult[0]);

    // Buscar a configuração ativa
    const configResult = await client`
      SELECT * FROM event_form_configs
      WHERE is_active = true
    `;

    if (configResult.length === 0) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }

    const config = toCamelCase(configResult[0]);

    // Parse configData se for string
    let configData = config.configData;
    if (typeof configData === 'string') {
      configData = JSON.parse(configData);
    }

    // Parse selectedProducts se for string
    let selectedProducts = registration.selectedProducts;
    if (typeof selectedProducts === 'string') {
      selectedProducts = JSON.parse(selectedProducts);
    }

    // Mapear paymentMethod para billingTypes
    const billingTypes = [];
    if (registration.paymentMethod === 'pix' || registration.paymentMethod === 'pix_installment') {
      billingTypes.push('PIX');
    }
    if (registration.paymentMethod === 'credit_card') {
      // Para cartão parcelado, usar UNDEFINED para permitir que o cliente escolha
      if (registration.installments > 1) {
        billingTypes.push('UNDEFINED');
      } else {
        billingTypes.push('CREDIT_CARD');
      }
    }

    // Mapear para chargeTypes
    const chargeTypes = [];

    if (registration.paymentMethod === 'pix' || registration.paymentMethod === 'pix_installment') {
      // PIX sempre usa DETACHED (mesmo para parcelado)
      chargeTypes.push('DETACHED');
    } else if (registration.paymentMethod === 'credit_card') {
      if (registration.installments > 1) {
        // Cartão parcelado: DETACHED + INSTALLMENT
        chargeTypes.push('DETACHED', 'INSTALLMENT');
      } else {
        // Cartão à vista: apenas DETACHED
        chargeTypes.push('DETACHED');
      }
    } else {
      // Fallback
      chargeTypes.push('DETACHED');
    }

    // Construir descrição detalhada do item
    const siteNameForPayment = process.env.SITE_NAME || process.env.VITE_SITE_NAME || 'Meu Evento';
    const eventName = configData.eventName || siteNameForPayment;
    let itemDescription = `Inscrição para ${eventName}`;

    // Adicionar tipo de ingresso
    if (registration.ticketType) {
      itemDescription += ` - ${registration.ticketType}`;
    }


    // Adicionar produtos adicionais selecionados
    if (selectedProducts && typeof selectedProducts === 'object') {
      const additionalItems = Object.entries(selectedProducts)
        .filter(([productName, option]) => option && option !== 'Não')
        .map(([productName, option]) => `${productName}: ${option}`);

      if (additionalItems.length > 0) {
        itemDescription += ` + ${additionalItems.join(', ')}`;
      }
    }

    // Adicionar forma de pagamento
    if (registration.paymentMethod) {
      const paymentMethodNames = {
        'pix': 'PIX à Vista',
        'pix_installment': 'PIX Parcelado',
        'credit_card': 'Cartão de Crédito',
        'paypal': 'PayPal'
      };
      itemDescription += ` - ${paymentMethodNames[registration.paymentMethod] || registration.paymentMethod}`;
    }

    // Adicionar parcelas se aplicável
    if (registration.installments && registration.installments > 1) {
      itemDescription += ` (${registration.installments}x)`;
    }

    // Construir items - versão corrigida para ASAAS
    const items = [{
      name: `Inscrição ${eventName}`,
      description: itemDescription,
      quantity: 1,
      value: parseFloat(registration.total)
    }];

    // Construir customerData
    // Processar número de telefone para formato ASAAS (formato nacional brasileiro)
    let phone = "11987654321"; // Formato nacional: 11 (DDD) + 987654321 (número válido)
    console.log('Using fixed phone:', phone);

    const customerData = {
      name: registration.fullName,
      email: registration.email,
      phone: "11987654321", // Formato nacional brasileiro válido
      address: "Endereço não informado", // Campo obrigatório para cartão
      addressNumber: "0", // Campo obrigatório para cartão
      postalCode: "01310100", // Campo obrigatório para cartão (CEP válido)
      province: registration.state || "SP" // Campo obrigatório para cartão
    };

    // Adicionar CPF se não for estrangeiro - sempre usar CPF válido para teste
    customerData.cpfCnpj = "11144477735"; // CPF válido para teste

    // URLs de callback - usar variável de ambiente SITE_URL
    const baseUrl = process.env.SITE_URL || process.env.VITE_SITE_URL || '';

    // Construir payload do ASAAS
    const asaasPayload = {
      billingTypes,
      chargeTypes,
      minutesToExpire: 30, // 30 minutos para expirar
      externalReference: `registration-${registrationId}`,
      callback: {
        successUrl: `${baseUrl}/inscricao/confirmacao/${registrationId}`,
        cancelUrl: `${baseUrl}/inscricao`,
        expiredUrl: `${baseUrl}/inscricao`
      },
      items,
      customerData: {
        name: registration.fullName,
        email: registration.email,
        phone: "11987654321",
        cpfCnpj: "11144477735",
        address: "Endereço não informado",
        addressNumber: "0",
        postalCode: "01310100",
        province: "SP"
      }
    };

    // Adicionar installment apenas para cartão de crédito parcelado
    if (registration.paymentMethod === 'credit_card' && registration.installments > 1) {
      asaasPayload.installment = {
        maxInstallmentCount: registration.installments
      };
    }

    // Adicionar descrição principal para cobranças ASAAS
    asaasPayload.description = itemDescription;

    // Log do payload para debug
    console.log('ASAAS Payload:', JSON.stringify(asaasPayload, null, 2));

    // Fazer chamada real para a API do ASAAS
    // Determinar ambiente baseado na variável ASAAS_SANDBOX
    const isSandbox = process.env.ASAAS_SANDBOX === 'true';
    const asaasApiKey = isSandbox ? process.env.ASAAS_API_KEY_SANDBOX : process.env.ASAAS_API_KEY_PRODUCTION;
    const asaasUrl = isSandbox ? 'https://api-sandbox.asaas.com/v3/checkouts' : 'https://api.asaas.com/v3/checkouts';

    console.log(`ASAAS Environment: ${isSandbox ? 'SANDBOX' : 'PRODUCTION'}`);
    console.log(`ASAAS URL: ${asaasUrl}`);

    if (!asaasApiKey) {
      return res.status(500).json({
        error: `Chave da API ASAAS não configurada para ${isSandbox ? 'sandbox' : 'produção'}`
      });
    }

    try {
      const asaasResponse = await fetch(asaasUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': asaasApiKey
        },
        body: JSON.stringify(asaasPayload)
      });

      const asaasResult = await asaasResponse.json();

      if (!asaasResponse.ok) {
        console.error('ASAAS API Error:', asaasResult);
        return res.status(400).json({
          error: 'Erro na API do ASAAS',
          details: asaasResult
        });
      }

      console.log('ASAAS Checkout criado:', asaasResult);

      res.json({
        success: true,
        checkout: asaasResult,
        message: 'Checkout ASAAS criado com sucesso'
      });

    } catch (apiError) {
      console.error('Erro ao chamar API ASAAS:', apiError);
      res.status(500).json({
        error: 'Erro ao criar checkout no ASAAS',
        details: apiError.message
      });
    }

  } catch (error) {
    console.error('Error creating checkout:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Update ASAAS payment ID for a registration
app.put('/api/registrations/:id/asaas-payment-id', async (req, res) => {
  try {
    const { id } = req.params;
    const { asaasPaymentId } = req.body;

    if (!asaasPaymentId) {
      return res.status(400).json({ error: 'asaasPaymentId is required' });
    }

    const result = await client`
      UPDATE event_registrations
      SET asaas_payment_id = ${asaasPaymentId}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, full_name, email, asaas_payment_id
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    const updatedRegistration = toCamelCase(result[0]);
    console.log(`✅ Updated ASAAS payment ID for registration ${id}: ${asaasPaymentId}`);

    res.json(updatedRegistration);
  } catch (error) {
    console.error('Error updating ASAAS payment ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ASAAS Webhook Management endpoints
app.post('/api/asaas/webhooks', async (req, res) => {
  try {
    const { url, name, email, environment = 'sandbox' } = req.body;

    if (!url || !name || !email) {
      return res.status(400).json({
        error: 'Missing required fields: url, name, email'
      });
    }

    const apiKey = environment === 'production'
      ? process.env.ASAAS_API_KEY_PRODUCTION
      : process.env.ASAAS_API_KEY_SANDBOX;

    if (!apiKey) {
      return res.status(500).json({
        error: `ASAAS API key not found for environment: ${environment}`
      });
    }

    const asaasBaseUrl = environment === 'production'
      ? 'https://www.asaas.com'
      : 'https://sandbox.asaas.com';

    const webhookData = {
      name,
      url,
      email,
      enabled: true,
      interrupted: false,
      authToken: null,
      sendType: "SEQUENTIALLY",
      events: [
        "PAYMENT_CREATED",
        "PAYMENT_RECEIVED",
        "PAYMENT_CONFIRMED",
        "PAYMENT_OVERDUE",
        "PAYMENT_REFUNDED",
        "PAYMENT_PARTIALLY_REFUNDED",
        "PAYMENT_CHARGEBACK_REQUESTED",
        "PAYMENT_CHARGEBACK_DISPUTE",
        "PAYMENT_AWAITING_CHARGEBACK_REVERSAL",
        "PAYMENT_ANTICIPATED",
        "PAYMENT_DELETED",
        "PAYMENT_RESTORED",
        "PAYMENT_UPDATED",
        "PAYMENT_AUTHORIZED",
        "PAYMENT_APPROVED_BY_RISK_ANALYSIS",
        "PAYMENT_REPROVED_BY_RISK_ANALYSIS",
        "PAYMENT_AWAITING_RISK_ANALYSIS"
      ]
    };

    console.log(`🔧 Creating ASAAS webhook for ${environment}:`, {
      name,
      url,
      email,
      events: webhookData.events.length
    });

    const response = await fetch(`${asaasBaseUrl}/v3/webhooks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': apiKey
      },
      body: JSON.stringify(webhookData)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ ASAAS webhook creation failed:', result);
      return res.status(response.status).json({
        error: 'Failed to create ASAAS webhook',
        details: result
      });
    }

    console.log(`✅ ASAAS webhook created successfully:`, {
      id: result.id,
      name: result.name,
      url: result.url,
      environment
    });

    res.json({
      success: true,
      webhook: result,
      environment
    });

  } catch (error) {
    console.error('❌ Error creating ASAAS webhook:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

app.get('/api/asaas/webhooks', async (req, res) => {
  try {
    const { environment = 'sandbox' } = req.query;

    const apiKey = environment === 'production'
      ? process.env.ASAAS_API_KEY_PRODUCTION
      : process.env.ASAAS_API_KEY_SANDBOX;

    if (!apiKey) {
      return res.status(500).json({
        error: `ASAAS API key not found for environment: ${environment}`
      });
    }

    const asaasBaseUrl = environment === 'production'
      ? 'https://www.asaas.com'
      : 'https://sandbox.asaas.com';

    const response = await fetch(`${asaasBaseUrl}/v3/webhooks`, {
      method: 'GET',
      headers: {
        'access_token': apiKey
      }
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Failed to fetch ASAAS webhooks:', result);
      return res.status(response.status).json({
        error: 'Failed to fetch ASAAS webhooks',
        details: result
      });
    }

    res.json({
      success: true,
      webhooks: result.data || result,
      environment
    });

  } catch (error) {
    console.error('❌ Error fetching ASAAS webhooks:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

app.delete('/api/asaas/webhooks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { environment = 'sandbox' } = req.query;

    const apiKey = environment === 'production'
      ? process.env.ASAAS_API_KEY_PRODUCTION
      : process.env.ASAAS_API_KEY_SANDBOX;

    if (!apiKey) {
      return res.status(500).json({
        error: `ASAAS API key not found for environment: ${environment}`
      });
    }

    const asaasBaseUrl = environment === 'production'
      ? 'https://www.asaas.com'
      : 'https://sandbox.asaas.com';

    const response = await fetch(`${asaasBaseUrl}/v3/webhooks/${id}`, {
      method: 'DELETE',
      headers: {
        'access_token': apiKey
      }
    });

    if (!response.ok) {
      const result = await response.json();
      console.error('❌ Failed to delete ASAAS webhook:', result);
      return res.status(response.status).json({
        error: 'Failed to delete ASAAS webhook',
        details: result
      });
    }

    console.log(`✅ ASAAS webhook deleted: ${id} (${environment})`);

    res.json({
      success: true,
      message: 'Webhook deleted successfully',
      webhookId: id,
      environment
    });

  } catch (error) {
    console.error('❌ Error deleting ASAAS webhook:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// ASAAS Webhook endpoint
app.post('/api/webhooks/asaas', async (req, res) => {
  try {
    const { event, payment } = req.body;

    console.log(`🔔 ASAAS Webhook received: ${event}`);
    console.log(`💳 Payment ID: ${payment?.id}`);
    console.log(`💰 Amount: ${payment?.value}`);
    console.log(`📊 Status: ${payment?.status}`);

    // Validate webhook data
    if (!event || !payment) {
      console.error('❌ Invalid webhook data received');
      return res.status(400).json({ error: 'Invalid webhook data' });
    }

    // Map ASAAS payment status to our payment status
    const statusMapping = {
      'PENDING': 'pending',
      'RECEIVED': 'paid',
      'CONFIRMED': 'paid',
      'OVERDUE': 'overdue',
      'REFUNDED': 'refunded',
      'PARTIALLY_REFUNDED': 'refunded',
      'RECEIVED_IN_CASH': 'paid',
      'CHARGEBACK_REQUESTED': 'chargeback',
      'CHARGEBACK_DISPUTE': 'chargeback',
      'AWAITING_CHARGEBACK_REVERSAL': 'chargeback'
    };

    const newStatus = statusMapping[payment.status] || 'pending';

    // Find registration by ASAAS payment ID
    let registrationId = null;

    // First, try to find by ASAAS payment ID (most reliable)
    if (payment.id) {
      const paymentIdResult = await client`
        SELECT id FROM event_registrations
        WHERE asaas_payment_id = ${payment.id}
        LIMIT 1
      `;

      if (paymentIdResult.length > 0) {
        registrationId = paymentIdResult[0].id;
      }
    }

    // Try to find by external reference (if we stored the registration ID there)
    if (!registrationId && payment.externalReference) {
      // externalReference comes as "registration-196", extract the number
      const externalRefMatch = payment.externalReference.match(/^registration-(\d+)$/);
      if (externalRefMatch) {
        registrationId = parseInt(externalRefMatch[1], 10);
      } else {
        // Fallback: try to parse as integer directly if it's just a number
        const parsedId = parseInt(payment.externalReference, 10);
        if (!isNaN(parsedId)) {
          registrationId = parsedId;
        }
      }
    }

    // Try to find by customer document (CPF)
    if (!registrationId && payment.customer && payment.customer.cpfCnpj) {
      const cpfResult = await client`
        SELECT id FROM event_registrations
        WHERE cpf = ${payment.customer.cpfCnpj}
        ORDER BY created_at DESC
        LIMIT 1
      `;

      if (cpfResult.length > 0) {
        registrationId = cpfResult[0].id;
      }
    }

    // Try to find by customer email
    if (!registrationId && payment.customer && payment.customer.email) {
      const emailResult = await client`
        SELECT id FROM event_registrations
        WHERE email = ${payment.customer.email}
        ORDER BY created_at DESC
        LIMIT 1
      `;

      if (emailResult.length > 0) {
        registrationId = emailResult[0].id;
      }
    }

    if (registrationId) {
      // Update registration status
      const updateResult = await client`
        UPDATE event_registrations
        SET payment_status = ${newStatus}, updated_at = NOW()
        WHERE id = ${registrationId}
        RETURNING id, full_name, email, payment_status
      `;

      if (updateResult.length > 0) {
        const updatedRegistration = updateResult[0];
        console.log(`✅ Updated registration ${registrationId}: ${updatedRegistration.full_name} (${updatedRegistration.email}) -> ${newStatus}`);

        // Log the webhook event for audit
        console.log(`📝 Webhook Event: ${event} | Payment: ${payment.id} | Registration: ${registrationId} | Status: ${newStatus}`);
      } else {
        console.log(`⚠️ Registration ${registrationId} not found for update`);
      }
    } else {
      console.log(`⚠️ Could not find registration for payment ${payment.id}`);
      console.log(`🔍 Payment details:`, {
        id: payment.id,
        customer: payment.customer,
        externalReference: payment.externalReference,
        value: payment.value
      });
    }

    // Always return 200 to acknowledge webhook receipt
    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      event,
      paymentId: payment.id,
      registrationId,
      newStatus
    });

  } catch (error) {
    console.error('❌ Error processing ASAAS webhook:', error);

    // Still return 200 to prevent webhook retries for our errors
    res.status(200).json({
      success: false,
      error: 'Webhook processing failed',
      message: error.message
    });
  }
});

// ===== NOTIFICATIONS ENDPOINTS =====

// Get notifications for authenticated user
app.get('/api/notifications', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    // Get user ID
    const user = await client`SELECT id FROM users WHERE email = ${email} AND is_active = true LIMIT 1`;

    if (user.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const userId = user[0].id;

    // Get unread notifications count
    const unreadCount = await client`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ${userId} AND is_read = false
    `;

    // Get recent notifications (last 10)
    const notifications = await client`
      SELECT id, type, title, message, data, is_read, created_at
      FROM notifications
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 10
    `;

    res.json({
      unreadCount: parseInt(unreadCount[0].count),
      notifications: toCamelCase(notifications)
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark notification as read
app.post('/api/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    // Get user ID
    const user = await client`SELECT id FROM users WHERE email = ${email} AND is_active = true LIMIT 1`;

    if (user.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const userId = user[0].id;

    // Mark notification as read
    const result = await client`
      UPDATE notifications
      SET is_read = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Notificação não encontrada' });
    }

    res.json({ success: true, notification: toCamelCase(result[0]) });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark all notifications as read
app.post('/api/notifications/read-all', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    // Get user ID
    const user = await client`SELECT id FROM users WHERE email = ${email} AND is_active = true LIMIT 1`;

    if (user.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const userId = user[0].id;

    // Mark all notifications as read
    await client`
      UPDATE notifications
      SET is_read = true, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId} AND is_read = false
    `;

    res.json({ success: true });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create notification (internal use)
const createNotification = async (userId, type, title, message, data = null) => {
  try {
    const result = await client`
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (${userId}, ${type}, ${title}, ${message}, ${data ? JSON.stringify(data) : null})
      RETURNING *
    `;
    return toCamelCase(result[0]);
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// ===== USER MANAGEMENT ENDPOINTS =====

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await client`
      SELECT id, email, is_active, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `;

    res.json(toCamelCase(users));

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new user
app.post('/api/users', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Check if user already exists
    const existingUser = await client`SELECT id FROM users WHERE email = ${email}`;

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await client`
      INSERT INTO users (email, password_hash, is_active)
      VALUES (${email}, ${passwordHash}, true)
      RETURNING id, email, is_active, created_at
    `;

    res.status(201).json(toCamelCase(result[0]));

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user status
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ error: 'is_active deve ser um boolean' });
    }

    const result = await client`
      UPDATE users
      SET is_active = ${is_active}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, email, is_active, updated_at
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(toCamelCase(result[0]));

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await client`
      DELETE FROM users
      WHERE id = ${id}
      RETURNING id, email
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ success: true, message: 'Usuário deletado com sucesso' });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// SPA fallback - serve index.html for non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile('index.html', { root: 'dist' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Test DB: http://localhost:${PORT}/api/test-db`);
});

// Export for Vercel serverless
export default app;