#!/bin/bash

echo "🔍 Testing API Health Check..."
echo "=============================="

# Kill any existing process on port 3002
if lsof -ti:3002 &> /dev/null; then
    echo "🔄 Killing existing process on port 3002..."
    kill -9 $(lsof -ti:3002) 2>/dev/null || true
    sleep 2
fi

# Run the health check API
echo "🚀 Starting Health Check API..."
node api-health-check.js &

# Wait for API to start
sleep 3

# Test the health endpoint
echo "🔗 Testing health endpoint..."
curl -s http://localhost:3002/api/health | jq . || echo "❌ Health check failed"

echo ""
echo "🔗 Testing debug endpoint..."
curl -s http://localhost:3002/api/debug | jq . || echo "❌ Debug check failed"

echo ""
echo "✅ Health check complete!"
echo "🔗 You can also test manually:"
echo "   curl http://localhost:3002/api/health"
echo "   curl http://localhost:3002/api/debug"