#!/usr/bin/env python3
import os
import re

def fix_callback_arrows(file_path):
    """Fix callback functions that should have arrow syntax"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix common callback patterns that should have arrows
        # Pattern: functionName(() { should be functionName(() => {
        content = re.sub(r'(\w+\s*\(\s*\(\s*[^)]*\s*\))\s*\{', r'\1 => {', content)
        
        # Fix specific patterns like describe('...', () { should be describe('...', () => {
        content = re.sub(r'(\w+\s*\([^,]+,\s*\(\s*[^)]*\s*\))\s*\{', r'\1 => {', content)
        
        # Fix arrow functions with parameters like .map((item) { should be .map((item) => {
        content = re.sub(r'(\.(?:map|filter|forEach|reduce|find|some|every)\s*\(\s*\([^)]+\))\s*\{', r'\1 => {', content)
        
        # Fix test patterns
        content = re.sub(r'((?:it|test|describe|beforeEach|afterEach|beforeAll|afterAll)\s*\([^,]+,\s*\(\s*[^)]*\s*\))\s*\{', r'\1 => {', content)
        
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
            if fix_callback_arrows(file_path):
                print(f"Fixed: {file_path}")
                fixed_count += 1

print(f"\nTotal files fixed: {fixed_count}")