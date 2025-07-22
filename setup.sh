#!/bin/bash

echo ""
echo "🔧 Loading Docker images from tar file..."
docker load -i docconnect.tar

echo ""
echo "🚀 Starting services with Docker Compose..."
docker compose up -d

echo ""
echo "🌐 Opening app in browser..."
sleep 5
xdg-open http://localhost:3000

echo ""
echo "✅ App should now be running at http://localhost:3000"
