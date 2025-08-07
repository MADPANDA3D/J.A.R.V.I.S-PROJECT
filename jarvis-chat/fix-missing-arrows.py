#!/usr/bin/env python3
"""
Fix missing arrow syntax for callback functions
"""

import os
import re
import sys

def fix_missing_arrows(content):
    """Fix callback functions that are missing arrow syntax."""
    original_content = content
    
    # Pattern 1: forEach callback without arrow
    # Match: .forEach(item {
    content = re.sub(
        r'\.forEach\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*{',
        r'.forEach(\1 => {',
        content
    )
    
    # Pattern 2: map callback without arrow
    # Match: .map(item {
    content = re.sub(
        r'\.map\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*{',
        r'.map(\1 => {',
        content
    )
    
    # Pattern 3: filter callback without arrow
    content = re.sub(
        r'\.filter\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*{',
        r'.filter(\1 => {',
        content
    )
    
    # Pattern 4: reduce callback without arrow
    content = re.sub(
        r'\.reduce\s*\(\s*\(([^)]+)\)\s*{',
        r'.reduce((\1) => {',
        content
    )
    
    # Pattern 5: find/findIndex callback without arrow
    content = re.sub(
        r'\.(find|findIndex)\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*{',
        r'.\1(\2 => {',
        content
    )
    
    # Pattern 6: some/every callback without arrow
    content = re.sub(
        r'\.(some|every)\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*{',
        r'.\1(\2 => {',
        content
    )
    
    # Pattern 7: Promise.all/map with async callback
    content = re.sub(
        r'\.map\s*\(\s*async\s+\(([^)]+)\)\s*{',
        r'.map(async (\1) => {',
        content
    )
    
    # Pattern 8: addEventListener callback
    content = re.sub(
        r'addEventListener\s*\(\s*[\'"](\w+)[\'"],\s*(\w+)\s*{',
        r'addEventListener(\'\1\', \2 => {',
        content
    )
    
    # Pattern 9: setInterval/setTimeout callback
    content = re.sub(
        r'(setInterval|setTimeout)\s*\(\s*\(\)\s*{',
        r'\1(() => {',
        content
    )
    
    # Pattern 10: useEffect/useCallback with missing arrow
    content = re.sub(
        r'(useEffect|useCallback|useMemo)\s*\(\s*\(\)\s*{',
        r'\1(() => {',
        content
    )
    
    # Pattern 11: then/catch callbacks
    content = re.sub(
        r'\.(then|catch)\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*{',
        r'.\1(\2 => {',
        content
    )
    
    # Pattern 12: sort callback
    content = re.sub(
        r'\.sort\s*\(\s*\(([^)]+)\)\s*{',
        r'.sort((\1) => {',
        content
    )
    
    # Pattern 13: Replace callback in string methods
    content = re.sub(
        r'\.replace\s*\([^,]+,\s*\(([^)]+)\)\s*{',
        r'.replace($1, (\1) => {',
        content
    )
    
    # Pattern 14: Array.from second parameter
    content = re.sub(
        r'Array\.from\s*\([^,]+,\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*{',
        r'Array.from($1, \1 => {',
        content
    )
    
    # Pattern 15: Promise constructor
    content = re.sub(
        r'new\s+Promise\s*\(\s*\(([^)]+)\)\s*{',
        r'new Promise((\1) => {',
        content
    )
    
    # Pattern 16: General callback pattern with parameter
    # Match: callbackFunc(param {
    content = re.sub(
        r'(\w+)\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*{\s*$',
        r'\1(\2 => {',
        content,
        flags=re.MULTILINE
    )
    
    # Pattern 17: Callback with multiple parameters
    # Match: callbackFunc((a, b) {
    content = re.sub(
        r'(\w+)\s*\(\s*\(([^)]+)\)\s*{\s*$',
        r'\1((\2) => {',
        content,
        flags=re.MULTILINE
    )
    
    # Pattern 18: setState callbacks
    content = re.sub(
        r'(setState|setMessages|setSelectedTools|setExpandedSessions|setPreferences)\s*\(\s*(\w+)\s*{',
        r'\1(\2 => {',
        content
    )
    
    # Pattern 19: Mock function callbacks
    content = re.sub(
        r'mockImplementation\s*\(\s*\(\)\s*{',
        r'mockImplementation(() => {',
        content
    )
    
    # Pattern 20: subscribeToMessages and similar
    content = re.sub(
        r'(subscribeToMessages|subscribe|unsubscribe)\s*\([^,]+,\s*(\w+)\s*{',
        r'\1($1, \2 => {',
        content
    )
    
    return content, content != original_content

def process_file(filepath):
    """Process a single file to fix missing arrows."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        fixed_content, changed = fix_missing_arrows(content)
        
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