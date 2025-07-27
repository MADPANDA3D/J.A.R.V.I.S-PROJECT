#!/usr/bin/env node

/**
 * JARVIS Chat - Webhook Server Debug Script
 * 
 * This script helps troubleshoot webhook server issues on the VPS
 * Usage: node debug-webhook-server.cjs
 */

const path = require('path');
const fs = require('fs');

console.log('🔍 JARVIS Webhook Server Debug Tool');
console.log('=====================================\n');

// Check Node.js version
console.log('📋 System Information:');
console.log(`   Node.js Version: ${process.version}`);
console.log(`   Platform: ${process.platform}`);
console.log(`   Architecture: ${process.arch}`);
console.log(`   Working Directory: ${process.cwd()}\n`);

// Check required dependencies
console.log('📦 Dependency Check:');
const requiredDeps = ['express', 'ws'];
const missingDeps = [];

for (const dep of requiredDeps) {
    try {
        require(dep);
        console.log(`   ✅ ${dep}: Available`);
    } catch (error) {
        console.log(`   ❌ ${dep}: MISSING`);
        missingDeps.push(dep);
    }
}

if (missingDeps.length > 0) {
    console.log(`\n❌ Missing dependencies detected!`);
    console.log(`   Run: npm install ${missingDeps.join(' ')}`);
}

// Check file permissions and paths
console.log('\n📁 File System Check:');
const criticalPaths = [
    './scripts/vps-webhook-server.cjs',
    './package.json'
];

for (const filePath of criticalPaths) {
    try {
        const stats = fs.statSync(filePath);
        console.log(`   ✅ ${filePath}: Exists (${stats.size} bytes)`);
    } catch (error) {
        console.log(`   ❌ ${filePath}: NOT FOUND`);
    }
}

// Check environment variables
console.log('\n🔧 Environment Variables:');
const envVars = [
    'NODE_ENV',
    'WEBHOOK_PORT',
    'WEBHOOK_SECRET',
    'PROJECT_ROOT'
];

for (const envVar of envVars) {
    const value = process.env[envVar];
    if (value) {
        // Hide sensitive values
        const displayValue = envVar.includes('SECRET') || envVar.includes('TOKEN') 
            ? '[HIDDEN]' 
            : value;
        console.log(`   ✅ ${envVar}: ${displayValue}`);
    } else {
        console.log(`   ⚠️  ${envVar}: Not set`);
    }
}

// Check ports
console.log('\n🌐 Port Check:');
const net = require('net');

function checkPort(port) {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(port, () => {
            server.close(() => {
                resolve(true); // Port is available
            });
        });
        server.on('error', () => {
            resolve(false); // Port is in use
        });
    });
}

async function checkPorts() {
    const ports = [9000, 9001, 9002, 9003];
    for (const port of ports) {
        const available = await checkPort(port);
        console.log(`   ${available ? '✅' : '❌'} Port ${port}: ${available ? 'Available' : 'In Use'}`);
    }
}

// Test webhook server startup
console.log('\n🚀 Webhook Server Test:');
try {
    // Try to load the webhook server script
    const webhookPath = './scripts/vps-webhook-server.cjs';
    if (fs.existsSync(webhookPath)) {
        console.log('   ✅ Webhook server script found');
        
        // Check if it's executable
        try {
            fs.accessSync(webhookPath, fs.constants.R_OK);
            console.log('   ✅ Script is readable');
        } catch (error) {
            console.log('   ❌ Script permission issues');
        }
    } else {
        console.log('   ❌ Webhook server script not found');
    }
} catch (error) {
    console.log(`   ❌ Error testing webhook server: ${error.message}`);
}

// Provide recommendations
console.log('\n💡 Troubleshooting Recommendations:');

if (missingDeps.length > 0) {
    console.log('   1. Install missing dependencies:');
    console.log(`      npm install ${missingDeps.join(' ')}`);
}

console.log('   2. Verify systemd service paths match your actual directory structure');
console.log('   3. Check systemd logs: journalctl -u jarvis-webhook -f');
console.log('   4. Test manually: node scripts/vps-webhook-server.cjs');
console.log('   5. Verify webhook secret is set in environment');

checkPorts().then(() => {
    console.log('\n🎯 Debug complete!');
    console.log('   If issues persist, run: journalctl -u jarvis-webhook --no-pager -n 50');
});