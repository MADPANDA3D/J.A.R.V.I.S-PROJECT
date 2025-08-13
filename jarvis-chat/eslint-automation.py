#!/usr/bin/env python3
"""
ESLint Automation Tool
======================
A focused tool to automate ESLint error detection and fixing.
Follows the proven single-file cleanup strategy.
"""

import subprocess
import re
import os
import json
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass

@dataclass
class LintError:
    file_path: str
    line: int
    column: int
    rule: str
    message: str
    severity: str  # 'error' or 'warning'

class ESLintAutomation:
    def __init__(self, project_path: str = "."):
        self.project_path = project_path
        self.common_fixes = {
            # Parsing errors patterns and fixes
            r"} catch \(\) \{": lambda m, content: content.replace(m.group(0), "} catch (error) {"),
            r"async \w+ \{": lambda m, content: content.replace(m.group(0), m.group(0).replace(" {", " => {")),
            r"\): Promise<[^>]+>\s*=>\s*\{": lambda m, content: content.replace(" => {", " {"),
            r"\): Promise<\s*=>\s*\{([^}]+)\}>\s*\{": lambda m, content: content.replace(m.group(0), f"): Promise<{{{m.group(1)}}}> {{"),
            
            # Common TypeScript fixes
            r": any\b": lambda m, content: content.replace(": any", ": unknown"),
            r" as any\b": lambda m, content: content.replace(" as any", " as unknown"),
            r"=> any\b": lambda m, content: content.replace("=> any", "=> unknown"),
        }

    def run_lint(self) -> Tuple[List[LintError], int]:
        """Run ESLint and parse the output"""
        try:
            result = subprocess.run(
                ["npm", "run", "lint", "--", "--format", "json"],
                cwd=self.project_path,
                capture_output=True,
                text=True,
                shell=True
            )
            
            # Get problem count
            count_result = subprocess.run(
                ["npm", "run", "lint"],
                cwd=self.project_path,
                capture_output=True,
                text=True,
                shell=True
            )
            
            problem_count = 0
            for line in count_result.stderr.split('\n'):
                if 'problems' in line:
                    match = re.search(r'(\d+) problems', line)
                    if match:
                        problem_count = int(match.group(1))
                        break
            
            # Parse JSON output
            errors = []
            try:
                lint_output = json.loads(result.stdout)
                for file_result in lint_output:
                    file_path = file_result.get('filePath', '')
                    for message in file_result.get('messages', []):
                        errors.append(LintError(
                            file_path=file_path,
                            line=message.get('line', 0),
                            column=message.get('column', 0),
                            rule=message.get('ruleId', 'unknown'),
                            message=message.get('message', ''),
                            severity='error' if message.get('severity') == 2 else 'warning'
                        ))
            except json.JSONDecodeError:
                # Fallback to text parsing if JSON fails
                pass
                
            return errors, problem_count
        except Exception as e:
            print(f"Error running lint: {e}")
            return [], 0

    def get_file_errors(self, file_path: str) -> List[LintError]:
        """Get errors for a specific file"""
        try:
            result = subprocess.run(
                ["npm", "run", "lint", file_path, "--", "--format", "json"],
                cwd=self.project_path,
                capture_output=True,
                text=True,
                shell=True
            )
            
            errors = []
            try:
                lint_output = json.loads(result.stdout)
                for file_result in lint_output:
                    for message in file_result.get('messages', []):
                        errors.append(LintError(
                            file_path=file_path,
                            line=message.get('line', 0),
                            column=message.get('column', 0),
                            rule=message.get('ruleId', 'unknown'),
                            message=message.get('message', ''),
                            severity='error' if message.get('severity') == 2 else 'warning'
                        ))
            except json.JSONDecodeError:
                pass
                
            return errors
        except Exception as e:
            print(f"Error getting file errors: {e}")
            return []

    def read_file(self, file_path: str) -> Optional[str]:
        """Read file content"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            return None

    def write_file(self, file_path: str, content: str) -> bool:
        """Write file content"""
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        except Exception as e:
            print(f"Error writing {file_path}: {e}")
            return False

    def apply_common_fixes(self, file_path: str) -> bool:
        """Apply common automated fixes to a file"""
        content = self.read_file(file_path)
        if not content:
            return False

        original_content = content
        
        # Apply common fixes
        for pattern, fix_func in self.common_fixes.items():
            matches = list(re.finditer(pattern, content))
            if matches:
                print(f"  Applying fix for pattern: {pattern}")
                for match in reversed(matches):  # Apply from end to avoid offset issues
                    content = fix_func(match, content)

        # Write back if changed
        if content != original_content:
            return self.write_file(file_path, content)
        
        return False

    def fix_parsing_errors(self, file_path: str, errors: List[LintError]) -> bool:
        """Fix parsing errors in a file"""
        parsing_errors = [e for e in errors if 'Parsing error' in e.message]
        if not parsing_errors:
            return False

        content = self.read_file(file_path)
        if not content:
            return False

        original_content = content
        lines = content.split('\n')

        for error in parsing_errors:
            line_idx = error.line - 1
            if 0 <= line_idx < len(lines):
                line = lines[line_idx]
                
                # Specific parsing error fixes
                if "'{' or ';' expected" in error.message:
                    # Fix method signatures with mixed syntax
                    if " => {" in line:
                        lines[line_idx] = line.replace(" => {", " {")
                        print(f"  Fixed method signature on line {error.line}")
                
                elif "'=>' expected" in error.message:
                    # Fix missing arrow in arrow functions
                    if re.search(r'async \w+ \{', line):
                        lines[line_idx] = re.sub(r'(async \w+) \{', r'\1 => {', line)
                        print(f"  Fixed missing arrow on line {error.line}")
                
                elif "'>' expected" in error.message:
                    # Fix malformed Promise types
                    if "Promise< =>" in line:
                        lines[line_idx] = re.sub(r'Promise<\s*=>\s*\{([^}]+)\}>', r'Promise<{\1}>', line)
                        print(f"  Fixed Promise type on line {error.line}")
                
                elif "Identifier expected" in error.message:
                    # Fix catch blocks missing parameters
                    if "} catch () {" in line:
                        lines[line_idx] = line.replace("} catch () {", "} catch (error) {")
                        print(f"  Fixed catch block on line {error.line}")

        # Write back if changed
        new_content = '\n'.join(lines)
        if new_content != original_content:
            return self.write_file(file_path, new_content)
        
        return False

    def clean_single_file(self, file_path: str) -> Tuple[bool, int, int]:
        """Clean a single file completely using our proven strategy"""
        print(f"\n🎯 Cleaning file: {file_path}")
        
        # Get initial error count
        initial_errors = self.get_file_errors(file_path)
        initial_count = len(initial_errors)
        
        if initial_count == 0:
            print(f"  ✅ File is already clean!")
            return True, 0, 0
        
        print(f"  📊 Initial errors: {initial_count}")
        
        changes_made = False
        iterations = 0
        max_iterations = 10  # Prevent infinite loops
        
        while iterations < max_iterations:
            iterations += 1
            iteration_changes = False
            
            # Get current errors
            current_errors = self.get_file_errors(file_path)
            if not current_errors:
                print(f"  ✅ File cleaned in {iterations} iterations!")
                break
            
            print(f"  🔄 Iteration {iterations}: {len(current_errors)} errors")
            
            # Apply parsing error fixes
            if self.fix_parsing_errors(file_path, current_errors):
                iteration_changes = True
                changes_made = True
                print(f"    🔧 Applied parsing error fixes")
            
            # Apply common fixes
            if self.apply_common_fixes(file_path):
                iteration_changes = True
                changes_made = True
                print(f"    🔧 Applied common fixes")
            
            # If no changes were made this iteration, break
            if not iteration_changes:
                print(f"  ⚠️ No more automated fixes available")
                break
        
        # Get final error count
        final_errors = self.get_file_errors(file_path)
        final_count = len(final_errors)
        
        reduction = initial_count - final_count
        print(f"  📈 Result: {initial_count}→{final_count} errors ({reduction:+d})")
        
        return changes_made, initial_count, final_count

    def get_problem_summary(self) -> Dict:
        """Get a summary of all current problems"""
        errors, total_count = self.run_lint()
        
        file_counts = {}
        parsing_errors = []
        
        for error in errors:
            rel_path = os.path.relpath(error.file_path, self.project_path)
            file_counts[rel_path] = file_counts.get(rel_path, 0) + 1
            
            if 'Parsing error' in error.message:
                parsing_errors.append(error)
        
        return {
            'total_problems': total_count,
            'file_counts': file_counts,
            'parsing_errors': len(parsing_errors),
            'top_files': sorted(file_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        }

def main():
    """Main entry point for interactive use"""
    automator = ESLintAutomation()
    
    print("🚀 ESLint Automation Tool")
    print("=" * 50)
    
    # Get initial status
    summary = automator.get_problem_summary()
    print(f"📊 Current Status: {summary['total_problems']} total problems")
    print(f"🔍 Parsing errors: {summary['parsing_errors']}")
    
    if summary['top_files']:
        print("\n🎯 Top error files:")
        for file_path, count in summary['top_files']:
            print(f"  • {file_path}: {count} errors")
    
    print("\n" + "=" * 50)
    print("Ready for automated fixing! 🛠️")

if __name__ == "__main__":
    main()
