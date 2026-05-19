import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../app/contexts/AuthContext';
import { connectSocket, disconnectSocket } from '../chat/chatSocketHandler';
import { useChatStore } from '../chat/chatStore';
import { auth } from '../app/config/firebase';

interface SocketContextType {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const setConnected = useChatStore((state) => state.setConnected);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    if (user) {
      // Get Firebase ID token for socket auth (backend expects Firebase token)
      const getFirebaseToken = async () => {
        const fbUser = auth.currentUser;
        if (!fbUser) return;
        
        try {
          const idToken = await fbUser.getIdToken();
          console.log('🔍 Frontend - Firebase ID Token length:', idToken.length);
          console.log('🔍 Frontend - Firebase ID Token starts with:', idToken.substring(0, 20) + '...');
          const socket = connectSocket(idToken);
          
          if (!socket) {
            console.error('Failed to create socket connection');
            setIsConnected(false);
            setConnected(false);
            return;
          }
          
          // Update connection state based on socket
          const updateConnectionState = () => {
            setIsConnected(socket?.connected || false);
            setConnected(socket?.connected || false);
          };

          socket.on('connect', updateConnectionState);
          socket.on('disconnect', updateConnectionState);
          socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
            setConnected(false);
          });

          // Initial state
          updateConnectionState();

          cleanup = () => {
            socket.off('connect', updateConnectionState);
            socket.off('disconnect', updateConnectionState);
            socket.off('connect_error');
            disconnectSocket();
          };
        } catch (error) {
          console.error('Failed to get Firebase token:', error);
        }
      };
      
      getFirebaseToken();
    } else {
      // Disconnect if user is not authenticated
      disconnectSocket();
      setIsConnected(false);
      setConnected(false);
    }
    
    return () => {
      if (cleanup) cleanup();
    };
  }, [user?.id, setConnected]);

  const connect = async () => {
    const fbUser = auth.currentUser;
    if (fbUser) {
      try {
        const idToken = await fbUser.getIdToken();
        connectSocket(idToken);
      } catch (error) {
        console.error('Failed to get Firebase token:', error);
      }
    }
  };

  const disconnect = () => {
    disconnectSocket();
    setIsConnected(false);
    setConnected(false);
  };

  return (
    <SocketContext.Provider value={{ isConnected, connect, disconnect }}>
      {children}
    </SocketContext.Provider>
  );
};
