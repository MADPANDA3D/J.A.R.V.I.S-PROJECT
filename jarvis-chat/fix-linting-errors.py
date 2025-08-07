#!/usr/bin/env python3
import re
import os

# List of files and lines with arrow function errors
arrow_errors = [
    ("src/api/__tests__/bugDashboard.test.ts", 37),
    ("src/api/__tests__/bugExport.test.ts", 38),
    ("src/api/bugExport.ts", 609),
    ("src/api/bugStreaming.ts", 155),
    ("src/api/logAccess.ts", 1059),
    ("src/components/accessibility/VisualAccessibilityControls.tsx", 44),
    ("src/components/bug-lifecycle/AssignmentInterface.tsx", 71),
    ("src/components/bug-lifecycle/BugLifecycleDashboard.tsx", 121),
    ("src/components/bug-report/BugReportForm.tsx", 184),
    ("src/components/bug-report/FileAttachmentUpload.tsx", 82),
    ("src/components/bug-report/__tests__/BugReportForm.test.tsx", 91),
    ("src/components/chat/MessageSearch.tsx", 244),
    ("src/components/chat/__tests__/ToolsSelector.test.tsx", 167),
    ("src/components/debugging/AuthenticationDebugger.tsx", 76),
    ("src/components/debugging/RuntimeErrorMonitor.tsx", 138),
    ("src/components/debugging/SystemHealthMonitor.tsx", 197),
    ("src/components/error/ErrorBoundary.tsx", 123),
    ("src/components/monitoring/PerformanceCharts.tsx", 46),
    ("src/components/monitoring/WebhookEventLog.tsx", 43),
    ("src/components/pwa/__tests__/InstallPrompt.test.tsx", 48),
    ("src/components/ui/__tests__/Avatar.test.tsx", 5),
    ("src/hooks/useBugLifecycle.ts", 236),
    ("src/hooks/useBugReport.ts", 184),
    ("src/hooks/usePWAInstall.ts", 52),
    ("src/hooks/useSearchHistory.ts", 39),
    ("src/hooks/useSearchState.ts", 56),
    ("src/hooks/useTools.ts", 103),
    ("src/hooks/useWebhookMonitoring.ts", 110),
    ("src/lib/__tests__/assignmentSystem.test.ts", 38),
    ("src/lib/__tests__/bugLifecycleIntegration.test.ts", 35),
    ("src/lib/__tests__/bugReporting.test.ts", 82),
    ("src/lib/__tests__/chatService.enhanced.test.ts", 74),
    ("src/lib/__tests__/chatService.production.test.ts", 52),
    ("src/lib/__tests__/config-templates.test.ts", 9),
    ("src/lib/__tests__/env-validation.enhanced.test.ts", 15),
    ("src/lib/__tests__/env-validation.test.ts", 9),
    ("src/lib/__tests__/environment-integration.test.ts", 23),
    ("src/lib/__tests__/errorTracking.enhanced.test.ts", 21),
    ("src/lib/__tests__/monitoring.test.ts", 21),
    ("src/lib/__tests__/secrets-management.test.ts", 13),
    ("src/lib/__tests__/sessionTracking.test.ts", 23),
    ("src/lib/__tests__/webhook.diagnostic.test.ts", 23),
    ("src/lib/__tests__/webhook.integration.test.ts", 13),
    ("src/lib/__tests__/webhookMonitoring.test.ts", 15),
    ("src/lib/__tests__/webhookService.basic.test.ts", 14),
    ("src/lib/__tests__/webhookService.test.ts", 17),
    ("src/lib/__tests__/webhookValidation.test.ts", 17),
    ("src/lib/bugLifecycle.ts", 306),
    ("src/lib/bugReporting.ts", 349),
    ("src/lib/bugSubmissionProcessor.ts", 255),
    ("src/lib/externalMonitoring.ts", 370),
    ("src/lib/healthMonitoring.ts", 136),
    ("src/lib/metrics.ts", 208),
    ("src/lib/monitoring.ts", 1245),
    ("src/lib/searchOptimization.ts", 340),
    ("src/lib/sessionTracking.ts", 227),
    ("src/lib/userActivityTracking.ts", 310),
    ("src/main.tsx", 17),
    ("src/services/__tests__/externalIntegration.test.ts", 36),
    ("src/services/webhookService.ts", 159),
    ("src/sw.ts", 18),
]

# Files with declaration/statement errors
declaration_errors = [
    ("src/components/communication/FeedbackCollectionForm.tsx", 401),
    ("src/components/communication/InternalComments.tsx", 349),
    ("src/components/debugging/LogStreamViewer.tsx", 213),
    ("src/components/debugging/ProductionDashboard.tsx", 86),
    ("src/components/logging/LoggingDashboard.tsx", 136),
    ("src/components/monitoring/RealTimeActivityDashboard.tsx", 161),
]

# Files with brace errors
brace_errors = [
    ("src/lib/errorTracking.ts", 331),
    ("src/lib/healthCheck.ts", 82),
    ("src/lib/webhookDeliveryVerification.ts", 231),
]

def fix_arrow_function(file_path, line_num):
    """Fix arrow function syntax at specific line"""
    with open(file_path, 'r') as f:
        lines = f.readlines()
    
    if line_num <= len(lines):
        line_idx = line_num - 1
        line = lines[line_idx]
        
        # Fix various arrow function patterns
        patterns = [
            (r'async\s*\(\s*\)\s*{', r'async () => {'),
            (r'async\s*\(([^)]+)\)\s*{', r'async (\1) => {'),
            (r'(\s|^)\(\s*\)\s*{', r'\1() => {'),
            (r'(\s|^)\(([^)]+)\)\s*{', r'\1(\2) => {'),
        ]
        
        original_line = line
        for pattern, replacement in patterns:
            line = re.sub(pattern, replacement, line)
        
        if line != original_line:
            lines[line_idx] = line
            with open(file_path, 'w') as f:
                f.writelines(lines)
            return True
    return False

def main():
    print("Fixing TypeScript linting errors...")
    
    # Fix arrow function errors
    print("\n1. Fixing arrow function syntax errors...")
    fixed_count = 0
    for file_path, line_num in arrow_errors:
        full_path = os.path.join("/mnt/c/Users/MADPANDA3D/Desktop/THE_LAB/TOOLS/BMAD_APP_1/jarvis-chat", file_path)
        if os.path.exists(full_path):
            if fix_arrow_function(full_path, line_num):
                print(f"  ✓ Fixed {file_path}:{line_num}")
                fixed_count += 1
            else:
                print(f"  ? Could not fix {file_path}:{line_num}")
        else:
            print(f"  ✗ File not found: {file_path}")
    
    print(f"\nFixed {fixed_count} arrow function errors")

if __name__ == "__main__":
    main()