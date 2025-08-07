#!/usr/bin/env python3
"""
Fix remaining arrow function syntax errors in TypeScript/JavaScript files.
Targets specific patterns that were missed by previous scripts.
"""

import os
import re
import sys

def fix_arrow_syntax_errors(content):
    """Fix various arrow syntax errors in the content."""
    original_content = content
    
    # Pattern 1: Fix if statements with arrow syntax
    # Match: if (condition) => {
    content = re.sub(
        r'(\s*if\s*\([^)]+\))\s*=>\s*{',
        r'\1 {',
        content
    )
    
    # Pattern 2: Fix else statements with arrow syntax
    # Match: } else => {
    content = re.sub(
        r'}\s*else\s*=>\s*{',
        r'} else {',
        content
    )
    
    # Pattern 3: Fix for loops with arrow syntax
    # Match: for (...) => {
    content = re.sub(
        r'(\s*for\s*\([^)]+\))\s*=>\s*{',
        r'\1 {',
        content
    )
    
    # Pattern 4: Fix while loops with arrow syntax
    # Match: while (...) => {
    content = re.sub(
        r'(\s*while\s*\([^)]+\))\s*=>\s*{',
        r'\1 {',
        content
    )
    
    # Pattern 5: Fix catch blocks with arrow syntax
    # Match: } catch (error) => {
    content = re.sub(
        r'}\s*catch\s*\(([^)]+)\)\s*=>\s*{',
        r'} catch (\1) {',
        content
    )
    
    # Pattern 6: Fix finally blocks with arrow syntax
    # Match: } finally => {
    content = re.sub(
        r'}\s*finally\s*=>\s*{',
        r'} finally {',
        content
    )
    
    # Pattern 7: Fix do-while loops with arrow syntax
    # Match: do => {
    content = re.sub(
        r'(\s*do)\s*=>\s*{',
        r'\1 {',
        content
    )
    
    # Pattern 8: Fix try blocks with arrow syntax
    # Match: try => {
    content = re.sub(
        r'(\s*try)\s*=>\s*{',
        r'\1 {',
        content
    )
    
    # Pattern 9: Fix constructor with arrow syntax
    # Match: constructor(...) => {
    content = re.sub(
        r'(\s*constructor\s*\([^)]*\))\s*=>\s*{',
        r'\1 {',
        content
    )
    
    # Pattern 10: Fix getter/setter with arrow syntax
    # Match: get propertyName() => {
    content = re.sub(
        r'(\s*(?:get|set)\s+\w+\s*\([^)]*\))\s*=>\s*{',
        r'\1 {',
        content
    )
    
    # Pattern 11: Fix class method declarations with arrow syntax
    # Match: methodName(...) => {
    # But NOT arrow functions like: const fn = () => {
    content = re.sub(
        r'^(\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*:\s*([^{]+?)\s*=>\s*{',
        r'\1\2(\3): \4 {',
        content,
        flags=re.MULTILINE
    )
    
    # Pattern 12: Fix methods without return type
    # Match: methodName(...) => {
    content = re.sub(
        r'^(\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*=>\s*{',
        r'\1\2(\3) {',
        content,
        flags=re.MULTILINE
    )
    
    # Pattern 13: Fix static methods with arrow syntax
    # Match: static methodName(...) => {
    content = re.sub(
        r'(\s*static\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*\([^)]*\)(?:\s*:\s*[^{]+?)?)\s*=>\s*{',
        r'\1 {',
        content
    )
    
    # Pattern 14: Fix async methods with arrow syntax
    # Match: async methodName(...) => {
    content = re.sub(
        r'^(\s*)async\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)(?:\s*:\s*([^{]+?))?\s*=>\s*{',
        r'\1async \2(\3)\4 {',
        content,
        flags=re.MULTILINE
    )
    
    # Pattern 15: Fix private/public/protected methods
    # Match: private methodName(...) => {
    content = re.sub(
        r'(\s*(?:private|public|protected)\s+(?:async\s+)?[a-zA-Z_$][a-zA-Z0-9_$]*\s*\([^)]*\)(?:\s*:\s*[^{]+?)?)\s*=>\s*{',
        r'\1 {',
        content
    )
    
    # Pattern 16: Fix abstract methods (shouldn't have body but just in case)
    # Match: abstract methodName(...) => {
    content = re.sub(
        r'(\s*abstract\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*\([^)]*\)(?:\s*:\s*[^{]+?)?)\s*=>\s*{',
        r'\1 {',
        content
    )
    
    # Pattern 17: Fix override methods
    # Match: override methodName(...) => {
    content = re.sub(
        r'(\s*override\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*\([^)]*\)(?:\s*:\s*[^{]+?)?)\s*=>\s*{',
        r'\1 {',
        content
    )
    
    return content, content != original_content

def process_file(filepath):
    """Process a single file to fix arrow syntax errors."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        fixed_content, changed = fix_arrow_syntax_errors(content)
        
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