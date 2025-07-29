import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Filter, Download, Pause, Play, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warning' | 'error';
  source: 'docker' | 'webhook' | 'system' | 'application';
  message: string;
  metadata?: Record<string, unknown>;
}

interface LogStreamViewerProps {
  websocketUrl?: string;
  enablePersistence?: boolean;
  maxLogEntries?: number;
  className?: string;
}

export function LogStreamViewer({
  websocketUrl = 'ws://69.62.71.229:9001',
  enablePersistence = true,
  maxLogEntries = 1000,
  className = '',
}: LogStreamViewerProps) {
  // State management
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  
  // Filter state
  const [levelFilter, setLevelFilter] = useState<Set<string>>(new Set(['debug', 'info', 'warning', 'error']));
  const [sourceFilter, setSourceFilter] = useState<Set<string>>(new Set(['docker', 'webhook', 'system', 'application']));
  
  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnectionStatus('connecting');
    
    try {
      const ws = new WebSocket(websocketUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🔌 Connected to log stream');
        setConnectionStatus('connected');
      };

      ws.onmessage = (event) => {
        if (isPaused) return;

        try {
          const logData = JSON.parse(event.data);
          const logEntry: LogEntry = {
            id: crypto.randomUUID(),
            timestamp: new Date(logData.timestamp || Date.now()),
            level: logData.level || 'info',
            source: logData.source || 'application',
            message: logData.message || event.data,
            metadata: logData.metadata,
          };

          setLogs(prevLogs => {
            const newLogs = [...prevLogs, logEntry];
            // Keep only the most recent entries
            if (newLogs.length > maxLogEntries) => {
              return newLogs.slice(-maxLogEntries);
            }
            return newLogs;
          });
        } catch (error) => {
          // If JSON parsing fails, treat as plain text log
          const logEntry: LogEntry = {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            level: 'info',
            source: 'system',
            message: event.data,
          };

          setLogs(prevLogs => {
            const newLogs = [...prevLogs, logEntry];
            if (newLogs.length > maxLogEntries) => {
              return newLogs.slice(-maxLogEntries);
            }
            return newLogs;
          });
        }
      };

      ws.onclose = () => {
        console.log('🔌 Disconnected from log stream');
        setConnectionStatus('disconnected');
        
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionStatus('disconnected');
      };

    } catch (error) => {
      console.error('❌ Failed to create WebSocket connection:', error);
      setConnectionStatus('disconnected');
      
      // Retry connection after 10 seconds
      setTimeout(connectWebSocket, 10000);
    }
  }, [websocketUrl, isPaused, maxLogEntries]);

  // Effect to establish WebSocket connection
  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) => {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connectWebSocket]);

  // Auto-scroll effect
  useEffect(() => {
    if (autoScroll && logsEndRef.current) => {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredLogs, autoScroll]);

  // Filter logs based on search query and filters
  useEffect(() => {
    let filtered = logs;

    // Apply level filter
    filtered = filtered.filter(log => levelFilter.has(log.level));

    // Apply source filter
    filtered = filtered.filter(log => sourceFilter.has(log.source));

    // Apply search query
    if (searchQuery.trim()) => {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(query) ||
        log.source.toLowerCase().includes(query) ||
        log.level.toLowerCase().includes(query) ||
        (log.metadata && JSON.stringify(log.metadata).toLowerCase().includes(query))
      );
    }

    setFilteredLogs(filtered);
  }, [logs, searchQuery, levelFilter, sourceFilter]);

  // Persistence effect
  useEffect(() => {
    if (enablePersistence && logs.length > 0) => {
      const persistKey = `log-stream-${websocketUrl}`;
      try {
        localStorage.setItem(persistKey, JSON.stringify(logs.slice(-100))); // Persist last 100 logs
      } catch (error) => {
        console.warn('Failed to persist logs:', error);
      }
    }
  }, [logs, enablePersistence, websocketUrl]);

  // Load persisted logs on mount
  useEffect(() => {
    if (enablePersistence) => {
      const persistKey = `log-stream-${websocketUrl}`;
      try {
        const persistedLogs = localStorage.getItem(persistKey);
        if (persistedLogs) => {
          const parsed = JSON.parse(persistedLogs);
          const logsWithDates = parsed.map((log: Omit<LogEntry, 'timestamp'> & { timestamp: string }) => ({
            ...log,
            timestamp: new Date(log.timestamp),
          }));
          setLogs(logsWithDates);
        }
      } catch (error) => {
        console.warn('Failed to load persisted logs:', error);
      }
    }
  }, [enablePersistence, websocketUrl]);

  // Utility functions
  const getLogLevelIcon = (level: string) => {
    switch (level) => {
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
      case 'info':
        return <Info className="h-3 w-3 text-blue-500" />;
      case 'debug':
        return <CheckCircle className="h-3 w-3 text-gray-500" />;
      default:
        return <Info className="h-3 w-3 text-gray-500" />;
    }
  };

  const getLogLevelBadge = (level: string) => {
    const variants = {
      error: 'destructive',
      warning: 'secondary',
      info: 'default',
      debug: 'outline',
    } as const;

    return (
      <Badge variant={variants[level as keyof typeof variants] || 'outline'} className="text-xs">
        {level.toUpperCase()}
      </Badge>
    );
  };

  const getSourceBadge = (source: string) => {
    const colors = {
      docker: 'bg-blue-100 text-blue-800',
      webhook: 'bg-green-100 text-green-800',
      system: 'bg-purple-100 text-purple-800',
      application: 'bg-orange-100 text-orange-800',
    };

    return (
      <Badge 
        variant="outline" 
        className={`text-xs ${colors[source as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}
      >
        {source}
      </Badge>
    );
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    }).format(timestamp);
  };

  const exportLogs = () => {
    const data = filteredLogs.map(log => ({
      timestamp: log.timestamp.toISOString(),
      level: log.level,
      source: log.source,
      message: log.message,
      metadata: log.metadata,
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    setLogs([]);
    if (enablePersistence) => {
      const persistKey = `log-stream-${websocketUrl}`;
      localStorage.removeItem(persistKey);
    }
  };

  const toggleFilter = (filter: Set<string>, setFilter: (filter: Set<string>) => void, value: string) => {
    const newFilter = new Set(filter);
    if (newFilter.has(value)) => {
      newFilter.delete(value);
    } else {
      newFilter.add(value);
    }
    setFilter(newFilter);
  };

  const handleScroll = useCallback(() => {
    if (logContainerRef.current) => {
      const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 5;
      setAutoScroll(isAtBottom);
    }
  }, []);

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Real-time Logs</CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Connection Status */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
                'bg-red-500'
              }`} />
              <span>
                {connectionStatus === 'connected' ? 'Live' : 
                 connectionStatus === 'connecting' ? 'Connecting...' : 
                 'Disconnected'}
              </span>
            </div>

            {/* Controls */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
              className="h-8"
            >
              {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={exportLogs}
              className="h-8"
            >
              <Download className="h-3 w-3" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={clearLogs}
              className="h-8"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs..."
              className="pl-10"
            />
          </div>

          {/* Level Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10">
                <Filter className="h-4 w-4 mr-2" />
                Levels ({levelFilter.size})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Log Levels</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {['debug', 'info', 'warning', 'error'].map(level => (
                <DropdownMenuCheckboxItem
                  key={level}
                  checked={levelFilter.has(level)}
                  onCheckedChange={() => toggleFilter(levelFilter, setLevelFilter, level)}
                  className="capitalize"
                >
                  {level}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Source Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10">
                <Filter className="h-4 w-4 mr-2" />
                Sources ({sourceFilter.size})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Log Sources</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {['docker', 'webhook', 'system', 'application'].map(source => (
                <DropdownMenuCheckboxItem
                  key={source}
                  checked={sourceFilter.has(source)}
                  onCheckedChange={() => toggleFilter(sourceFilter, setSourceFilter, source)}
                  className="capitalize"
                >
                  {source}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
          <span>Total: {logs.length}</span>
          <span>Filtered: {filteredLogs.length}</span>
          <span>Max: {maxLogEntries}</span>
          {isPaused && <Badge variant="secondary" className="text-xs">Paused</Badge>}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div 
          ref={logContainerRef}
          className="h-96 overflow-y-auto border border-border/50 bg-muted/20"
          onScroll={handleScroll}
        >
          {filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No logs to display</p>
                <p className="text-xs mt-1">
                  {logs.length === 0 ? 'Waiting for log entries...' : 'No logs match current filters'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-2 rounded text-xs border border-border/30 bg-background/50 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getLogLevelIcon(log.level)}
                  </div>
                  
                  <div className="flex-shrink-0 text-muted-foreground font-mono">
                    {formatTimestamp(log.timestamp)}
                  </div>
                  
                  <div className="flex gap-1">
                    {getLogLevelBadge(log.level)}
                    {getSourceBadge(log.source)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-foreground break-words font-mono">
                      {log.message}
                    </div>
                    {log.metadata && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        <details className="cursor-pointer">
                          <summary className="hover:text-foreground">Metadata</summary>
                          <pre className="mt-1 p-2 bg-muted/50 rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>

        {!autoScroll && (
          <div className="flex justify-center p-2 border-t border-border/50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAutoScroll(true);
                logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs"
            >
              Scroll to bottom
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}