#!/bin/bash

# ACMS Docker Deployment Script
# Usage: ./deploy-docker.sh

set -e

echo "🚀 ACMS Deployment Script"
echo "=========================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file and set secure passwords!"
    echo "   - DB_PASSWORD"
    echo "   - JWT_SECRET"
    echo ""
    read -p "Press Enter after updating .env file..."
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose up -d --build

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
echo ""
echo "🔍 Checking service health..."

# Check database
if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ Database is healthy"
else
    echo "❌ Database is not responding"
fi

# Check backend
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "⚠️  Backend is starting... (may take a few more seconds)"
fi

# Check frontend
if curl -f http://localhost/ > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "⚠️  Frontend is starting... (may take a few more seconds)"
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📍 Access your application:"
echo "   Frontend: http://localhost"
echo "   Backend:  http://localhost:5000/api"
echo "   Database: localhost:5432"
echo ""
echo "📊 View logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose down"
echo ""
echo "🔄 Restart services:"
echo "   docker-compose restart"
echo ""
