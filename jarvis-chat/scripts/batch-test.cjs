#!/usr/bin/env node
/**
 * BATCH TEST RUNNER - runs tests in smaller batches to prevent hanging
 * This addresses the CI hanging issue by running tests in controlled batches
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 BATCH MODE: Running tests in controlled batches');

// Find all test files
const testPatterns = [
  'src/**/*.test.ts',
  'src/**/*.test.tsx',
  'scripts/**/*.test.js'
];

function runBatch(testFiles, batchNum, totalBatches) {
  return new Promise((resolve, reject) => {
    console.log(`\n🧪 BATCH ${batchNum}/${totalBatches}: Running ${testFiles.length} test files`);
    
    const vitestArgs = [
      'run',
      '--pool=threads',
      '--poolOptions.threads.maxThreads=1',
      '--no-coverage',
      '--testTimeout=10000',
      '--teardownTimeout=3000',
      ...testFiles
    ];

    const testProcess = spawn('npx', ['vitest', ...vitestArgs], {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_OPTIONS: '--max-old-space-size=51200',
        CI: 'true'
      }
    });

    // 5 minute timeout per batch
    const timeout = setTimeout(() => {
      console.log(`\n⚠️ BATCH ${batchNum}: Timeout - force killing`);
      testProcess.kill('SIGKILL');
      reject(new Error(`Batch ${batchNum} timed out`));
    }, 300000); // 5 minutes

    testProcess.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        console.log(`✅ BATCH ${batchNum}: Completed successfully`);
        resolve();
      } else {
        reject(new Error(`Batch ${batchNum} failed with code ${code}`));
      }
    });

    testProcess.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

// Get test files (simplified - you may need to adjust this)
const testFiles = [
  'src/lib/__tests__/bugLifecycleIntegration.test.ts',
  'src/lib/__tests__/webhookService.test.ts',
  'src/services/__tests__/externalIntegration.test.ts',
  'src/api/__tests__/bugExport.test.ts',
  'src/lib/__tests__/webhookValidation.test.ts',
  'src/api/__tests__/bugDashboard.test.ts',
  'src/lib/__tests__/webhookMonitoring.test.ts',
  'src/__tests__/bugReportIntegration.test.ts',
  'src/lib/__tests__/assignmentSystem.test.ts',
  'src/lib/__tests__/environment-integration.test.ts',
  'src/lib/__tests__/secrets-management.test.ts',
  'src/lib/__tests__/monitoring.test.ts',
  'src/lib/__tests__/webhookService.basic.test.ts',
  'src/lib/__tests__/errorTracking.enhanced.test.ts',
  'src/lib/__tests__/config-templates.test.ts',
  'src/lib/__tests__/chatService.enhanced.test.ts',
  'src/components/chat/__tests__/ToolsSelector.test.tsx',
  'src/hooks/__tests__/useTools.test.ts',
  'src/components/bug-report/__tests__/BugReportForm.test.tsx',
  'src/lib/__tests__/webhook.diagnostic.test.ts',
  'src/lib/__tests__/sessionTracking.test.ts',
  'src/lib/__tests__/env-validation.test.ts',
  'src/lib/__tests__/bugReporting.test.ts',
  'src/hooks/__tests__/usePWAInstall.test.ts',
  'src/components/pwa/__tests__/PWAStatus.test.tsx',
  'src/hooks/__tests__/useChat.test.ts',
  'scripts/__tests__/webhook-server.test.js',
  'src/components/pwa/__tests__/InstallPrompt.test.tsx',
  'src/lib/__tests__/webhook.live.test.ts'
];

async function runBatchedTests() {
  const batchSize = 5; // Run 5 test files per batch
  const batches = [];
  
  for (let i = 0; i < testFiles.length; i += batchSize) {
    batches.push(testFiles.slice(i, i + batchSize));
  }

  console.log(`📊 BATCH MODE: ${testFiles.length} test files split into ${batches.length} batches`);

  try {
    for (let i = 0; i < batches.length; i++) {
      await runBatch(batches[i], i + 1, batches.length);
      
      // Brief pause between batches to ensure cleanup
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n🎉 ALL BATCHES COMPLETED SUCCESSFULLY');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ BATCH FAILED:', error.message);
    process.exit(1);
  }
}

// Start batch testing
runBatchedTests();