#!/usr/bin/env python3
"""
Fix missing arrow syntax in const/let/var function assignments.
This handles patterns like:
  const myFunc = (params) {
Which should be:
  const myFunc = (params) => {
"""

import re
import os
import sys

def fix_const_arrow_syntax(content):
    """Fix missing arrow syntax in const/let/var function assignments."""
    
    # Pattern to match const/let/var function assignments without arrow
    # Matches: const/let/var name = (params) { 
    # Also handles multi-line parameter lists
    pattern = r'(\b(?:const|let|var)\s+\w+\s*=\s*\([^)]*\))\s*{'
    
    def replace_with_arrow(match):
        # Add arrow before the opening brace
        return match.group(1) + ' => {'
    
    # Apply the fix
    fixed_content = re.sub(pattern, replace_with_arrow, content)
    
    # Also fix patterns where there's a type annotation after the params
    # Matches: const name = (params): Type {
    pattern_with_type = r'(\b(?:const|let|var)\s+\w+\s*=\s*\([^)]*\)\s*:\s*[^{]+)\s*{'
    
    def replace_with_arrow_type(match):
        # Add arrow before the opening brace
        return match.group(1) + ' => {'
    
    fixed_content = re.sub(pattern_with_type, replace_with_arrow_type, fixed_content)
    
    # Also fix async patterns
    # Matches: const name = async (params) {
    pattern_async = r'(\b(?:const|let|var)\s+\w+\s*=\s*async\s*\([^)]*\))\s*{'
    
    def replace_async_with_arrow(match):
        return match.group(1) + ' => {'
    
    fixed_content = re.sub(pattern_async, replace_async_with_arrow, fixed_content)
    
    # Fix async patterns with type annotations
    # Matches: const name = async (params): Type {
    pattern_async_type = r'(\b(?:const|let|var)\s+\w+\s*=\s*async\s*\([^)]*\)\s*:\s*[^{]+)\s*{'
    
    def replace_async_type_with_arrow(match):
        return match.group(1) + ' => {'
    
    fixed_content = re.sub(pattern_async_type, replace_async_type_with_arrow, fixed_content)
    
    return fixed_content

def process_file(filepath):
    """Process a single file to fix arrow syntax."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        fixed_content = fix_const_arrow_syntax(content)
        
        if fixed_content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    # Get all TypeScript and JavaScript files
    extensions = ('.ts', '.tsx', '.js', '.jsx')
    files_to_check = []
    
    for root, dirs, files in os.walk('src'):
        # Skip node_modules and other build directories
        dirs[:] = [d for d in dirs if d not in ['node_modules', 'dist', 'build', '.next']]
        
        for file in files:
            if file.endswith(extensions):
                files_to_check.append(os.path.join(root, file))
    
    # Also check scripts directory
    for root, dirs, files in os.walk('scripts'):
        dirs[:] = [d for d in dirs if d not in ['node_modules', 'dist', 'build']]
        for file in files:
            if file.endswith(extensions):
                files_to_check.append(os.path.join(root, file))
    
    print(f"Checking {len(files_to_check)} files for missing arrow syntax...")
    
    fixed_files = []
    for filepath in files_to_check:
        if process_file(filepath):
            fixed_files.append(filepath)
    
    if fixed_files:
        print(f"\nFixed {len(fixed_files)} files:")
        for f in sorted(fixed_files):
            print(f"  - {f}")
    else:
        print("\nNo files needed fixing for const/let/var arrow syntax.")
    
    return len(fixed_files)

if __name__ == '__main__':
    fixed_count = main()
    sys.exit(0 if fixed_count >= 0 else 1)