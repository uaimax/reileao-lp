# Enriched Context

## Found in Project

### Application Architecture
- **Full-stack monorepo**: React frontend + Express backend in single repository
- **Frontend**: React + TypeScript + Vite (port 8080) - `/src/pages/`, `/src/components/`
- **Backend**: Express.js + TypeScript (port 3002) - `/api/index.ts`
- **Database**: PostgreSQL with Drizzle ORM - schema in `/src/lib/schema.ts`
- **Build output**: Vite builds to `/dist/` directory

### Configuration Files Found
- **Package.json**: `/home/uaimax/projects/uaizouk-lp-dinamic/package.json`
  - Node.js ES modules (`"type": "module"`)
  - Key scripts: `dev`, `dev:api`, `dev:full`, `build`, `api`
  - Dependencies: Express 4.21.2, React 18.3.1, Vite 5.4.1, postgres 3.4.7
- **Vercel config**: `/home/uaimax/projects/uaizouk-lp-dinamic/vercel.json`
  - Build command: `npm run build`
  - Output directory: `dist`
  - API functions configured for serverless deployment
- **Vite config**: `/home/uaimax/projects/uaizouk-lp-dinamic/vite.config.ts`
  - Frontend port: 8080
  - API proxy target: `http://localhost:3003` (⚠️ **PORT MISMATCH ISSUE**)

### Database Configuration
- **Setup script**: `/home/uaimax/projects/uaizouk-lp-dinamic/setup-db.js`
- **Schema**: `/home/uaimax/projects/uaizouk-lp-dinamic/schema.sql`
- **Migrations**: `/home/uaimax/projects/uaizouk-lp-dinamic/migrations/`
- **ORM**: Drizzle with PostgreSQL client, requires `DATABASE_URL` environment variable

### Current Deployment Status
- **Vercel deployed**: Serverless functions architecture
- **No Docker files**: No existing Dockerfile, .dockerignore, or docker-compose.yml
- **Database**: External PostgreSQL (Neon mentioned in request)

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string (already configured with Neon)
- `VITE_API_URL`: API endpoint URL for frontend
- `NODE_ENV`: Environment mode
- `PORT`: API server port (defaults to 3002)

### Static File Serving
- **Current**: Vercel serves static files from `/dist/`
- **Docker requirement**: Express backend must serve static files

## Critical Issues Identified

### 1. Port Configuration Mismatch
- **Issue**: Vite proxy configuration targets port 3003, but API runs on port 3002
- **File**: `/home/uaimax/projects/uaizouk-lp-dinamic/vite.config.ts:13`
- **Impact**: API calls will fail in development and potentially in production

### 2. Static File Serving
- **Issue**: Express backend doesn't serve frontend static files (currently handled by Vercel)
- **Requirement**: Must add static file middleware to serve `/dist/` content

## Inferred Context

### Deployment Strategy
- **Single container approach**: Most suitable for Caprover deployment
- **Express serves both**: API routes (`/api/*`) and static files (`/*`)
- **External database**: Continue using existing Neon PostgreSQL setup
- **Port 3002**: Single exposed port for Caprover simplicity

### Technical Requirements
- **Node.js 18+**: Based on modern dependencies and ES modules
- **Build process**: Frontend must be built before container starts
- **Health checks**: API has `/api/health` endpoint for container health monitoring
- **File uploads**: S3 integration exists, no persistent storage needed in container