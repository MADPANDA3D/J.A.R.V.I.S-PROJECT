#!/usr/bin/env python3
"""
Fix React component arrow function syntax and other complex patterns.
"""

import os
import re
import sys

def fix_react_components(content):
    """Fix React functional component declarations"""
    
    # Pattern 1: React.FC with parameters on next line
    # Before: export const Component: React.FC<Props> = ({
    #   prop1,
    #   prop2
    # }) {
    # After: export const Component: React.FC<Props> = ({
    #   prop1,
    #   prop2  
    # }) => {
    content = re.sub(
        r'(export\s+const\s+\w+\s*:\s*React\.FC(?:<[^>]+>)?\s*=\s*\([^)]*\))\s*{',
        r'\1 => {',
        content,
        flags=re.MULTILINE | re.DOTALL
    )
    
    # Pattern 2: Complex multiline React components
    # Handle cases where parameters span multiple lines
    lines = content.split('\n')
    fixed_lines = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # Check for React.FC pattern
        if 'React.FC' in line and '=' in line and '=>' not in line:
            # Look ahead to find the closing parenthesis and opening brace
            j = i
            paren_count = line.count('(') - line.count(')')
            
            # Find the line with the closing parenthesis
            while j < len(lines) - 1 and paren_count > 0:
                j += 1
                paren_count += lines[j].count('(') - lines[j].count(')')
            
            # Now check if the next non-empty line has a lonely {
            k = j
            while k < len(lines) - 1:
                k += 1
                next_line = lines[k].strip()
                if next_line:
                    if next_line == '{':
                        # Found the pattern, add => to the previous line
                        if lines[j].rstrip().endswith(')'):
                            lines[j] = lines[j].rstrip() + ' =>'
                        lines[k] = next_line
                    break
        
        fixed_lines.append(lines[i])
        i += 1
    
    content = '\n'.join(fixed_lines)
    
    # Pattern 3: Function expressions in object methods
    # Before: methodName: function() {
    # After: methodName: () => {
    content = re.sub(
        r'(\w+)\s*:\s*function\s*\(\s*\)\s*{',
        r'\1: () => {',
        content
    )
    
    # Pattern 4: Function expressions with parameters
    # Before: methodName: function(param1, param2) {
    # After: methodName: (param1, param2) => {
    content = re.sub(
        r'(\w+)\s*:\s*function\s*\(([^)]+)\)\s*{',
        r'\1: (\2) => {',
        content
    )
    
    # Pattern 5: Async function expressions
    # Before: methodName: async function() {
    # After: methodName: async () => {
    content = re.sub(
        r'(\w+)\s*:\s*async\s+function\s*\(\s*\)\s*{',
        r'\1: async () => {',
        content
    )
    
    # Pattern 6: Async function expressions with params
    # Before: methodName: async function(param) {
    # After: methodName: async (param) => {
    content = re.sub(
        r'(\w+)\s*:\s*async\s+function\s*\(([^)]+)\)\s*{',
        r'\1: async (\2) => {',
        content
    )
    
    # Pattern 7: Variable function assignments
    # Before: const func = function() {
    # After: const func = () => {
    content = re.sub(
        r'(const|let|var)\s+(\w+)\s*=\s*function\s*\(\s*\)\s*{',
        r'\1 \2 = () => {',
        content
    )
    
    # Pattern 8: Variable function assignments with params
    # Before: const func = function(a, b) {
    # After: const func = (a, b) => {
    content = re.sub(
        r'(const|let|var)\s+(\w+)\s*=\s*function\s*\(([^)]+)\)\s*{',
        r'\1 \2 = (\3) => {',
        content
    )
    
    # Pattern 9: Object method shorthand that needs arrow
    # This is for cases where we have method() { instead of method: () => {
    # But we need to be careful not to break class methods
    # Skip this for now as it's complex
    
    # Pattern 10: Array method callbacks with newlines
    # Before: .map((item)
    # {
    # After: .map((item) => {
    content = re.sub(
        r'\.(map|filter|forEach|reduce|find|some|every|then|catch|finally)\s*\(\s*\(([^)]*)\)\s*\n\s*{',
        r'.\1((\2) => {',
        content,
        flags=re.MULTILINE
    )
    
    return content

def fix_specific_patterns(content):
    """Fix specific edge cases found in the codebase"""
    
    # Fix object property function definitions
    # Before: subscribe: (callback: (status: Status) => void) {
    # After: subscribe: (callback: (status: Status) => void) => {
    content = re.sub(
        r'(\w+)\s*:\s*\(([^)]+:\s*\([^)]+\)\s*=>\s*[^)]+)\)\s*{',
        r'\1: (\2) => {',
        content
    )
    
    # Fix multiline parameter functions
    lines = content.split('\n')
    fixed_lines = []
    
    for i in range(len(lines)):
        line = lines[i]
        # Check if line ends with ) and next line starts with {
        if i < len(lines) - 1 and line.strip().endswith(')') and not line.strip().endswith('=>'):
            next_line = lines[i + 1].strip()
            if next_line.startswith('{'):
                # Check if this is likely a function that needs =>
                if any(keyword in lines[max(0, i-3):i+1][0] for keyword in ['const', 'let', 'var', '=', ':', '.map', '.filter', '.forEach', 'then', 'catch']):
                    line = line.rstrip() + ' =>'
        
        fixed_lines.append(line)
    
    return '\n'.join(fixed_lines)

def process_file(filepath):
    """Process a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        content = fix_react_components(content)
        content = fix_specific_patterns(content)
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    """Process all files with remaining arrow function errors"""
    
    # Files identified from the lint output
    files_to_fix = [
        'src/api/bugStreaming.ts',
        'src/api/logAccess.ts',
        'src/components/UpdateNotification.tsx',
        'src/components/accessibility/AccessibilityTestPanel.tsx',
        'src/components/accessibility/VisualAccessibilityControls.tsx',
        'src/components/analytics/AlertPanel.tsx',
        'src/components/analytics/ErrorTrendChart.tsx',
        'src/components/analytics/SessionAnalyticsDashboard.tsx',
        'src/components/analytics/SessionTimeline.tsx',
        'src/components/auth/AuthLayout.tsx',
        'src/components/auth/LoginForm.tsx',
        'src/components/auth/ProtectedRoute.tsx',
        'src/components/auth/RegisterForm.tsx',
        'src/components/bug-lifecycle/AssignmentInterface.tsx',
        'src/components/bug-lifecycle/BugLifecycleDashboard.tsx',
        'src/components/bug-report/BugReportForm.tsx',
        'src/components/bug-report/BugReportModal.tsx',
        'src/components/bug-report/FileAttachmentUpload.tsx',
        'src/components/chat/ChatLayout.tsx',
        'src/components/chat/MessageBubble.tsx',
        'src/components/chat/MessageInput.tsx',
        'src/components/chat/MessageSearch.tsx',
        'src/components/chat/ToolsSelector.tsx',
        'src/components/chat/TypingIndicator.tsx',
        'src/components/communication/FeedbackCollectionForm.tsx',
        'src/components/communication/InternalComments.tsx',
        'src/components/debugging/AuthenticationDebugger.tsx',
        'src/components/debugging/EnvironmentValidator.tsx',
        'src/components/debugging/LogStreamViewer.tsx',
        'src/components/debugging/ProductionDashboard.tsx',
        'src/components/debugging/RuntimeErrorMonitor.tsx',
        'src/components/debugging/SystemHealthMonitor.tsx',
        'src/components/error/ErrorBoundary.tsx',
        'src/components/layout/AppLayout.tsx',
        'src/components/layout/Footer.tsx',
        'src/components/layout/Header.tsx',
        'src/components/logging/LoggingDashboard.tsx',
        'src/components/monitoring/HealthStatusIndicator.tsx',
        'src/components/monitoring/PerformanceCharts.tsx',
        'src/components/monitoring/RealTimeActivityDashboard.tsx',
        'src/components/monitoring/WebhookEventLog.tsx',
        'src/components/monitoring/WebhookMonitoringDashboard.tsx',
        'src/components/pwa/InstallPrompt.tsx',
        'src/components/pwa/PWAStatus.tsx',
        'src/components/ui/Avatar.tsx',
        'src/components/ui/badge.tsx',
        'src/components/ui/button.tsx',
        'src/components/ui/calendar.tsx',
        'src/components/ui/dropdown-menu.tsx',
        'src/components/ui/input.tsx',
        'src/contexts/AuthContext.tsx',
        'src/hooks/useBugLifecycle.ts',
        'src/hooks/useBugReport.ts',
        'src/hooks/useChat.ts',
        'src/hooks/usePWAInstall.ts',
        'src/hooks/useSearchHistory.ts',
        'src/hooks/useSearchState.ts',
        'src/hooks/useTools.ts',
        'src/hooks/useWebhookMonitoring.ts',
        'src/lib/advancedErrorTracking.ts',
        'src/lib/alertingSystem.ts',
        'src/lib/apiSecurity.ts',
        'src/lib/assignmentSystem.ts',
        'src/lib/bugLifecycle.ts',
        'src/lib/bugReporting.ts',
        'src/lib/bugSubmissionProcessor.ts',
        'src/lib/chatService.ts',
        'src/lib/color-contrast-validator.ts',
        'src/lib/databaseLogging.ts',
        'src/lib/distributedTracing.ts',
        'src/lib/env-validation.ts',
        'src/lib/externalAPIClient.ts',
        'src/lib/externalMonitoring.ts',
        'src/lib/feedbackCollection.ts',
        'src/lib/healthCheck.ts',
        'src/lib/healthMonitoring.ts',
        'src/lib/incidentResponse.ts',
        'src/lib/internalCommunication.ts',
        'src/lib/logAggregation.ts',
        'src/lib/mockN8nServer.ts',
        'src/lib/notificationService.ts',
        'src/lib/performanceMetrics.ts',
        'src/lib/searchAnalytics.ts',
        'src/lib/secrets-management.ts',
        'src/lib/streamingIntegration.ts',
        'src/lib/supabase.ts',
        'src/lib/utils.ts',
        'src/lib/webhookMonitoring.ts',
        'src/lib/webhookService.ts',
        'src/lib/webhookValidation.ts',
        'src/pages/ChatPage.tsx',
        'src/pages/Dashboard.tsx',
        'src/pages/HealthPage.tsx',
        'src/pages/NotFound.tsx',
        'src/pages/SettingsPage.tsx',
        'src/pages/TasksPage.tsx',
        'src/pages/WebhookMonitoringPage.tsx',
        'src/pages/auth/LoginPage.tsx',
        'src/services/externalIntegration.ts',
        'src/services/webhookService.ts',
        'src/test/testUtils.ts',
    ]
    
    fixed_count = 0
    for file in files_to_fix:
        if os.path.exists(file):
            if process_file(file):
                fixed_count += 1
                print(f"✓ Fixed {file}")
        else:
            print(f"⚠ File not found: {file}")
    
    print(f"\nFixed {fixed_count} files")
    return fixed_count > 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)