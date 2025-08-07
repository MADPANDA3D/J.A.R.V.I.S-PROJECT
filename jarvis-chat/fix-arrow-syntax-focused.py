#!/usr/bin/env python3
"""
Focused fix for arrow function syntax errors based on linting documentation principles.
This script targets specific patterns causing "=>" expected errors.
"""

import os
import re
import sys

def fix_arrow_functions(content):
    """Fix common arrow function syntax errors"""
    
    # Pattern 1: setTimeout/setInterval with async but missing arrow
    # Before: setTimeout(async () {
    # After: setTimeout(async () => {
    content = re.sub(
        r'(setTimeout|setInterval)\s*\(\s*async\s*\(\s*\)\s*(?!=>)',
        r'\1(async () => ',
        content
    )
    
    # Pattern 2: beforeEach/afterEach/it/test with missing arrow
    # Before: beforeEach(() {
    # After: beforeEach(() => {
    content = re.sub(
        r'(beforeEach|afterEach|beforeAll|afterAll|it|test|describe)\s*\(\s*\(\s*\)\s*(?!=>)\s*{',
        r'\1(() => {',
        content
    )
    
    # Pattern 3: async function in test blocks missing arrow
    # Before: beforeEach(async () {
    # After: beforeEach(async () => {
    content = re.sub(
        r'(beforeEach|afterEach|beforeAll|afterAll|it|test)\s*\(\s*async\s*\(\s*\)\s*(?!=>)\s*{',
        r'\1(async () => {',
        content
    )
    
    # Pattern 4: Method definitions with missing arrows in object literals
    # Before: methodName() {
    # After: methodName: () => {
    # Note: This is more complex, skip for now
    
    # Pattern 5: Event handlers and callbacks
    # Before: .then((response) {
    # After: .then((response) => {
    content = re.sub(
        r'\.(then|catch|finally|map|filter|forEach|reduce|find|some|every)\s*\(\s*\(([^)]*)\)\s*(?!=>)\s*{',
        r'.\1((\2) => {',
        content
    )
    
    # Pattern 6: Async callbacks in array methods
    # Before: .map(async (item) {
    # After: .map(async (item) => {
    content = re.sub(
        r'\.(map|filter|forEach|reduce|find|some|every)\s*\(\s*async\s*\(([^)]*)\)\s*(?!=>)\s*{',
        r'.\1(async (\2) => {',
        content
    )
    
    # Pattern 7: React useEffect and similar hooks
    # Before: useEffect(() {
    # After: useEffect(() => {
    content = re.sub(
        r'(useEffect|useLayoutEffect|useCallback|useMemo)\s*\(\s*\(\s*\)\s*(?!=>)\s*{',
        r'\1(() => {',
        content
    )
    
    # Pattern 8: Promise constructor
    # Before: new Promise((resolve, reject) {
    # After: new Promise((resolve, reject) => {
    content = re.sub(
        r'new\s+Promise\s*\(\s*\(([^)]+)\)\s*(?!=>)\s*{',
        r'new Promise((\1) => {',
        content
    )
    
    # Pattern 9: Event listeners
    # Before: addEventListener('click', (e) {
    # After: addEventListener('click', (e) => {
    content = re.sub(
        r'(addEventListener|removeEventListener)\s*\(\s*["\']([^"\']+)["\']\s*,\s*\(([^)]*)\)\s*(?!=>)\s*{',
        r'\1("\2", (\3) => {',
        content
    )
    
    # Pattern 10: Async function expressions without arrows
    # Before: const func = async () {
    # After: const func = async () => {
    content = re.sub(
        r'(const|let|var)\s+(\w+)\s*=\s*async\s*\(\s*\)\s*(?!=>)\s*{',
        r'\1 \2 = async () => {',
        content
    )
    
    return content

def process_file(filepath):
    """Process a single file to fix arrow function syntax"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        content = fix_arrow_functions(content)
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    """Main function to process TypeScript and JavaScript files"""
    
    # Get list of files with arrow function errors from eslint output
    files_to_fix = [
        'src/App.tsx',
        'src/__tests__/bugReportIntegration.test.ts',
        'src/api/__tests__/bugDashboard.test.ts',
        'src/api/__tests__/bugExport.test.ts',
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
        'src/components/auth/__tests__/ProtectedRoute.test.tsx',
        'src/components/bug-lifecycle/AssignmentInterface.tsx',
        'src/components/bug-lifecycle/BugLifecycleDashboard.tsx',
        'src/components/bug-report/BugReportForm.tsx',
        'src/components/bug-report/BugReportModal.tsx',
        'src/components/bug-report/FileAttachmentUpload.tsx',
        'src/components/bug-report/__tests__/BugReportForm.test.tsx',
        'src/components/chat/ChatLayout.tsx',
        'src/components/chat/MessageBubble.tsx',
        'src/components/chat/MessageInput.tsx',
        'src/components/chat/MessageSearch.tsx',
        'src/components/chat/ToolsSelector.tsx',
        'src/components/chat/TypingIndicator.tsx',
        'src/components/chat/__tests__/ToolsSelector.test.tsx',
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
        'src/components/pwa/__tests__/InstallPrompt.test.tsx',
        'src/components/pwa/__tests__/PWAStatus.test.tsx',
        'src/components/ui/Avatar.tsx',
        'src/components/ui/__tests__/Avatar.test.tsx',
        'src/components/ui/badge.tsx',
        'src/components/ui/button.tsx',
        'src/components/ui/calendar.tsx',
        'src/components/ui/dropdown-menu.tsx',
        'src/components/ui/input.tsx',
        'src/contexts/AuthContext.tsx',
        'src/hooks/__tests__/useChat.test.ts',
        'src/hooks/__tests__/usePWAInstall.test.ts',
        'src/hooks/__tests__/useTools.test.ts',
        'src/hooks/useBugLifecycle.ts',
        'src/hooks/useBugReport.ts',
        'src/hooks/useChat.ts',
        'src/hooks/usePWAInstall.ts',
        'src/hooks/useSearchHistory.ts',
        'src/hooks/useSearchState.ts',
        'src/hooks/useTools.ts',
        'src/hooks/useWebhookMonitoring.ts',
        'src/lib/__tests__/assignmentSystem.test.ts',
        'src/lib/__tests__/bugLifecycleIntegration.test.ts',
        'src/lib/__tests__/bugReporting.test.ts',
        'src/lib/__tests__/chatService.enhanced.test.ts',
        'src/lib/__tests__/config-templates.test.ts',
        'src/lib/__tests__/env-validation.enhanced.test.ts',
        'src/lib/__tests__/env-validation.test.ts',
        'src/lib/__tests__/environment-integration.test.ts',
        'src/lib/__tests__/errorTracking.enhanced.test.ts',
        'src/lib/__tests__/monitoring.test.ts',
        'src/lib/__tests__/secrets-management.test.ts',
        'src/lib/__tests__/sessionTracking.test.ts',
        'src/lib/__tests__/webhook.diagnostic.test.ts',
        'src/lib/__tests__/webhook.integration.test.ts',
        'src/lib/__tests__/webhook.live.test.ts',
        'src/lib/__tests__/webhookMonitoring.test.ts',
        'src/lib/__tests__/webhookService.basic.test.ts',
        'src/lib/__tests__/webhookService.test.ts',
        'src/lib/__tests__/webhookValidation.test.ts',
        'src/lib/accessibility-testing.ts',
        'src/lib/accessibility.ts',
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
        'src/lib/env-validation.ts',
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
        'src/lib/supabase.ts',
        'src/lib/userActivityTracking.ts',
        'src/lib/utils.ts',
        'src/lib/webhookDeliveryVerification.ts',
        'src/lib/webhookMonitoring.ts',
        'src/lib/webhookService.ts',
        'src/lib/webhookValidation.ts',
        'src/main.tsx',
        'src/pages/ChatPage.tsx',
        'src/pages/Dashboard.tsx',
        'src/pages/HealthPage.tsx',
        'src/pages/NotFound.tsx',
        'src/pages/SettingsPage.tsx',
        'src/pages/TasksPage.tsx',
        'src/pages/WebhookMonitoringPage.tsx',
        'src/pages/auth/LoginPage.tsx',
        'src/services/__tests__/externalIntegration.test.ts',
        'src/services/externalIntegration.ts',
        'src/services/webhookService.ts',
        'src/test/setup.test.ts',
        'src/test/testUtils.ts',
        'vite.config.ts'
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