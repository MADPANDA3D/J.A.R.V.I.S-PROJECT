#!/usr/bin/env node
/**
 * ULTRA AGGRESSIVE process exit after tests complete
 * This bypasses npm and directly calls vitest with maximum force termination
 */

const { spawn } = require('child_process');
const path = require('path');

// Get arguments passed to this script (e.g., --coverage)
const args = process.argv.slice(2);

console.log(`🚀 ULTRA MODE: Starting vitest directly with args: [${args.join(', ')}]`);
console.log('🕒 ULTRA TIMEOUT: 10 minutes maximum');

// Run vitest directly bypassing npm
const vitestArgs = [
  'run',
  '--pool=threads',
  '--poolOptions.threads.maxThreads=1',
  '--no-coverage',
  '--testTimeout=15000',
  '--teardownTimeout=5000',
  ...args
];

const testProcess = spawn('npx', ['vitest', ...vitestArgs], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: '--max-old-space-size=51200',
    CI: 'true',
    VITEST_MAX_THREADS: '1',
    VITEST_MAX_FORKS: '1'
  }
});

console.log(`📊 ULTRA: Vitest process PID: ${testProcess.pid}`);

// Set an ULTRA aggressive timeout - 10 minutes
const timeout = setTimeout(() => {
  console.log('\n🚨 ULTRA TIMEOUT: Tests did not complete within 10 minutes - FORCE KILLING');
  testProcess.kill('SIGKILL');
  
  // Kill any remaining vitest processes
  setTimeout(() => {
    console.log('🔪 ULTRA: Killing any remaining vitest processes');
    require('child_process').exec('pkill -f vitest', () => {
      process.exit(124); // timeout exit code
    });
  }, 1000);
}, 600000); // 10 minutes

testProcess.on('close', (code) => {
  clearTimeout(timeout);
  console.log(`\n✅ ULTRA: Test process completed with code: ${code}`);
  
  // IMMEDIATE force exit - no grace period
  console.log('🔧 ULTRA: IMMEDIATE process exit');
  process.exit(code || 0);
});

testProcess.on('error', (error) => {
  clearTimeout(timeout);
  console.error(`\n❌ ULTRA: Test process error:`, error);
  process.exit(1);
});

// Handle process signals with immediate kill
process.on('SIGINT', () => {
  console.log('\n🛑 ULTRA: Received SIGINT - IMMEDIATE termination');
  clearTimeout(timeout);
  testProcess.kill('SIGKILL');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 ULTRA: Received SIGTERM - IMMEDIATE termination');
  clearTimeout(timeout);
  testProcess.kill('SIGKILL');
  process.exit(1);
});

// Additional safety: force exit after 12 minutes no matter what
setTimeout(() => {
  console.log('\n💀 ULTRA SAFETY: 12 minute absolute limit reached - TERMINATING EVERYTHING');
  process.exit(1);
}, 720000); // 12 minutes absolute limit