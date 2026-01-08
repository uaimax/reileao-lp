#!/bin/bash

# Start API server in background
echo "Starting API server..."
npx tsx api/index.ts &
API_PID=$!

# Wait a moment for API to start
sleep 2

# Test API connection
echo "Testing API connection..."
if curl -s http://localhost:3002/api/health > /dev/null; then
    echo "✅ API server is running on port 3002"
else
    echo "❌ API server failed to start"
    kill $API_PID 2>/dev/null
    exit 1
fi

# Start frontend
echo "Starting frontend..."
npm run dev

# Cleanup on exit
trap "kill $API_PID 2>/dev/null; exit" INT TERM
wait