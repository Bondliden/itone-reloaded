#!/bin/bash

# iTone Karaoke Project Export Script
# Run this script to create a comprehensive backup of your project

echo "📦 Exporting iTone Karaoke Project..."

# Create export directory
export_dir="itone-karaoke-export-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$export_dir"

echo "Creating project archive in $export_dir..."

# Copy all source files
cp -r src/ "$export_dir/"
cp -r public/ "$export_dir/"
cp -r docs/ "$export_dir/"
cp -r scripts/ "$export_dir/"
cp -r supabase/ "$export_dir/"
cp -r android/ "$export_dir/"
cp -r ios/ "$export_dir/"
cp -r server/ "$export_dir/"
cp -r store-metadata/ "$export_dir/"

# Copy configuration files
cp package.json "$export_dir/"
cp package-lock.json "$export_dir/" 2>/dev/null || true
cp tsconfig.json "$export_dir/"
cp tsconfig.app.json "$export_dir/"
cp tsconfig.node.json "$export_dir/"
cp vite.config.ts "$export_dir/"
cp tailwind.config.js "$export_dir/"
cp postcss.config.js "$export_dir/"
cp capacitor.config.ts "$export_dir/"
cp eslint.config.js "$export_dir/"
cp index.html "$export_dir/"
cp README.md "$export_dir/"
cp .env.example "$export_dir/"

echo "✅ Project files copied successfully"

# Create compressed archive
if command -v tar &> /dev/null; then
    echo "📦 Creating tar.gz archive..."
    tar -czf "${export_dir}.tar.gz" "$export_dir"
    echo "✅ Archive created: ${export_dir}.tar.gz"
elif command -v zip &> /dev/null; then
    echo "📦 Creating zip archive..."
    zip -r "${export_dir}.zip" "$export_dir"
    echo "✅ Archive created: ${export_dir}.zip"
else
    echo "⚠️  No compression tool found. Project copied to directory: $export_dir"
fi

echo ""
echo "🎉 Export complete!"
echo ""
echo "📁 Your iTone Karaoke project includes:"
echo "   • Complete React frontend with TypeScript"
echo "   • Supabase backend with PostgreSQL database"
echo "   • Genspark AI integration"
echo "   • Capacitor mobile app configuration"
echo "   • Stripe payment integration"
echo "   • N8N workflow automation"
echo "   • App store deployment configurations"
echo "   • Comprehensive documentation"
echo ""
echo "🚀 Ready to deploy anywhere!"