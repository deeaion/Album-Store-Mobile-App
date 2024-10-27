import { useEffect, useState, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { toast } from 'react-toastify';
import { getLogger } from '../utils/logger';

const log = getLogger('useSignalRWebSocket');

interface SignalROptions {
  url: string;
  token?: string;
  onMessage?: (product: any) => void;
}

export const useWebSocket = ({ url, token, onMessage }: SignalROptions) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5; // Set a maximum limit on reconnect attempts

  const startConnection = useCallback(async () => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      log.log('Max reconnect attempts reached. Stopping reconnection attempts.');
      return;
    }

    if (connectionRef.current?.state === signalR.HubConnectionState.Connected || !url) return;

    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(url, {
        accessTokenFactory: () => token || '',
      })
      .withAutomaticReconnect([0, 5000, 10000, 20000]) // Increased intervals
      .configureLogging(signalR.LogLevel.Information)
      .build();

    hubConnection.on('ReceiveMessage', (product) => {
      log.log('New message received:', product);
      onMessage?.(product);

      toast.success(`New Product Added: ${product.name}`, {
        position: 'top-right',
        autoClose: 3000,
      });
    });

    hubConnection.onreconnecting((err) => {
      log.log('Reconnecting due to error:', err);
      reconnectAttempts.current += 1;
    });

    hubConnection.onreconnected(() => {
      log.log('Reconnected to SignalR WebSocket');
      reconnectAttempts.current = 0;
    });

    try {
      await hubConnection.start();
      log.log('Connected to SignalR WebSocket');
      setConnection(hubConnection);
      connectionRef.current = hubConnection;
    } catch (err) {
      log.log('Error connecting to SignalR:', err);
      setTimeout(startConnection, 20000); // Retry after a delay if failed
    }
  }, [url, token, onMessage]);

  useEffect(() => {
    startConnection();

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop().then(() => log.log('SignalR connection stopped'));
        connectionRef.current = null;
      }
    };
  }, [startConnection]);

  const sendMessage = useCallback(
    (message: any) => {
      if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
        connectionRef.current.send('SendMessage', message);
      } else {
        log.log('SignalR connection not open. Message not sent:', message);
      }
    },
    []
  );

  return { sendMessage };
};
