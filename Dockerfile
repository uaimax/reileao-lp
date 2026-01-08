# Use Node.js 18+ base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build React frontend
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Expose port 3002 for CapRover
EXPOSE 3002

# Set environment variable
ENV NODE_ENV=production

# Start the application
CMD ["node", "api/index.js"]