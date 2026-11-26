#!/bin/bash

echo "🚀 Deploying Kasir Obat to Vercel..."
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
fi

# Read environment variable
if [ -f .env ]; then
    export $(cat .env | grep VITE_SCRIPT_URL | xargs)
    echo "✅ Environment variables loaded from .env"
else
    echo "⚠️  Warning: .env file not found"
fi

# Build the project first to check for errors
echo ""
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🌐 Deploying to Vercel..."
    echo ""
    
    # Deploy to Vercel
    vercel --prod --yes
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Deployment successful!"
        echo ""
        echo "⚠️  Don't forget to set environment variables in Vercel:"
        echo "   vercel env add VITE_SCRIPT_URL production"
        echo "   Value: $VITE_SCRIPT_URL"
        echo ""
        echo "   Then redeploy: vercel --prod"
    else
        echo ""
        echo "❌ Deployment failed!"
    fi
else
    echo ""
    echo "❌ Build failed! Fix the errors before deploying."
    exit 1
fi
