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
    // Stabilize connection lifecycle:
    // - If user is present: connect only once (connectSocket has singleton guard)
    // - If user is absent: disconnect and reset
    let cancelled = false;

    const run = async () => {
      if (!user) {
        disconnectSocket();
        if (!cancelled) {
          setIsConnected(false);
          setConnected(false);
        }
        return;
      }

      const fbUser = auth.currentUser;
      if (!fbUser) return;

      try {
        const idToken = await fbUser.getIdToken();

        const socket = connectSocket(idToken);

        if (!socket) {
          console.error('Failed to create socket connection');
          if (!cancelled) {
            setIsConnected(false);
            setConnected(false);
          }
          return;
        }

        // Sync initial state
        if (!cancelled) {
          setIsConnected(socket.connected);
          setConnected(socket.connected);
        }

        // Lightweight listeners (connection state only).
        // Backend/chat handler already attaches main event listeners once.
        const handleConnect = () => {
          setIsConnected(true);
          setConnected(true);
        };

        const handleDisconnect = () => {
          setIsConnected(false);
          setConnected(false);
        };

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);

        return () => {
          socket.off('connect', handleConnect);
          socket.off('disconnect', handleDisconnect);
          // Do NOT call disconnectSocket() here unless user becomes null.
        };
      } catch (error) {
        console.error('Failed to get Firebase token:', error);
      }
    };

    const cleanupPromise = run();

    return () => {
      cancelled = true;
      // Note: disconnectSocket is handled when `user` becomes null.
      // This prevents connect/disconnect flapping during re-renders.
      void cleanupPromise;
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
