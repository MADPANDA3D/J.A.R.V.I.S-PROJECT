#!/usr/bin/env python3
import re
import os
import sys

# Base directory
BASE_DIR = "/mnt/c/Users/MADPANDA3D/Desktop/THE_LAB/TOOLS/BMAD_APP_1/jarvis-chat"

def fix_arrow_function_in_line(line):
    """Fix arrow function syntax in a line"""
    # Pattern 1: async () { -> async () => {
    line = re.sub(r'async\s*\(\s*\)\s*{', r'async () => {', line)
    
    # Pattern 2: async (param) { -> async (param) => {
    line = re.sub(r'async\s*\(([^)]+)\)\s*{', r'async (\1) => {', line)
    
    # Pattern 3: (param) { -> (param) => {
    line = re.sub(r'(\s|^)\(([^)]+)\)\s*{', r'\1(\2) => {', line)
    
    # Pattern 4: () { -> () => {
    line = re.sub(r'(\s|^)\(\s*\)\s*{', r'\1() => {', line)
    
    # Pattern 5: ) { at end of line -> ) => {
    line = re.sub(r'\)\s*{\s*$', r') => {\n', line)
    
    # Pattern 6: ): ReturnType { -> ): ReturnType => {
    line = re.sub(r'\):\s*(\w+)\s*{', r'): \1 => {', line)
    
    return line

def fix_file(file_path):
    """Fix all syntax errors in a file"""
    print(f"Processing {file_path}...")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception as e:
        print(f"  Error reading file: {e}")
        return
    
    modified = False
    new_lines = []
    
    for i, line in enumerate(lines):
        original_line = line
        
        # Fix arrow functions
        line = fix_arrow_function_in_line(line)
        
        # Fix common patterns based on context
        if i > 0:
            prev_line = lines[i-1].strip()
            
            # If previous line ends with ) and current line is just {, add =>
            if prev_line.endswith(')') and line.strip() == '{':
                line = line.replace('{', '=> {')
                
            # If previous line ends with ): Type and current line is {
            if re.search(r'\):\s*\w+\s*$', prev_line) and line.strip() == '{':
                line = line.replace('{', '=> {')
        
        if line != original_line:
            modified = True
            
        new_lines.append(line)
    
    if modified:
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
            print(f"  ✓ Fixed {file_path}")
        except Exception as e:
            print(f"  Error writing file: {e}")
    else:
        print(f"  No changes needed in {file_path}")

def fix_unused_variables(file_path):
    """Fix unused variable errors by prefixing with underscore"""
    print(f"Fixing unused variables in {file_path}...")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"  Error reading file: {e}")
        return
    
    # Common patterns for unused error variables in catch blocks
    patterns = [
        (r'catch\s*\(\s*error\s*\)', r'catch (_error)'),
        (r'catch\s*\(\s*e\s*\)', r'catch (_e)'),
        (r'\.catch\s*\(\s*error\s*\)', r'.catch(_error)'),
        (r'\.catch\s*\(\s*e\s*\)', r'.catch(_e)'),
        (r'\.catch\s*\(\s*\(\s*error\s*\)\s*=>', r'.catch((_error) =>'),
    ]
    
    modified = False
    for pattern, replacement in patterns:
        new_content = re.sub(pattern, replacement, content)
        if new_content != content:
            content = new_content
            modified = True
    
    if modified:
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"  ✓ Fixed unused variables in {file_path}")
        except Exception as e:
            print(f"  Error writing file: {e}")

def fix_any_types(file_path):
    """Replace 'any' types with 'unknown' as a safer alternative"""
    print(f"Fixing 'any' types in {file_path}...")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"  Error reading file: {e}")
        return
    
    # Replace : any with : unknown
    content = re.sub(r':\s*any\b', r': unknown', content)
    
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✓ Fixed 'any' types in {file_path}")
    except Exception as e:
        print(f"  Error writing file: {e}")

def main():
    # Files with arrow function errors from the lint output
    arrow_function_files = [
        "src/__tests__/bugReportIntegration.test.ts",
        "src/api/__tests__/bugDashboard.test.ts",
        "src/api/__tests__/bugExport.test.ts",
        "src/api/bugStreaming.ts",
        "src/api/logAccess.ts",
        "src/components/bug-lifecycle/AssignmentInterface.tsx",
        "src/components/bug-lifecycle/BugLifecycleDashboard.tsx",
        "src/components/bug-report/BugReportForm.tsx",
        "src/components/bug-report/FileAttachmentUpload.tsx",
        "src/components/bug-report/__tests__/BugReportForm.test.tsx",
        "src/components/chat/MessageSearch.tsx",
        "src/components/chat/__tests__/ToolsSelector.test.tsx",
        "src/components/debugging/AuthenticationDebugger.tsx",
        "src/components/monitoring/WebhookEventLog.tsx",
        "src/components/pwa/__tests__/InstallPrompt.test.tsx",
        "src/components/ui/__tests__/Avatar.test.tsx",
        "src/components/ui/calendar.tsx",
        "src/components/ui/dropdown-menu.tsx",
        "src/contexts/AuthContext.tsx",
        "src/hooks/__tests__/useChat.test.ts",
        "src/hooks/__tests__/usePWAInstall.test.ts",
        "src/hooks/__tests__/useTools.test.ts",
        "src/hooks/useBugLifecycle.ts",
        "src/hooks/useBugReport.ts",
        "src/hooks/useSearchState.ts",
        "src/lib/__tests__/assignmentSystem.test.ts",
        "src/lib/__tests__/bugLifecycleIntegration.test.ts",
        "src/lib/__tests__/bugReporting.test.ts",
        "src/lib/__tests__/chatService.enhanced.test.ts",
        "src/lib/__tests__/chatService.production.test.ts",
        "src/lib/__tests__/env-validation.enhanced.test.ts",
        "src/lib/__tests__/environment-integration.test.ts",
        "src/lib/__tests__/errorTracking.enhanced.test.ts",
        "src/lib/__tests__/monitoring.test.ts",
        "src/lib/__tests__/secrets-management.test.ts",
        "src/lib/__tests__/sessionTracking.test.ts",
        "src/lib/__tests__/webhook.diagnostic.test.ts",
        "src/lib/__tests__/webhook.integration.test.ts",
        "src/lib/__tests__/webhookService.basic.test.ts",
        "src/lib/__tests__/webhookService.test.ts",
        "src/lib/__tests__/webhookValidation.test.ts",
        "src/lib/assignmentSystem.ts",
        "src/lib/bugLifecycle.ts",
        "src/lib/bugReporting.ts",
        "src/lib/bugSubmissionProcessor.ts",
        "src/lib/healthCheck.ts",
        "src/lib/healthMonitoring.ts",
        "src/lib/userActivityTracking.ts",
        "src/lib/webhookDeliveryVerification.ts",
        "src/services/__tests__/externalIntegration.test.ts",
        "src/services/webhookService.ts",
    ]
    
    # Files with unused variable errors
    unused_var_files = [
        "src/api/bugExport.ts",
        "src/api/externalIntegration.ts",
        "src/lib/logAggregation.ts",
        "src/lib/metrics.ts",
        "src/lib/mockN8nServer.ts",
        "src/lib/monitoring.ts",
        "src/lib/performanceMetrics.ts",
        "src/lib/supabase.ts",
        "src/lib/webhookService.ts",
        "src/services/externalIntegration.ts",
    ]
    
    # Files with 'any' type errors
    any_type_files = [
        "src/lib/databaseLogging.ts",
        "src/lib/feedbackCollection.ts",
        "src/lib/monitoring.ts",
        "src/services/externalIntegration.ts",
        "src/test/setup.ts",
        "src/test/testUtils.ts",
    ]
    
    print("=== Fixing Arrow Function Syntax Errors ===")
    for file_path in arrow_function_files:
        full_path = os.path.join(BASE_DIR, file_path)
        if os.path.exists(full_path):
            fix_file(full_path)
    
    print("\n=== Fixing Unused Variable Errors ===")
    for file_path in unused_var_files:
        full_path = os.path.join(BASE_DIR, file_path)
        if os.path.exists(full_path):
            fix_unused_variables(full_path)
    
    print("\n=== Fixing 'any' Type Errors ===")
    for file_path in any_type_files:
        full_path = os.path.join(BASE_DIR, file_path)
        if os.path.exists(full_path):
            fix_any_types(full_path)
    
    print("\nDone! Run 'npm run lint' to check remaining errors.")

if __name__ == "__main__":
    main()