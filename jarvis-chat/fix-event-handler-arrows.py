#!/usr/bin/env python3
"""
Fix remaining arrow function syntax errors - event handlers and edge cases.
"""

import os
import re
import sys

def fix_event_handlers(content):
    """Fix event handler assignments that need arrow functions"""
    
    # Pattern 1: Event handlers like ws.onopen = () {
    # Before: websocket.onopen = () {
    # After: websocket.onopen = () => {
    content = re.sub(
        r'(\.\s*on[a-zA-Z]+\s*=\s*\([^)]*\))\s*{',
        r'\1 => {',
        content
    )
    
    # Pattern 2: WebSocket event handlers
    # Before: .on('connection', (ws, request) {
    # After: .on('connection', (ws, request) => {
    content = re.sub(
        r'\.on\s*\(\s*["\']([^"\']+)["\']\s*,\s*\(([^)]*)\)\s*{',
        r'.on("\1", (\2) => {',
        content
    )
    
    # Pattern 3: setTimeout/setInterval handlers with parameters
    # Before: setTimeout((param) {
    # After: setTimeout((param) => {
    content = re.sub(
        r'(setTimeout|setInterval)\s*\(\s*\(([^)]*)\)\s*{',
        r'\1((\2) => {',
        content
    )
    
    # Pattern 4: Async event handlers
    # Before: .on('event', async (param) {
    # After: .on('event', async (param) => {
    content = re.sub(
        r'\.on\s*\(\s*["\']([^"\']+)["\']\s*,\s*async\s*\(([^)]*)\)\s*{',
        r'.on("\1", async (\2) => {',
        content
    )
    
    # Pattern 5: Object method event handlers
    # Before: handler: (event) {
    # After: handler: (event) => {
    content = re.sub(
        r'(\w+)\s*:\s*\(([^)]*)\)\s*{',
        r'\1: (\2) => {',
        content
    )
    
    # Pattern 6: Inline callbacks in JSX
    # Before: onClick={() {
    # After: onClick={() => {
    content = re.sub(
        r'(on[A-Z]\w*)\s*=\s*{\s*\(\s*\)\s*{',
        r'\1={() => {',
        content
    )
    
    # Pattern 7: Inline callbacks with parameters in JSX
    # Before: onChange={(e) {
    # After: onChange={(e) => {
    content = re.sub(
        r'(on[A-Z]\w*)\s*=\s*{\s*\(([^)]*)\)\s*{',
        r'\1={(\2) => {',
        content
    )
    
    return content

def fix_complex_patterns(content):
    """Fix more complex arrow function patterns"""
    
    # Pattern 1: Multi-line function parameters ending with arrow missing
    lines = content.split('\n')
    fixed_lines = []
    
    for i in range(len(lines)):
        line = lines[i]
        
        # Check for patterns that commonly miss arrows
        if i < len(lines) - 1:
            current_line = line.strip()
            next_line = lines[i + 1].strip() if i + 1 < len(lines) else ''
            
            # Pattern: Line ends with ) and next line is just {
            if (current_line.endswith(')') and 
                not current_line.endswith('=>') and 
                not current_line.endswith(') =>') and
                next_line == '{'):
                
                # Check if this looks like a function that needs arrow
                if any(pattern in lines[max(0, i-2):i+1][0] for pattern in 
                      ['.on(', 'setTimeout', 'setInterval', '=', ':', 
                       'onClick', 'onChange', 'onSubmit', '.then', '.catch',
                       '.map', '.filter', '.forEach']):
                    line = line.rstrip() + ' =>'
        
        fixed_lines.append(line)
    
    content = '\n'.join(fixed_lines)
    
    # Pattern 2: Fix specific test patterns
    # Before: waitFor(() {
    # After: waitFor(() => {
    content = re.sub(
        r'(waitFor|waitForElementToBeRemoved|act)\s*\(\s*\(\s*\)\s*{',
        r'\1(() => {',
        content
    )
    
    # Pattern 3: Fix async test patterns
    # Before: waitFor(async () {
    # After: waitFor(async () => {
    content = re.sub(
        r'(waitFor|waitForElementToBeRemoved|act)\s*\(\s*async\s*\(\s*\)\s*{',
        r'\1(async () => {',
        content
    )
    
    # Pattern 4: Fix inline object methods that look like shortcuts
    # Before: method() {
    # After: method: () => {
    # This is tricky, skip for safety
    
    # Pattern 5: Fix class property arrow functions
    # Before: property = () {
    # After: property = () => {
    # This should already be correct
    
    # Pattern 6: Fix multiline parameters with types
    # This requires more sophisticated parsing
    
    return content

def fix_typescript_specific(content):
    """Fix TypeScript-specific arrow function patterns"""
    
    # Pattern 1: Functions with return type annotations
    # Before: ): ReturnType {
    # After: ): ReturnType => {
    content = re.sub(
        r'\)\s*:\s*([A-Za-z<>\[\]|&\s]+)\s*{',
        r'): \1 => {',
        content
    )
    
    # Pattern 2: Generic functions
    # Before: <T>(param: T) {
    # After: <T>(param: T) => {
    content = re.sub(
        r'(<[^>]+>)\s*\(([^)]*)\)\s*{',
        r'\1(\2) => {',
        content
    )
    
    # Pattern 3: Type predicates
    # Before: (value): value is Type {
    # After: (value): value is Type => {
    content = re.sub(
        r'\(([^)]+)\)\s*:\s*\1\s+is\s+([A-Za-z]+)\s*{',
        r'(\1): \1 is \2 => {',
        content
    )
    
    return content

def process_file(filepath):
    """Process a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        content = fix_event_handlers(content)
        content = fix_complex_patterns(content)
        content = fix_typescript_specific(content)
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    """Process all files with remaining errors"""
    
    # Get all TypeScript and JavaScript files
    all_files = []
    for root, dirs, files in os.walk('src'):
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                all_files.append(os.path.join(root, file))
    
    # Also check scripts directory
    if os.path.exists('scripts'):
        for root, dirs, files in os.walk('scripts'):
            for file in files:
                if file.endswith(('.js', '.cjs', '.mjs')):
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