#!/bin/bash

# Build script for Apple App Store release
set -e

echo "🍎 Building iTone Karaoke for Apple App Store..."

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf dist
rm -rf ios/App/build

# Build web assets
echo "Building web assets..."
npm run build

# Copy to Capacitor
echo "Copying to iOS..."
npx cap copy ios

# Build iOS app
echo "Building iOS app..."
cd ios/App

# Clean Xcode build folder
xcodebuild clean -workspace App.xcworkspace -scheme App

# Archive for App Store
echo "Creating App Store archive..."
xcodebuild archive \
    -workspace App.xcworkspace \
    -scheme App \
    -configuration Release \
    -archivePath ./build/iTone.xcarchive \
    -allowProvisioningUpdates

# Export IPA for App Store
echo "Exporting IPA for App Store..."
xcodebuild -exportArchive \
    -archivePath ./build/iTone.xcarchive \
    -exportPath ./build/AppStore \
    -exportOptionsPlist ../../store-metadata/app-store/ExportOptions.plist

echo "✅ iOS IPA created at: ios/App/build/AppStore/"
echo "📱 Upload the .ipa file to App Store Connect"
echo ""
echo "🎯 Next steps:"
echo "1. Upload ios/App/build/AppStore/iTone Karaoke.ipa to App Store Connect"
echo "2. Complete app metadata using store-metadata/app-store/metadata.json"
echo "3. Add app screenshots and preview videos"
echo "4. Submit for App Store review"

cd ../..