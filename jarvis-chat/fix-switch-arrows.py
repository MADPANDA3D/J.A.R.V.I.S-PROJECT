#!/usr/bin/env python3
import os
import re
import sys

def fix_switch_arrow_syntax(file_path):
    """Fix switch statements with arrow syntax"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Pattern to match switch statements with arrow syntax
        pattern = r'(switch\s*\([^)]+\))\s*=>\s*\{'
        replacement = r'\1 {'
        
        # Check if pattern exists
        if re.search(pattern, content):
            # Replace the pattern
            new_content = re.sub(pattern, replacement, content)
            
            # Write back to file
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            return True
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

# List of files to fix
files_to_fix = [
    "src/api/bugStreaming.ts",
    "src/api/logAccess.ts",
    "src/components/bug-lifecycle/AssignmentInterface.tsx",
    "src/components/bug-lifecycle/BugLifecycleDashboard.tsx",
    "src/components/debugging/AuthenticationDebugger.tsx",
    "src/components/monitoring/WebhookEventLog.tsx",
    "src/lib/assignmentSystem.ts",
    "src/lib/bugLifecycle.ts",
    "src/lib/healthMonitoring.ts",
    "src/lib/userActivityTracking.ts",
    "src/services/webhookService.ts"
]

fixed_count = 0
for file_path in files_to_fix:
    if fix_switch_arrow_syntax(file_path):
        print(f"Fixed: {file_path}")
        fixed_count += 1
    else:
        print(f"No changes needed: {file_path}")

print(f"\nTotal files fixed: {fixed_count}")