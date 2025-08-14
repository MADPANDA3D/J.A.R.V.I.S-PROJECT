#!/usr/bin/env node
/**
 * Force process exit after tests complete
 * This addresses the CI hanging issue where Vitest doesn't properly exit
 */

const { spawn } = require('child_process');
const path = require('path');

// Get arguments passed to this script (e.g., --coverage)
const args = process.argv.slice(2);

// Run the test command with proper timeout handling
const testProcess = spawn('npm', ['run', 'test:run', ...args], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: '--max-old-space-size=51200',
    CI: 'true'
  }
});

// Set a hard timeout for the entire test run
const timeout = setTimeout(() => {
  console.log('\n⚠️  Tests did not complete within timeout - forcing exit');
  testProcess.kill('SIGKILL');
  process.exit(1);
}, 1800000); // 30 minutes maximum

testProcess.on('close', (code) => {
  clearTimeout(timeout);
  console.log(`\n✅ Test process completed with code: ${code}`);
  
  // Force immediate exit regardless of hanging resources
  setTimeout(() => {
    console.log('🔧 Forcing process exit to prevent hanging');
    process.exit(code || 0);
  }, 5000); // 5 second grace period
});

testProcess.on('error', (error) => {
  clearTimeout(timeout);
  console.error(`\n❌ Test process error:`, error);
  process.exit(1);
});

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT - terminating tests');
  clearTimeout(timeout);
  testProcess.kill('SIGKILL');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM - terminating tests');
  clearTimeout(timeout);
  testProcess.kill('SIGKILL');
  process.exit(1);
});