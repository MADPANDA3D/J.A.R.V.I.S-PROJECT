import { supabase } from './supabase';
import { validateEnvironment } from './env-validation';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  checks: {
    database: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
    environment: {
      status: 'valid' | 'invalid';
      errors: string[];
      warnings: string[];
    };
    services: {
      supabase: 'connected' | 'disconnected';
      n8n: 'configured' | 'fallback';
    };
  };
}

export const performHealthCheck = async (): Promise<HealthCheckResult>  =>  => {
  const timestamp = new Date().toISOString();
  const version = '1.0.0'; // You can replace this with actual version from package.json
  const environment = import.meta.env.PROD ? 'production' : 'development';

  // Check environment configuration
  const envValidation = validateEnvironment();

  // Initialize health check result
  const healthCheck: HealthCheckResult = {
    status: 'healthy',
    timestamp,
    version,
    environment,
    checks: {
      database: {
        status: 'down',
      },
      environment: {
        status: envValidation.isValid ? 'valid' : 'invalid',
        errors: envValidation.errors,
        warnings: envValidation.warnings,
      },
      services: {
        supabase: 'disconnected',
        n8n: import.meta.env.VITE_N8N_WEBHOOK_URL ? 'configured' : 'fallback',
      },
    },
  };

  // Check database connectivity
  try {
    const dbStartTime = Date.now();
    const { error } = await supabase
      .from('messages')
      .select('id')
      .limit(1)
      .single();

    const responseTime = Date.now() - dbStartTime;

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is OK for health check
      healthCheck.checks.database = {
        status: 'down',
        responseTime,
        error: error.message,
      };
    } else {
      healthCheck.checks.database = {
        status: 'up',
        responseTime,
      };
      healthCheck.checks.services.supabase = 'connected';
    }
  } catch (dbError) {
    healthCheck.checks.database = {
      status: 'down',
      error:
        dbError instanceof Error ? dbError.message : 'Unknown database error',
    };
  }

  // Determine overall health status
  if (
    healthCheck.checks.database.status === 'down' ||
    healthCheck.checks.environment.status === 'invalid'
  ) {
    healthCheck.status = 'unhealthy';
  } else if (
    healthCheck.checks.environment.warnings.length > 0 ||
    healthCheck.checks.services.n8n === 'fallback'
  ) {
    healthCheck.status = 'degraded';
  }

  return healthCheck;
};

// Utility function for simple health check endpoint
export const getHealthStatus = async (): Promise< =>  => {
  status: string;
  timestamp: string;
}> {
  try {
    const healthCheck = await performHealthCheck();
    return {
      status: healthCheck.status,
      timestamp: healthCheck.timestamp,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
    };
  }
};
