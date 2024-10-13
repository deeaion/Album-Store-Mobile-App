import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const useWebSocket = (url: string, token?: string) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  useEffect(() => {
    // Create a new SignalR Hub connection
    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(url, {
        accessTokenFactory: () => token || '', // Provide the token for authentication
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000]) // Reconnect logic: try immediately, after 2s, 10s, 30s
      .configureLogging(signalR.LogLevel.Information) // Log information to the console
      .build();

    // Start the connection
    hubConnection
      .start()
      .then(() => {
        console.log('Connected to SignalR WebSocket');

        // Subscribe to the 'newProduct' event (adjust the event name based on your backend)
        hubConnection.on('ReceiveMessage', (product) => {
          console.log('New Product Added: ', product);

          // Show a toast notification for the new product
          toast.success(`New Product Added: ${product.name}`, {
            position: 'top-right',
            autoClose: 3000,
          });
        });
      })
      .catch((err) => {
        console.error('Error connecting to SignalR WebSocket:', err);
      });

    // Set the connection to state
    setConnection(hubConnection);

    // Cleanup the connection when the component unmounts
    return () => {
      if (hubConnection) {
        hubConnection.stop().then(() => console.log('SignalR connection stopped'));
      }
    };
  }, [url, token]); // Depend on the `url` and `token` for creating the WebSocket connection

  return connection;
};
