#!/usr/bin/env node

/**
 * WebSocket Notification System Test
 * Tests real-time notifications during webhook processing
 */

const WebSocket = require('ws');
const crypto = require('crypto');

const WEBHOOK_SECRET = 'bxWGYH5dx8/IS8AJOKokMWaXmdAWsQ87IfZSt38zNo0yX0g1BiHTezqxR6rstM4h';
const WEBSOCKET_URL = 'ws://localhost:9001';
const WEBHOOK_URL = 'http://localhost:9000/webhook/deploy';

class WebSocketTester {
    constructor() {
        this.ws = null;
        this.messages = [];
        this.connectionPromise = null;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            console.log('🔌 Connecting to WebSocket server...');
            
            this.ws = new WebSocket(WEBSOCKET_URL);
            
            this.ws.on('open', () => {
                console.log('✅ Connected to WebSocket server');
                resolve();
            });
            
            this.ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    console.log('📨 Received notification:', message);
                    this.messages.push(message);
                } catch (error) {
                    console.log('📨 Received raw message:', data.toString());
                    this.messages.push({ raw: data.toString() });
                }
            });
            
            this.ws.on('error', (error) => {
                console.log('❌ WebSocket error:', error.message);
                reject(error);
            });
            
            this.ws.on('close', () => {
                console.log('🔌 WebSocket connection closed');
            });
            
            // Timeout after 5 seconds
            setTimeout(() => {
                if (this.ws.readyState !== WebSocket.OPEN) {
                    reject(new Error('WebSocket connection timeout'));
                }
            }, 5000);
        });
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }

    clearMessages() {
        this.messages = [];
    }

    getMessages() {
        return [...this.messages];
    }
}

function generateSignature(payload) {
    return 'sha256=' + crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(payload)
        .digest('hex');
}

async function triggerWebhookEvent(eventType, payload, description) {
    console.log(`\n🎯 Triggering webhook: ${description}`);
    
    const payloadString = JSON.stringify(payload);
    const signature = generateSignature(payloadString);
    
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-GitHub-Event': eventType,
                'X-Hub-Signature-256': signature
            },
            body: payloadString
        });
        
        const responseText = await response.text();
        console.log(`📤 Webhook response: ${response.status} - ${responseText}`);
        
        return response.ok;
    } catch (error) {
        console.log(`❌ Webhook failed: ${error.message}`);
        return false;
    }
}

async function testWebSocketNotifications() {
    console.log('🚀 Starting WebSocket Notification Tests');
    console.log('========================================');
    
    const tester = new WebSocketTester();
    
    try {
        // Connect to WebSocket
        await tester.connect();
        
        // Wait a moment for connection to stabilize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test 1: Ping event (should not trigger notifications)
        console.log('\n📌 Test 1: Ping Event (No notifications expected)');
        tester.clearMessages();
        
        await triggerWebhookEvent('ping', {
            zen: "Design for failure.",
            hook_id: 12345678,
            repository: { name: "J.A.R.V.I.S-PROJECT" }
        }, 'GitHub Ping Event');
        
        // Wait for potential notifications
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const pingMessages = tester.getMessages();
        console.log(`📊 Messages received: ${pingMessages.length}`);
        
        if (pingMessages.length === 0) {
            console.log('✅ Correct: No notifications for ping events');
        } else {
            console.log('⚠️ Unexpected: Received notifications for ping event');
        }
        
        // Test 2: Workflow run success (should trigger deployment notifications)
        console.log('\n🚀 Test 2: Workflow Run Success (Deployment notifications expected)');
        tester.clearMessages();
        
        await triggerWebhookEvent('workflow_run', {
            action: "completed",
            workflow_run: {
                conclusion: "success",
                head_sha: "abcd1234567890abcdef1234567890abcdef1234",
                name: "Deploy to VPS"
            },
            repository: { name: "J.A.R.V.I.S-PROJECT" }
        }, 'Successful Workflow Run');
        
        // Wait longer for deployment process notifications
        await new Promise(resolve => setTimeout(resolve, 8000));
        
        const deploymentMessages = tester.getMessages();
        console.log(`📊 Messages received: ${deploymentMessages.length}`);
        
        if (deploymentMessages.length > 0) {
            console.log('✅ Deployment notifications received:');
            deploymentMessages.forEach((msg, index) => {
                console.log(`  ${index + 1}. ${JSON.stringify(msg)}`);
            });
            
            // Check for expected notification types
            const hasWarningNotification = deploymentMessages.some(msg => 
                msg.type === 'warning' && msg.message.includes('update in progress')
            );
            
            const hasSuccessNotification = deploymentMessages.some(msg => 
                msg.type === 'success' && msg.message.includes('Update completed')
            );
            
            if (hasWarningNotification) {
                console.log('✅ Found deployment start notification');
            } else {
                console.log('⚠️ Missing deployment start notification');
            }
            
            if (hasSuccessNotification) {
                console.log('✅ Found deployment success notification');
            } else {
                console.log('⚠️ Missing deployment success notification (may still be processing)');
            }
            
        } else {
            console.log('❌ No deployment notifications received');
        }
        
        // Test 3: Connection count verification
        console.log('\n📊 Test 3: Connection Count Verification');
        
        const healthResponse = await fetch('http://localhost:9000/health');
        const healthData = await healthResponse.json();
        
        console.log(`🔌 Connected clients reported by server: ${healthData.connectedClients}`);
        
        if (healthData.connectedClients >= 1) {
            console.log('✅ WebSocket connection correctly tracked by server');
        } else {
            console.log('❌ WebSocket connection not tracked by server');
        }
        
        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📋 WebSocket Notification Test Summary:');
        console.log(`  - Connection: ${tester.ws.readyState === WebSocket.OPEN ? 'SUCCESS' : 'FAILED'}`);
        console.log(`  - Ping events: ${pingMessages.length} notifications (expected: 0)`);
        console.log(`  - Deployment events: ${deploymentMessages.length} notifications (expected: >0)`);
        console.log(`  - Server tracking: ${healthData.connectedClients} clients`);
        
        return {
            connectionSuccess: tester.ws.readyState === WebSocket.OPEN,
            pingMessages: pingMessages.length,
            deploymentMessages: deploymentMessages.length,
            serverTracking: healthData.connectedClients >= 1
        };
        
    } catch (error) {
        console.log(`❌ WebSocket test failed: ${error.message}`);
        return null;
    } finally {
        tester.disconnect();
    }
}

async function generateWebSocketTestCommands() {
    console.log('\n📝 Manual WebSocket Testing Commands:');
    console.log('=====================================');
    
    console.log('\n1. Test WebSocket connection with wscat:');
    console.log('npm install -g wscat');
    console.log('wscat -c ws://localhost:9001');
    
    console.log('\n2. Test with websocat:');
    console.log('# Install: https://github.com/vi/websocat');
    console.log('websocat ws://localhost:9001');
    
    console.log('\n3. Test WebSocket in browser console:');
    console.log('const ws = new WebSocket("ws://localhost:9001");');
    console.log('ws.onmessage = (event) => console.log("Notification:", JSON.parse(event.data));');
    console.log('ws.onopen = () => console.log("Connected to JARVIS notifications");');
    
    console.log('\n4. Trigger deployment while connected:');
    const payload = JSON.stringify({
        action: "completed",
        workflow_run: {
            conclusion: "success",
            head_sha: "test123456789",
            name: "Deploy to VPS"
        },
        repository: { name: "J.A.R.V.I.S-PROJECT" }
    });
    
    const signature = generateSignature(payload);
    
    console.log('curl -X POST http://localhost:9000/webhook/deploy \\');
    console.log('    -H "Content-Type: application/json" \\');
    console.log('    -H "X-GitHub-Event: workflow_run" \\');
    console.log(`    -H "X-Hub-Signature-256: ${signature}" \\`);
    console.log(`    -d '${payload}'`);
}

// Check requirements
if (typeof WebSocket === 'undefined') {
    console.log('❌ WebSocket not available - installing ws package...');
    process.exit(1);
}

if (typeof fetch === 'undefined') {
    console.log('❌ This script requires Node.js 18+ for fetch API support');
    console.log('Current Node.js version:', process.version);
    process.exit(1);
}

// Run tests
testWebSocketNotifications()
    .then(async (results) => {
        await generateWebSocketTestCommands();
        
        if (results) {
            const success = results.connectionSuccess && results.deploymentMessages > 0;
            console.log(`\n🎯 Overall test result: ${success ? 'SUCCESS' : 'PARTIAL SUCCESS'}`);
            process.exit(success ? 0 : 1);
        } else {
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('💥 Unexpected error:', error);
        process.exit(1);
    });