/**
 * Mock n8n Server for Testing
 * Provides realistic webhook response simulation with configurable scenarios
 */

import { WebhookPayload, WebhookResponse } from './webhookService';

export interface MockServerConfig {
  baseLatency: number;
  latencyVariation: number;
  errorRate: number;
  timeoutRate: number;
  rateLimitRequests: number;
  rateLimitWindow: number;
}

export interface MockScenario {
  name: string;
  condition: (payload: WebhookPayload) => boolean;
  response: (payload: WebhookPayload) => Promise<WebhookResponse>;
  latency?: number;
  errorRate?: number;
}

export class MockN8nServer {
  private config: MockServerConfig;
  private requestCounts: Map<string, { count: number; windowStart: number }> =
    new Map();
  private scenarios: MockScenario[] = [];
  private requestHistory: Array<{
    payload: WebhookPayload;
    response: WebhookResponse | Error;
    timestamp: Date;
    processingTime: number;
  }> = [];

  constructor(config: Partial<MockServerConfig> = {}) {
    this.config = {
      baseLatency: 100,
      latencyVariation: 50,
      errorRate: 0.05, // 5% error rate
      timeoutRate: 0.01, // 1% timeout rate
      rateLimitRequests: 100,
      rateLimitWindow: 60000, // 1 minute
      ...config,
    };

    this.setupDefaultScenarios();
  }

  /**
   * Process webhook request with realistic simulation
   */
  async processWebhook(payload: WebhookPayload): Promise<WebhookResponse>  {
    const startTime = Date.now();

    try {
      // Check for health check requests
      if (payload.message === '__health_check__') {
        return this.createHealthCheckResponse();
      }

      // Check rate limiting
      if (this.isRateLimited(payload.userId)) {
        throw new Error('Rate limit exceeded');
      }

      // Find matching scenario
      const scenario = this.scenarios.find(s => s.condition(payload));
      if (scenario) {
        const response = await this.executeScenario(scenario, payload);
        this.recordRequest(payload, response, Date.now() - startTime);
        return response;
      }

      // Default processing
      const response = await this.processDefaultRequest(payload);
      this.recordRequest(payload, response, Date.now() - startTime);
      return response;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.recordRequest(payload, error as Error, processingTime);
      throw error;
    }
  }

  /**
   * Add custom scenario for testing
   */
  addScenario(scenario: MockScenario): void {
    this.scenarios.push(scenario);
  }

  /**
   * Remove all custom scenarios
   */
  clearScenarios(): void {
    this.scenarios = [];
    this.setupDefaultScenarios();
  }

  /**
   * Get request history for analysis
   */
  getRequestHistory(): typeof this.requestHistory {
    return [...this.requestHistory];
  }

  /**
   * Clear request history
   */
  clearHistory(): void {
    this.requestHistory = [];
    this.requestCounts.clear();
  }

  /**
   * Update server configuration
   */
  updateConfig(config: Partial<MockServerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): MockServerConfig {
    return { ...this.config };
  }

  /**
   * Simulate concurrent load
   */
  async simulateLoad(
    payloads: WebhookPayload[],
    concurrency: number = 10
  ): Promise< => {
    successes: number;
    failures: number;
    averageResponseTime: number;
  }> {
    const results: Array<{ success: boolean; responseTime: number }> = [];

    // Process payloads in chunks
    for (let i = 0; i < payloads.length; i += concurrency) {
      const chunk = payloads.slice(i, i + concurrency);

      const promises = chunk.map(async payload {
        const startTime = Date.now();
        try {
          await this.processWebhook(payload);
          return { success: true, responseTime: Date.now() - startTime };
        } catch () {
          return { success: false, responseTime: Date.now() - startTime };
        }
      });

      const chunkResults = await Promise.all(promises);
      results.push(...chunkResults);
    }

    const successes = results.filter(r => r.success).length;
    const failures = results.length - successes;
    const averageResponseTime =
      results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

    return { successes, failures, averageResponseTime };
  }

  // Private methods

  private setupDefaultScenarios(): void {
    // Error scenario for testing error handling
    this.scenarios.push({
      name: 'error-simulation',
      condition: payload => payload.message.includes('__simulate_error__'),
      response: async () {
        throw new Error('Simulated server error');
      },
    });

    // Timeout scenario
    this.scenarios.push({
      name: 'timeout-simulation',
      condition: payload => payload.message.includes('__simulate_timeout__'),
      response: async () {
        await this.sleep(10000); // 10 seconds - should trigger timeout
        return {
          response: 'This should not be reached',
          success: true,
        };
      },
    });

    // Slow response scenario
    this.scenarios.push({
      name: 'slow-response',
      condition: payload => payload.message.includes('__simulate_slow__'),
      response: async () {
        await this.sleep(2000); // 2 seconds
        return {
          response: `Slow response to: ${payload.message}`,
          success: true,
          processingTime: 2000,
        };
      },
    });

    // Large response scenario
    this.scenarios.push({
      name: 'large-response',
      condition: payload => payload.message.includes('__simulate_large__'),
      response: async () {
        const largeResponse = 'A'.repeat(10000); // 10KB response
        return {
          response: `Large response: ${largeResponse}`,
          success: true,
        };
      },
    });

    // Invalid response format scenario
    this.scenarios.push({
      name: 'invalid-format',
      condition: payload =>
        payload.message.includes('__simulate_invalid_format__'),
      response: async () {
        // Return invalid format (missing required fields)
        return { invalid: true } as unknown as WebhookResponse;
      },
    });
  }

  private async executeScenario(
    scenario: MockScenario,
    payload: WebhookPayload
  ): Promise<WebhookResponse>  => {
    // Apply scenario-specific or default latency
    const latency = scenario.latency ?? this.calculateLatency();
    await this.sleep(latency);

    // Apply scenario-specific or default error rate
    const errorRate = scenario.errorRate ?? this.config.errorRate;
    if (Math.random() < errorRate) {
      throw new Error('Random error simulation');
    }

    return await scenario.response(payload);
  }

  private async processDefaultRequest(
    payload: WebhookPayload
  ): Promise<WebhookResponse>  => {
    // Simulate processing latency
    const latency = this.calculateLatency();
    await this.sleep(latency);

    // Simulate random errors
    if (Math.random() < this.config.errorRate) {
      throw new Error('Random server error');
    }

    // Simulate timeouts
    if (Math.random() < this.config.timeoutRate) {
      await this.sleep(10000); // Force timeout
    }

    // Generate realistic AI response
    const response = this.generateAIResponse(payload.message);

    return {
      response,
      success: true,
      requestId: this.generateRequestId(),
      processingTime: latency,
    };
  }

  private createHealthCheckResponse(): WebhookResponse {
    return {
      response: 'Webhook is healthy',
      success: true,
      requestId: this.generateRequestId(),
      processingTime: 50,
    };
  }

  private isRateLimited(userId: string): boolean {
    const now = Date.now();
    const userRequests = this.requestCounts.get(userId);

    if (!userRequests) {
      this.requestCounts.set(userId, { count: 1, windowStart: now });
      return false;
    }

    // Reset window if expired
    if (now - userRequests.windowStart > this.config.rateLimitWindow) {
      this.requestCounts.set(userId, { count: 1, windowStart: now });
      return false;
    }

    // Check if limit exceeded
    if (userRequests.count >= this.config.rateLimitRequests) {
      return true;
    }

    // Increment count
    userRequests.count++;
    return false;
  }

  private calculateLatency(): number {
    const variation = (Math.random() - 0.5) * 2 * this.config.latencyVariation;
    return Math.max(0, this.config.baseLatency + variation);
  }

  private generateAIResponse(message: string): string {
    const responses = [
      `I understand you said: "${message}". How can I help you further?`,
      `That's an interesting point about "${message}". Let me provide some insights.`,
      `Regarding "${message}" - I'm here to assist. What specific information do you need?`,
      `I've processed your message: "${message}". I'm ready to help with any questions.`,
      `Thank you for your message: "${message}". As JARVIS, I'm designed to be helpful and efficient.`,
    ];

    // Add some variation based on message content
    if (message.toLowerCase().includes('help')) {
      return `I'm here to help! You mentioned: "${message}". What specific assistance do you need?`;
    }

    if (
      message.toLowerCase().includes('error') ||
      message.toLowerCase().includes('problem')
    ) {
      return `I see you're experiencing an issue with: "${message}". Let me help you troubleshoot this.`;
    }

    if (message.toLowerCase().includes('thank')) {
      return `You're welcome! Regarding "${message}" - I'm always happy to help.`;
    }

    return responses[Math.floor(Math.random() * responses.length)];
  }

  private recordRequest(
    payload: WebhookPayload,
    response: WebhookResponse | Error,
    processingTime: number
  ): void {
    this.requestHistory.push({
      payload,
      response,
      timestamp: new Date(),
      processingTime,
    });

    // Keep only last 1000 requests
    if (this.requestHistory.length > 1000) {
      this.requestHistory.shift();
    }
  }

  private generateRequestId(): string {
    return `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sleep(ms: number): Promise<void>  => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Default mock server instance for testing
export const mockN8nServer = new MockN8nServer();
