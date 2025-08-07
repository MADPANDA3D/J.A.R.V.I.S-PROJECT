#!/usr/bin/env python3
"""
Fix unused _error variable warnings.
Replace _error with _ (underscore) which is the convention for unused variables in TypeScript.
"""

import re
import os
import sys

def fix_unused_error_vars(content):
    """Replace _error with _ for unused catch variables."""
    
    # Pattern to match catch blocks with _error
    # Matches: } catch (_error) {
    pattern1 = r'(\bcatch\s*\(\s*)_error(\s*\)\s*{)'
    content = re.sub(pattern1, r'\1_\2', content)
    
    # Pattern to match catch blocks with typed _error
    # Matches: } catch (_error: any) {  or } catch (_error: Error) {
    pattern2 = r'(\bcatch\s*\(\s*)_error(\s*:\s*\w+\s*\)\s*{)'
    content = re.sub(pattern2, r'\1_\2', content)
    
    return content

def process_file(filepath):
    """Process a single file to fix unused error variables."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        fixed_content = fix_unused_error_vars(content)
        
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
    
    # Check src directory
    if os.path.exists('src'):
        for root, dirs, files in os.walk('src'):
            dirs[:] = [d for d in dirs if d not in ['node_modules', 'dist', 'build', '.next']]
            for file in files:
                if file.endswith(extensions):
                    files_to_check.append(os.path.join(root, file))
    
    # Check scripts directory
    if os.path.exists('scripts'):
        for root, dirs, files in os.walk('scripts'):
            dirs[:] = [d for d in dirs if d not in ['node_modules', 'dist', 'build']]
            for file in files:
                if file.endswith(extensions):
                    files_to_check.append(os.path.join(root, file))
    
    print(f"Checking {len(files_to_check)} files for unused _error variables...")
    
    fixed_files = []
    for filepath in files_to_check:
        if process_file(filepath):
            fixed_files.append(filepath)
    
    if fixed_files:
        print(f"\nFixed {len(fixed_files)} files:")
        for f in sorted(fixed_files):
            print(f"  - {f}")
    else:
        print("\nNo files needed fixing for unused _error variables.")
    
    return len(fixed_files)

if __name__ == '__main__':
    fixed_count = main()
    sys.exit(0 if fixed_count >= 0 else 1)