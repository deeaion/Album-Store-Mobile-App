import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { Network } from '@capacitor/network';

export interface OnlineStatusContextProps {
  isOnline: boolean;
}

export const OnlineStatusContext = createContext<OnlineStatusContextProps>({ isOnline: true });

interface OnlineStatusProviderProps {
  children: ReactNode;
}

export const OnlineStatusProvider: React.FC<OnlineStatusProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Function to initialize the network status on load
    const initializeNetworkStatus = async () => {
      try {
        const status = await Network.getStatus();
        console.log('Initial network status:', status.connected ? 'Online' : 'Offline');
        setIsOnline(status.connected);
      } catch (error) {
        console.error('Failed to retrieve initial network status:', error);
      }
    };

    // Set up the listener to track network status changes
    const setupNetworkListener = async () => {
      const handler = await Network.addListener('networkStatusChange', (status) => {
        console.log('Network status changed:', status.connected ? 'Online' : 'Offline');
        setIsOnline(status.connected);
      });
      return handler;
    };

    // Initialize network status and listener
    initializeNetworkStatus();
    let networkListener: { remove: () => void };

    setupNetworkListener().then(handler => {
      networkListener = handler;
    });

    // Cleanup network listener on unmount
    return () => {
      networkListener?.remove();
      console.log('Network listener removed');
    };
  }, []);

  return (
    <OnlineStatusContext.Provider value={{ isOnline }}>
      {children}
    </OnlineStatusContext.Provider>
  );
};
