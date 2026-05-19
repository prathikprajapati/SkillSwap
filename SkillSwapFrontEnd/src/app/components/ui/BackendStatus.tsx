import { useState, useEffect } from "react";
import { Wifi, WifiOff, AlertCircle } from "lucide-react";
import apiClient from "../../api/client";

export function BackendStatus() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        // Simple health check - try to reach the backend
        await apiClient.get('/health', { timeout: 3000 });
        setIsOnline(true);
      } catch (error) {
        if ((error as any)?.isNetworkError || (error as any)?.code === 'ERR_NETWORK') {
          setIsOnline(false);
        } else {
          setIsOnline(true); // Backend is online but endpoint doesn't exist
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkBackendStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (isChecking || isOnline === null) {
    return null; // Don't show anything while checking
  }

  if (!isOnline) {
    return (
      <div className="fixed top-4 right-4 z-50 max-w-sm">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 shadow-lg">
          <div className="flex items-start gap-2">
            <WifiOff className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Backend Offline
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Using demo data. Start the backend server for full functionality.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null; // Don't show anything when online
}
