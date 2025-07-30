import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Loader2, X } from 'lucide-react';

interface UpdateNotification {
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  timestamp: string;
}

interface UpdateNotificationProps {
  websocketUrl?: string;
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({
  websocketUrl = 'ws://localhost:9001'
}) {
  const [notification, setNotification] = useState<UpdateNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Only connect if we're in the browser and have a valid URL
    if (typeof window === 'undefined' || !websocketUrl) return;

    let currentWebSocket: WebSocket | null = null;

    const connectWebSocket = () => {
      setConnectionStatus('connecting');
      
      try {
        const websocket = new WebSocket(websocketUrl);
        currentWebSocket = websocket;
        
        websocket.onopen = () => {
          console.log('🔌 Connected to update notifications');
          setConnectionStatus('connected');
          setWs(websocket);
        };
        
        websocket.onmessage = (event) {
          try {
            const data = JSON.parse(event.data) as UpdateNotification;
            console.log('📢 Update notification received:', data);
            
            setNotification(data);
            setIsVisible(true);
            
            // Auto-hide success messages after 10 seconds
            if (data.type === 'success') {
              setTimeout(() => {
                setIsVisible(false);
                setTimeout(() => setNotification(null), 300);
              }, 10000);
            }
            
            // Auto-hide info messages after 5 seconds unless they mention restart
            if (data.type === 'info' && !data.message.toLowerCase().includes('restart')) {
              setTimeout(() => {
                setIsVisible(false);
                setTimeout(() => setNotification(null), 300);
              }, 5000);
            }
          } catch (error) {
            console.error('❌ Failed to parse update notification:', error);
          }
        };
        
        websocket.onclose = () => {
          console.log('🔌 Disconnected from update notifications');
          setConnectionStatus('disconnected');
          setWs(null);
          currentWebSocket = null;
          
          // Attempt to reconnect after 5 seconds
          setTimeout(connectWebSocket, 5000);
        };
        
        websocket.onerror = (error) {
          console.error('❌ WebSocket error:', error);
          setConnectionStatus('disconnected');
        };
        
      } catch (error) {
        console.error('❌ Failed to create WebSocket connection:', error);
        setConnectionStatus('disconnected');
        
        // Retry connection after 10 seconds
        setTimeout(connectWebSocket, 10000);
      }
    };

    connectWebSocket();

    // Cleanup on unmount
    return () {
      if (currentWebSocket) {
        currentWebSocket.close();
        currentWebSocket = null;
      }
    };
  }, [websocketUrl]);

  const getNotificationIcon = (type: string) {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />;
    }
  };

  const getNotificationVariant = (type: string) {
    switch (type) {
      case 'warning':
        return 'destructive';
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const dismissNotification = () => {
    setIsVisible(false);
    setTimeout(() => setNotification(null), 300);
  };

  const refreshPage = () => {
    window.location.reload();
  };

  if (!notification) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className={`w-2 h-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
            'bg-red-500'
          }`} />
          <span>
            {connectionStatus === 'connected' ? 'Live updates' : 
             connectionStatus === 'connecting' ? 'Connecting...' : 
             'Updates offline'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className={`transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <Alert variant={getNotificationVariant(notification.type)} className="shadow-lg border-2">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getNotificationIcon(notification.type)}
            </div>
            
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  System Update
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </span>
              </div>
              
              <AlertDescription className="text-sm leading-relaxed">
                {notification.message}
              </AlertDescription>
              
              {(notification.type === 'success' || notification.message.toLowerCase().includes('completed')) && (
                <div className="flex gap-2 mt-3">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={refreshPage}
                    className="text-xs"
                  >
                    Refresh App
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={dismissNotification}
                    className="text-xs"
                  >
                    Dismiss
                  </Button>
                </div>
              )}
              
              {notification.type === 'warning' && notification.message.toLowerCase().includes('restart') && (
                <div className="mt-3">
                  <div className="text-xs text-muted-foreground">
                    The application will restart automatically in a few seconds...
                  </div>
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissNotification}
              className="flex-shrink-0 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </Alert>
      </div>
    </div>
  );
};

export default UpdateNotification;