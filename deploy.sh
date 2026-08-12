#!/bin/bash
# QueueForge Deployment Script
# Run this after setting up Vercel project

set -e

echo "🚀 QueueForge Deployment Script"
echo "================================"

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel@latest
fi

# Build locally first to catch errors
echo "🔨 Building locally..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Fix errors before deploying."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Post-deployment checklist:"
echo "  1. Verify environment variables in Vercel Dashboard"
echo "  2. Test authentication flow (signup, login, email verification)"
echo "  3. Test queue join, booking, notifications"
echo "  4. Configure custom domain in Vercel Settings"
echo "  5. Set up monitoring (Vercel Analytics, Uptime Kuma)"
echo ""
echo "🔗 Your app: https://your-project.vercel.app"