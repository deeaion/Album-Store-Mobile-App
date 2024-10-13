import { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const useWebSocket = (url: string, token?: string) => {
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    const stompClient = new Client({
      // SockJS expects `http` or `https`
      webSocketFactory: () => new SockJS(url),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000, // Reconnect after 5 seconds if connection drops
      heartbeatIncoming: 0, // Disable incoming heartbeats
      heartbeatOutgoing: 10000, // Send a heartbeat every 10 seconds
      debug: (str) => {
        console.log(`STOMP: ${str}`);
      },
    });

    // When the client connects successfully
    stompClient.onConnect = () => {
      console.log('Connected to WebSocket');

      // Subscribe to the 'newProduct' topic
      stompClient.subscribe('/topic/newProduct', (message) => {
        const product = JSON.parse(message.body);
        console.log('New Product Added: ', product);

        // Show a toast notification for the new product
        toast.success(`New Product Added: ${product.name}`, {
          position: "top-right",
          autoClose: 3000,
        });
      });
    };

    // Handle STOMP errors
    stompClient.onStompError = (frame) => {
      console.error(`STOMP error: ${frame.headers['message']}`);
      console.error(`Details: ${frame.body}`);
    };

    // Activate the WebSocket connection
    stompClient.activate();
    setClient(stompClient);

    // Cleanup the connection when the component unmounts
    return () => {
      if (stompClient) stompClient.deactivate();
    };
  }, [url, token]); // Depend on the `url` and `token` for creating the WebSocket connection

  return client;
};
