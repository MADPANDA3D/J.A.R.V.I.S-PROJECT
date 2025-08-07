#!/usr/bin/env python3
import os
import re

def fix_async_arrow_functions(file_path):
    """Fix async arrow functions that are missing arrows"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix async arrow functions without arrow
        # Pattern: async () { should be async () => {
        content = re.sub(r'(\basync\s*\([^)]*\))\s*\{', r'\1 => {', content)
        
        # Fix async arrow functions with parameters
        # Pattern: async (param) { should be async (param) => {
        content = re.sub(r'(\basync\s+\w+)\s*\{', r'\1 => {', content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

# Process all TypeScript and JavaScript files
fixed_count = 0
for root, dirs, files in os.walk('src'):
    if 'node_modules' in root or '.git' in root:
        continue
        
    for file in files:
        if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
            file_path = os.path.join(root, file)
            if fix_async_arrow_functions(file_path):
                print(f"Fixed: {file_path}")
                fixed_count += 1

print(f"\nTotal files fixed: {fixed_count}")