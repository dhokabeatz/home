#!/bin/bash

# Test script to verify serverless setup works locally
# Usage: ./test-serverless.sh

echo "🧪 Testing Serverless Setup Locally..."

# Check if we're in the backend directory
if [ ! -f "serverless.yml" ]; then
    echo "❌ Please run this script from the backend directory"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "📝 Please update .env with your actual configuration"
fi

# Load environment variables from .env file
echo "� Loading environment variables..."
set -a
source .env
set +a

echo "�🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "📦 Starting Serverless Offline..."
echo "🌐 Backend will be available at http://localhost:4000"
echo "📚 API docs will be available at http://localhost:4000/api/docs"
echo ""
echo "Press Ctrl+C to stop the server"

serverless offline
