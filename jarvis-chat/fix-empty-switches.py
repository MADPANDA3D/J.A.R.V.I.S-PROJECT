#!/usr/bin/env python3
import os
import re

def fix_empty_switches(file_path):
    """Fix empty switch statements"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        fixed = False
        i = 0
        while i < len(lines):
            # Look for switch statement
            if 'switch' in lines[i] and '{' in lines[i]:
                # Check if next line has just closing brace
                if i + 1 < len(lines) and lines[i + 1].strip() == '}':
                    # Remove the extra closing brace
                    lines.pop(i + 1)
                    fixed = True
            i += 1
        
        if fixed:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(lines)
            return True
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

# Files that likely have this issue based on the error messages
files_to_check = [
    "src/components/communication/FeedbackCollectionForm.tsx",
    "src/components/communication/InternalComments.tsx",
    "src/components/debugging/LogStreamViewer.tsx",
    "src/components/debugging/ProductionDashboard.tsx",
    "src/components/debugging/RuntimeErrorMonitor.tsx",
    "src/components/debugging/SystemHealthMonitor.tsx",
    "src/components/logging/LoggingDashboard.tsx",
    "src/components/monitoring/RealTimeActivityDashboard.tsx"
]

fixed_count = 0
for file_path in files_to_check:
    if os.path.exists(file_path):
        if fix_empty_switches(file_path):
            print(f"Fixed: {file_path}")
            fixed_count += 1
        else:
            print(f"No empty switches found in: {file_path}")
    else:
        print(f"File not found: {file_path}")

print(f"\nTotal files fixed: {fixed_count}")