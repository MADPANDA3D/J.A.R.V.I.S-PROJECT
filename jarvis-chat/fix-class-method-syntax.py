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
    
    # Pattern 1: Fix method declarations with return types that got => added
    # Before: methodName(): ReturnType => {
    # After: methodName(): ReturnType {
    content = re.sub(
        r'(private|public|protected|static|async)?\s*(\w+)\s*\([^)]*\)\s*:\s*([^=>\n]+)\s*=>\s*{',
        r'\1 \2(\3): \4 {',
        content
    )
    
    # More specific pattern for the exact error we're seeing
    # Before: private methodName(): void => {
    # After: private methodName(): void {
    content = re.sub(
        r'(\s+)(private|public|protected|static)\s+(\w+)\s*\(([^)]*)\)\s*:\s*(\w+(?:<[^>]+>)?)\s*=>\s*{',
        r'\1\2 \3(\4): \5 {',
        content
    )
    
    # Pattern 2: Fix async class methods
    # Before: async methodName(): Promise<Type> => {
    # After: async methodName(): Promise<Type> {
    content = re.sub(
        r'(\s+)(private|public|protected|static)?\s*(async)\s+(\w+)\s*\(([^)]*)\)\s*:\s*([^=>\n]+)\s*=>\s*{',
        r'\1\2 \3 \4(\5): \6 {',
        content
    )
    
    # Pattern 3: Fix static methods
    # Before: static getInstance(): Instance => {
    # After: static getInstance(): Instance {
    content = re.sub(
        r'(\s+)(static)\s+(\w+)\s*\(([^)]*)\)\s*:\s*([^=>\n]+)\s*=>\s*{',
        r'\1\2 \3(\4): \5 {',
        content
    )
    
    # Pattern 4: Fix getter/setter methods
    # Before: get value(): Type => {
    # After: get value(): Type {
    content = re.sub(
        r'(\s+)(get|set)\s+(\w+)\s*\(([^)]*)\)\s*:\s*([^=>\n]+)\s*=>\s*{',
        r'\1\2 \3(\4): \5 {',
        content
    )
    
    # Pattern 5: Fix methods without access modifiers
    # This is trickier, need to ensure we're in a class context
    lines = content.split('\n')
    fixed_lines = []
    in_class = False
    class_indent = 0
    
    for i, line in enumerate(lines):
        # Detect class declaration
        if re.match(r'(export\s+)?(abstract\s+)?class\s+\w+', line.strip()):
            in_class = True
            class_indent = len(line) - len(line.lstrip())
        elif in_class and line.strip() == '}' and len(line) - len(line.lstrip()) == class_indent:
            in_class = False
        
        # Fix method declarations inside classes
        if in_class and '=>' in line and re.match(r'\s+\w+\s*\([^)]*\)\s*:\s*[^=>\n]+\s*=>\s*{', line):
            line = re.sub(
                r'(\s+)(\w+)\s*\(([^)]*)\)\s*:\s*([^=>\n]+)\s*=>\s*{',
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
    
    # Files with the new parsing errors
    files_to_fix = [
        'src/api/bugDashboard.ts',
        'src/api/bugExport.ts',
        'src/api/bugStreaming.ts',
        'src/api/externalIntegration.ts',
        'src/api/logAccess.ts',
        'src/components/bug-lifecycle/BugLifecycleDashboard.tsx',
        'src/components/error/ErrorBoundary.tsx',
        'src/hooks/useBugLifecycle.ts',
        'src/hooks/useBugReport.ts',
        'src/lib/advancedErrorTracking.ts',
        'src/lib/alertingSystem.ts',
        'src/lib/apiSecurity.ts',
        'src/lib/assignmentSystem.ts',
        'src/lib/bugLifecycle.ts',
        'src/lib/bugReporting.ts',
        'src/lib/bugSubmissionProcessor.ts',
        'src/lib/centralizedLogging.ts',
        'src/lib/chatService.ts',
        'src/lib/color-contrast-validator.ts',
        'src/lib/databaseLogging.ts',
        'src/lib/distributedTracing.ts',
        'src/lib/errorTracking.ts',
        'src/lib/externalAPIClient.ts',
        'src/lib/externalMonitoring.ts',
        'src/lib/feedbackCollection.ts',
        'src/lib/healthCheck.ts',
        'src/lib/healthMonitoring.ts',
        'src/lib/incidentResponse.ts',
        'src/lib/internalCommunication.ts',
        'src/lib/logAggregation.ts',
        'src/lib/metrics.ts',
        'src/lib/mockN8nServer.ts',
        'src/lib/monitoring.ts',
        'src/lib/notificationService.ts',
        'src/lib/performanceMetrics.ts',
        'src/lib/searchAnalytics.ts',
        'src/lib/searchOptimization.ts',
        'src/lib/secrets-management.ts',
        'src/lib/sessionTracking.ts',
        'src/lib/streamingIntegration.ts',
        'src/lib/userActivityTracking.ts',
        'src/lib/webhookDeliveryVerification.ts',
        'src/lib/webhookMonitoring.ts',
        'src/lib/webhookService.ts',
        'src/lib/webhookValidation.ts',
        'src/services/externalIntegration.ts',
        'src/services/webhookService.ts',
    ]
    
    # Also check all TypeScript files for this pattern
    for root, dirs, files in os.walk('src'):
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                filepath = os.path.join(root, file)
                if filepath not in files_to_fix:
                    files_to_fix.append(filepath)
    
    fixed_count = 0
    for file in files_to_fix:
        if os.path.exists(file):
            if process_file(file):
                fixed_count += 1
                print(f"✓ Fixed {file}")
    
    print(f"\nFixed {fixed_count} files")
    return fixed_count > 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)