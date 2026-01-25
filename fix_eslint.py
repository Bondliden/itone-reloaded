#!/usr/bin/env python3
"""
Quick ESLint fixer for iTone project
Fixes common patterns:
- Prefix unused variables with underscore
- Remove unused imports
- Fix empty interfaces
"""

import re
import os
from pathlib import Path

# Define fixes
FIXES = {
    # Unused variables - just prefix with underscore
    'src/components/Live Session.tsx': [
        (r'sessionId: _sessionId', 'sessionId: (_ sessionId is handled by hooks)')
    ],
    'src/components/IntegratedUploadStudio.tsx': [
        (r"} catch \(error\) {", "} catch (_error) {")
    ],
    'src/components/PlatformConnectionManager.tsx': [
        (r"} catch \(error\) {", "} catch (_error) {"),
        (r"const handleDisconnect = async \(platformId: string\)", "const handleDisconnect = async (_platformId: string)")
    ],
    'src/components/PlatinumCheckout.tsx': [
        (r"const createSubscription = useCreatePlatinumSubscription\(\);", "const _createSubscription = useCreatePlatinumSubscription();")
    ],
    'src/components/Queue.tsx': [
        (r"} catch \(error\) {", "} catch (_error) {"),
        (r"const nextSong = await response\.json\(\);", "const _nextSong = await response.json();")
    ],
    'src/components/RecordingStudio.tsx': [
        (r"const maxQuality = subscription", "const _maxQuality = subscription"),
        (r"} catch \(error\) {", "} catch (_error) {"),
        (r"const uploadToPlatform = async", "const _uploadToPlatform = async")
    ],
    'src/components/ui/input.tsx': [
        (r"export interface InputProps extends", "export type InputProps =")
    ],
    'src/components/ui/textarea.tsx': [
        (r"export interface TextareaProps extends", "export type TextareaProps =")
    ],
    'src/components/ui/use-toast.ts': [
        (r"const actionTypes = {", "const actionTypes: { [key: string]: string } = {")
    ],
    'src/contexts/AuthContext.tsx': [
        (r"import.*UserProfile.*from", "// Removed unused UserProfile import")
    ],
    'src/hooks/useSupabase.ts': [
        (r"import { useAuth }", "// Removed unused useAuth import")
    ],
    'src/pages/DashboardPage.tsx': [
        (r"import.*useState.*from", "import { useMemo } from"),
        (r"const.*platinumSubscription.*=", "const _platinumSubscription =")
    ],
    'src/pages/KaraokePage.tsx': [
        (r"setCurrentTime,.*=", "// setCurrentTime not needed =")
    ]
}

def main():
    print("ESLint Quick Fixer for iTone")
    print("=" * 50)
    
    project_root = Path(__file__).parent.parent
    
    for filepath, replacements in FIXES.items():
        fullpath = project_root / filepath
        if not fullpath.exists():
            print(f"⚠️  File not found: {filepath}")
            continue
            
        try:
            with open(fullpath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            for pattern, replacement in replacements:
                content = re.sub(pattern, replacement, content)
            
            if content != original_content:
                with open(fullpath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✅ Fixed: {filepath}")
            else:
                print(f"ℹ️  No changes: {filepath}")
                
        except Exception as e:
            print(f"❌ Error fixing {filepath}: {e}")
    
    print("\n" + "=" * 50)
    print("Done! Run 'npx eslint .' to verify.")

if __name__ == '__main__':
    main()
