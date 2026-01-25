#!/usr/bin/env python3
"""
Automated ESLint fixer for iTone project
Fixes all simple errors like unused variables
"""

import json
import re
from pathlib import Path

def fix_unused_variable(file_path, line, var_name):
    """Prefix unused variable with underscore"""
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Line is 1-indexed
    if 0 < line <= len(lines):
        # Replace the variable name with underscore prefix
        lines[line - 1] = lines[line - 1].replace(var_name, f'_{var_name}', 1)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        return True
    return False

def main():
    project_root = Path(r'a:\ESCRITTORIO\AI\Itone\project-bolt-sb1-9mxnrqyh\project')
    eslint_file = projet_root / 'eslint-full.json'
    
    with open(eslint_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    fixes_applied = 0
    
    for file_info in data:
        if file_info['errorCount'] == 0 and file_info['warningCount'] == 0:
            continue
        
        file_path = Path(file_info['filePath'])
        
        for message in file_info['messages']:
            rule_id = message.get('ruleId', '')
            msg_text = message.get('message', '')
            
            # Fix unused variables
            if rule_id == '@typescript-eslint/no-unused-vars':
                match = re.search(r"'(\w+)' is (defined|assigned)", msg_text)
                if match:
                    var_name = match.group(1)
                    if not var_name.startswith('_'):
                        line = message['line']
                        if fix_unused_variable(file_path, line, var_name):
                            print(f"✅ Fixed unused variable '{var_name}' in {file_path.name}:{line}")
                            fixes_applied += 1
    
    print(f"\n🎉 Applied {fixes_applied} fixes!")

if __name__ == '__main__':
    main()
