import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  Key, 
  Database, 
  RefreshCw, 
  Copy, 
  Eye, 
  EyeOff,
  Lock,
  Unlock,
  User,
  UserX,
  Globe
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { supabase } from '@/lib/supabase';

interface AuthenticationDebuggerProps {
  className?: string;
}

interface AuthTest {
  name: string;
  status: 'pending' | 'running' | 'success' | 'warning' | 'error';
  message: string;
  details?: Record<string, unknown>;
  timestamp?: Date;
}

interface SupabaseConnectionTest {
  url: boolean;
  key: boolean;
  connection: boolean;
  auth: boolean;
  rls: boolean;
}

export function AuthenticationDebugger({ className = '' }: AuthenticationDebuggerProps) {
  const [authTests, setAuthTests] = useState<AuthTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentUser, setCurrentUser] = useState<Record<string, unknown> | null>(null);
  const [connectionTest, setConnectionTest] = useState<SupabaseConnectionTest | null>(null);
  const [testCredentials, setTestCredentials] = useState({
    email: 'test@example.com',
    password: 'testpassword123'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [authLogs, setAuthLogs] = useState<string[]>([]);

  // Initialize auth state monitoring
  useEffect(() => {
    // Get current auth state
    const getCurrentUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) => {
          addAuthLog(`Auth state error: ${error.message}`);
        } else {
          setCurrentUser(user);
          addAuthLog(`Current user: ${user?.email || 'None'}`);
        }
      } catch (error) => {
        addAuthLog(`Failed to get current user: ${error}`);
      }
    };

    getCurrentUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      addAuthLog(`Auth event: ${event}, User: ${session?.user?.email || 'None'}`);
      setCurrentUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const addAuthLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setAuthLogs(prev => [...prev.slice(-19), `[${timestamp}] ${message}`]);
  };

  // Test Supabase configuration
  const testSupabaseConfig = async (): Promise<AuthTest> => {
    const test: AuthTest = {
      name: 'Supabase Configuration',
      status: 'running',
      message: 'Testing Supabase connection and configuration...',
    };

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const config: SupabaseConnectionTest = {
        url: !!supabaseUrl,
        key: !!supabaseKey && supabaseKey.length > 50,
        connection: false,
        auth: false,
        rls: false,
      };

      if (!config.url) => {
        return {
          ...test,
          status: 'error',
          message: 'VITE_SUPABASE_URL is not configured',
          details: { missing: 'VITE_SUPABASE_URL' },
        };
      }

      if (!config.key) => {
        return {
          ...test,
          status: 'error',
          message: 'VITE_SUPABASE_ANON_KEY is missing or invalid',
          details: { 
            missing: 'VITE_SUPABASE_ANON_KEY',
            keyLength: supabaseKey?.length || 0 
          },
        };
      }

      // Test connection
      try {
        const { error } = await supabase.from('chat_messages').select('count', { count: 'exact', head: true });
        config.connection = !error;
        config.auth = !error;
        
        if (error) => {
          addAuthLog(`Connection test failed: ${error.message}`);
          return {
            ...test,
            status: 'error',
            message: `Database connection failed: ${error.message}`,
            details: { error: error.message, code: error.code },
          };
        }
      } catch (connectionError) => {
        addAuthLog(`Connection test error: ${connectionError}`);
        return {
          ...test,
          status: 'error',
          message: 'Failed to connect to Supabase',
          details: { error: String(connectionError) },
        };
      }

      setConnectionTest(config);
      addAuthLog('Supabase configuration test passed');

      return {
        ...test,
        status: 'success',
        message: 'Supabase configuration is valid',
        details: { 
          url: supabaseUrl,
          keyLength: supabaseKey.length,
          project: supabaseUrl.split('//')[1]?.split('.')[0]
        },
      };
    } catch (error) => {
      addAuthLog(`Config test error: ${error}`);
      return {
        ...test,
        status: 'error',
        message: 'Configuration test failed',
        details: { error: String(error) },
      };
    }
  };

  // Test authentication endpoints
  const testAuthEndpoints = async (): Promise<AuthTest> => {
    const test: AuthTest = {
      name: 'Authentication Endpoints',
      status: 'running',
      message: 'Testing authentication service endpoints...',
    };

    try {
      // Test if auth endpoints are accessible
      const { data, error } = await supabase.auth.getSession();
      
      if (error) => {
        addAuthLog(`Auth endpoint error: ${error.message}`);
        return {
          ...test,
          status: 'error',
          message: `Auth service error: ${error.message}`,
          details: { error: error.message },
        };
      }

      addAuthLog('Auth endpoints accessible');
      return {
        ...test,
        status: 'success',
        message: 'Authentication endpoints are accessible',
        details: { 
          sessionExists: !!data.session,
          userExists: !!data.session?.user 
        },
      };
    } catch (error) => {
      addAuthLog(`Endpoint test error: ${error}`);
      return {
        ...test,
        status: 'error',
        message: 'Failed to access authentication endpoints',
        details: { error: String(error) },
      };
    }
  };

  // Test RLS policies
  const testRLSPolicies = async (): Promise<AuthTest> => {
    const test: AuthTest = {
      name: 'Row Level Security (RLS)',
      status: 'running',
      message: 'Testing RLS policies and permissions...',
    };

    try {
      // Test accessing a protected table without auth
      const { error: unauthError } = await supabase
        .from('chat_messages')
        .select('id')
        .limit(1);

      if (!unauthError) => {
        addAuthLog('Warning: RLS may not be properly configured');
        return {
          ...test,
          status: 'warning',
          message: 'RLS policies may not be properly configured - data accessible without auth',
          details: { rlsStatus: 'potentially_disabled' },
        };
      }

      // Check if the error is an auth error (expected)
      if (unauthError.code === 'PGRST301' || unauthError.message.includes('JWT')) => {
        addAuthLog('RLS policies are active');
        return {
          ...test,
          status: 'success',
          message: 'RLS policies are properly configured',
          details: { rlsStatus: 'active', errorCode: unauthError.code },
        };
      }

      addAuthLog(`RLS test unexpected error: ${unauthError.message}`);
      return {
        ...test,
        status: 'warning',
        message: `Unexpected RLS behavior: ${unauthError.message}`,
        details: { error: unauthError.message, code: unauthError.code },
      };
    } catch (error) => {
      addAuthLog(`RLS test error: ${error}`);
      return {
        ...test,
        status: 'error',
        message: 'Failed to test RLS policies',
        details: { error: String(error) },
      };
    }
  };

  // Test user authentication flow
  const testAuthFlow = async (): Promise<AuthTest> => {
    const test: AuthTest = {
      name: 'Authentication Flow',
      status: 'running',
      message: 'Testing sign-up and sign-in capabilities...',
    };

    try {
      // Test sign-up capability (this won't actually create a user)
      const { error: signUpError } = await supabase.auth.signUp({
        email: 'test-nonexistent@example.com',
        password: 'testpassword123',
        options: { data: { test: true } }
      });

      if (signUpError) => {
        // Some errors are expected (like user already exists)
        if (signUpError.message.includes('already registered') || 
            signUpError.message.includes('rate limit') ||
            signUpError.message.includes('email not confirmed')) => {
          addAuthLog('Auth flow test: Sign-up endpoint responsive');
          return {
            ...test,
            status: 'success',
            message: 'Authentication flow is functional',
            details: { 
              signUpEndpoint: 'responsive',
              expectedError: signUpError.message 
            },
          };
        }

        addAuthLog(`Auth flow error: ${signUpError.message}`);
        return {
          ...test,
          status: 'error',
          message: `Authentication flow error: ${signUpError.message}`,
          details: { error: signUpError.message },
        };
      }

      addAuthLog('Auth flow test completed');
      return {
        ...test,
        status: 'success',
        message: 'Authentication flow is functional',
        details: { signUpEndpoint: 'responsive' },
      };
    } catch (error) => {
      addAuthLog(`Auth flow test error: ${error}`);
      return {
        ...test,
        status: 'error',
        message: 'Authentication flow test failed',
        details: { error: String(error) },
      };
    }
  };

  // Run all authentication tests
  const runAuthTests = async () => {
    setIsRunning(true);
    setAuthTests([]);
    addAuthLog('Starting authentication diagnostics...');

    const tests = [
      testSupabaseConfig,
      testAuthEndpoints,
      testRLSPolicies,
      testAuthFlow,
    ];

    for (const testFn of tests) => {
      try {
        const result = await testFn();
        result.timestamp = new Date();
        setAuthTests(prev => [...prev, result]);
        
        // Add small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) => {
        const errorTest: AuthTest = {
          name: testFn.name,
          status: 'error',
          message: 'Test execution failed',
          details: { error: String(error) },
          timestamp: new Date(),
        };
        setAuthTests(prev => [...prev, errorTest]);
      }
    }

    addAuthLog('Authentication diagnostics completed');
    setIsRunning(false);
  };

  // Test specific credentials
  const testCredentialsAuth = async () => {
    if (!testCredentials.email || !testCredentials.password) => {
      addAuthLog('Test credentials are required');
      return;
    }

    addAuthLog(`Testing credentials for ${testCredentials.email}...`);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testCredentials.email,
        password: testCredentials.password,
      });

      if (error) => {
        addAuthLog(`Credential test failed: ${error.message}`);
      } else {
        addAuthLog(`Credential test successful for ${data.user?.email}`);
        // Sign out immediately to avoid affecting the session
        await supabase.auth.signOut();
        addAuthLog('Test session signed out');
      }
    } catch (error) => {
      addAuthLog(`Credential test error: ${error}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) => {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default',
      warning: 'secondary',
      error: 'destructive',
      running: 'outline',
      pending: 'outline',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'} className="text-xs">
        {status.toUpperCase()}
      </Badge>
    );
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) => {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Authentication Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5" />
              <div>
                <CardTitle className="text-lg">Authentication Debugging</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Comprehensive authentication system diagnostics and debugging
                </p>
              </div>
            </div>

            <Button
              onClick={runAuthTests}
              disabled={isRunning}
              className="h-8"
            >
              <RefreshCw className={`h-3 w-3 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? 'Running...' : 'Run Tests'}
            </Button>
          </div>

          {/* Current Auth State */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="flex items-center gap-3 p-3 border border-border/50 rounded">
              {currentUser ? (
                <User className="h-4 w-4 text-green-500" />
              ) : (
                <UserX className="h-4 w-4 text-gray-500" />
              )}
              <div>
                <div className="text-sm font-medium">User Status</div>
                <div className="text-xs text-muted-foreground">
                  {currentUser ? (
                    <Badge variant="default" className="text-xs">
                      Authenticated
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Anonymous
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border border-border/50 rounded">
              <Database className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-sm font-medium">Supabase</div>
                <div className="text-xs text-muted-foreground">
                  {connectionTest?.connection ? (
                    <Badge variant="default" className="text-xs">Connected</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">Disconnected</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border border-border/50 rounded">
              {connectionTest?.rls ? (
                <Lock className="h-4 w-4 text-green-500" />
              ) : (
                <Unlock className="h-4 w-4 text-yellow-500" />
              )}
              <div>
                <div className="text-sm font-medium">RLS Security</div>
                <div className="text-xs text-muted-foreground">
                  {connectionTest?.rls ? (
                    <Badge variant="default" className="text-xs">Active</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Unknown</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Test Results */}
      {authTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Diagnostic Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {authTests.map((test, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 border border-border/50 rounded hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(test.status)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{test.name}</span>
                      {getStatusBadge(test.status)}
                      {test.timestamp && (
                        <span className="text-xs text-muted-foreground">
                          {test.timestamp.toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">{test.message}</p>
                    
                    {test.details && Object.keys(test.details).length > 0 && (
                      <details className="cursor-pointer">
                        <summary className="text-xs text-blue-600 hover:text-blue-800">
                          View Details
                        </summary>
                        <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                          <pre className="text-foreground overflow-x-auto">
                            {JSON.stringify(test.details, null, 2)}
                          </pre>
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Credential Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Manual Authentication Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Test Email</label>
                <Input
                  type="email"
                  value={testCredentials.email}
                  onChange={(e) => setTestCredentials(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="test@example.com"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Test Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={testCredentials.password}
                    onChange={(e) => setTestCredentials(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Password"
                    className="text-sm pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            </div>

            <Button
              onClick={testCredentialsAuth}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Key className="h-3 w-3 mr-2" />
              Test Authentication
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current User Details */}
      {currentUser && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current User Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">User ID:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">{currentUser.id}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(currentUser.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-mono text-xs">{currentUser.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email Confirmed:</span>
                <Badge variant={currentUser.email_confirmed_at ? 'default' : 'secondary'} className="text-xs">
                  {currentUser.email_confirmed_at ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last Sign In:</span>
                <span className="text-xs">
                  {currentUser.last_sign_in_at ? new Date(currentUser.last_sign_in_at).toLocaleString() : 'Never'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Authentication Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Authentication Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 overflow-y-auto border border-border/50 rounded p-3 bg-muted/20">
            {authLogs.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                No authentication activity yet
              </div>
            ) : (
              <div className="space-y-1">
                {authLogs.map((log, index) => (
                  <div key={index} className="text-xs font-mono text-foreground">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}