import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  logDatabaseQuery, 
  generateCorrelationId, 
  sanitizeParameters, 
  sanitizeQuery 
} from './databaseLogging';
import { getSessionId } from './errorTracking';
import type { BrowserInfo, ErrorReport, APMMetrics } from '@/types/bugReport';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const siteUrl = import.meta.env.VITE_SUPABASE_SITE_URL || import.meta.env.VITE_APP_DOMAIN;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// Create enhanced Supabase client with logging
const createLoggedSupabaseClient = (url: string, key: string, options: Record<string, unknown> = {}) => {
  const client = createClient(url, key, {
    ...options,
    global: {
      ...options.global,
      fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
        const startTime = performance.now();
        const correlationId = generateCorrelationId();
        const sessionId = getSessionId();
        
        // Extract request details
        const url = typeof input === 'string' ? input : input.toString();
        const method = init?.method || 'GET';
        const headers = init?.headers as Record<string, string> || {};
        
        // Determine operation type and table from URL
        const { operation, table } = parseSupabaseRequest(url, method, init?.body);
        
        try {
          // Make the actual request
          const response = await fetch(input, {
            ...init,
            headers: {
              ...headers,
              'x-correlation-id': correlationId
            }
          });
          
          const endTime = performance.now();
          const executionTime = endTime - startTime;
          
          // Parse response for additional context
          let rowCount: number | undefined;
          let responseData: unknown;
          
          try {
            // Clone response to read body without consuming it
            const responseClone = response.clone();
            responseData = await responseClone.json();
            
            // Extract row count from response
            if (Array.isArray(responseData)) {
              rowCount = responseData.length;
            } else if (responseData && typeof responseData === 'object') {
              if ('count' in responseData) {
                rowCount = responseData.count;
              } else if (Array.isArray(responseData.data)) {
                rowCount = responseData.data.length;
              }
            }
          } catch {
            // Response body couldn't be parsed as JSON
          }
          
          // Log the database query
          logDatabaseQuery({
            correlationId,
            table: table || 'unknown',
            operation: operation || 'unknown',
            query: sanitizeQuery(url + (init?.body ? ` BODY: ${init.body}` : '')),
            parameters: init?.body ? sanitizeParameters(JSON.parse(init.body as string) || {}) : undefined,
            executionTime,
            rowCount,
            statusCode: response.status,
            success: response.ok,
            error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
            userId: await getCurrentUserId(client),
            sessionId,
            metadata: {
              method,
              url,
              headers: sanitizeHeaders(headers),
              userAgent: headers['user-agent'] || navigator.userAgent
            }
          });
          
          return response;
          
        } catch {
          const endTime = performance.now();
          const executionTime = endTime - startTime;
          
          // Log the failed request
          logDatabaseQuery({
            correlationId,
            table: table || 'unknown',
            operation: operation || 'unknown',
            query: sanitizeQuery(url + (init?.body ? ` BODY: ${init.body}` : '')),
            parameters: init?.body ? sanitizeParameters(JSON.parse(init.body as string) || {}) : undefined,
            executionTime,
            statusCode: 0,
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
            userId: await getCurrentUserId(client),
            sessionId,
            metadata: {
              method,
              url,
              headers: sanitizeHeaders(headers),
              networkError: true
            }
          });
          
          throw error;
        }
      }
    }
  });
  
  return client;
};

// Parse Supabase request to extract operation and table info
function parseSupabaseRequest(url: string, method: string): {
  operation: 'select' | 'insert' | 'update' | 'delete' | 'rpc' | 'auth' | 'unknown';
  table: string;
} {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/').filter(Boolean);
    
    // Auth endpoints
    if (pathSegments.includes('auth')) {
      return {
        operation: 'auth',
        table: pathSegments[pathSegments.length - 1] || 'auth'
      };
    }
    
    // RPC endpoints
    if (pathSegments.includes('rpc')) {
      return {
        operation: 'rpc',
        table: pathSegments[pathSegments.length - 1] || 'rpc'
      };
    }
    
    // REST API endpoints
    if (pathSegments.includes('rest')) {
      const table = pathSegments[pathSegments.length - 1] || 'unknown';
      
      switch (method.toUpperCase()) {
        case 'GET':
          return { operation: 'select', table };
        case 'POST':
          return { operation: 'insert', table };
        case 'PATCH':
          return { operation: 'update', table };
        case 'DELETE':
          return { operation: 'delete', table };
        default:
          return { operation: 'unknown', table };
      }
    }
    
    return { operation: 'unknown', table: 'unknown' };
  } catch {
    return { operation: 'unknown', table: 'unknown' };
  }
}

// Get current user ID from client
async function getCurrentUserId(client: SupabaseClient): Promise<string | undefined> {
  try {
    const { data } = await client.auth.getUser();
    return data.user?.id;
  } catch {
    return undefined;
  }
}

// Sanitize headers to remove sensitive information
function sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
  const sanitized = { ...headers };
  const sensitiveHeaders = ['authorization', 'apikey', 'x-api-key', 'cookie'];
  
  sensitiveHeaders.forEach(header => {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
    if (sanitized[header.toLowerCase()]) {
      sanitized[header.toLowerCase()] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

export const supabase = createLoggedSupabaseClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Configure site URL for email verification redirects
    flowType: 'pkce',
    ...(siteUrl && {
      redirectTo: `${siteUrl}/auth/callback`,
    }),
  },
});

// Bug reporting database operations
export const bugReportOperations = {
  // Create a new bug report
  async createBugReport(bugData: {
    title: string;
    description: string;
    bugType: string;
    severity: string;
    browserInfo?: BrowserInfo;
    errorStack?: string;
    userAgent?: string;
    url?: string;
    reproductionSteps?: string;
    errorContext?: ErrorReport[];
    monitoringData?: APMMetrics;
  }) {
    const { data, error } = await supabase
      .from('bug_reports')
      .insert({
        title: bugData.title,
        description: bugData.description,
        bug_type: bugData.bugType,
        severity: bugData.severity,
        browser_info: bugData.browserInfo,
        error_stack: bugData.errorStack,
        user_agent: bugData.userAgent,
        url: bugData.url,
        reproduction_steps: bugData.reproductionSteps,
        error_context: bugData.errorContext,
        monitoring_data: bugData.monitoringData
      })
      .select()
      .single();

    return { data, error };
  },

  // Get user's bug reports
  async getUserBugReports(userId?: string, options: {
    status?: string[];
    limit?: number;
    offset?: number;
  } = {}) {
    let query = supabase
      .from('bug_reports')
      .select(`
        *,
        bug_comments(count),
        bug_attachments(count)
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (options.status?.length) {
      query = query.in('status', options.status);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Get bug report by ID
  async getBugReportById(bugId: string) {
    const { data, error } = await supabase
      .from('bug_reports')
      .select(`
        *,
        bug_comments(*),
        bug_attachments(*)
      `)
      .eq('id', bugId)
      .single();

    return { data, error };
  },

  // Update bug report
  async updateBugReport(bugId: string, updates: {
    title?: string;
    description?: string;
    status?: string;
    assignedTo?: string;
    priority?: number;
  }) {
    const { data, error } = await supabase
      .from('bug_reports')
      .update({
        ...updates,
        assigned_to: updates.assignedTo,
        updated_at: new Date().toISOString()
      })
      .eq('id', bugId)
      .select()
      .single();

    return { data, error };
  },

  // Add comment to bug report
  async addBugComment(comment: {
    bugReportId: string;
    comment: string;
    isInternal?: boolean;
  }) {
    const { data, error } = await supabase
      .from('bug_comments')
      .insert({
        bug_report_id: comment.bugReportId,
        comment: comment.comment,
        is_internal: comment.isInternal || false
      })
      .select()
      .single();

    return { data, error };
  },

  // Upload bug attachment
  async uploadBugAttachment(attachment: {
    bugReportId: string;
    file: File;
  }) {
    // First upload file to Supabase Storage
    const fileExt = attachment.file.name.split('.').pop();
    const fileName = `${attachment.bugReportId}/${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('bug-attachments')
      .upload(fileName, attachment.file);

    if (uploadError) {
      return { data: null, error: uploadError };
    }

    // Then create attachment record
    const { data, error } = await supabase
      .from('bug_attachments')
      .insert({
        bug_report_id: attachment.bugReportId,
        filename: attachment.file.name,
        file_path: uploadData.path,
        file_size: attachment.file.size,
        mime_type: attachment.file.type
      })
      .select()
      .single();

    return { data, error };
  },

  // Get bug report statistics
  async getBugReportStats(userId?: string) {
    const { data, error } = await supabase
      .rpc('get_user_bug_summary', userId ? { target_user_id: userId } : {});

    return { data, error };
  },

  // Search bug reports
  async searchBugReports(query: {
    search?: string;
    status?: string[];
    bugType?: string[];
    severity?: string[];
    userId?: string;
    dateRange?: {
      start: string;
      end: string;
    };
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }) {
    let supabaseQuery = supabase
      .from('bug_reports')
      .select(`
        *,
        bug_comments(count),
        bug_attachments(count)
      `, { count: 'exact' });

    // Apply filters
    if (query.search) {
      supabaseQuery = supabaseQuery.or(`title.ilike.%${query.search}%,description.ilike.%${query.search}%`);
    }

    if (query.status?.length) {
      supabaseQuery = supabaseQuery.in('status', query.status);
    }

    if (query.bugType?.length) {
      supabaseQuery = supabaseQuery.in('bug_type', query.bugType);
    }

    if (query.severity?.length) {
      supabaseQuery = supabaseQuery.in('severity', query.severity);
    }

    if (query.userId) {
      supabaseQuery = supabaseQuery.eq('user_id', query.userId);
    }

    if (query.dateRange) {
      supabaseQuery = supabaseQuery
        .gte('created_at', query.dateRange.start)
        .lte('created_at', query.dateRange.end);
    }

    // Apply sorting
    const sortBy = query.sortBy || 'created_at';
    const sortOrder = query.sortOrder || 'desc';
    supabaseQuery = supabaseQuery.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    if (query.limit) {
      const start = query.offset || 0;
      const end = start + query.limit - 1;
      supabaseQuery = supabaseQuery.range(start, end);
    }

    const { data, error, count } = await supabaseQuery;
    
    return { 
      data, 
      error, 
      count: count || 0,
      hasMore: query.limit ? (count || 0) > (query.offset || 0) + query.limit : false
    };
  }
};
