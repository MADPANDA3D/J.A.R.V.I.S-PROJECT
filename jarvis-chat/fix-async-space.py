#!/usr/bin/env python3
"""
Fix async function spacing - add space between async and parentheses
"""

import os
import re
import sys

def fix_async_spacing(content):
    """Fix async function declarations to have proper spacing."""
    original_content = content
    
    # Pattern 1: Fix async( -> async (
    content = re.sub(
        r'(\basync)\(',
        r'\1 (',
        content
    )
    
    return content, content != original_content

def process_file(filepath):
    """Process a single file to fix async spacing."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        fixed_content, changed = fix_async_spacing(content)
        
        if changed:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {str(e)}")
        return False

def main():
    # Define the root directory
    root_dir = '/mnt/c/Users/MADPANDA3D/Desktop/THE_LAB/TOOLS/BMAD_APP_1/jarvis-chat'
    
    if not os.path.exists(root_dir):
        print(f"Error: Root directory {root_dir} does not exist")
        sys.exit(1)
    
    # Find all TypeScript and JavaScript files
    files_to_process = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Skip node_modules and other build directories
        if 'node_modules' in dirpath or '.git' in dirpath or 'dist' in dirpath or 'build' in dirpath:
            continue
        
        for filename in filenames:
            if filename.endswith(('.ts', '.tsx', '.js', '.jsx')):
                files_to_process.append(os.path.join(dirpath, filename))
    
    print(f"Found {len(files_to_process)} TypeScript/JavaScript files to check")
    
    # Process each file
    fixed_count = 0
    for filepath in files_to_process:
        if process_file(filepath):
            fixed_count += 1
            print(f"Fixed: {os.path.relpath(filepath, root_dir)}")
    
    print(f"\nTotal files fixed: {fixed_count}")

if __name__ == '__main__':
    main()