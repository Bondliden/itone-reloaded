#!/usr/bin/env node

/**
 * Merge Conflict Resolution Script
 * Removes git conflict markers and resolves conflicts by keeping HEAD version
 * Run: node fix-conflicts.js
 */

const fs = require('fs');
const path = require('path');

const FILES_WITH_CONFLICTS = [
  'src/utils/videoUtils.ts',
  'src/components/FeatureGate.tsx',
  'src/components/KaraokePlayer.tsx',
  'src/components/VoiceAnalyzer.tsx',
  'src/components/IntegratedUploadStudio.tsx',
  'src/components/SubscriptionManager.tsx',
  'src/components/PlatinumUpgrade.tsx',
  'src/components/LyricsDisplay.tsx',
  'src/components/PricingPage.tsx',
  'src/components/LiveSession.tsx',
  'src/components/UserProfile.tsx',
  'src/pages/LoginPage.tsx',
  'src/components/PlatinumCheckout.tsx',
  'src/components/NotificationCenter.tsx',
  'src/components/PlatformUploadPricing.tsx',
  'src/components/AudioVisualizer.tsx',
  'src/pages/KaraokePage.tsx'
];

function resolveConflicts(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    // Pattern to match conflict markers
    const conflictPattern = /<<<<<<< HEAD\n[\s\S]*?=======\n[\s\S]*?>>>>>>> origin\/main\n/g;
    
    // Function to resolve individual conflicts
    const resolveConflict = (match) => {
      // Extract HEAD version (keep it)
      const headMatch = match.match(/<<<<<<< HEAD\n([\s\S]*?)\n=======/);
      if (headMatch) {
        modified = true;
        return headMatch[1] + '\n';
      }
      return match;
    };
    
    const newContent = content.replace(conflictPattern, resolveConflict);
    
    if (modified) {
      fs.writeFileSync(fullPath, newContent, 'utf8');
      console.log(`✓ Fixed: ${filePath}`);
      return true;
    } else {
      console.log(`- No conflicts found: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

console.log('🔧 Starting merge conflict resolution...\n');

let fixed = 0;
let errors = 0;

FILES_WITH_CONFLICTS.forEach(file => {
  if (resolveConflicts(file)) {
    fixed++;
  }
});

console.log(`\n✅ Conflict resolution complete!`);
console.log(`   Fixed: ${fixed} files`);
console.log(`   Errors: ${errors} files`);
console.log('\n💡 Next step: Commit these changes and push to trigger a new build.\n');
