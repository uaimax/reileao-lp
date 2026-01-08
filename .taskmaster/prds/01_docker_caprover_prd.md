# Docker Caprover Deployment PRD

## Overview

Create Docker containerization and Caprover deployment configuration for the UAIZOUK 2025 Event Landing Page application. The solution must enable easy deployment to Caprover with a single container serving both the React frontend and Express backend, using the existing Neon PostgreSQL database.

## Core Features

- **Dockerfile**: Single-stage Docker container configuration
  - Node.js 18+ base image
  - Install dependencies and build frontend
  - Serve both API and static files via Express
  - Expose port 3002 for Caprover

- **Captain Definition**: Caprover deployment configuration
  - Container HTTP port: 3002
  - Environment variable setup for DATABASE_URL
  - Health check configuration

- **Port Configuration Fix**: Correct Vite proxy configuration
  - Change target from port 3003 to 3002 in vite.config.ts
  - Ensure API calls work in development and production

- **Static File Serving**: Configure Express to serve built frontend
  - Add middleware to serve files from `/dist/` directory
  - Route API calls to `/api/*` and frontend to all other routes

## Success Criteria

- [ ] Docker container builds successfully with `docker build`
- [ ] Container runs locally with `docker run` and serves both frontend and API
- [ ] Frontend loads at http://localhost:3002/ and admin panel at http://localhost:3002/painel
- [ ] API endpoints respond correctly at http://localhost:3002/api/*
- [ ] Health check endpoint returns success at http://localhost:3002/api/health
- [ ] Caprover can deploy the application using the captain-definition file
- [ ] Application connects to Neon database using DATABASE_URL environment variable
- [ ] Port 3003/3002 mismatch is resolved and development proxy works correctly

## Technical Notes

- **Input**: Existing monorepo with React frontend and Express backend
- **Output**: 
  - `Dockerfile` in project root
  - `captain-definition` in project root  
  - `.dockerignore` in project root
  - Updated `vite.config.ts` with correct port
  - Updated `api/index.ts` with static file serving
- **Database**: Uses existing Neon PostgreSQL connection via DATABASE_URL
- **Port**: Single port 3002 for both frontend and API
- **Build**: Frontend builds to `/dist/`, served by Express in production