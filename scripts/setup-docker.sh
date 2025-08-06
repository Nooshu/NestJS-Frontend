#!/bin/bash

# Docker setup script for NestJS Frontend
echo "🐳 Setting up Docker for NestJS Frontend"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed."
    echo ""
    echo "📦 To install Docker on macOS:"
    echo "1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop"
    echo "2. Install and start Docker Desktop"
    echo "3. Run this script again"
    echo ""
    echo "📦 To install Docker using Homebrew:"
    echo "brew install --cask docker"
    echo ""
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running."
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is installed and running"

# Check if docker-compose is available
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    echo "❌ Docker Compose is not available."
    echo "Please install Docker Compose or update Docker Desktop."
    exit 1
fi

echo "✅ Docker Compose is available"

# Prepare the project for Docker build
echo ""
echo "🔧 Preparing project for Docker build..."
./scripts/prepare-docker.sh

# Test the Docker setup
echo ""
echo "🔨 Testing Docker setup..."

# Build the image
echo "Building Docker image..."
$COMPOSE_CMD build

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully"
    
    echo ""
    echo "🚀 To run the application:"
    echo "   $COMPOSE_CMD up"
    echo ""
    echo "🌐 The application will be available at:"
    echo "   https://localhost:3100"
    echo ""
    echo "📋 Other useful commands:"
    echo "   $COMPOSE_CMD up -d          # Run in background"
    echo "   $COMPOSE_CMD down           # Stop the application"
    echo "   $COMPOSE_CMD logs -f        # View logs"
    echo "   $COMPOSE_CMD up --build     # Rebuild and start"
else
    echo "❌ Failed to build Docker image"
    exit 1
fi 