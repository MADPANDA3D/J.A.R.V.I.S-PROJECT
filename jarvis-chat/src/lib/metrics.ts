/**
 * Custom Metrics and KPI Tracking System
 * Tracks business metrics, user engagement, and system performance KPIs
 */

import { monitoringService } from './monitoring';
import { supabase } from './supabase';

// Business metrics interface
export interface BusinessMetrics {
  // User Engagement
  dailyActiveUsers: number;
  messagesSentPerDay: number;
  averageSessionDuration: number;
  userRetentionRate: number;
  chatCompletionRate: number;

  // System Performance
  averageResponseTime: number;
  errorRate: number;
  uptime: number;
  webhookSuccessRate: number;

  // Infrastructure
  cpuUtilization: number;
  memoryUtilization: number;
  diskUsage: number;
  networkLatency: number;

  // Feature Usage
  featureAdoptionRate: Record<string, number>;
  userFlowCompletionRate: Record<string, number>;
}

// KPI tracking interface
export interface KPIData {
  name: string;
  value: number;
  target?: number;
  unit: string;
  category: 'business' | 'technical' | 'user' | 'performance';
  timestamp: number;
  metadata?: Record<string, unknown>;
}

// User session interface
export interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: number;
  endTime?: number;
  pageViews: number;
  interactions: number;
  messagesExchanged: number;
  features: string[];
  location?: {
    country?: string;
    city?: string;
  };
  device: {
    type: 'mobile' | 'tablet' | 'desktop';
    browser: string;
    os: string;
  };
}

// Conversion funnel interface
export interface ConversionFunnel {
  name: string;
  steps: {
    name: string;
    count: number;
    conversionRate: number;
  }[];
  totalUsers: number;
  conversionRate: number;
}

class MetricsService {
  private sessions: Map<string, UserSession> = new Map();
  private dailyMetrics: Map<string, number> = new Map();
  private kpis: KPIData[] = [];
  private currentSessionId: string;
  private sessionStartTime: number;

  // Feature usage tracking
  private featureUsage: Map<string, { count: number; users: Set<string> }> =
    new Map();

  // Performance metrics buffer
  private performanceBuffer: Array<{
    timestamp: number;
    metric: string;
    value: number;
    metadata?: Record<string, unknown>;
  }> = [];

  constructor() {
    this.currentSessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.initializeSession();
    this.startMetricsCollection();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeSession(): void {
    const session: UserSession = {
      sessionId: this.currentSessionId,
      startTime: this.sessionStartTime,
      pageViews: 1,
      interactions: 0,
      messagesExchanged: 0,
      features: [],
      device: this.detectDevice(),
    };

    this.sessions.set(this.currentSessionId, session);

    // Track session start
    this.trackKPI('user.session_started', 1, 'sessions', 'user', {
      sessionId: this.currentSessionId,
      device: session.device,
    });
  }

  private detectDevice(): UserSession['device'] {
    const userAgent = navigator.userAgent;

    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      );
    const isTablet =
      /iPad|Android(?=.*\\bMobile\\b)|Android(?=.*\\bTablet\\b)/i.test(
        userAgent
      );

    const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

    const browser = this.detectBrowser();
    const os = this.detectOS();

    return { type: deviceType, browser, os };
  }

  private detectBrowser(): string {
    const userAgent = navigator.userAgent;

    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';

    return 'Unknown';
  }

  private detectOS(): string {
    const userAgent = navigator.userAgent;

    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';

    return 'Unknown';
  }

  private startMetricsCollection(): void {
    // Collect metrics every minute
    setInterval(() => {
      this.collectPerformanceMetrics();
      this.collectSystemMetrics();
    }, 60000);

    // Collect daily metrics every hour
    setInterval(() => {
      this.collectDailyMetrics();
    }, 3600000);

    // Collect business metrics every 5 minutes
    setInterval(() => {
      this.collectBusinessMetrics();
    }, 300000);

    // Session activity tracking
    this.setupActivityTracking();
  }

  private setupActivityTracking(): void {
    // Track page visibility changes
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.trackKPI('user.page_hidden', 1, 'events', 'user');
      } else {
        this.trackKPI('user.page_visible', 1, 'events', 'user');
      }
    });

    // Track user interactions
    ['click', 'keydown', 'scroll', 'mousemove'].forEach(eventType => {
      document.addEventListener(
        eventType,
        this.throttle(() {
          this.trackUserInteraction(eventType);
        }, 1000),
        { passive: true }
      );
    });

    // Track page unload
    window.addEventListener("beforeunload", () => {
      this.endCurrentSession();
    });
  }

  private throttle(func: () => void, delay: number): () => void {
    let timeoutId: number | undefined;
    let lastExecTime = 0;

    return () {
      const currentTime = Date.now();

      if (currentTime - lastExecTime > delay) {
        func();
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
            func();
            lastExecTime = Date.now();
          },
          delay - (currentTime - lastExecTime)
        );
      }
    };
  }

  // Public API methods
  public trackKPI(
    name: string,
    value: number,
    unit: string,
    category: KPIData['category'],
    metadata?: Record<string, unknown>
  ): void {
    const kpi: KPIData = {
      name,
      value,
      unit,
      category,
      timestamp: Date.now(),
      metadata,
    };

    this.kpis.push(kpi);

    // Keep only last 1000 KPIs in memory
    if (this.kpis.length > 1000) {
      this.kpis = this.kpis.slice(-1000);
    }

    // Send to monitoring service
    monitoringService.trackCustomMetric(`kpi.${name}`, value, {
      unit,
      category,
      ...metadata,
    });
  }

  public trackUserInteraction(
    interaction: string,
    metadata?: Record<string, unknown>
  ): void {
    const session = this.sessions.get(this.currentSessionId);
    if (session) {
      session.interactions++;
      this.sessions.set(this.currentSessionId, session);
    }

    this.trackKPI('user.interaction', 1, 'count', 'user', {
      type: interaction,
      sessionId: this.currentSessionId,
      ...metadata,
    });

    monitoringService.trackUserInteraction(interaction, metadata);
  }

  public trackPageView(path: string, metadata?: Record<string, unknown>): void {
    const session = this.sessions.get(this.currentSessionId);
    if (session) {
      session.pageViews++;
      this.sessions.set(this.currentSessionId, session);
    }

    this.trackKPI('user.page_view', 1, 'views', 'user', {
      path,
      sessionId: this.currentSessionId,
      ...metadata,
    });
  }

  public trackMessageExchange(
    type: 'sent' | 'received',
    metadata?: Record<string, unknown>
  ): void {
    const session = this.sessions.get(this.currentSessionId);
    if (session) {
      session.messagesExchanged++;
      this.sessions.set(this.currentSessionId, session);
    }

    this.trackKPI(`message.${type}`, 1, 'messages', 'business', {
      sessionId: this.currentSessionId,
      ...metadata,
    });

    // Track daily message volume
    const today = new Date().toISOString().split('T')[0];
    const dailyKey = `messages_${today}`;
    const currentCount = this.dailyMetrics.get(dailyKey) || 0;
    this.dailyMetrics.set(dailyKey, currentCount + 1);
  }

  public trackFeatureUsage(
    featureName: string,
    userId?: string,
    metadata?: Record<string, unknown>
  ): void {
    // Update session features
    const session = this.sessions.get(this.currentSessionId);
    if (session && !session.features.includes(featureName)) {
      session.features.push(featureName);
      this.sessions.set(this.currentSessionId, session);
    }

    // Update feature usage stats
    if (!this.featureUsage.has(featureName)) {
      this.featureUsage.set(featureName, { count: 0, users: new Set() });
    }

    const featureStats = this.featureUsage.get(featureName)!;
    featureStats.count++;
    if (userId) {
      featureStats.users.add(userId);
    }

    this.trackKPI('feature.usage', 1, 'usage', 'business', {
      feature: featureName,
      userId,
      sessionId: this.currentSessionId,
      ...metadata,
    });
  }

  public trackConversion(
    funnelName: string,
    step: string,
    userId?: string,
    metadata?: Record<string, unknown>
  ): void {
    this.trackKPI('conversion.step', 1, 'conversions', 'business', {
      funnel: funnelName,
      step,
      userId,
      sessionId: this.currentSessionId,
      ...metadata,
    });
  }

  public trackPerformanceMetric(
    metric: string,
    value: number,
    metadata?: Record<string, unknown>
  ): void {
    this.performanceBuffer.push({
      timestamp: Date.now(),
      metric,
      value,
      metadata,
    });

    // Keep buffer size manageable
    if (this.performanceBuffer.length > 500) {
      this.performanceBuffer = this.performanceBuffer.slice(-500);
    }

    this.trackKPI(
      `performance.${metric}`,
      value,
      'ms',
      'performance',
      metadata
    );
  }

  public setUser(userId: string, properties?: Record<string, unknown>): void {
    const session = this.sessions.get(this.currentSessionId);
    if (session) {
      session.userId = userId;
      this.sessions.set(this.currentSessionId, session);
    }

    monitoringService.setUser(userId, properties);

    this.trackKPI('user.identified', 1, 'users', 'user', {
      userId,
      sessionId: this.currentSessionId,
      ...properties,
    });
  }

  // Analytics and reporting methods
  public getBusinessMetrics(timeRange?: number): Partial<BusinessMetrics>  => {
    const cutoff = timeRange ? Date.now() - timeRange : 0;
    const relevantKPIs = this.kpis.filter(kpi => kpi.timestamp >= cutoff);

    // Calculate metrics from KPIs
    const messageKPIs = relevantKPIs.filter(kpi =>
      kpi.name.startsWith('message.')
    );
    const performanceKPIs = relevantKPIs.filter(kpi =>
      kpi.name.startsWith('performance.')
    );

    const metrics: Partial<BusinessMetrics> = {
      messagesSentPerDay: messageKPIs.filter(kpi => kpi.name === 'message.sent')
        .length,
      averageSessionDuration: this.calculateAverageSessionDuration(),
      errorRate: this.calculateErrorRate(relevantKPIs),
      averageResponseTime: this.calculateAverageResponseTime(performanceKPIs),
      featureAdoptionRate: this.calculateFeatureAdoptionRates(),
    };

    return metrics;
  }

  public getKPIs(filter?: {
    category?: KPIData['category'];
    name?: string;
    timeRange?: number;
  }): KPIData[] {
    let filtered = this.kpis;

    if (filter?.category) {
      filtered = filtered.filter(kpi => kpi.category === filter.category);
    }

    if (filter?.name) {
      filtered = filtered.filter(kpi => kpi.name.includes(filter.name!));
    }

    if (filter?.timeRange) {
      const cutoff = Date.now() - filter.timeRange;
      filtered = filtered.filter(kpi => kpi.timestamp >= cutoff);
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  public getConversionFunnel(
    funnelName: string,
    timeRange?: number
  ): ConversionFunnel | null {
    const cutoff = timeRange ? Date.now() - timeRange : 0;
    const conversionKPIs = this.kpis.filter(
      kpi =>
        kpi.name === 'conversion.step' &&
        kpi.metadata?.funnel === funnelName &&
        kpi.timestamp >= cutoff
    );

    if (conversionKPIs.length === 0) return null;

    // Group by step and count unique users
    const stepCounts = new Map<string, Set<string>>();

    conversionKPIs.forEach(kpi => {
      const step = kpi.metadata?.step as string;
      const userId = kpi.metadata?.userId as string;

      if (!stepCounts.has(step)) {
        stepCounts.set(step, new Set());
      }

      if (userId) {
        stepCounts.get(step)!.add(userId);
      }
    });

    // Calculate conversion rates
    const steps = Array.from(stepCounts.entries()).map(([step, users]) => ({
      name: step,
      count: users.size,
      conversionRate: 0, // Will be calculated below
    }));

    steps.sort((a, b) => a.name.localeCompare(b.name));

    // Calculate conversion rates (each step relative to the first)
    const totalUsers = steps.length > 0 ? steps[0].count : 0;
    steps.forEach(step => {
      step.conversionRate =
        totalUsers > 0 ? (step.count / totalUsers) * 100 : 0;
    });

    const overallConversionRate =
      steps.length > 1 && totalUsers > 0
        ? (steps[steps.length - 1].count / totalUsers) * 100
        : 0;

    return {
      name: funnelName,
      steps,
      totalUsers,
      conversionRate: overallConversionRate,
    };
  }

  public getSessionAnalytics(timeRange?: number):   {
    totalSessions: number;
    averageDuration: number;
    averagePageViews: number;
    averageInteractions: number;
    deviceBreakdown: Record<string, number>;
    browserBreakdown: Record<string, number>;
  } {
    const cutoff = timeRange ? Date.now() - timeRange : 0;
    const relevantSessions = Array.from(this.sessions.values()).filter(
      session => session.startTime >= cutoff
    );

    const deviceBreakdown: Record<string, number> = {};
    const browserBreakdown: Record<string, number> = {};

    let totalDuration = 0;
    let totalPageViews = 0;
    let totalInteractions = 0;

    relevantSessions.forEach(session => {
      const duration = (session.endTime || Date.now()) - session.startTime;
      totalDuration += duration;
      totalPageViews += session.pageViews;
      totalInteractions += session.interactions;

      deviceBreakdown[session.device.type] =
        (deviceBreakdown[session.device.type] || 0) + 1;
      browserBreakdown[session.device.browser] =
        (browserBreakdown[session.device.browser] || 0) + 1;
    });

    const sessionCount = relevantSessions.length;

    return {
      totalSessions: sessionCount,
      averageDuration: sessionCount > 0 ? totalDuration / sessionCount : 0,
      averagePageViews: sessionCount > 0 ? totalPageViews / sessionCount : 0,
      averageInteractions:
        sessionCount > 0 ? totalInteractions / sessionCount : 0,
      deviceBreakdown,
      browserBreakdown,
    };
  }

  // Private calculation methods
  private calculateAverageSessionDuration(): number {
    const sessions = Array.from(this.sessions.values());
    if (sessions.length === 0) return 0;

    const totalDuration = sessions.reduce((sum, session) => {
      const duration = (session.endTime || Date.now()) - session.startTime;
      return sum + duration;
    }, 0);

    return totalDuration / sessions.length;
  }

  private calculateErrorRate(kpis: KPIData[]): number {
    const errorKPIs = kpis.filter(kpi => kpi.name.includes('error'));
    const totalKPIs = kpis.length;

    return totalKPIs > 0 ? (errorKPIs.length / totalKPIs) * 100 : 0;
  }

  private calculateAverageResponseTime(performanceKPIs: KPIData[]): number {
    const responseTimeKPIs = performanceKPIs.filter(
      kpi => kpi.name.includes('response_time') || kpi.name.includes('api.')
    );

    if (responseTimeKPIs.length === 0) return 0;

    const totalTime = responseTimeKPIs.reduce((sum, kpi) => sum + kpi.value, 0);
    return totalTime / responseTimeKPIs.length;
  }

  private calculateFeatureAdoptionRates(): Record<string, number> {
    const adoptionRates: Record<string, number> = {};
    const totalUsers = new Set(
      Array.from(this.sessions.values())
        .map(session => session.userId)
        .filter(Boolean)
    ).size;

    this.featureUsage.forEach((stats, featureName) => {
      adoptionRates[featureName] =
        totalUsers > 0 ? (stats.users.size / totalUsers) * 100 : 0;
    });

    return adoptionRates;
  }

  private async collectPerformanceMetrics(): Promise<void>  {
    try {
      // Collect memory usage if available
      if ('memory' in performance) {
        const memory = (performance as unknown as { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
        this.trackPerformanceMetric('memory.used', memory.usedJSHeapSize);
        this.trackPerformanceMetric('memory.total', memory.totalJSHeapSize);
        this.trackPerformanceMetric('memory.limit', memory.jsHeapSizeLimit);
      }

      // Collect connection info
      if ('connection' in navigator) {
        const connection = (navigator as unknown as { connection: { rtt: number; downlink: number } }).connection;
        this.trackPerformanceMetric('network.rtt', connection.rtt || 0);
        this.trackPerformanceMetric(
          'network.downlink',
          connection.downlink || 0
        );
      }
    } catch () {
      monitoringService.captureException(
        error instanceof Error
          ? error
          : new Error('Failed to collect performance metrics')
      );
    }
  }

  private async collectSystemMetrics(): Promise<void>  {
    try {
      // Check system health through health check endpoint
      const healthCheck = await fetch('/api/health');
      const healthData = await healthCheck.json();

      this.trackKPI(
        'system.health_check_status',
        healthCheck.ok ? 1 : 0,
        'status',
        'technical'
      );

      if (healthData.checks) {
        Object.entries(healthData.checks).forEach(([check, result]: [string, { status: string }]) => {
            this.trackKPI(
              `system.${check}`,
              result.status === 'up' ? 1 : 0,
              'status',
              'technical'
            );
          }
        );
      }
    } catch () {
      this.trackKPI('system.health_check_status', 0, 'status', 'technical');
    }
  }

  private async collectBusinessMetrics(): Promise<void>  {
    try {
      // Collect user count from database
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (userCount !== null) {
        this.trackKPI('business.total_users', userCount, 'users', 'business');
      }

      // Collect message count for today
      const today = new Date().toISOString().split('T')[0];
      const { count: messageCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`);

      if (messageCount !== null) {
        this.trackKPI(
          'business.daily_messages',
          messageCount,
          'messages',
          'business'
        );
      }
    } catch () {
      monitoringService.captureException(
        error instanceof Error
          ? error
          : new Error('Failed to collect business metrics')
      );
    }
  }

  private async collectDailyMetrics(): Promise<void>  {
    const today = new Date().toISOString().split('T')[0];

    // Calculate daily active users
    const todaySessions = Array.from(this.sessions.values()).filter(session => {
      const sessionDate = new Date(session.startTime)
        .toISOString()
        .split('T')[0];
      return sessionDate === today;
    });

    const uniqueUsers = new Set(
      todaySessions.map(session => session.userId).filter(Boolean)
    );
    this.trackKPI(
      'business.daily_active_users',
      uniqueUsers.size,
      'users',
      'business'
    );

    // Store daily metrics
    this.dailyMetrics.set(`dau_${today}`, uniqueUsers.size);
  }

  private endCurrentSession(): void {
    const session = this.sessions.get(this.currentSessionId);
    if (session && !session.endTime) {
      session.endTime = Date.now();
      this.sessions.set(this.currentSessionId, session);

      const duration = session.endTime - session.startTime;
      this.trackKPI('user.session_ended', duration, 'ms', 'user', {
        sessionId: this.currentSessionId,
        pageViews: session.pageViews,
        interactions: session.interactions,
        messagesExchanged: session.messagesExchanged,
        features: session.features,
      });
    }
  }

  // Health check for metrics service
  public getMetricsHealth():   {
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: {
      totalKPIs: number;
      activeSessions: number;
      featureUsageTracked: number;
      recentActivity: number;
    };
  } {
    const recentTimeRange = 5 * 60 * 1000; // 5 minutes
    const recentKPIs = this.kpis.filter(
      kpi => kpi.timestamp >= Date.now() - recentTimeRange
    );

    const activeSessions = Array.from(this.sessions.values()).filter(
      session => !session.endTime
    ).length;

    const status =
      recentKPIs.length === 0
        ? 'unhealthy'
        : recentKPIs.length < 10
          ? 'degraded'
          : 'healthy';

    return {
      status,
      metrics: {
        totalKPIs: this.kpis.length,
        activeSessions,
        featureUsageTracked: this.featureUsage.size,
        recentActivity: recentKPIs.length,
      },
    };
  }
}

// Singleton instance
export const metricsService = new MetricsService();

// Utility functions for easy access
export const trackKPI = (
  name: string,
  value: number,
  unit: string,
  category: KPIData['category'],
  metadata?: Record<string, unknown>
) => metricsService.trackKPI(name, value, unit, category, metadata);

export const trackUserInteraction = (
  interaction: string,
  metadata?: Record<string, unknown>
) => metricsService.trackUserInteraction(interaction, metadata);

export const trackPageView = (
  path: string,
  metadata?: Record<string, unknown>
) => metricsService.trackPageView(path, metadata);

export const trackMessageExchange = (
  type: 'sent' | 'received',
  metadata?: Record<string, unknown>
) => metricsService.trackMessageExchange(type, metadata);

export const trackFeatureUsage = (
  featureName: string,
  userId?: string,
  metadata?: Record<string, unknown>
) => metricsService.trackFeatureUsage(featureName, userId, metadata);

export const trackConversion = (
  funnelName: string,
  step: string,
  userId?: string,
  metadata?: Record<string, unknown>
) => metricsService.trackConversion(funnelName, step, userId, metadata);

export const trackPerformanceMetric = (
  metric: string,
  value: number,
  metadata?: Record<string, unknown>
) => metricsService.trackPerformanceMetric(metric, value, metadata);

export const setMetricsUser = (
  userId: string,
  properties?: Record<string, unknown>
) => metricsService.setUser(userId, properties);

// React hooks for metrics
export const useMetrics = () => {
  return {
    trackKPI,
    trackUserInteraction,
    trackPageView,
    trackMessageExchange,
    trackFeatureUsage,
    trackConversion,
    trackPerformanceMetric,
    setUser: setMetricsUser,
    getBusinessMetrics: () => metricsService.getBusinessMetrics(),
    getKPIs: (filter?: Parameters<typeof metricsService.getKPIs>[0]) =>
      metricsService.getKPIs(filter),
    getSessionAnalytics: () => metricsService.getSessionAnalytics(),
    getConversionFunnel: (funnelName: string, timeRange?: number) =>
      metricsService.getConversionFunnel(funnelName, timeRange),
  };
};
