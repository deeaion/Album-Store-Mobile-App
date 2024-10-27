import { useEffect, useState } from 'react';
import { Network, ConnectionStatus } from '@capacitor/network';
import { PluginListenerHandle } from '@capacitor/core';

const initialState: ConnectionStatus = {
  connected: false,
  connectionType: 'unknown',
};

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<ConnectionStatus>(initialState);

  useEffect(() => {
    let handler: PluginListenerHandle | null = null;
    let canceled = false;

    // Function to handle network status changes
    const handleNetworkStatusChange = (status: ConnectionStatus) => {
      console.log('Network status changed:', status);
      if (!canceled) {
        setNetworkStatus(status);
      }
    };

    // Initialize network status and set up listener
    const initializeNetworkStatus = async () => {
      const status = await Network.getStatus();
      console.log('Initial network status:', status);
      if (!canceled) {
        setNetworkStatus(status);
      }

      handler = await Network.addListener('networkStatusChange', handleNetworkStatusChange);
    };

    initializeNetworkStatus();

    return () => {
      canceled = true;
      handler?.remove();
    };
  }, []);

  return { networkStatus };
};
