import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useToast } from '../hooks/use-toast';

// Define the message types that can be received from the WebSocket
interface SocketMessage {
  type: 'alert' | 'sensorData' | 'deviceStatus' | 'attackLog';
  data: any;
}

// Define the context type
interface SocketContextType {
  lastMessage: SocketMessage | null;
  isConnected: boolean;
}

// Create the context with default values
const SocketContext = createContext<SocketContextType>({
  lastMessage: null,
  isConnected: false,
});

// Provider component
interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps): JSX.Element {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<SocketMessage | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    // Determine WebSocket URL (secure in production, regular in development)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log('Attempting to connect to WebSocket at:', wsUrl);
    
    // Create WebSocket connection
    const ws = new WebSocket(wsUrl);
    
    // Connection opened
    ws.addEventListener('open', () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
      toast({
        title: 'Connected',
        description: 'Real-time updates are now active',
      });
    });
    
    // Listen for messages
    ws.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data) as SocketMessage;
        setLastMessage(message);
        
        // Optionally show toast notifications for important events
        if (message.type === 'alert' && message.data.severity === 'critical') {
          toast({
            title: 'Critical Alert',
            description: message.data.title,
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message', error);
      }
    });
    
    // Handle errors
    ws.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to real-time updates service',
        variant: 'destructive',
      });
    });
    
    // Connection closed
    ws.addEventListener('close', () => {
      console.log('WebSocket connection closed');
      setIsConnected(false);
      
      // Attempt to reconnect after a delay
      setTimeout(() => {
        toast({
          title: 'Reconnecting',
          description: 'Attempting to restore real-time updates',
        });
      }, 5000);
    });
    
    setSocket(ws);
    
    // Clean up the socket on unmount
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [toast]);
  
  // Handle reconnection attempts if connection is lost
  useEffect(() => {
    if (!isConnected && socket && socket.readyState === WebSocket.CLOSED) {
      const reconnectTimer = setTimeout(() => {
        window.location.reload(); // Simple reconnection strategy: reload the page
      }, 10000); // Try to reconnect after 10 seconds
      
      return () => clearTimeout(reconnectTimer);
    }
  }, [isConnected, socket]);
  
  return (
    <SocketContext.Provider value={{ lastMessage, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

// Custom hook to use the socket context
export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}