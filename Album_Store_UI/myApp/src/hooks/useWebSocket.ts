import { useEffect, useState, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { Network } from '@capacitor/network';
import { getLogger } from '../utils/logger';
import { useSnackbar } from '../api/Snackbar/SnacbarContext';

const log = getLogger('useSignalRWebSocket');

interface SignalROptions {
  url: string;
  token?: string;
  onMessage?: (product: any) => void;
}

export const useWebSocket = ({ url, token, onMessage }: SignalROptions) => {
  const { showSnackbar } = useSnackbar();
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'offline' | 'reconnecting'>('disconnected');
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const lastMessageRef = useRef<string | null>(null);

  // Check network status using Capacitor's Network API
  const initializeNetworkStatus = useCallback(async () => {
    const status = await Network.getStatus();
    if (!status.connected) {
      setConnectionStatus('offline');
      connection?.stop();  // Stop SignalR connection when offline
    }
  }, [connection]);

  useEffect(() => {
    initializeNetworkStatus();

    const setupNetworkListener = async () => {
      const networkListener = await Network.addListener('networkStatusChange', (status) => {
        if (status.connected) {
          setConnectionStatus('connecting');
          startConnection();  // Attempt to start SignalR connection when online
        } else {
          setConnectionStatus('offline');
          connection?.stop();  // Stop SignalR connection when offline
        }
      });
      
      return networkListener;
    };

    let networkListenerHandle: any;

    setupNetworkListener().then((handle) => {
      networkListenerHandle = handle;
    });

    return () => {
      networkListenerHandle?.remove(); // Cleanup listener on unmount
    };
  }, [connection, initializeNetworkStatus]);

  const startConnection = useCallback(async () => {
    if (!url || connectionStatus === 'offline' || reconnectAttempts.current >= maxReconnectAttempts) return;

    setConnectionStatus('connecting');
    log.log('Attempting to start SignalR connection...');

    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(url, {
        accessTokenFactory: () => token || '',
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    const setupListeners = () => {
      hubConnection.off('ReceiveMessage');
      hubConnection.on('ReceiveMessage', (product) => {
        const messageString = JSON.stringify(product);
        if (messageString !== lastMessageRef.current) {
          log.log('New message received:', product);
          onMessage?.(product);
          showSnackbar(`New Product Added: ${product.name}`, 'success');
          lastMessageRef.current = messageString;
        }
      });
    };

    setupListeners();

    hubConnection.onreconnecting((err) => {
      reconnectAttempts.current += 1;
      log.log('Reconnecting due to error:', err);
      setConnectionStatus('reconnecting');  // Set to reconnecting when SignalR is trying to reconnect
    });

    hubConnection.onreconnected(() => {
      log.log('Reconnected to SignalR WebSocket');
      reconnectAttempts.current = 0;
      setConnectionStatus('connected');
      setupListeners();
    });

    hubConnection.onclose((err) => {
      log.log('Connection closed', err);
      setConnectionStatus('disconnected');
      if (reconnectAttempts.current < maxReconnectAttempts) {
        setTimeout(startConnection, 30000);
      }
    });

    try {
      await hubConnection.start();
      setConnection(hubConnection);
      setConnectionStatus('connected');
      log.log('Connected to SignalR WebSocket');
    } catch (err) {
      log.log('Error connecting to SignalR:', err);
      setConnectionStatus('disconnected');
      if (reconnectAttempts.current < maxReconnectAttempts) {
        setTimeout(startConnection, 30000);
      }
    }
  }, [url, token, onMessage, showSnackbar, connectionStatus]);

  useEffect(() => {
    if (connectionStatus === 'connecting' && token) {
      startConnection();
    }
    return () => {
      connection?.stop().then(() => log.log('SignalR connection stopped'));
    };
  }, [connectionStatus, startConnection, token]);

  return { connection, connectionStatus };
};
