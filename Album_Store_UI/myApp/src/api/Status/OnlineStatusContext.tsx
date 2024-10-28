import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { Network } from '@capacitor/network';

export interface OnlineStatusContextProps {
  isOnline: boolean;
  isServerOnline: boolean;
}

export const OnlineStatusContext = createContext<OnlineStatusContextProps>({ isOnline: true, isServerOnline: true });

interface OnlineStatusProviderProps {
  children: ReactNode;
}

export const OnlineStatusProvider: React.FC<OnlineStatusProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isServerOnline, setIsServerOnline] = useState(true);

  useEffect(() => {
    // Initialize network status
    const initializeNetworkStatus = async () => {
      try {
        const status = await Network.getStatus();
        setIsOnline(status.connected);
      } catch (error) {
        console.error('Failed to retrieve initial network status:', error);
      }
    };

    // Set up listener for network status changes
    const setupNetworkListener = async () => {
      const handler = await Network.addListener('networkStatusChange', (status) => {
        setIsOnline(status.connected);
      });
      return handler;
    };

    // Server health check function
    const checkServerHealth = async () => {
      try {
        const response = await fetch('https://localhost:60505/api/health/health');
        if (!response.ok) throw new Error('Server unavailable');
        setIsServerOnline(true); // Server is available
      } catch (error) {
        console.error('Server health check failed:', error);
        setIsServerOnline(false); // Server is unavailable
      }
    };

    // Initialize network status and listener
    initializeNetworkStatus();
    let networkListener: { remove: () => void };
    setupNetworkListener().then(handler => {
      networkListener = handler;
    });

    // Periodic server health check every 5 minutes
    const healthCheckInterval = setInterval(checkServerHealth,  60 * 1000);
    checkServerHealth(); // Initial check

    // Cleanup
    return () => {
      networkListener?.remove();
      clearInterval(healthCheckInterval);
      console.log('Cleanup complete');
    };
  }, []);

  return (
    <OnlineStatusContext.Provider value={{ isOnline, isServerOnline }}>
      {children}
    </OnlineStatusContext.Provider>
  );
};
