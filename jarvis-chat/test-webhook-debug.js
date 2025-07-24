/**
 * Enhanced Webhook Debug Script
 * Provides detailed debugging for webhook responses
 */

const webhookUrl =
  'https://n8n.madpanda3d.com/webhook/4bed7e4e-041a-4f19-b736-d320250a50ca';

async function debugWebhook() {
  console.log('🔍 ENHANCED WEBHOOK DEBUG');
  console.log('='.repeat(50));
  console.log(`📡 Webhook URL: ${webhookUrl}`);
  console.log('');

  const testMessage = {
    message: 'Hello! This is a debug test message from JARVIS Chat.',
    userId: 'debug_user_' + Date.now(),
    timestamp: new Date().toISOString(),
    conversationId: 'debug_conversation_001',
    requestId: 'req_' + Date.now() + '_debug',
    clientVersion: '1.0.0',
    metadata: {
      source: 'debug_test',
      testType: 'response_debugging',
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
        'User-Agent': 'JARVIS-Debug/1.0',
      },
      body: JSON.stringify(testMessage),
    });

    const responseTime = Date.now() - startTime;

    console.log(`⚡ Response received in ${responseTime}ms`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`📋 Content-Type: ${response.headers.get('content-type')}`);
    console.log(`📏 Content-Length: ${response.headers.get('content-length')}`);
    console.log(
      `🔀 Transfer-Encoding: ${response.headers.get('transfer-encoding')}`
    );
    console.log('');

    // Get the raw response text first
    const responseText = await response.text();
    console.log(`📝 Raw response body (${responseText.length} chars):`);
    console.log('---');
    console.log(responseText || '(empty response)');
    console.log('---');
    console.log('');

    if (response.ok) {
      if (responseText.trim() === '') {
        console.log('❌ ISSUE DETECTED: Empty Response Body');
        console.log('');
        console.log('🔧 POSSIBLE CAUSES:');
        console.log('   1. Your n8n workflow is not returning a response');
        console.log('   2. The "Respond to Webhook" node is missing');
        console.log(
          "   3. The workflow execution path doesn't reach the response node"
        );
        console.log('   4. The response node is not configured properly');
        console.log('');
        console.log('💡 SOLUTIONS:');
        console.log(
          '   1. Add a "Respond to Webhook" node at the end of your workflow'
        );
        console.log('   2. Configure it to return:');
        console.log('      {');
        console.log('        "response": "Your AI response here",');
        console.log('        "success": true');
        console.log('      }');
        console.log('   3. Check n8n execution logs for errors');
        console.log('   4. Ensure all nodes are connected properly');
      } else {
        try {
          const data = JSON.parse(responseText);
          console.log('✅ SUCCESS! Valid JSON response received:');
          console.log(JSON.stringify(data, null, 2));

          // Validate JARVIS expected format
          if (data.success && data.response) {
            console.log('');
            console.log(
              '🎉 PERFECT! Response format matches JARVIS expectations'
            );
            console.log(`   AI Response: "${data.response}"`);
          } else {
            console.log('');
            console.log('⚠️  Response received but format needs adjustment');
            console.log('   Expected: { success: true, response: "message" }');
            console.log('   Received:', Object.keys(data));
          }
        } catch (parseError) {
          console.log('❌ ISSUE: Response is not valid JSON');
          console.log(`   Parse error: ${parseError.message}`);
          console.log('   This might be HTML error page or plain text');
        }
      }
    } else {
      console.log('❌ HTTP ERROR Response:');
      if (responseText) {
        try {
          const errorData = JSON.parse(responseText);
          console.log('   Error details:', errorData);
        } catch {
          console.log('   Error text:', responseText);
        }
      }
    }

    // Test with a simpler payload
    console.log('');
    console.log('🔄 Testing with minimal payload...');

    const simplePayload = {
      message: 'test',
      userId: 'simple_test',
    };

    const simpleResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(simplePayload),
    });

    const simpleText = await simpleResponse.text();
    console.log(`   Simple test status: ${simpleResponse.status}`);
    console.log(`   Simple test response: ${simpleText || '(empty)'}`);
  } catch (error) {
    console.log('❌ NETWORK ERROR:');
    console.log(`   Error: ${error.message}`);
    console.log(`   Type: ${error.constructor.name}`);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Check your internet connection');
    console.log('   2. Verify the webhook URL is accessible');
    console.log('   3. Check if n8n server is running');
    console.log('   4. Look for CORS issues in browser console');
  }

  console.log('');
  console.log('='.repeat(50));
  console.log('Debug completed');
  console.log('');
  console.log('Next steps:');
  console.log('1. Check your n8n workflow execution logs');
  console.log('2. Ensure you have a "Respond to Webhook" node');
  console.log('3. Verify the response format matches JARVIS expectations');
}

// Run the debug
debugWebhook().catch(console.error);
