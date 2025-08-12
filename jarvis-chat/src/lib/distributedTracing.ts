/**
 * Distributed Tracing and Cross-Service Correlation System
 * Implements comprehensive request flow tracking across all service interactions
 */

import { centralizedLogging } from './centralizedLogging';

// Tracing interfaces
export interface TraceSpan {
  spanId: string;
  traceId: string;
  parentSpanId?: string;
  operationName: string;
  serviceName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'running' | 'completed' | 'error';
  tags: Record<string, unknown>;
  logs: SpanLog[];
  baggage?: Record<string, string>;
}

export interface SpanLog {
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  fields?: Record<string, unknown>;
}

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  baggage?: Record<string, string>;
  samplingPriority?: number;
}

export interface ServiceCorrelation {
  correlationId: string;
  traceId: string;
  servicePath: string[];
  timestamp: string;
  initiatingService: string;
  targetService: string;
  operation: string;
  metadata: Record<string, unknown>;
}

export interface RequestFlow {
  flowId: string;
  traceId: string;
  initiatingRequest: {
    service: string;
    operation: string;
    timestamp: string;
    userId?: string;
    sessionId?: string;
  };
  serviceInteractions: ServiceInteraction[];
  totalDuration: number;
  status: 'active' | 'completed' | 'failed';
  errorCount: number;
}

export interface ServiceInteraction {
  interactionId: string;
  fromService: string;
  toService: string;
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
}

// Tracing configuration
export interface TracingConfig {
  enabled: boolean;
  samplingRate: number; // 0.0 to 1.0
  maxSpansPerTrace: number;
  spanTimeout: number; // milliseconds
  baggage: {
    maxItems: number;
    maxValueSize: number;
  };
  export: {
    endpoint?: string;
    apiKey?: string;
    batchSize: number;
    flushInterval: number;
  };
}

// Distributed tracing service implementation
class DistributedTracingService {
  private spans: Map<string, TraceSpan> = new Map();
  private traces: Map<string, TraceSpan[]> = new Map();
  private correlations: ServiceCorrelation[] = [];
  private requestFlows: Map<string, RequestFlow> = new Map();
  private currentContext: TraceContext | null = null;
  private config: TracingConfig;
  private exportTimer?: NodeJS.Timeout;

  constructor() {
    this.config = this.loadConfiguration();
    this.startExportTimer();
    this.setupCleanupTimer();
  }

  private loadConfiguration(): TracingConfig {
    return {
      enabled: import.meta.env.VITE_TRACING_ENABLED === 'true',
      samplingRate: parseFloat(import.meta.env.VITE_TRACING_SAMPLING_RATE || '1.0'),
      maxSpansPerTrace: parseInt(import.meta.env.VITE_TRACING_MAX_SPANS || '100'),
      spanTimeout: parseInt(import.meta.env.VITE_TRACING_SPAN_TIMEOUT || '300000'), // 5 minutes
      baggage: {
        maxItems: parseInt(import.meta.env.VITE_TRACING_BAGGAGE_MAX_ITEMS || '10'),
        maxValueSize: parseInt(import.meta.env.VITE_TRACING_BAGGAGE_MAX_SIZE || '1024')
      },
      export: {
        endpoint: import.meta.env.VITE_TRACING_EXPORT_ENDPOINT,
        apiKey: import.meta.env.VITE_TRACING_EXPORT_API_KEY,
        batchSize: parseInt(import.meta.env.VITE_TRACING_BATCH_SIZE || '10'),
        flushInterval: parseInt(import.meta.env.VITE_TRACING_FLUSH_INTERVAL || '10000') // 10 seconds
      }
    };
  }

  // Generate unique IDs
  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  private generateSpanId(): string {
    return `span_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  }

  // Check if trace should be sampled
  private shouldSample(): boolean {
    return Math.random() < this.config.samplingRate;
  }

  // Start a new trace
  startTrace(
    operationName: string,
    serviceName: string,
    tags: Record<string, unknown> = {},
    baggage: Record<string, string> = {}
  ): TraceContext {
    if (!this.config.enabled || !this.shouldSample()) {
      // Return a no-op context
      return {
        traceId: 'noop',
        spanId: 'noop'
      };
    }

    const traceId = this.generateTraceId();
    const spanId = this.generateSpanId();
    
    const span: TraceSpan = {
      spanId,
      traceId,
      operationName,
      serviceName,
      startTime: performance.now(),
      status: 'running',
      tags: { ...tags },
      logs: [],
      baggage: { ...baggage }
    };

    this.spans.set(spanId, span);
    
    if (!this.traces.has(traceId)) {
      this.traces.set(traceId, []);
    }
    this.traces.get(traceId)!.push(span);

    const context: TraceContext = {
      traceId,
      spanId,
      baggage,
      samplingPriority: 1
    };

    this.currentContext = context;

    // Log trace start
    centralizedLogging.debug(
      serviceName,
      'system',
      `Starting trace: ${operationName}`,
      {
        traceId,
        spanId,
        operationName,
        tags
      },
      this.generateCorrelationId()
    );

    return context;
  }

  // Start a child span
  startSpan(
    operationName: string,
    serviceName: string,
    parentContext?: TraceContext,
    tags: Record<string, unknown> = {}
  ): TraceContext {
    if (!this.config.enabled) {
      return { traceId: 'noop', spanId: 'noop' };
    }

    const context = parentContext || this.currentContext;
    if (!context || context.traceId === 'noop') {
      return { traceId: 'noop', spanId: 'noop' };
    }

    const spanId = this.generateSpanId();
    
    const span: TraceSpan = {
      spanId,
      traceId: context.traceId,
      parentSpanId: context.spanId,
      operationName,
      serviceName,
      startTime: performance.now(),
      status: 'running',
      tags: { ...tags },
      logs: [],
      baggage: context.baggage
    };

    this.spans.set(spanId, span);
    
    if (this.traces.has(context.traceId)) {
      this.traces.get(context.traceId)!.push(span);
    }

    const newContext: TraceContext = {
      traceId: context.traceId,
      spanId,
      parentSpanId: context.spanId,
      baggage: context.baggage,
      samplingPriority: context.samplingPriority
    };

    return newContext;
  }

  // Finish a span
  finishSpan(
    context: TraceContext,
    status: 'completed' | 'error' = 'completed',
    error?: Error
  ): void {
    if (!this.config.enabled || !context || context.spanId === 'noop') {
      return;
    }

    const span = this.spans.get(context.spanId);
    if (!span) return;

    span.endTime = performance.now();
    span.duration = span.endTime - span.startTime;
    span.status = status;

    if (error) {
      span.tags.error = true;
      span.tags.errorMessage = error.message;
      span.tags.errorStack = error.stack;
      
      this.addSpanLog(context, 'error', 'Span completed with error', {
        error: error.message,
        stack: error.stack
      });
    }

    // Log span completion
    centralizedLogging.debug(
      span.serviceName,
      'system',
      `Finished span: ${span.operationName} (${span.duration?.toFixed(2)}ms)`,
      {
        traceId: span.traceId,
        spanId: span.spanId,
        parentSpanId: span.parentSpanId,
        duration: span.duration,
        status,
        error: error?.message
      },
      this.generateCorrelationId()
    );

    // Update current context if this was the active span
    if (this.currentContext?.spanId === context.spanId) {
      this.currentContext = context.parentSpanId ? {
        traceId: context.traceId,
        spanId: context.parentSpanId,
        baggage: context.baggage
      } : null;
    }
  }

  // Add log to span
  addSpanLog(
    context: TraceContext,
    level: SpanLog['level'],
    message: string,
    fields?: Record<string, unknown>
  ): void {
    if (!this.config.enabled || !context || context.spanId === 'noop') {
      return;
    }

    const span = this.spans.get(context.spanId);
    if (!span) return;

    span.logs.push({
      timestamp: performance.now(),
      level,
      message,
      fields
    });
  }

  // Set span tags
  setSpanTags(context: TraceContext, tags: Record<string, unknown>): void {
    if (!this.config.enabled || !context || context.spanId === 'noop') {
      return;
    }

    const span = this.spans.get(context.spanId);
    if (!span) return;

    Object.assign(span.tags, tags);
  }

  // Set baggage item
  setBaggageItem(context: TraceContext, key: string, value: string): TraceContext {
    if (!this.config.enabled || !context || context.traceId === 'noop') {
      return context;
    }

    const baggage = { ...context.baggage };
    
    // Check limits
    if (Object.keys(baggage).length >= this.config.baggage.maxItems) {
      console.warn('Maximum baggage items reached');
      return context;
    }

    if (value.length > this.config.baggage.maxValueSize) {
      console.warn('Baggage value exceeds maximum size');
      return context;
    }

    baggage[key] = value;

    return {
      ...context,
      baggage
    };
  }

  // Get baggage item
  getBaggageItem(context: TraceContext, key: string): string | undefined {
    return context.baggage?.[key];
  }

  // Create service correlation
  createServiceCorrelation(
    traceId: string,
    initiatingService: string,
    targetService: string,
    operation: string,
    metadata: Record<string, unknown> = {}
  ): string {
    const correlationId = this.generateCorrelationId();
    
    const correlation: ServiceCorrelation = {
      correlationId,
      traceId,
      servicePath: [initiatingService, targetService],
      timestamp: new Date().toISOString(),
      initiatingService,
      targetService,
      operation,
      metadata
    };

    this.correlations.push(correlation);

    // Log correlation
    centralizedLogging.info(
      'distributed-tracing',
      'system',
      `Service correlation: ${initiatingService} -> ${targetService}`,
      {
        correlationId,
        traceId,
        operation,
        metadata
      },
      correlationId
    );

    return correlationId;
  }

  // Start request flow tracking
  startRequestFlow(
    traceId: string,
    initiatingService: string,
    operation: string,
    userId?: string,
    sessionId?: string
  ): string  => {
    const flowId = `flow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const flow: RequestFlow = {
      flowId,
      traceId,
      initiatingRequest: {
        service: initiatingService,
        operation,
        timestamp: new Date().toISOString(),
        userId,
        sessionId
      },
      serviceInteractions: [],
      totalDuration: 0,
      status: 'active',
      errorCount: 0
    };

    this.requestFlows.set(flowId, flow);

    centralizedLogging.info(
      'distributed-tracing',
      'system',
      `Starting request flow: ${operation}`,
      {
        flowId,
        traceId,
        initiatingService,
        userId,
        sessionId
      }
    );

    return flowId;
  }

  // Add service interaction to request flow
  addServiceInteraction(
    flowId: string,
    fromService: string,
    toService: string,
    operation: string,
    startTime: number,
    success: boolean,
    endTime?: number,
    error?: string,
    metadata?: Record<string, unknown>
  ): void  => {
    const flow = this.requestFlows.get(flowId);
    if (!flow) return;

    const interactionId = `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const duration = endTime ? endTime - startTime : undefined;

    const interaction: ServiceInteraction = {
      interactionId,
      fromService,
      toService,
      operation,
      startTime,
      endTime,
      duration,
      success,
      error,
      metadata
    };

    flow.serviceInteractions.push(interaction);

    if (!success) {
      flow.errorCount++;
    }

    // Update flow status
    if (endTime) {
      const totalDuration = endTime - (flow.serviceInteractions[0]?.startTime || startTime);
      flow.totalDuration = totalDuration;
      
      if (flow.serviceInteractions.every(i => i.endTime !== undefined)) {
        flow.status = flow.errorCount > 0 ? 'failed' : 'completed';
      }
    }

    centralizedLogging.debug(
      'distributed-tracing',
      'system',
      `Service interaction: ${fromService} -> ${toService}`,
      {
        flowId,
        interactionId,
        operation,
        duration,
        success,
        error
      }
    );
  }

  // Get current context
  getCurrentContext(): TraceContext | null {
    return this.currentContext;
  }

  // Set current context
  setCurrentContext(context: TraceContext | null): void {
    this.currentContext = context;
  }

  // Extract trace context from headers
  extractContextFromHeaders(headers: Record<string, string>): TraceContext | null {
    const traceId = headers['x-trace-id'];
    const spanId = headers['x-span-id'];
    const parentSpanId = headers['x-parent-span-id'];
    
    if (!traceId || !spanId) {
      return null;
    }

    // Parse baggage
    let baggage: Record<string, string> = {};
    const baggageHeader = headers['x-baggage'];
    if (baggageHeader) {
      try {
        baggage = JSON.parse(baggageHeader);
      } catch (error) {
        // Invalid baggage format
      }
    }

    return {
      traceId,
      spanId,
      parentSpanId,
      baggage
    };
  }

  // Inject trace context into headers
  injectContextIntoHeaders(context: TraceContext, headers: Record<string, string> = {}): Record<string, string> {
    if (!context || context.traceId === 'noop') {
      return headers;
    }

    return {
      ...headers,
      'x-trace-id': context.traceId,
      'x-span-id': context.spanId,
      ...(context.parentSpanId && { 'x-parent-span-id': context.parentSpanId }),
      ...(context.baggage && Object.keys(context.baggage).length > 0 && {
        'x-baggage': JSON.stringify(context.baggage)
      })
    };
  }

  // Query methods
  getTrace(traceId: string): TraceSpan[] {
    return this.traces.get(traceId) || [];
  }

  getSpan(spanId: string): TraceSpan | undefined {
    return this.spans.get(spanId);
  }

  getCorrelations(filter?: {
    traceId?: string;
    initiatingService?: string;
    targetService?: string;
    timeRange?: number; // hours
  }): ServiceCorrelation[]  => {
    let filtered = [...this.correlations];

    if (filter) {
      if (filter.traceId) {
        filtered = filtered.filter(c => c.traceId === filter.traceId);
      }
      if (filter.initiatingService) {
        filtered = filtered.filter(c => c.initiatingService === filter.initiatingService);
      }
      if (filter.targetService) {
        filtered = filtered.filter(c => c.targetService === filter.targetService);
      }
      if (filter.timeRange) {
        const cutoff = new Date(Date.now() - (filter.timeRange * 60 * 60 * 1000)).toISOString();
        filtered = filtered.filter(c => c.timestamp > cutoff);
      }
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getRequestFlows(filter?: {
    traceId?: string;
    status?: RequestFlow['status'];
    timeRange?: number; // hours
  }): RequestFlow[]  => {
    let flows = Array.from(this.requestFlows.values());

    if (filter) {
      if (filter.traceId) {
        flows = flows.filter(f => f.traceId === filter.traceId);
      }
      if (filter.status) {
        flows = flows.filter(f => f.status === filter.status);
      }
      if (filter.timeRange) {
        const cutoff = new Date(Date.now() - (filter.timeRange * 60 * 60 * 1000)).toISOString();
        flows = flows.filter(f => f.initiatingRequest.timestamp > cutoff);
      }
    }

    return flows.sort((a, b) => 
      new Date(b.initiatingRequest.timestamp).getTime() - 
      new Date(a.initiatingRequest.timestamp).getTime()
    );
  }

  // Export spans to external tracing system
  private async exportSpans(): Promise<void>  {
    if (!this.config.export.endpoint) return;

    const completedSpans = Array.from(this.spans.values()).filter(
      span => span.status !== 'running'
    );

    if (completedSpans.length === 0) return;

    const batch = completedSpans.slice(0, this.config.export.batchSize);

    try {
      const response = await fetch(this.config.export.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.export.apiKey && {
            'Authorization': `Bearer ${this.config.export.apiKey}`
          })
        },
        body: JSON.stringify({
          spans: batch.map(span => ({
            traceId: span.traceId,
            spanId: span.spanId,
            parentSpanId: span.parentSpanId,
            operationName: span.operationName,
            serviceName: span.serviceName,
            startTime: span.startTime,
            endTime: span.endTime,
            duration: span.duration,
            tags: span.tags,
            logs: span.logs,
            status: span.status
          }))
        })
      });

      if (response.ok) {
        // Remove exported spans
        batch.forEach(span => {
          this.spans.delete(span.spanId);
        });
      } else {
        console.warn('Failed to export spans:', response.statusText);
      }
    } catch (error) {
      console.warn('Error exporting spans:', error);
    }
  }

  private startExportTimer(): void {
    if (!this.config.export.endpoint) return;

    this.exportTimer = setInterval(() => {
      this.exportSpans();
    }, this.config.export.flushInterval);
  }

  private setupCleanupTimer(): void {
    // Clean up old data every hour
    setInterval(() => {
      this.cleanupOldData();
    }, 60 * 60 * 1000);
  }

  private cleanupOldData(): void {
    const now = performance.now();
    const timeout = this.config.spanTimeout;

    // Clean up old spans
    for (const [spanId, span] of this.spans.entries()) {
      if (now - span.startTime > timeout) {
        this.spans.delete(spanId);
        
        // Remove from traces
        const traceSpans = this.traces.get(span.traceId);
        if (traceSpans) {
          const index = traceSpans.findIndex(s => s.spanId === spanId);
          if (index >= 0) {
            traceSpans.splice(index, 1);
          }
          
          // Remove empty traces
          if (traceSpans.length === 0) {
            this.traces.delete(span.traceId);
          }
        }
      }
    }

    // Clean up old correlations
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    const cutoffISO = new Date(cutoffTime).toISOString();
    this.correlations = this.correlations.filter(c => c.timestamp > cutoffISO);

    // Clean up old request flows
    for (const [flowId, flow] of this.requestFlows.entries()) {
      if (flow.initiatingRequest.timestamp < cutoffISO) {
        this.requestFlows.delete(flowId);
      }
    }
  }

  // Update configuration
  updateConfig(updates: Partial<TracingConfig>): void {
    this.config = { ...this.config, ...updates };
    
    if (updates.export?.flushInterval && this.exportTimer) {
      clearInterval(this.exportTimer);
      this.startExportTimer();
    }
  }

  // Get current configuration
  getConfig(): TracingConfig {
    return { ...this.config };
  }

  // Cleanup resources
  destroy(): void {
    if (this.exportTimer) {
      clearInterval(this.exportTimer);
    }
    this.exportSpans(); // Final export
  }
}

// Singleton instance
export const distributedTracing = new DistributedTracingService();

// Utility functions for common patterns
export const withTracing = async <T>(
  operationName: string,
  serviceName: string,
  operation: (context: TraceContext) => Promise<T>,
  tags: Record<string, unknown> = {},
  parentContext?: TraceContext
): Promise<T>  => {
  const context = parentContext
    ? distributedTracing.startSpan(operationName, serviceName, parentContext, tags)
    : distributedTracing.startTrace(operationName, serviceName, tags);

  try {
    const result = await operation(context);
    distributedTracing.finishSpan(context, 'completed');
    return result;
  } catch (error) {
    distributedTracing.finishSpan(context, 'error', error as Error);
    throw error;
  }
};

// Convenience exports
export const startTrace = (operationName: string, serviceName: string, tags?: Record<string, unknown>, baggage?: Record<string, string>) =>
  distributedTracing.startTrace(operationName, serviceName, tags, baggage);

export const startSpan = (operationName: string, serviceName: string, parentContext?: TraceContext, tags?: Record<string, unknown>) =>
  distributedTracing.startSpan(operationName, serviceName, parentContext, tags);

export const finishSpan = (context: TraceContext, status?: 'completed' | 'error', error?: Error) =>
  distributedTracing.finishSpan(context, status, error);

export const getCurrentContext = () => distributedTracing.getCurrentContext();
export const setCurrentContext = (context: TraceContext | null) => distributedTracing.setCurrentContext(context);

export const createServiceCorrelation = (traceId: string, initiatingService: string, targetService: string, operation: string, metadata?: Record<string, unknown>) =>
  distributedTracing.createServiceCorrelation(traceId, initiatingService, targetService, operation, metadata);

export const injectContextIntoHeaders = (context: TraceContext, headers?: Record<string, string>) =>
  distributedTracing.injectContextIntoHeaders(context, headers);

export const extractContextFromHeaders = (headers: Record<string, string>) =>
  distributedTracing.extractContextFromHeaders(headers);