#!/usr/bin/env node
/**
 * Force process exit after tests complete
 * This addresses the CI hanging issue where Vitest doesn't properly exit
 */

const { spawn } = require('child_process');
const path = require('path');

// Get arguments passed to this script (e.g., --coverage)
const args = process.argv.slice(2);

console.log(`🚀 Starting test process with args: [${args.join(', ')}]`);
console.log('🕒 Timeout set to 15 minutes maximum');

// Run the test command with proper timeout handling
const testProcess = spawn('npm', ['run', 'test:run', ...args], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: '--max-old-space-size=51200',
    CI: 'true'
  }
});

console.log(`📊 Test process PID: ${testProcess.pid}`);

// Set a hard timeout for the entire test run
const timeout = setTimeout(() => {
  console.log('\n⚠️  Tests did not complete within timeout - forcing exit');
  testProcess.kill('SIGKILL');
  process.exit(1);
}, 900000); // 15 minutes maximum (more aggressive)

testProcess.on('close', (code) => {
  clearTimeout(timeout);
  console.log(`\n✅ Test process completed with code: ${code}`);
  
  // Force immediate exit regardless of hanging resources
  setTimeout(() => {
    console.log('🔧 Forcing process exit to prevent hanging');
    process.exit(code || 0);
  }, 2000); // 2 second grace period (more aggressive)
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