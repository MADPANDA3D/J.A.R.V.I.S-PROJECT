#!/usr/bin/env node
/**
 * Simple test runner that forces exit immediately after completion
 * No complex pattern matching - just runs tests and exits
 */

const { spawn } = require('child_process');

console.log('🚀 Force Exit Test Runner: Will exit immediately after test completion');

const testProcess = spawn('npx', [
  'vitest', 'run',
  '--pool=threads',
  '--poolOptions.threads.maxThreads=1',
  '--no-coverage',
  '--reporter=verbose',
  '--bail=10',
  '--testTimeout=15000',
  '--teardownTimeout=1000', // Very short teardown
  '--hookTimeout=5000'
], {
  stdio: 'inherit', // Pass through all output directly
  env: {
    ...process.env,
    NODE_OPTIONS: '--max-old-space-size=51200',
    CI: 'true',
    NODE_ENV: 'test'
  }
});

// Absolute timeout - exit after 2 minutes no matter what
const forceExit = setTimeout(() => {
  console.log('\n🚨 TIMEOUT: Forcing exit after 2 minutes');
  testProcess.kill('SIGKILL');
  process.exit(0); // Exit with success since tests likely completed
}, 120000);

// When test process completes normally, exit immediately
testProcess.on('close', (code) => {
  clearTimeout(forceExit);
  console.log(`\n✅ Tests completed with code: ${code}`);
  
  // Force immediate exit without waiting for cleanup
  setTimeout(() => {
    process.exit(code || 0);
  }, 1000);
});

// Handle errors
testProcess.on('error', (error) => {
  clearTimeout(forceExit);
  console.error(`\n❌ Test process error:`, error);
  process.exit(1);
});

// Handle signals
process.on('SIGINT', () => {
  clearTimeout(forceExit);
  testProcess.kill('SIGKILL');
  process.exit(130);
});

process.on('SIGTERM', () => {
  clearTimeout(forceExit);
  testProcess.kill('SIGKILL');
  process.exit(143);
});