/**
 * Webhook Validation Test Suite
 * Tests for Zod-based payload validation and security validation
 */

import { describe, it, expect } from 'vitest';
import {
  WebhookValidator,
  ValidationErrorSchema,
} from '../webhookValidation';

describe('WebhookValidation', () => {
  describe('Webhook Payload Schema Validation', () => {
    it('should validate a basic valid payload', () => {
      const validPayload = {
        type: 'Text',
        message: 'Hello, this is a test message',
        sessionId: 'session_123',
        source: 'webapp',
        chatId: 1,
        timestamp: new Date().toISOString(),
        selected_tools: [],
      };

      const result = WebhookValidator.validatePayload(validPayload);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('Text');
        expect(result.data.message).toBe('Hello, this is a test message');
        expect(result.data.sessionId).toBe('session_123');
        expect(result.data.chatId).toBe(1);
        expect(result.data.selected_tools).toEqual([]);
      }
    });

    it('should validate payload with all optional fields', () => {
      const fullPayload = {
        type: 'Voice',
        message: 'Voice message content',
        sessionId: 'session_456',
        source: 'mobile_app',
        chatId: 42,
        timestamp: '2024-01-15T10:30:00.000Z',
        requestId: 'req_789',
        UUID: '550e8400-e29b-41d4-a716-446655440000',
        selected_tools: ['web_search', 'file_analysis'],
      };

      const result = WebhookValidator.validatePayload(fullPayload);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('Voice');
        expect(result.data.requestId).toBe('req_789');
        expect(result.data.UUID).toBe('550e8400-e29b-41d4-a716-446655440000');
        expect(result.data.selected_tools).toEqual([
          'web_search',
          'file_analysis',
        ]);
      }
    });

    it('should reject payload with missing required fields', () => {
      const invalidPayload = {
        type: 'Text',
        message: 'Missing sessionId and chatId',
        // Missing sessionId, chatId, timestamp
      };

      const result = WebhookValidator.validatePayload(invalidPayload);

      expect(result.success).toBe(false);
      if (!result.success) {
        console.log('Validation errors:', result.error.validation_errors);
        expect(result.error.validation_errors.length).toBeGreaterThan(0);
        expect(
          result.error.validation_errors.some(e => e.field === 'sessionId')
        ).toBe(true);
        expect(
          result.error.validation_errors.some(e => e.field === 'chatId')
        ).toBe(true);
        expect(
          result.error.validation_errors.some(e => e.field === 'timestamp')
        ).toBe(true);
      }
    });

    it('should reject payload with invalid field types', () => {
      const invalidPayload = {
        type: 'InvalidType', // Invalid enum value
        message: 123, // Should be string
        sessionId: '', // Empty string not allowed
        source: 'webapp',
        chatId: 'not_a_number', // Should be number
        timestamp: 'invalid_date_format',
        selected_tools: ['invalid_tool'], // Invalid tool ID
      };

      const result = WebhookValidator.validatePayload(invalidPayload);

      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.validation_errors;
        expect(errors.some(e => e.field === 'type')).toBe(true);
        expect(errors.some(e => e.field === 'message')).toBe(true);
        expect(errors.some(e => e.field === 'sessionId')).toBe(true);
        expect(errors.some(e => e.field === 'chatId')).toBe(true);
        expect(errors.some(e => e.field === 'timestamp')).toBe(true);
        expect(errors.some(e => e.field === 'selected_tools.0')).toBe(true);
      }
    });

    it('should reject payload with extra unknown fields', () => {
      const payloadWithExtra = {
        type: 'Text',
        message: 'Valid message',
        sessionId: 'session_123',
        source: 'webapp',
        chatId: 1,
        timestamp: new Date().toISOString(),
        selected_tools: [],
        unknownField: 'should be rejected',
        anotherExtra: 123,
      };

      const result = WebhookValidator.validatePayload(payloadWithExtra);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.validation_errors.some(e =>
            e.message.includes('Unrecognized key')
          )
        ).toBe(true);
      }
    });

    it('should validate message length constraints', () => {
      // Test empty message
      const emptyMessage = {
        type: 'Text',
        message: '',
        sessionId: 'session_123',
        source: 'webapp',
        chatId: 1,
        timestamp: new Date().toISOString(),
        selected_tools: [],
      };

      let result = WebhookValidator.validatePayload(emptyMessage);
      expect(result.success).toBe(false);

      // Test very long message (over 10,000 characters)
      const longMessage = {
        type: 'Text',
        message: 'A'.repeat(10001),
        sessionId: 'session_123',
        source: 'webapp',
        chatId: 1,
        timestamp: new Date().toISOString(),
        selected_tools: [],
      };

      result = WebhookValidator.validatePayload(longMessage);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.validation_errors.some(e =>
            e.message.includes('exceeds maximum length')
          )
        ).toBe(true);
      }
    });

    it('should validate all supported message types', () => {
      const messageTypes = ['Text', 'Voice', 'Photo', 'Video', 'Document'];

      messageTypes.forEach(type => {
        const payload = {
          type,
          message: `Test ${type} message`,
          sessionId: 'session_123',
          source: 'webapp',
          chatId: 1,
          timestamp: new Date().toISOString(),
          selected_tools: [],
        };

        const result = WebhookValidator.validatePayload(payload);
        expect(result.success).toBe(true);
      });
    });

    it('should validate all supported tool IDs', () => {
      const validTools = [
        'web_search',
        'file_analysis',
        'code_review',
        'image_generation',
        'data_analysis',
        'task_automation',
      ];

      const payload = {
        type: 'Text',
        message: 'Test message with all tools',
        sessionId: 'session_123',
        source: 'webapp',
        chatId: 1,
        timestamp: new Date().toISOString(),
        selected_tools: validTools,
      };

      const result = WebhookValidator.validatePayload(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.selected_tools).toEqual(validTools);
      }
    });

    it('should validate UUID format strictly', () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000';
      const invalidUUIDs = [
        '550e8400-e29b-41d4-a716-44665544000', // Too short
        '550e8400-e29b-41d4-a716-446655440000a', // Too long
        '550e8400e29b41d4a716446655440000', // Missing hyphens
        'invalid-uuid-format-here',
        '123',
        '',
      ];

      // Test valid UUID
      const validPayload = {
        type: 'Text',
        message: 'Test message',
        sessionId: 'session_123',
        source: 'webapp',
        chatId: 1,
        timestamp: new Date().toISOString(),
        UUID: validUUID,
        selected_tools: [],
      };

      let result = WebhookValidator.validatePayload(validPayload);
      expect(result.success).toBe(true);

      // Test invalid UUIDs
      invalidUUIDs.forEach(invalidUUID => {
        const invalidPayload = {
          ...validPayload,
          UUID: invalidUUID,
        };

        result = WebhookValidator.validatePayload(invalidPayload);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(
            result.error.validation_errors.some(
              e =>
                e.field === 'UUID' && e.message.includes('Invalid UUID format')
            )
          ).toBe(true);
        }
      });
    });
  });

  describe('Enhanced Webhook Payload Schema Validation', () => {
    it('should validate enhanced payload with metadata', () => {
      const enhancedPayload = {
        type: 'Text',
        message: 'Enhanced test message',
        sessionId: 'session_123',
        source: 'webapp',
        chatId: 1,
        timestamp: new Date().toISOString(),
        selected_tools: ['web_search'],
        metadata: {
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          platform: 'web',
          tools_context: {
            user_selections: [
              {
                tool_id: 'web_search',
                tool_name: 'Web Search',
                enabled: true,
                priority: 1,
              },
            ],
            session_preferences: {
              auto_suggest: true,
              persist_selections: true,
              analytics_enabled: false,
            },
          },
        },
      };

      const result = WebhookValidator.validateEnhancedPayload(enhancedPayload);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.metadata?.user_agent).toBeDefined();
        expect(
          result.data.metadata?.tools_context?.user_selections
        ).toHaveLength(1);
        expect(
          result.data.metadata?.tools_context?.session_preferences?.auto_suggest
        ).toBe(true);
      }
    });

    it('should apply default values for optional metadata fields', () => {
      const minimalEnhanced = {
        type: 'Text',
        message: 'Minimal enhanced message',
        sessionId: 'session_123',
        source: 'webapp',
        chatId: 1,
        timestamp: new Date().toISOString(),
        metadata: {
          tools_context: {
            session_preferences: {
              // Only setting one field, others should get defaults
              analytics_enabled: false,
            },
          },
        },
      };

      const result = WebhookValidator.validateEnhancedPayload(minimalEnhanced);

      expect(result.success).toBe(true);
      if (result.success) {
        const prefs = result.data.metadata?.tools_context?.session_preferences;
        expect(prefs?.auto_suggest).toBe(true); // Default
        expect(prefs?.persist_selections).toBe(true); // Default
        expect(prefs?.analytics_enabled).toBe(false); // Explicitly set
      }
    });

    it('should validate tool selection metadata structure', () => {
      const invalidToolSelection = {
        type: 'Text',
        message: 'Test message',
        sessionId: 'session_123',
        source: 'webapp',
        chatId: 1,
        timestamp: new Date().toISOString(),
        metadata: {
          tools_context: {
            user_selections: [
              {
                tool_id: 'invalid_tool', // Invalid tool ID
                tool_name: 'Invalid Tool',
                enabled: 'yes', // Should be boolean
                priority: 0, // Should be 1-10
              },
            ],
          },
        },
      };

      const result =
        WebhookValidator.validateEnhancedPayload(invalidToolSelection);

      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.validation_errors;
        expect(errors.some(e => e.field.includes('tool_id'))).toBe(true);
        expect(errors.some(e => e.field.includes('enabled'))).toBe(true);
        expect(errors.some(e => e.field.includes('priority'))).toBe(true);
      }
    });
  });

  describe('Webhook Response Schema Validation', () => {
    it('should validate successful webhook response', () => {
      const successResponse = {
        success: true,
        response: 'This is a successful response from the AI',
        requestId: 'req_123456',
        processingTime: 250,
        metadata: {
          model_used: 'gpt-4',
          tokens_consumed: 150,
          tools_used: ['web_search'],
          processing_steps: [
            'input_validation',
            'ai_processing',
            'response_generation',
          ],
        },
      };

      const result = WebhookValidator.validateResponse(successResponse);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.success).toBe(true);
        expect(result.data.response).toBeDefined();
        expect(result.data.processingTime).toBe(250);
        expect(result.data.metadata?.model_used).toBe('gpt-4');
      }
    });

    it('should validate error webhook response', () => {
      const errorResponse = {
        success: false,
        error: 'AI service temporarily unavailable',
        requestId: 'req_789',
      };

      const result = WebhookValidator.validateResponse(errorResponse);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.success).toBe(false);
        expect(result.data.error).toBe('AI service temporarily unavailable');
      }
    });

    it('should reject response with invalid structure', () => {
      const invalidResponses = [
        // Missing success field
        { response: 'Missing success field' },
        // Wrong success type
        { success: 'true', response: 'Success should be boolean' },
        // Invalid processingTime
        { success: true, response: 'Test', processingTime: -5 },
        // Invalid metadata structure
        {
          success: true,
          response: 'Test',
          metadata: { tokens_consumed: 'not_a_number' },
        },
      ];

      invalidResponses.forEach(invalidResponse => {
        const result = WebhookValidator.validateResponse(invalidResponse);
        expect(result.success).toBe(false);
      });
    });

    it('should validate optional response fields', () => {
      const minimalResponse = {
        success: true,
      };

      const result = WebhookValidator.validateResponse(minimalResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('Health Check Response Schema Validation', () => {
    it('should validate healthy status response', () => {
      const healthyResponse = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: 86400,
        checks: {
          database: 'pass',
          n8n_connectivity: 'pass',
          webhook_endpoint: 'pass',
        },
      };

      const result = WebhookValidator.validateHealthCheck(healthyResponse);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('healthy');
        expect(result.data.uptime).toBe(86400);
        expect(result.data.checks?.database).toBe('pass');
      }
    });

    it('should validate degraded status response', () => {
      const degradedResponse = {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'pass',
          n8n_connectivity: 'fail',
          webhook_endpoint: 'pass',
        },
      };

      const result = WebhookValidator.validateHealthCheck(degradedResponse);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('degraded');
        expect(result.data.checks?.n8n_connectivity).toBe('fail');
      }
    });

    it('should reject invalid health status values', () => {
      const invalidStatus = {
        status: 'unknown_status', // Not in enum
        timestamp: new Date().toISOString(),
      };

      const result = WebhookValidator.validateHealthCheck(invalidStatus);
      expect(result.success).toBe(false);
    });

    it('should validate minimal health check response', () => {
      const minimalResponse = {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      };

      const result = WebhookValidator.validateHealthCheck(minimalResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('Validation Error Schema', () => {
    it('should create properly structured validation errors', () => {
      const invalidPayload = {
        type: 'InvalidType',
        message: '',
        // Missing required fields
      };

      const result = WebhookValidator.validatePayload(invalidPayload);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.success).toBe(false);
        expect(result.error.error).toBeDefined();
        expect(Array.isArray(result.error.validation_errors)).toBe(true);
        expect(result.error.timestamp).toBeDefined();

        // Validate that the validation error itself is valid
        const errorValidation = ValidationErrorSchema.safeParse(result.error);
        expect(errorValidation.success).toBe(true);
      }
    });
  });

  describe('WebhookValidator Utility Methods', () => {
    it('should create validated payload with createValidatedPayload', () => {
      const payload = WebhookValidator.createValidatedPayload(
        'Test message',
        'session_123',
        42,
        ['web_search'],
        'Text'
      );

      expect(payload.message).toBe('Test message');
      expect(payload.sessionId).toBe('session_123');
      expect(payload.chatId).toBe(42);
      expect(payload.selected_tools).toEqual(['web_search']);
      expect(payload.type).toBe('Text');
      expect(payload.source).toBe('webapp');
      expect(payload.timestamp).toBeDefined();
    });

    it('should throw error for invalid payload construction', () => {
      expect(() => {
        WebhookValidator.createValidatedPayload(
          '', // Empty message not allowed
          'session_123',
          42
        );
      }).toThrow('Invalid payload construction');
    });

    it('should provide validation summary', () => {
      const validPayload = {
        type: 'Text',
        message: 'Valid message',
        sessionId: 'session_123',
        source: 'webapp',
        chatId: 1,
        timestamp: new Date().toISOString(),
        selected_tools: [],
      };

      const summary = WebhookValidator.getValidationSummary(validPayload);

      expect(summary.isValid).toBe(true);
      expect(summary.fieldCount).toBeGreaterThan(0);
      expect(summary.missingRequired).toEqual([]);
      expect(summary.invalidFields).toEqual([]);
      expect(summary.extraFields).toEqual([]);
    });

    it('should provide detailed validation summary for invalid payload', () => {
      const invalidPayload = {
        type: 'Text',
        message: 'Valid message',
        // Missing sessionId, chatId, timestamp
        extraField: 'should not be here',
      };

      const summary = WebhookValidator.getValidationSummary(invalidPayload);

      expect(summary.isValid).toBe(false);
      expect(summary.missingRequired.length).toBeGreaterThan(0);
      expect(summary.extraFields).toContain('extraField');
    });

    it('should handle edge cases in validation summary', () => {
      // Test with null/undefined
      const nullSummary = WebhookValidator.getValidationSummary(null);
      expect(nullSummary.isValid).toBe(false);

      const undefinedSummary = WebhookValidator.getValidationSummary(undefined);
      expect(undefinedSummary.isValid).toBe(false);

      // Test with empty object
      const emptySummary = WebhookValidator.getValidationSummary({});
      expect(emptySummary.isValid).toBe(false);
      expect(emptySummary.fieldCount).toBe(0);
    });
  });

  describe('Schema Integration Tests', () => {
    it('should work with real-world payload example', () => {
      const realWorldPayload = {
        type: 'Text',
        message:
          'Can you help me analyze this document and search for recent research on machine learning?',
        sessionId: 'user_session_2024_01_15_10_30',
        source: 'webapp',
        chatId: 1,
        timestamp: '2024-01-15T10:30:00.000Z',
        requestId: 'req_1705316200_abc123',
        selected_tools: ['file_analysis', 'web_search'],
        metadata: {
          user_agent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          platform: 'web',
          tools_context: {
            user_selections: [
              {
                tool_id: 'file_analysis',
                tool_name: 'File Analysis',
                enabled: true,
                priority: 1,
              },
              {
                tool_id: 'web_search',
                tool_name: 'Web Search',
                enabled: true,
                priority: 2,
              },
            ],
            session_preferences: {
              auto_suggest: true,
              persist_selections: true,
              analytics_enabled: true,
            },
          },
        },
      };

      // Create a basic payload without metadata for basic validation
      const { metadata, ...basicPayload } = realWorldPayload;
      // metadata is intentionally unused - we just extract it to create basicPayload
      void metadata;
      
      // Test basic validation (without metadata)
      const basicResult = WebhookValidator.validatePayload(basicPayload);
      expect(basicResult.success).toBe(true);

      // Test enhanced validation (with metadata)
      const enhancedResult =
        WebhookValidator.validateEnhancedPayload(realWorldPayload);
      expect(enhancedResult.success).toBe(true);
    });

    it('should handle complex validation error scenarios', () => {
      const complexInvalidPayload = {
        type: 'InvalidType',
        message: '', // Too short
        sessionId: '', // Too short
        source: '', // Too short
        chatId: -1, // Invalid (not positive)
        timestamp: 'not-a-date',
        UUID: 'not-a-uuid',
        selected_tools: ['invalid_tool_1', 'invalid_tool_2'],
        extraField1: 'not allowed',
        extraField2: 123,
      };

      const result = WebhookValidator.validatePayload(complexInvalidPayload);

      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.validation_errors;

        // Should have errors for each invalid field
        expect(errors.length).toBeGreaterThan(5);

        // Check specific error types
        expect(errors.some(e => e.field === 'type')).toBe(true);
        expect(errors.some(e => e.field === 'message')).toBe(true);
        expect(errors.some(e => e.field === 'chatId')).toBe(true);
        expect(errors.some(e => e.field === 'timestamp')).toBe(true);
        expect(errors.some(e => e.field === 'UUID')).toBe(true);
        expect(errors.some(e => e.field.includes('selected_tools'))).toBe(true);
      }
    });
  });
});
