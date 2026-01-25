#!/bin/bash

# Generate app icons for both platforms
set -e

echo "🎨 Generating app icons for iTone Karaoke..."

# Create directories
mkdir -p assets/icons/android
mkdir -p assets/icons/ios

# You'll need to replace this with your actual app icon (1024x1024 PNG)
echo "📝 Place your 1024x1024 app icon at: assets/app-icon-1024.png"
echo ""
echo "Then run these commands to generate all required sizes:"
echo ""

echo "For Android:"
echo "# Generate Android icons (place in android/app/src/main/res/)"
echo "convert assets/app-icon-1024.png -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher.png"
echo "convert assets/app-icon-1024.png -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher.png"  
echo "convert assets/app-icon-1024.png -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher.png"
echo "convert assets/app-icon-1024.png -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png"
echo "convert assets/app-icon-1024.png -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png"
echo ""

echo "For iOS:"
echo "# Generate iOS icons (place in ios/App/App/Assets.xcassets/AppIcon.appiconset/)"
echo "convert assets/app-icon-1024.png -resize 20x20 ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-20.png"
echo "convert assets/app-icon-1024.png -resize 40x40 ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-40.png"
echo "convert assets/app-icon-1024.png -resize 58x58 ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-58.png"
echo "convert assets/app-icon-1024.png -resize 60x60 ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-60.png"
echo "convert assets/app-icon-1024.png -resize 80x80 ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-80.png"
echo "convert assets/app-icon-1024.png -resize 87x87 ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-87.png"
echo "convert assets/app-icon-1024.png -resize 120x120 ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-120.png"
echo "convert assets/app-icon-1024.png -resize 152x152 ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-152.png"
echo "convert assets/app-icon-1024.png -resize 167x167 ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-167.png"
echo "convert assets/app-icon-1024.png -resize 180x180 ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-180.png"
echo "convert assets/app-icon-1024.png -resize 1024x1024 ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-1024.png"
echo ""

echo "📱 Icon generation commands ready!"
echo "💡 Tip: Install ImageMagick first: brew install imagemagick"