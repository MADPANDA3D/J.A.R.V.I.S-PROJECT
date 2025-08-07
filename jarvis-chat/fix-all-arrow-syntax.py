#!/usr/bin/env python3
"""
Fix all missing arrow syntax issues comprehensively.
Handles:
1. const/let/var function assignments
2. Test functions (describe, it, test, beforeEach, etc.)
3. Async variations
4. Type annotations
"""

import re
import os
import sys

def fix_arrow_syntax(content):
    """Fix all arrow syntax issues in the content."""
    
    # 1. Fix const/let/var function assignments without arrow
    # Matches: const/let/var name = (params) {
    pattern1 = r'(\b(?:const|let|var)\s+\w+\s*=\s*\([^)]*\))\s*{'
    content = re.sub(pattern1, r'\1 => {', content)
    
    # 2. Fix const/let/var with type annotations
    # Matches: const name = (params): Type {
    pattern2 = r'(\b(?:const|let|var)\s+\w+\s*=\s*\([^)]*\)\s*:\s*[^{]+)\s*{'
    content = re.sub(pattern2, r'\1 => {', content)
    
    # 3. Fix async const/let/var patterns
    # Matches: const name = async (params) {
    pattern3 = r'(\b(?:const|let|var)\s+\w+\s*=\s*async\s*\([^)]*\))\s*{'
    content = re.sub(pattern3, r'\1 => {', content)
    
    # 4. Fix async with type annotations
    # Matches: const name = async (params): Type {
    pattern4 = r'(\b(?:const|let|var)\s+\w+\s*=\s*async\s*\([^)]*\)\s*:\s*[^{]+)\s*{'
    content = re.sub(pattern4, r'\1 => {', content)
    
    # 5. Fix test framework functions (describe, it, test, etc.)
    # These should use arrow functions in their callbacks
    test_funcs = ['describe', 'it', 'test', 'beforeEach', 'afterEach', 'beforeAll', 'afterAll']
    for func in test_funcs:
        # Pattern: describe('name', () {
        pattern = rf'({func}\s*\([^,]+,\s*\(\s*\))\s*{{'
        content = re.sub(pattern, r'\1 => {', content)
        
        # Pattern with async: describe('name', async () {
        pattern_async = rf'({func}\s*\([^,]+,\s*async\s*\(\s*\))\s*{{'
        content = re.sub(pattern_async, r'\1 => {', content)
    
    # 6. Fix function expressions in object methods or callbacks
    # Matches patterns like: .then(function(x) {
    pattern5 = r'(\.\w+\s*\(\s*function\s*\([^)]*\))\s*{'
    content = re.sub(pattern5, lambda m: m.group(1).replace('function', '') + ' => {', content)
    
    # 7. Fix patterns like: setTimeout(() {
    pattern6 = r'(setTimeout\s*\(\s*\(\s*\))\s*{'
    content = re.sub(pattern6, r'\1 => {', content)
    
    # 8. Fix patterns in array methods
    array_methods = ['map', 'filter', 'forEach', 'reduce', 'find', 'some', 'every', 'sort']
    for method in array_methods:
        # Pattern: .map((item) {
        pattern = rf'(\.{method}\s*\(\s*\([^)]*\))\s*{{'
        content = re.sub(pattern, r'\1 => {', content)
        
        # Pattern with async: .map(async (item) {
        pattern_async = rf'(\.{method}\s*\(\s*async\s*\([^)]*\))\s*{{'
        content = re.sub(pattern_async, r'\1 => {', content)
    
    # 9. Fix React hook patterns
    react_hooks = ['useEffect', 'useCallback', 'useMemo', 'useLayoutEffect']
    for hook in react_hooks:
        # Pattern: useEffect(() {
        pattern = rf'({hook}\s*\(\s*\(\s*\))\s*{{'
        content = re.sub(pattern, r'\1 => {', content)
        
        # Pattern with params: useCallback((x) {
        pattern_params = rf'({hook}\s*\(\s*\([^)]*\))\s*{{'
        content = re.sub(pattern_params, r'\1 => {', content)
        
        # Pattern with async
        pattern_async = rf'({hook}\s*\(\s*async\s*\([^)]*\))\s*{{'
        content = re.sub(pattern_async, r'\1 => {', content)
    
    # 10. Fix promise patterns
    promise_methods = ['then', 'catch', 'finally']
    for method in promise_methods:
        # Pattern: .then((result) {
        pattern = rf'(\.{method}\s*\(\s*\([^)]*\))\s*{{'
        content = re.sub(pattern, r'\1 => {', content)
        
        # Pattern with async
        pattern_async = rf'(\.{method}\s*\(\s*async\s*\([^)]*\))\s*{{'
        content = re.sub(pattern_async, r'\1 => {', content)
    
    # 11. Fix event handler patterns
    # Pattern: onClick={(e) {
    pattern7 = r'(\bon\w+\s*=\s*{\s*\([^)]*\))\s*{'
    content = re.sub(pattern7, r'\1 => {', content)
    
    # 12. Fix JSX prop callbacks
    # Pattern: renderItem={(item) {
    pattern8 = r'(\w+\s*=\s*{\s*\([^)]*\))\s*{'
    content = re.sub(pattern8, r'\1 => {', content)
    
    return content

def process_file(filepath):
    """Process a single file to fix arrow syntax."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        fixed_content = fix_arrow_syntax(content)
        
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
    
    # Check test directories
    test_dirs = ['__tests__', 'test', 'tests', 'spec']
    for test_dir in test_dirs:
        if os.path.exists(test_dir):
            for root, dirs, files in os.walk(test_dir):
                dirs[:] = [d for d in dirs if d not in ['node_modules', 'dist', 'build']]
                for file in files:
                    if file.endswith(extensions):
                        files_to_check.append(os.path.join(root, file))
    
    print(f"Checking {len(files_to_check)} files for arrow syntax issues...")
    
    fixed_files = []
    for filepath in files_to_check:
        if process_file(filepath):
            fixed_files.append(filepath)
    
    if fixed_files:
        print(f"\nFixed {len(fixed_files)} files:")
        for f in sorted(fixed_files):
            print(f"  - {f}")
    else:
        print("\nNo files needed arrow syntax fixes.")
    
    return len(fixed_files)

if __name__ == '__main__':
    fixed_count = main()
    sys.exit(0 if fixed_count >= 0 else 1)