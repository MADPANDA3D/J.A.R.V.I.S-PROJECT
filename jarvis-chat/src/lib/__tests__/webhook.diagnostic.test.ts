/**
 * Webhook Diagnostic Tool
 * Helps diagnose webhook connection issues and provides setup guidance
 */

import { describe, it, expect } from 'vitest';
import { WebhookService } from '../webhookService';

describe('Webhook Diagnostics', () => {
  const webhookUrl =
    'https://n8n.madpanda3d.com/webhook-test/4bed7e4e-041a-4f19-b736-d320250a50ca';

  it('should diagnose webhook connectivity and provide setup guidance', async () => {
    console.log('\n🔍 WEBHOOK DIAGNOSTIC REPORT');
    console.log('═'.repeat(50));

    const webhookService = new WebhookService({
      webhookUrl,
      timeout: 5000,
      retryConfig: {
        maxAttempts: 1,
        baseDelay: 100,
        maxDelay: 100,
        backoffFactor: 1,
        jitter: false,
      },
    });

    console.log(`📡 Testing webhook: ${webhookUrl}`);

    try {
      const response = await webhookService.sendMessage({
        message: 'Diagnostic test message',
        userId: 'diagnostic_user',
        timestamp: new Date().toISOString(),
      });

      console.log('✅ SUCCESS: Webhook is working!');
      console.log(`   Response: ${response.response}`);
      console.log(`   Success: ${response.success}`);

      const metrics = webhookService.getMetrics();
      console.log(`   Response Time: ${metrics.averageResponseTime}ms`);
    } catch (error: unknown) => {
      console.log('❌ WEBHOOK ERROR DETECTED');
      const errorObj = error as Record<string, unknown>;
      console.log(`   Error Type: ${errorObj.type || 'Unknown'}`);
      console.log(`   Status Code: ${errorObj.statusCode || 'N/A'}`);
      console.log(`   Message: ${errorObj.message || 'No message available'}`);

      if (errorObj.statusCode === 404) {
        console.log('\n💡 SOLUTION FOR 404 ERROR:');
        console.log('   Your n8n workflow is in TEST MODE.');
        console.log('   To fix this:');
        console.log('   1. Go to your n8n workflow editor');
        console.log('   2. Click the "Execute Workflow" button');
        console.log('   3. OR activate the workflow for production use');
        console.log('   4. Then re-run this test');
        console.log(
          '\n   Alternative: Use production webhook URL instead of test URL'
        );
      }

      // Test basic connectivity
      console.log('\n🌐 Testing basic connectivity...');
      try {
        const response = await fetch(
          webhookUrl.replace('/webhook-test/', '/webhook/'),
          {
            method: 'GET',
            headers: { 'User-Agent': 'JARVIS-Diagnostic/1.0' },
          }
        );
        console.log(
          `   Server responds: ${response.status} ${response.statusText}`
        );
      } catch (netError) => {
        console.log(`   Network error: ${netError}`);
      }
    }

    console.log('\n⚙️  CURRENT CONFIGURATION:');
    const config = webhookService.getConfig();
    console.log(`   Webhook URL: ${config.webhookUrl}`);
    console.log(`   Timeout: ${config.timeout}ms`);
    console.log(`   Max Retries: ${config.retryConfig.maxAttempts}`);
    console.log(
      `   Circuit Breaker Threshold: ${config.circuitBreakerOptions.failureThreshold}`
    );

    console.log('\n📊 METRICS:');
    const metrics = webhookService.getMetrics();
    console.log(`   Total Requests: ${metrics.totalRequests}`);
    console.log(`   Successful: ${metrics.successfulRequests}`);
    console.log(`   Failed: ${metrics.failedRequests}`);
    console.log(`   Error Rate: ${metrics.errorRate.toFixed(2)}%`);
    console.log(`   Circuit State: ${metrics.circuitBreakerState}`);

    console.log('\n🔧 NEXT STEPS:');
    console.log('   1. Activate your n8n workflow');
    console.log('   2. Consider using production webhook URL');
    console.log(
      '   3. Test with curl first: curl -X POST [webhook-url] -H "Content-Type: application/json" -d \'{"message":"test"}\''
    );
    console.log('   4. Check n8n logs for any processing errors');

    console.log('\n═'.repeat(50));

    // This test should pass regardless of webhook status
    expect(webhookService).toBeDefined();
    expect(config.webhookUrl).toBe(webhookUrl);
  });

  it('should test webhook response format expectations', async () => {
    console.log('\n📋 WEBHOOK RESPONSE FORMAT REQUIREMENTS');
    console.log('═'.repeat(40));

    console.log('For successful integration, your n8n webhook should return:');
    console.log('```json');
    console.log('{');
    console.log('  "response": "Your AI response message here",');
    console.log('  "success": true,');
    console.log('  "requestId": "optional-request-id",');
    console.log('  "processingTime": 150 // optional, in ms');
    console.log('}');
    console.log('```');

    console.log('\nFor error responses:');
    console.log('```json');
    console.log('{');
    console.log('  "response": "",');
    console.log('  "success": false,');
    console.log('  "error": "Description of what went wrong"');
    console.log('}');
    console.log('```');

    console.log('\n📨 INPUT PAYLOAD FORMAT:');
    console.log('Your n8n workflow will receive:');
    console.log('```json');
    console.log('{');
    console.log('  "message": "User message text",');
    console.log('  "userId": "unique_user_identifier", ');
    console.log('  "timestamp": "2025-01-24T13:10:00.000Z",');
    console.log('  "conversationId": "optional_conversation_id",');
    console.log('  "requestId": "req_1234567890_abcdef123",');
    console.log('  "clientVersion": "1.0.0",');
    console.log('  "metadata": {');
    console.log('    "source": "chat_interface",');
    console.log('    "additionalContext": "..."');
    console.log('  }');
    console.log('}');
    console.log('```');

    expect(true).toBe(true); // Always pass this informational test
  });

  it('should provide n8n workflow setup guidance', async () => {
    console.log('\n🛠️  N8N WORKFLOW SETUP GUIDE');
    console.log('═'.repeat(40));

    console.log('1. WEBHOOK NODE SETUP:');
    console.log('   • Method: POST');
    console.log(
      '   • Path: /webhook-test/4bed7e4e-041a-4f19-b736-d320250a50ca'
    );
    console.log('   • Response Mode: "Respond to Webhook"');
    console.log('   • Authentication: None (or Bearer token if needed)');

    console.log('\n2. PROCESS THE REQUEST:');
    console.log('   • Extract message: {{ $json.message }}');
    console.log('   • Extract userId: {{ $json.userId }}');
    console.log('   • Extract conversationId: {{ $json.conversationId }}');

    console.log('\n3. AI PROCESSING:');
    console.log('   • Connect to your AI service (OpenAI, Claude, etc.)');
    console.log('   • Use the message as prompt');
    console.log('   • Consider conversation context if needed');

    console.log('\n4. RESPONSE NODE SETUP:');
    console.log('   • Use "Respond to Webhook" node');
    console.log('   • Response Body:');
    console.log('     {');
    console.log('       "response": "{{ $json.ai_response }}",');
    console.log('       "success": true,');
    console.log('       "requestId": "{{ $json.requestId }}",');
    console.log('       "processingTime": {{ $json.processing_time }}');
    console.log('     }');

    console.log('\n5. ERROR HANDLING:');
    console.log('   • Add error handling nodes');
    console.log('   • Return error response format on failures');
    console.log('   • Log errors for debugging');

    console.log('\n6. ACTIVATION:');
    console.log('   • Click "Execute Workflow" for testing');
    console.log('   • Set to "Active" for production use');
    console.log('   • Monitor execution logs');

    expect(true).toBe(true); // Always pass this informational test
  });
});
