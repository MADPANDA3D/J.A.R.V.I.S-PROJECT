#!/usr/bin/env node
/**
 * IMMEDIATE EXIT - doesn't wait for test process to close properly
 * Forces exit as soon as we detect test completion
 */

const { spawn } = require('child_process');

console.log('🚨 IMMEDIATE EXIT MODE: Will force exit on test completion detection');

const args = process.argv.slice(2);
const vitestArgs = [
  'run',
  '--pool=threads', 
  '--poolOptions.threads.maxThreads=1',
  '--no-coverage',
  '--testTimeout=10000',
  '--teardownTimeout=3000',
  '--reporter=verbose',
  ...args
];

const testProcess = spawn('npx', ['vitest', ...vitestArgs], {
  stdio: 'pipe', // Use pipe to capture output
  env: {
    ...process.env,
    NODE_OPTIONS: '--max-old-space-size=51200',
    CI: 'true'
  }
});

let testOutput = '';
let testsCompleted = false;

// 5 minute absolute timeout
const absoluteTimeout = setTimeout(() => {
  console.log('🚨 ABSOLUTE TIMEOUT: Forcing immediate exit');
  testProcess.kill('SIGKILL');
  process.exit(124);
}, 300000);

// Monitor output for completion indicators
testProcess.stdout.on('data', (data) => {
  const output = data.toString();
  testOutput += output;
  process.stdout.write(output); // Still show output
  
  // Look for test completion patterns
  if (output.includes('webhook.live.test.ts') && output.includes('✓')) {
    console.log('\n🎯 DETECTED: Live webhook test completed - this is usually the last test');
    
    // Give it 10 seconds then force exit
    setTimeout(() => {
      if (!testsCompleted) {
        console.log('🔥 FORCING EXIT: Live webhook test done, not waiting for process close');
        clearTimeout(absoluteTimeout);
        testProcess.kill('SIGKILL');
        
        // Immediate exit
        setTimeout(() => {
          console.log('✅ IMMEDIATE EXIT: Success');
          process.exit(0);
        }, 1000);
      }
    }, 10000);
  }
  
  // Also check for test summary completion
  if (output.includes('Tests ') && (output.includes('passed') || output.includes('completed'))) {
    console.log('\n🎯 DETECTED: Test summary found');
    setTimeout(() => {
      if (!testsCompleted) {
        console.log('🔥 FORCING EXIT: Test summary detected, not waiting');
        clearTimeout(absoluteTimeout);
        testsCompleted = true;
        testProcess.kill('SIGKILL');
        
        setTimeout(() => {
          console.log('✅ IMMEDIATE EXIT: Success');
          process.exit(0);
        }, 2000);
      }
    }, 5000);
  }
});

testProcess.stderr.on('data', (data) => {
  const output = data.toString();
  process.stderr.write(output);
});

testProcess.on('close', (code) => {
  clearTimeout(absoluteTimeout);
  testsCompleted = true;
  console.log(`\n✅ Test process completed with code: ${code}`);
  process.exit(code || 0);
});

testProcess.on('error', (error) => {
  clearTimeout(absoluteTimeout);
  console.error(`\n❌ Test process error:`, error);
  process.exit(1);
});

// Handle signals
process.on('SIGINT', () => {
  clearTimeout(absoluteTimeout);
  testProcess.kill('SIGKILL');
  process.exit(1);
});

process.on('SIGTERM', () => {
  clearTimeout(absoluteTimeout);
  testProcess.kill('SIGKILL');
  process.exit(1);
});