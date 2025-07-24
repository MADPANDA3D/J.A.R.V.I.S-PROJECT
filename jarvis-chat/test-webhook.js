/**
 * Simple Webhook Test Script
 * Use this to test your n8n webhook once it's activated
 *
 * Usage: node test-webhook.js
 */

const webhookUrl =
  'https://n8n.madpanda3d.com/webhook/4bed7e4e-041a-4f19-b736-d320250a50ca';

async function testWebhook() {
  console.log('🚀 Testing JARVIS n8n Webhook Integration');
  console.log('='.repeat(50));
  console.log(`📡 Webhook URL: ${webhookUrl}`);
  console.log('');

  const testMessage = {
    message:
      'Hello! This is a test message from JARVIS Chat. Please respond with a friendly greeting.',
    userId: 'test_user_' + Date.now(),
    timestamp: new Date().toISOString(),
    conversationId: 'test_conversation_001',
    requestId:
      'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    clientVersion: '1.0.0',
    metadata: {
      source: 'manual_test',
      testType: 'basic_functionality',
    },
  };

  console.log('📨 Sending test payload:');
  console.log(JSON.stringify(testMessage, null, 2));
  console.log('');

  try {
    console.log('⏳ Sending request...');
    const startTime = Date.now();

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'JARVIS-Chat/1.0',
      },
      body: JSON.stringify(testMessage),
    });

    const responseTime = Date.now() - startTime;

    console.log(`⚡ Response received in ${responseTime}ms`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS! Webhook response:');
      console.log(JSON.stringify(data, null, 2));

      // Validate response format
      if (data.success && data.response) {
        console.log('');
        console.log('🎉 WEBHOOK INTEGRATION WORKING PERFECTLY!');
        console.log(`   AI Response: "${data.response}"`);
        console.log(`   Response Time: ${responseTime}ms`);
        console.log(`   Request ID: ${data.requestId || 'not provided'}`);
      } else {
        console.log('');
        console.log('⚠️  Warning: Response format might need adjustment');
        console.log('   Expected: { success: true, response: "message" }');
      }
    } else {
      const errorText = await response.text();
      console.log('❌ ERROR Response:');
      console.log(errorText);

      try {
        const errorData = JSON.parse(errorText);
        if (
          errorData.code === 404 &&
          errorData.message.includes('not registered')
        ) {
          console.log('');
          console.log('💡 SOLUTION:');
          console.log('   1. Go to your n8n workflow');
          console.log('   2. Click "Execute Workflow" button');
          console.log('   3. Or set the workflow to "Active"');
          console.log('   4. Then run this test again');
        }
      } catch {
        // Error text wasn't JSON
      }
    }
  } catch (error) {
    console.log('❌ NETWORK ERROR:');
    console.log(error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Check your internet connection');
    console.log('   2. Verify the webhook URL is correct');
    console.log('   3. Ensure n8n server is running');
  }

  console.log('');
  console.log('='.repeat(50));
  console.log('Test completed');
}

// Run the test
testWebhook().catch(console.error);
