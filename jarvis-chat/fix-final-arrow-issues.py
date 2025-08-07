#!/usr/bin/env python3
"""
Fix the final remaining arrow syntax issues.
"""

import re
import os

def fix_specific_issues(content, filepath):
    """Fix specific remaining arrow syntax issues."""
    
    # Fix addEventListener patterns
    # Pattern: addEventListener('event', (param: Type) {
    pattern1 = r'(addEventListener\s*\(\s*[\'"][^\'\"]+[\'"]\s*,\s*\([^)]*\))\s*{'
    content = re.sub(pattern1, r'\1 => {', content)
    
    # Fix global property assignments with functions
    # Pattern: (global as any).prop = (params) {
    pattern2 = r'(\(global\s+as\s+any\)\.\w+\s*=\s*\([^)]*\))\s*{'
    content = re.sub(pattern2, r'\1 => {', content)
    
    # Fix async function with return type but no arrow
    # Pattern: async (params): Promise<Type> {
    pattern3 = r'(async\s*\([^)]*\)\s*:\s*Promise<[^>]+>)\s*{'
    content = re.sub(pattern3, r'\1 => {', content)
    
    # Fix Vite config entryFileNames pattern
    # Pattern: entryFileNames: chunkInfo {
    if 'vite.config' in filepath:
        content = re.sub(r'entryFileNames:\s*chunkInfo\s*{', 'entryFileNames: (chunkInfo) => {', content)
    
    # Fix any remaining patterns where we have a function-like structure without arrow
    # Pattern: word(params) {  (but not function declarations)
    pattern4 = r'(?<!function\s)(?<!async\s)(?<!if\s)(?<!for\s)(?<!while\s)(?<!switch\s)(?<!catch\s)(\b\w+\s*\([^)]*\))\s*{'
    
    # Check if this looks like it should be an arrow function (assigned to something)
    lines = content.split('\n')
    for i, line in enumerate(lines):
        # Check if line contains pattern and previous line suggests assignment
        if re.search(pattern4, line):
            # Look at context to determine if this should be arrow function
            if i > 0:
                prev_line = lines[i-1].strip()
                # If previous line ends with = or : then this is likely an assignment
                if prev_line.endswith('=') or prev_line.endswith(':'):
                    lines[i] = re.sub(pattern4, r'\1 => {', line)
    
    content = '\n'.join(lines)
    
    return content

def process_file(filepath):
    """Process a single file to fix arrow syntax."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        fixed_content = fix_specific_issues(content, filepath)
        
        if fixed_content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    # Specific files to fix based on the errors
    files_to_fix = [
        'src/sw.ts',
        'src/test/setup.ts',
        'src/test/testUtils.ts',
        'vite.config.ts'
    ]
    
    print(f"Fixing {len(files_to_fix)} specific files with arrow syntax issues...")
    
    fixed_files = []
    for filepath in files_to_fix:
        if os.path.exists(filepath):
            if process_file(filepath):
                fixed_files.append(filepath)
        else:
            print(f"File not found: {filepath}")
    
    if fixed_files:
        print(f"\nFixed {len(fixed_files)} files:")
        for f in sorted(fixed_files):
            print(f"  - {f}")
    else:
        print("\nNo files were fixed.")
    
    return len(fixed_files)

if __name__ == '__main__':
    main()