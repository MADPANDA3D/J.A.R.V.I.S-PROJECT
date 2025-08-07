#!/usr/bin/env python3
"""
Final comprehensive fix for all arrow syntax errors.
"""

import os
import re
import sys

def fix_all_arrow_errors(content):
    """Fix all remaining arrow syntax errors."""
    original_content = content
    
    # Pattern 1: Fix if statements with parentheses followed by => {
    # Match: if (...) => {
    content = re.sub(
        r'(\bif\s*\([^)]+\))\s*=>\s*{',
        r'\1 {',
        content
    )
    
    # Pattern 2: Fix else statements
    content = re.sub(
        r'}\s*else\s*=>\s*{',
        r'} else {',
        content
    )
    
    # Pattern 3: Fix for loops
    content = re.sub(
        r'(\bfor\s*\([^)]+\))\s*=>\s*{',
        r'\1 {',
        content
    )
    
    # Pattern 4: Fix while loops
    content = re.sub(
        r'(\bwhile\s*\([^)]+\))\s*=>\s*{',
        r'\1 {',
        content
    )
    
    # Pattern 5: Fix do-while
    content = re.sub(
        r'(\bdo)\s*=>\s*{',
        r'\1 {',
        content
    )
    
    # Pattern 6: Fix try blocks
    content = re.sub(
        r'(\btry)\s*=>\s*{',
        r'\1 {',
        content
    )
    
    # Pattern 7: Fix catch blocks
    content = re.sub(
        r'}\s*catch\s*\(([^)]+)\)\s*=>\s*{',
        r'} catch (\1) {',
        content
    )
    
    # Pattern 8: Fix finally blocks
    content = re.sub(
        r'}\s*finally\s*=>\s*{',
        r'} finally {',
        content
    )
    
    # Pattern 9: Fix switch statements
    content = re.sub(
        r'(\bswitch\s*\([^)]+\))\s*=>\s*{',
        r'\1 {',
        content
    )
    
    # Pattern 10: Fix case statements (shouldn't have => but just in case)
    content = re.sub(
        r'(\bcase\s+[^:]+:)\s*=>\s*{',
        r'\1 {',
        content
    )
    
    # Pattern 11: Fix default statements
    content = re.sub(
        r'(\bdefault:)\s*=>\s*{',
        r'\1 {',
        content
    )
    
    # Pattern 12: Fix async before parentheses (add space)
    content = re.sub(
        r'(\basync)\(',
        r'\1 (',
        content
    )
    
    # Pattern 13: Fix function declarations with arrow syntax
    # Match: function name() => {
    content = re.sub(
        r'(\bfunction\s+\w+\s*\([^)]*\))\s*=>\s*{',
        r'\1 {',
        content
    )
    
    # Pattern 14: Fix method declarations in classes/interfaces
    # Match: methodName() => {
    content = re.sub(
        r'^(\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*=>\s*{',
        r'\1\2(\3) {',
        content,
        flags=re.MULTILINE
    )
    
    # Pattern 15: Fix methods with return types
    # Match: methodName(): Type => {
    content = re.sub(
        r'^(\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*:\s*([^{=]+?)\s*=>\s*{',
        r'\1\2(\3): \4 {',
        content,
        flags=re.MULTILINE
    )
    
    # Pattern 16: Fix async methods
    # Match: async methodName() => {
    content = re.sub(
        r'^(\s*)async\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*=>\s*{',
        r'\1async \2(\3) {',
        content,
        flags=re.MULTILINE
    )
    
    # Pattern 17: Fix async methods with return types
    # Match: async methodName(): Type => {
    content = re.sub(
        r'^(\s*)async\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*:\s*([^{=]+?)\s*=>\s*{',
        r'\1async \2(\3): \4 {',
        content,
        flags=re.MULTILINE
    )
    
    # Pattern 18: Fix static methods
    content = re.sub(
        r'(\bstatic\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*\([^)]*\)(?:\s*:\s*[^{=]+?)?)\s*=>\s*{',
        r'\1 {',
        content
    )
    
    # Pattern 19: Fix private/public/protected methods
    content = re.sub(
        r'(\b(?:private|public|protected)\s+(?:async\s+)?[a-zA-Z_$][a-zA-Z0-9_$]*\s*\([^)]*\)(?:\s*:\s*[^{=]+?)?)\s*=>\s*{',
        r'\1 {',
        content
    )
    
    # Pattern 20: Fix constructor
    content = re.sub(
        r'(\bconstructor\s*\([^)]*\))\s*=>\s*{',
        r'\1 {',
        content
    )
    
    # Pattern 21: Fix getter/setter
    content = re.sub(
        r'(\b(?:get|set)\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*\([^)]*\))\s*=>\s*{',
        r'\1 {',
        content
    )
    
    # Pattern 22: Fix describe/it/test blocks (for test files)
    content = re.sub(
        r'(\b(?:describe|it|test|beforeEach|afterEach|beforeAll|afterAll)\s*\([^)]+\))\s*=>\s*{',
        r'\1 {',
        content
    )
    
    # Pattern 23: Fix comparison expressions with arrow (special case)
    # Match: ) < new Date()) => {
    content = re.sub(
        r'(\)\s*[<>]=?\s*[^)]+\))\s*=>\s*{',
        r'\1 {',
        content
    )
    
    # Pattern 24: More general fix for any statement ending with ) => {
    # This is a catch-all for missed patterns
    content = re.sub(
        r'([^=\s])\s*=>\s*{\s*$',
        r'\1 {',
        content,
        flags=re.MULTILINE
    )
    
    return content, content != original_content

def process_file(filepath):
    """Process a single file to fix arrow syntax errors."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        fixed_content, changed = fix_all_arrow_errors(content)
        
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