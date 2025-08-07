#!/usr/bin/env python3
"""
Fix class method syntax errors introduced by overzealous arrow function fixes.
These errors occur when => was incorrectly added to class methods.
"""

import os
import re
import sys

def fix_class_methods(content):
    """Fix class methods that were incorrectly given arrow syntax"""
    
    # Pattern 1: Fix private/public/protected methods with return types
    # Before: private methodName(): void => {
    # After: private methodName(): void {
    content = re.sub(
        r'(\s+)(private|public|protected)\s+(\w+)\s*\(([^)]*)\)\s*:\s*([^=>\n]+?)\s*=>\s*{',
        r'\1\2 \3(\4): \5 {',
        content
    )
    
    # Pattern 2: Fix static methods
    # Before: static getInstance(): Instance => {
    # After: static getInstance(): Instance {
    content = re.sub(
        r'(\s+)(static)\s+(\w+)\s*\(([^)]*)\)\s*:\s*([^=>\n]+?)\s*=>\s*{',
        r'\1\2 \3(\4): \5 {',
        content
    )
    
    # Pattern 3: Fix async methods with modifiers
    # Before: private async methodName(): Promise<void> => {
    # After: private async methodName(): Promise<void> {
    content = re.sub(
        r'(\s+)(private|public|protected)\s+(async)\s+(\w+)\s*\(([^)]*)\)\s*:\s*([^=>\n]+?)\s*=>\s*{',
        r'\1\2 \3 \4(\5): \6 {',
        content
    )
    
    # Pattern 4: Fix getter/setter methods
    # Before: get value(): Type => {
    # After: get value(): Type {
    content = re.sub(
        r'(\s+)(get|set)\s+(\w+)\s*\(([^)]*)\)\s*:\s*([^=>\n]+?)\s*=>\s*{',
        r'\1\2 \3(\4): \5 {',
        content
    )
    
    # Pattern 5: Fix constructor (shouldn't have => but just in case)
    # Before: constructor() => {
    # After: constructor() {
    content = re.sub(
        r'(\s+)(constructor)\s*\(([^)]*)\)\s*=>\s*{',
        r'\1\2(\3) {',
        content
    )
    
    # Pattern 6: Fix methods without modifiers (need to be careful)
    # This targets methods inside classes only
    lines = content.split('\n')
    fixed_lines = []
    in_class = False
    class_depth = 0
    brace_count = 0
    
    for i, line in enumerate(lines):
        # Track if we're inside a class
        if 'class ' in line and '{' in line:
            in_class = True
            class_depth = brace_count + line.count('{')
        
        # Count braces to track depth
        brace_count += line.count('{') - line.count('}')
        
        # Exit class when we close its brace
        if in_class and brace_count < class_depth:
            in_class = False
        
        # Fix method declarations inside classes
        if in_class and ' => {' in line:
            # Check if it looks like a method declaration
            match = re.match(r'^(\s+)(\w+)\s*\(([^)]*)\)\s*:\s*([^=>\n]+?)\s*=>\s*{', line)
            if match:
                line = re.sub(
                    r'^(\s+)(\w+)\s*\(([^)]*)\)\s*:\s*([^=>\n]+?)\s*=>\s*{',
                    r'\1\2(\3): \4 {',
                    line
                )
        
        fixed_lines.append(line)
    
    return '\n'.join(fixed_lines)

def process_file(filepath):
    """Process a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        content = fix_class_methods(content)
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    """Process all TypeScript files"""
    
    # Get all TypeScript files
    all_files = []
    for root, dirs, files in os.walk('src'):
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                all_files.append(os.path.join(root, file))
    
    fixed_count = 0
    for file in all_files:
        if process_file(file):
            fixed_count += 1
            print(f"✓ Fixed {file}")
    
    print(f"\nFixed {fixed_count} files")
    return fixed_count > 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)