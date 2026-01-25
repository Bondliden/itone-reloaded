#!/bin/bash

# Build script for Google Play Store release
set -e

echo "🤖 Building iTone Karaoke for Google Play Store..."

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf dist
rm -rf android/app/build

# Build web assets
echo "Building web assets..."
npm run build

# Copy to Capacitor
echo "Copying to Android..."
npx cap copy android

# Generate keystore if it doesn't exist
if [ ! -f "android/release-key.keystore" ]; then
    echo "Generating release keystore..."
    cd android
    keytool -genkey -v -keystore release-key.keystore -alias itone-key -keyalg RSA -keysize 2048 -validity 10000 \
        -dname "CN=iTone Karaoke, OU=Mobile Apps, O=iTone, L=San Francisco, ST=CA, C=US" \
        -storepass itone2025 -keypass itone2025
    cd ..
fi

# Build AAB for Play Store
echo "Building Android App Bundle for Play Store..."
cd android
./gradlew bundleRelease

echo "✅ Android App Bundle created at: android/app/build/outputs/bundle/release/"
echo "📱 Upload the .aab file to Google Play Console"
echo ""
echo "🎯 Next steps:"
echo "1. Upload android/app/build/outputs/bundle/release/app-release.aab to Google Play Console"
echo "2. Complete store listing with metadata from store-metadata/google-play/"
echo "3. Set up pricing and distribution"
echo "4. Submit for review"

cd ..