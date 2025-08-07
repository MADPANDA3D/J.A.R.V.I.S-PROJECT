#!/usr/bin/env python3
"""
Fix async class methods that incorrectly have arrow syntax.
Targets patterns like:
  async methodName(): Promise<Type> => {
Which should be:
  async methodName(): Promise<Type> {
"""

import os
import re
import sys

def fix_async_class_methods(content):
    """Fix async class methods with incorrect arrow syntax."""
    lines = content.split('\n')
    fixed_lines = []
    modified = False
    
    for i, line in enumerate(lines):
        # Pattern 1: async method with return type and arrow
        # async methodName(...): Promise<Type> => {
        match = re.search(r'^(\s*)(async\s+\w+\s*\([^)]*\)\s*:\s*Promise<[^>]+>\s*)=>\s*{', line)
        if match:
            indent = match.group(1)
            method_signature = match.group(2)
            fixed_line = f"{indent}{method_signature}{{"
            fixed_lines.append(fixed_line)
            modified = True
            print(f"Fixed async method: {line.strip()} -> {fixed_line.strip()}")
            continue
        
        # Pattern 2: private/public async method with return type and arrow
        # private async methodName(...): Promise<Type> => {
        match = re.search(r'^(\s*)((?:private|public|protected)\s+async\s+\w+\s*\([^)]*\)\s*:\s*Promise<[^>]+>\s*)=>\s*{', line)
        if match:
            indent = match.group(1)
            method_signature = match.group(2)
            fixed_line = f"{indent}{method_signature}{{"
            fixed_lines.append(fixed_line)
            modified = True
            print(f"Fixed private/public async method: {line.strip()} -> {fixed_line.strip()}")
            continue
        
        # Pattern 3: async method with complex return type
        # async methodName(): Promise<{ field: Type }> => {
        match = re.search(r'^(\s*)((?:private|public|protected)?\s*async\s+\w+\s*\([^)]*\)\s*:\s*Promise<[^{]+>\s*)=>\s*{', line)
        if match:
            indent = match.group(1)
            method_signature = match.group(2)
            fixed_line = f"{indent}{method_signature}{{"
            fixed_lines.append(fixed_line)
            modified = True
            print(f"Fixed async method with complex type: {line.strip()} -> {fixed_line.strip()}")
            continue
            
        fixed_lines.append(line)
    
    return '\n'.join(fixed_lines), modified

def process_file(filepath):
    """Process a single file to fix async class methods."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        fixed_content, modified = fix_async_class_methods(content)
        
        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    # Target directories
    directories = ['src', 'scripts']
    
    fixed_count = 0
    
    for directory in directories:
        if not os.path.exists(directory):
            continue
            
        for root, dirs, files in os.walk(directory):
            # Skip node_modules and other non-source directories
            dirs[:] = [d for d in dirs if d not in ['node_modules', 'dist', 'build', '.git']]
            
            for file in files:
                if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                    filepath = os.path.join(root, file)
                    if process_file(filepath):
                        fixed_count += 1
                        print(f"Fixed: {filepath}")
    
    print(f"\nTotal files fixed: {fixed_count}")

if __name__ == '__main__':
    main()