#!/bin/bash

# Complete deployment script for both app stores
set -e

echo "🚀 Deploying iTone Karaoke to App Stores..."

# Ensure we're in the right directory
if [ ! -f "capacitor.config.ts" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if Capacitor is installed
if ! command -v cap &> /dev/null; then
    echo "📦 Installing Capacitor CLI..."
    npm install -g @capacitor/cli
fi

# Build web assets
echo "🌐 Building web application..."
npm run build

# Validate build
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Web build complete"

# Ask user which platform to build
echo ""
echo "📱 Which platform would you like to build?"
echo "1) Android (Google Play Store)"
echo "2) iOS (Apple App Store)" 
echo "3) Both platforms"
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo "🤖 Building for Android..."
        ./scripts/build-android.sh
        ;;
    2)
        echo "🍎 Building for iOS..."
        ./scripts/build-ios.sh
        ;;
    3)
        echo "📱 Building for both platforms..."
        ./scripts/build-android.sh
        echo ""
        ./scripts/build-ios.sh
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Build complete!"
echo ""
echo "📋 Final checklist:"
echo "□ App icons generated (run scripts/generate-icons.sh)"
echo "□ Screenshots captured for store listings"
echo "□ Store metadata reviewed and updated"
echo "□ Privacy policy published at https://itone.studio/privacy"
echo "□ Terms of service published at https://itone.studio/terms"
echo "□ Support page ready at https://itone.studio/support"
echo ""
echo "🎯 Ready for store submission!"