#!/usr/bin/env python3
"""
ESLint Helper Tool
==================
Automatically fixes ESLint parsing errors in a loop until each file is completely clean.
Implements the proven single-file strategy with revealed error pattern handling.
"""

import subprocess
import re
import os
import json
import shutil
from typing import List, Dict, Optional, Tuple

class ESLintError:
    def __init__(self, file_path: str, line: int, column: int, message: str, rule: str = ""):
        self.file_path = file_path
        self.line = line
        self.column = column  
        self.message = message
        self.rule = rule
    
    def __str__(self):
        return f"{self.file_path}:{self.line}:{self.column} - {self.message}"

class ESLintHelper:
    def __init__(self, project_dir: str = "."):
        self.project_dir = project_dir
        self.max_iterations = 20  # Prevent infinite loops
        
        # Enhanced parsing error patterns
        self.parsing_fixes = [
            # Method signature fixes
            (r'\): Promise<([^>]+)>\s*=>\s*\{', r'): Promise<\1> {'),
            (r'\): Promise<\s*=>\s*\{', r'): Promise<{'),
            (r'}\s*>\s*=>\s*\{', r'}> {'),
            
            # Arrow function fixes  
            (r'async (\w+) \{', r'async \1 => {'),
            (r'async \(\) \{', r'async () => {'),
            (r'response: async \(\) \{', r'response: async () => {'),
            
            # Catch block fixes
            (r'} catch \(\) \{', r'} catch (error) {'),
            (r'catch \(\) \{', r'catch (error) {'),
            
            # Promise type malformations
            (r'\): Promise< =>', r'): Promise<{'),
            (r'Promise<= =>', r'Promise<{'),
        ]

    def run_lint_count(self) -> int:
        """Get current total problem count"""
        try:
            result = subprocess.run(
                'npm run lint -- --no-fix',
                cwd=self.project_dir,
                capture_output=True,
                text=True,
                shell=True,
                encoding='utf-8'
            )
            
            output = result.stdout + result.stderr
            for line in output.split('\n'):
                if 'problems' in line:
                    match = re.search(r'(\d+) problems', line)
                    if match:
                        return int(match.group(1))
            return 0
        except Exception as e:
            print(f"Error getting lint count: {e}")
            return 0

    def get_file_errors(self, file_path: str) -> List[ESLintError]:
        """Get specific errors for a single file"""
        try:
            # Use relative path for ESLint
            rel_path = os.path.relpath(file_path, self.project_dir)
            
            result = subprocess.run(
                f'npm run lint -- --no-fix {rel_path}',
                cwd=self.project_dir,
                capture_output=True,
                text=True,
                shell=True,
                encoding='utf-8'
            )
            
            errors = []
            output = result.stdout + result.stderr
            current_file = None
            
            for line in output.split('\n'):
                # Check for file path line
                if line.strip().endswith('.ts') and not line.strip().startswith(' '):
                    current_file = line.strip()
                    continue
                    
                # Parse error line format: "  123:45  error  Message"
                error_match = re.match(r'\s*(\d+):(\d+)\s+(error|warning)\s+(.+)', line)
                if error_match and current_file:
                    line_num = int(error_match.group(1))
                    col_num = int(error_match.group(2))
                    severity = error_match.group(3)
                    message = error_match.group(4)
                    
                    # Extract rule if present
                    rule = ""
                    if message.strip().endswith(")"):
                        rule_match = re.search(r'\s+([a-z-/@]+)$', message)
                        if rule_match:
                            rule = rule_match.group(1)
                            message = message.replace(rule, "").strip()
                    
                    errors.append(ESLintError(current_file, line_num, col_num, message, rule))
            
            return errors
            
        except Exception as e:
            print(f"Error getting file errors for {file_path}: {e}")
            return []

    def apply_parsing_fixes(self, file_path: str, errors: List[ESLintError]) -> bool:
        """Apply targeted fixes for parsing errors"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            original_content = ''.join(lines)
            changes_made = False
            
            # Apply fixes for parsing errors
            for error in errors:
                if "Parsing error" not in error.message:
                    continue
                    
                line_idx = error.line - 1
                if line_idx >= len(lines):
                    continue
                    
                line_content = lines[line_idx]
                original_line = line_content
                
                # Apply specific fixes based on error message
                if "'=>' expected" in error.message:
                    # Fix missing arrow functions
                    if "async (" in line_content and " {" in line_content:
                        line_content = re.sub(r'async \([^)]*\) \{', lambda m: m.group(0).replace(' {', ' => {'), line_content)
                    elif "response: async ()" in line_content and " {" in line_content:
                        line_content = re.sub(r'response: async \(\) \{', r'response: async () => {', line_content)
                
                elif "'{' or ';' expected" in error.message:
                    # Fix method signatures with arrow functions
                    if "): Promise<" in line_content and " => {" in line_content:
                        line_content = re.sub(r'\): Promise<([^>]+)>\s*=>\s*\{', r'): Promise<\1> {', line_content)
                
                elif "Identifier expected" in error.message:
                    # Fix various identifier issues
                    pass  # These often need manual inspection
                
                elif "Declaration or statement expected" in error.message:
                    # Check for common syntax issues
                    pass  # These often need manual inspection
                
                # Update line if changed
                if line_content != original_line:
                    lines[line_idx] = line_content
                    changes_made = True
                    print(f"  Fixed line {error.line}: {error.message}")
            
            # Apply general parsing fixes
            content = ''.join(lines)
            for pattern, replacement in self.parsing_fixes:
                new_content = re.sub(pattern, replacement, content)
                if new_content != content:
                    content = new_content
                    changes_made = True
            
            # Write back if changed
            if changes_made:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                return True
            
            return False
                
        except Exception as e:
            print(f"Error applying fixes to {file_path}: {e}")
            return False

    def get_problem_files(self) -> List[str]:
        """Get all files with ESLint problems"""
        try:
            result = subprocess.run(
                'npm run lint -- --no-fix',
                cwd=self.project_dir,
                capture_output=True,
                text=True,
                shell=True,
                encoding='utf-8'
            )
            
            files = []
            output = result.stdout + result.stderr
            
            for line in output.split('\n'):
                if line.strip().endswith('.ts') and not line.strip().startswith(' '):
                    files.append(line.strip())
            
            return list(set(files))  # Remove duplicates
                
        except Exception as e:
            print(f"Error getting problem files: {e}")
            return []

    def create_backup(self, file_path: str) -> str:
        """Create a backup of the file before making changes"""
        backup_path = f"{file_path}.bak"
        shutil.copy2(file_path, backup_path)
        return backup_path
    
    def restore_backup(self, file_path: str, backup_path: str) -> None:
        """Restore file from backup"""
        shutil.copy2(backup_path, file_path)
        os.remove(backup_path)
    
    def clean_file_automatically(self, file_path: str) -> Tuple[int, int]:
        """Automatically clean a single file with backup/restore safety"""
        print(f"\n🎯 Auto-cleaning: {file_path}")
        
        # Get initial errors for THIS file only
        initial_errors = self.get_file_errors(file_path)
        initial_error_count = len(initial_errors)
        
        print(f"📊 Initial file errors: {initial_error_count}")
        
        if initial_error_count == 0:
            print(f"✅ File is already clean!")
            return 0, 0
        
        # Create backup before any changes
        backup_path = self.create_backup(file_path)
        print(f"💾 Created backup: {os.path.basename(backup_path)}")
        
        iteration = 0
        try:
            while iteration < self.max_iterations:
                iteration += 1
                print(f"\n🔄 Iteration {iteration}")
                
                # Get current errors for this file
                current_errors = self.get_file_errors(file_path)
                current_error_count = len(current_errors)
                
                if current_error_count == 0:
                    print(f"✅ File is clean!")
                    break
                
                # Check if error count increased - REVERT if so
                if current_error_count > initial_error_count:
                    print(f"❌ ERROR COUNT INCREASED: {initial_error_count} → {current_error_count}")
                    print(f"� Reverting changes...")
                    self.restore_backup(file_path, backup_path)
                    return initial_error_count, initial_error_count  # No improvement
                    
                print(f"📋 File has {current_error_count} errors:")
                for error in current_errors[:3]:  # Show first 3
                    print(f"  • Line {error.line}: {error.message}")
                if len(current_errors) > 3:
                    print(f"  ... and {len(current_errors) - 3} more")
                
                # Apply fixes
                changes_made = self.apply_parsing_fixes(file_path, current_errors)
                if not changes_made:
                    print(f"❌ No automatic fixes available - needs manual intervention")
                    break
                    
                print(f"✅ Applied fixes, checking results...")
                
                # Verify the fixes didn't break anything
                post_fix_errors = self.get_file_errors(file_path)
                post_fix_count = len(post_fix_errors)
                
                if post_fix_count > current_error_count:
                    print(f"❌ FIXES CREATED MORE ERRORS: {current_error_count} → {post_fix_count}")
                    print(f"🔄 Reverting this iteration...")
                    self.restore_backup(file_path, backup_path)
                    return initial_error_count, initial_error_count  # No improvement
            
            # Get final results
            final_errors = self.get_file_errors(file_path)
            final_error_count = len(final_errors)
            
            print(f"\n📈 Final result: {initial_error_count} → {final_error_count} errors")
            
            if final_error_count == 0:
                print(f"🎉 SUCCESS! File is completely clean!")
            elif final_error_count < initial_error_count:
                print(f"✅ IMPROVEMENT! Reduced by {initial_error_count - final_error_count} errors")
            elif iteration >= self.max_iterations:
                print(f"⚠️  Hit max iterations ({self.max_iterations}) - may need manual fixes")
            
            # Clean up backup
            if os.path.exists(backup_path):
                os.remove(backup_path)
                
            return initial_error_count, final_error_count
            
        except Exception as e:
            print(f"❌ Error during processing: {e}")
            # Restore backup on any error
            if os.path.exists(backup_path):
                print(f"🔄 Restoring backup due to error...")
                self.restore_backup(file_path, backup_path)
            return initial_error_count, initial_error_count

    def auto_fix_all_files(self) -> None:
        """Automatically fix files one at a time with strict safety"""
        print(f"🚀 Starting automatic ESLint fix - ONE FILE AT A TIME")
        print("=" * 60)
        
        initial_total = self.run_lint_count()
        print(f"📊 Starting with {initial_total} total problems")
        
        problem_files = self.get_problem_files()
        print(f"📁 Found {len(problem_files)} files with problems")
        
        total_files_improved = 0
        total_errors_fixed = 0
        
        for i, file_path in enumerate(problem_files, 1):
            print(f"\n{'='*20} FILE {i}/{len(problem_files)} {'='*20}")
            
            before, after = self.clean_file_automatically(file_path)
            
            if after < before:
                improvement = before - after
                print(f"✅ {file_path} - IMPROVED! Fixed {improvement} errors")
                total_files_improved += 1
                total_errors_fixed += improvement
            elif after == 0:
                print(f"✅ {file_path} - Already clean!")
            else:
                print(f"❌ {file_path} - No automatic fixes possible")
            
            # Only continue if this file is now clean or improved
            if after > 0:
                print(f"⚠️  File still has {after} errors - may need manual intervention")
        
        final_total = self.run_lint_count()
        actual_reduction = initial_total - final_total
        
        print(f"\n🏆 FINAL RESULTS")
        print(f"=" * 60)
        print(f"📊 Total problems: {initial_total} → {final_total}")
        print(f"📈 Net reduction: {actual_reduction} problems")
        print(f"📁 Files improved: {total_files_improved}/{len(problem_files)}")
        print(f"🔧 Individual fixes applied: {total_errors_fixed}")
        
        if actual_reduction > 0:
            print(f"🎉 SUCCESS! Automation safely reduced {actual_reduction} problems!")
        else:
            print(f"ℹ️  No problems were automatically fixable - manual intervention needed")

def main():
    """Main function - run the automated ESLint fixer"""
    print("🚀 ESLint Automated Fixer")
    print("=" * 50)
    
    # Initialize helper
    project_dir = "."  # Current directory should be jarvis-chat/
    helper = ESLintHelper(project_dir)
    
    # Show current status
    current_problems = helper.run_lint_count()
    print(f"📊 Current problems: {current_problems}")
    
    if current_problems == 0:
        print("✅ No problems found! Project is clean.")
        return
    
    # Get files with problems
    problem_files = helper.get_problem_files()
    print(f"📁 Files with problems: {len(problem_files)}")
    
    if problem_files:
        for file_path in problem_files[:5]:  # Show first 5
            print(f"  • {file_path}")
        if len(problem_files) > 5:
            print(f"  ... and {len(problem_files) - 5} more")
    
    print(f"\n🤖 Starting automatic fixing...")
    
    # Ask user for confirmation
    choice = input("\nProceed with automatic fixes? (y/n): ").lower().strip()
    if choice != 'y':
        print("❌ Cancelled by user")
        return
    
    # Run automatic fixing
    helper.auto_fix_all_files()

def test_single_file(file_path: str):
    """Test the fixer on a single file"""
    helper = ESLintHelper(".")
    helper.clean_file_automatically(file_path)

if __name__ == "__main__":
    # Uncomment to test on a single file:
    # test_single_file("src/lib/mockN8nServer.ts")
    
    # Run full automation
    main()
