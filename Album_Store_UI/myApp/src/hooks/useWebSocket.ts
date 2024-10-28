import { useEffect, useState, useCallback, useRef, useContext } from 'react';
import * as signalR from '@microsoft/signalr';
import { Network } from '@capacitor/network';
import { useSnackbar } from '../api/Snackbar/SnacbarContext';
import { OnlineStatusContext } from '../api/Status/OnlineStatusContext';

interface SignalROptions {
  url: string;
  token?: string;
  userId?: string;
  onMessage?: (product: any) => void;
}

export const useWebSocket = ({ url, token, userId = '', onMessage }: SignalROptions) => {
  const { showSnackbar } = useSnackbar();
  const { isOnline } = useContext(OnlineStatusContext);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'offline' | 'reconnecting'>('disconnected');
  const reconnectAttempts = useRef(0);

  const keepAliveInterval = 50000;
  const maxReconnectAttempts = 5;
  const minRetryDelay = 15000;
  const maxRetryDelay = 60000;
  
  const keepAliveRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageRef = useRef<string | null>(null);

  useEffect(() => {
       if (!userId) {
      // console.log('Skipping WebSocket connection as userId is not available.');
      return;
    }
    const initializeNetworkStatus = async () => {
      const status = await Network.getStatus();
      setConnectionStatus(status.connected ? 'connecting' : 'offline');
      // console.log(`Network initialized with status: ${status.connected ? 'Online' : 'Offline'}`);
    };

    initializeNetworkStatus();

    const setupNetworkListener = async () => {
      const networkListener = await Network.addListener('networkStatusChange', (status) => {
        // console.log(`Network status changed: ${status.connected ? 'Online' : 'Offline'}`);
        if (status.connected) {
          setConnectionStatus('connecting');
          startConnection();
        } else {
          setConnectionStatus('offline');
          connection?.stop();
        }
      });
      return networkListener;
    };

    let networkListenerHandle: any;
    setupNetworkListener().then((handle) => {
      networkListenerHandle = handle;
    });

   return () => {
      networkListenerHandle?.remove();
    };
  }, [userId]); // Add userId as a dependency here

  const startKeepAlive = (hubConnection: signalR.HubConnection) => {
    stopKeepAlive();
    keepAliveRef.current = setInterval(() => {
      if (hubConnection.state === signalR.HubConnectionState.Connected) {
        hubConnection.invoke('Ping').catch((err) => console.log('Keep-alive ping failed:', err));
      }
    }, keepAliveInterval);
  };

  const stopKeepAlive = () => {
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
  };

  const startConnection = useCallback(async () => {
    // console.log('startConnection');
    if (!url || reconnectAttempts.current >= maxReconnectAttempts) {
      // console.log(`Skipping connection start. url=${url}, connectionStatus=${connectionStatus}, reconnectAttempts=${reconnectAttempts.current}`);
      return;
    }

    if (!userId) {
      // console.log('No userId provided, connection cannot be started.');
      return;
    }

    if (!token) {
      // console.log('No token provided, connection cannot be started.');
      return;
    }

    setConnectionStatus('connecting');
    // console.log('Attempting to start SignalR connection...');

    const fullUrl = `${url}?userId=${encodeURIComponent(userId)}`;
    // console.log(`Connecting to: ${fullUrl}`);

    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(fullUrl, {
        accessTokenFactory: () => token || '',
        transport: signalR.HttpTransportType.WebSockets,
      })
      .configureLogging(signalR.LogLevel.Trace)
      .withAutomaticReconnect()
      .build();

    const setupListeners = () => {
      hubConnection.off('ReceiveMessage');
      hubConnection.on('ReceiveMessage', (product) => {
        const messageString = JSON.stringify(product);
        if (messageString !== lastMessageRef.current) {
          // console.log('New message received:', product);
          onMessage?.(product);
          showSnackbar(`New Product Added: ${product.name}`, 'success');
          lastMessageRef.current = messageString;
        }
      });
    };

    setupListeners();

    hubConnection.onreconnecting((err) => {
      reconnectAttempts.current += 1;
      // console.log('Reconnecting due to error:', err);
      setConnectionStatus('reconnecting');
      stopKeepAlive();
    });

    hubConnection.onreconnected(() => {
      // console.log('Reconnected to SignalR WebSocket');
      reconnectAttempts.current = 0;
      setConnectionStatus('connected');
      setupListeners();
      startKeepAlive(hubConnection);
    });

    hubConnection.onclose((err) => {
      // console.log('Connection closed', err);
       console.log('Connection closed. Error:', err);
      setConnectionStatus('disconnected');
      stopKeepAlive();

      const retryDelay = Math.min(minRetryDelay * (2 ** reconnectAttempts.current), maxRetryDelay);
      reconnectAttempts.current = Math.min(reconnectAttempts.current + 1, maxReconnectAttempts);

      if (reconnectAttempts.current < maxReconnectAttempts) {
        // console.log(`Retrying connection in ${retryDelay / 1000} seconds...`);
        setTimeout(startConnection, retryDelay);
      } else {
        // console.log('Max retries reached, stopping further attempts.');
      }
    });

    try {
      await hubConnection.start();
      setConnection(hubConnection);
      setConnectionStatus('connected');
      // console.log('Connected to SignalR WebSocket');
      startKeepAlive(hubConnection);
    } catch (err) {
      // console.log('Error connecting to SignalR:', err);
      setConnectionStatus('disconnected');
      const retryDelay = Math.min(minRetryDelay * (2 ** reconnectAttempts.current), maxRetryDelay);
      if (reconnectAttempts.current < maxReconnectAttempts) {
        setTimeout(startConnection, retryDelay);
      }
    }
  }, [url, token, userId, onMessage, showSnackbar]);

  useEffect(() => {
    // console.log('useEffect connectionStatus', connectionStatus);
    if (connectionStatus === 'disconnected' && token && userId) {
      // console.log(`Starting connection with userId: ${userId}`);
      startConnection();
    } else if (!userId) {
      // console.log('Connection not started - userId is undefined');
    }

    return () => {
      if (connection) {
        connection.stop().then(() => console.log('SignalR connection stopped'));
      }
      stopKeepAlive();
    };
  }, [connectionStatus, startConnection, token, userId]);

  return { connection, connectionStatus };
};
