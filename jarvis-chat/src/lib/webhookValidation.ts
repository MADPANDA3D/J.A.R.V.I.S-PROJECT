/**
 * Webhook Payload Validation with Zod Schemas
 * Provides runtime type safety and validation for n8n webhook integration
 */

import { z } from 'zod';

// Base schemas for common types
const UUIDSchema = z.string().uuid('Invalid UUID format');
const TimestampSchema = z.string().datetime('Invalid timestamp format');

// Message type validation
const MessageTypeSchema = z.enum(
  ['Text', 'Voice', 'Photo', 'Video', 'Document'],
  {
    errorMap: () => ({
      message:
        'Message type must be one of: Text, Voice, Photo, Video, Document',
    }),
  }
);

// Tools validation
const ToolIdSchema = z.enum(
  [
    'web_search',
    'file_analysis',
    'code_review',
    'image_generation',
    'data_analysis',
    'task_automation',
  ],
  {
    errorMap: () => ({ message: 'Invalid tool ID provided' }),
  }
);

const SelectedToolsSchema = z.array(ToolIdSchema).optional().default([]);

// Main webhook payload schema
export const WebhookPayloadSchema = z
  .object({
    type: MessageTypeSchema,
    message: z
      .string()
      .min(1, 'Message cannot be empty')
      .max(10000, 'Message exceeds maximum length of 10,000 characters'),
    sessionId: z
      .string()
      .min(1, 'Session ID is required')
      .max(100, 'Session ID too long'),
    source: z.string().min(1, 'Source is required'),
    chatId: z
      .number()
      .int('Chat ID must be an integer')
      .positive('Chat ID must be positive'),
    timestamp: TimestampSchema,
    requestId: z.string().optional(),
    UUID: UUIDSchema.optional(),
    selected_tools: SelectedToolsSchema,
  })
  .strict(); // Reject unknown properties

// Enhanced payload schema with metadata
export const EnhancedWebhookPayloadSchema = WebhookPayloadSchema.extend({
  metadata: z
    .object({
      user_agent: z.string().optional(),
      platform: z.string().optional(),
      tools_context: z
        .object({
          user_selections: z
            .array(
              z.object({
                tool_id: ToolIdSchema,
                tool_name: z.string(),
                enabled: z.boolean(),
                priority: z.number().int().min(1).max(10).optional(),
              })
            )
            .optional(),
          session_preferences: z
            .object({
              auto_suggest: z.boolean().default(true),
              persist_selections: z.boolean().default(true),
              analytics_enabled: z.boolean().default(true),
            })
            .optional(),
        })
        .optional(),
    })
    .optional(),
});

// Webhook response schema
export const WebhookResponseSchema = z
  .object({
    success: z.boolean(),
    response: z.string().optional(),
    agent_message: z.string().optional(),
    message_id: UUIDSchema.optional(),
    error: z.string().optional(),
    requestId: z.string().optional(),
    processingTime: z.number().positive().optional(),
    metadata: z
      .object({
        model_used: z.string().optional(),
        tokens_consumed: z.number().int().positive().optional(),
        tools_used: z.array(ToolIdSchema).optional(),
        processing_steps: z.array(z.string()).optional(),
      })
      .optional(),
  })
  .strict();

// Health check response schema
export const HealthCheckResponseSchema = z
  .object({
    status: z.enum(['healthy', 'degraded', 'unhealthy']),
    timestamp: TimestampSchema,
    version: z.string().optional(),
    uptime: z.number().positive().optional(),
    checks: z
      .object({
        database: z.enum(['pass', 'fail']).optional(),
        n8n_connectivity: z.enum(['pass', 'fail']).optional(),
        webhook_endpoint: z.enum(['pass', 'fail']).optional(),
      })
      .optional(),
  })
  .strict();

// Error response schema for validation failures
export const ValidationErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  validation_errors: z.array(
    z.object({
      field: z.string(),
      message: z.string(),
      received: z.unknown().optional(),
    })
  ),
  timestamp: TimestampSchema,
});

// Type exports for TypeScript
export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>;
export type EnhancedWebhookPayload = z.infer<
  typeof EnhancedWebhookPayloadSchema
>;
export type WebhookResponse = z.infer<typeof WebhookResponseSchema>;
export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;
export type ValidationError = z.infer<typeof ValidationErrorSchema>;

/**
 * Validation utility class with enhanced error handling
 */
export class WebhookValidator {
  /**
   * Validate webhook payload with detailed error reporting
   */
  static validatePayload(data: unknown):
    | {
        success: true;
        data: WebhookPayload;
      }
    | {
        success: false;
        error: ValidationError;
      } {
    try {
      const validatedData = WebhookPayloadSchema.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError: ValidationError = {
          success: false,
          error: 'Webhook payload validation failed',
          validation_errors: (error.errors || []).map(err => ({
            field: (err.path || []).join('.'),
            message: err.message || 'Validation error',
            received: (err.path || []).reduce(
              (obj: any, key) => obj?.[key],
              data
            ),
          })),
          timestamp: new Date().toISOString(),
        };
        return { success: false, error: validationError };
      }

      // Unexpected error
      const validationError: ValidationError = {
        success: false,
        error: 'Unexpected validation error',
        validation_errors: [
          {
            field: 'unknown',
            message:
              error instanceof Error ? error.message : 'Unknown error occurred',
          },
        ],
        timestamp: new Date().toISOString(),
      };
      return { success: false, error: validationError };
    }
  }

  /**
   * Validate enhanced webhook payload with metadata
   */
  static validateEnhancedPayload(data: unknown):
    | {
        success: true;
        data: EnhancedWebhookPayload;
      }
    | {
        success: false;
        error: ValidationError;
      } {
    try {
      const validatedData = EnhancedWebhookPayloadSchema.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError: ValidationError = {
          success: false,
          error: 'Enhanced webhook payload validation failed',
          validation_errors: (error.errors || []).map(err => ({
            field: (err.path || []).join('.'),
            message: err.message || 'Validation error',
            received: (err.path || []).reduce(
              (obj: any, key) => obj?.[key],
              data
            ),
          })),
          timestamp: new Date().toISOString(),
        };
        return { success: false, error: validationError };
      }

      const validationError: ValidationError = {
        success: false,
        error: 'Unexpected enhanced validation error',
        validation_errors: [
          {
            field: 'unknown',
            message:
              error instanceof Error ? error.message : 'Unknown error occurred',
          },
        ],
        timestamp: new Date().toISOString(),
      };
      return { success: false, error: validationError };
    }
  }

  /**
   * Validate webhook response
   */
  static validateResponse(data: unknown):
    | {
        success: true;
        data: WebhookResponse;
      }
    | {
        success: false;
        error: ValidationError;
      } {
    try {
      const validatedData = WebhookResponseSchema.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError: ValidationError = {
          success: false,
          error: 'Webhook response validation failed',
          validation_errors: (error.errors || []).map(err => ({
            field: (err.path || []).join('.'),
            message: err.message || 'Validation error',
            received: (err.path || []).reduce(
              (obj: any, key) => obj?.[key],
              data
            ),
          })),
          timestamp: new Date().toISOString(),
        };
        return { success: false, error: validationError };
      }

      const validationError: ValidationError = {
        success: false,
        error: 'Unexpected response validation error',
        validation_errors: [
          {
            field: 'unknown',
            message:
              error instanceof Error ? error.message : 'Unknown error occurred',
          },
        ],
        timestamp: new Date().toISOString(),
      };
      return { success: false, error: validationError };
    }
  }

  /**
   * Validate health check response
   */
  static validateHealthCheck(data: unknown):
    | {
        success: true;
        data: HealthCheckResponse;
      }
    | {
        success: false;
        error: ValidationError;
      } {
    try {
      const validatedData = HealthCheckResponseSchema.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError: ValidationError = {
          success: false,
          error: 'Health check response validation failed',
          validation_errors: (error.errors || []).map(err => ({
            field: (err.path || []).join('.'),
            message: err.message || 'Validation error',
            received: (err.path || []).reduce(
              (obj: any, key) => obj?.[key],
              data
            ),
          })),
          timestamp: new Date().toISOString(),
        };
        return { success: false, error: validationError };
      }

      const validationError: ValidationError = {
        success: false,
        error: 'Unexpected health check validation error',
        validation_errors: [
          {
            field: 'unknown',
            message:
              error instanceof Error ? error.message : 'Unknown error occurred',
          },
        ],
        timestamp: new Date().toISOString(),
      };
      return { success: false, error: validationError };
    }
  }

  /**
   * Safe payload transformation with validation
   */
  static createValidatedPayload(
    message: string,
    sessionId: string,
    chatId: number,
    selectedTools?: string[],
    messageType: 'Text' | 'Voice' | 'Photo' | 'Video' | 'Document' = 'Text'
  ): WebhookPayload {
    const payload = {
      type: messageType,
      message,
      sessionId,
      source: 'webapp',
      chatId,
      timestamp: new Date().toISOString(),
      selected_tools: selectedTools || [],
    };

    const validation = this.validatePayload(payload);
    if (!validation.success) {
      throw new Error(
        `Invalid payload construction: ${validation.error.error}`
      );
    }

    return validation.data;
  }

  /**
   * Get validation summary for debugging
   */
  static getValidationSummary(data: unknown): {
    isValid: boolean;
    fieldCount: number;
    missingRequired: string[];
    invalidFields: string[];
    extraFields: string[];
  } {
    try {
      WebhookPayloadSchema.parse(data);
      return {
        isValid: true,
        fieldCount: Object.keys(data as object).length,
        missingRequired: [],
        invalidFields: [],
        extraFields: [],
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const missingRequired: string[] = [];
        const invalidFields: string[] = [];
        const extraFields: string[] = [];

        (error.errors || []).forEach(err => {
          if (err.code === 'invalid_type' && err.received === 'undefined') {
            missingRequired.push((err.path || []).join('.'));
          } else if (err.code === 'unrecognized_keys') {
            extraFields.push(...(err.keys || []));
          } else {
            invalidFields.push((err.path || []).join('.'));
          }
        });

        return {
          isValid: false,
          fieldCount: Object.keys((data as object) || {}).length,
          missingRequired,
          invalidFields,
          extraFields,
        };
      }

      return {
        isValid: false,
        fieldCount: 0,
        missingRequired: ['unknown'],
        invalidFields: [],
        extraFields: [],
      };
    }
  }
}
