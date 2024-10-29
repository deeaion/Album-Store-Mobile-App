// useWebSocket.ts
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
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      connection?.stop();
    };
  }, [connection]);

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
    if (!url || reconnectAttempts.current >= maxReconnectAttempts || connectionStatus === 'connected' || !token || !userId) return;

    const fullUrl = `${url}?userId=${encodeURIComponent(userId)}`;
    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(fullUrl, { accessTokenFactory: () => token, transport: signalR.HttpTransportType.WebSockets })
      .configureLogging(signalR.LogLevel.Trace)
      .withAutomaticReconnect()
      .build();

    hubConnection.on('ReceiveMessage', (product) => {
      if (JSON.stringify(product) !== lastMessageRef.current) {
        onMessage?.(product);
        showSnackbar(`New Product Added: ${product.name}`, 'success');
        lastMessageRef.current = JSON.stringify(product);
      }
    });

    hubConnection.onclose(async () => {
      if (!isMounted.current) return;
      setConnectionStatus('disconnected');
      stopKeepAlive();

      if (isOnline && reconnectAttempts.current < maxReconnectAttempts) {
        const retryDelay = Math.min(minRetryDelay * (2 ** reconnectAttempts.current), maxRetryDelay);
        reconnectAttempts.current++;
        setTimeout(startConnection, retryDelay);
      }
    });

    try {
      await hubConnection.start();
      setConnection(hubConnection);
      setConnectionStatus('connected');
      startKeepAlive(hubConnection);
    } catch {
      setConnectionStatus('disconnected');
    }
  }, [url, token, userId, onMessage, isOnline]);

  useEffect(() => {
    if (isOnline) startConnection();
  }, [isOnline, startConnection]);

  return { connection, connectionStatus };
};
