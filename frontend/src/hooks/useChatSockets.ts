import { useEffect, useRef, useState } from 'react';

// Define the structure of an incoming real-time message
type IncomingMessage = {
  sender: number | 'me';
  msg: string;
};

export const useChatSocket = (userId: number | null, token: string | null) => {
  const [messages, setMessages] = useState<IncomingMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!userId || !token) return;

    // Connect to FastAPI WebSocket endpoint
    // 1. Get the base API URL (Localhost or Cloud)
    const BASE_URL = "https://fitnest-backend-7533.onrender.com";

    // 2. Convert "http" -> "ws" and "https" -> "wss" automatically
    // This ensures that when you are on Render (https), you get Secure WebSockets (wss)
    const SOCKET_URL = BASE_URL.replace(/^http/, 'ws');

    const wsUrl = `${SOCKET_URL}/chat/ws/${userId}/${token}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('Connected to Chat Socket');
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // We only care about the payload data here
        setMessages((prev) => [...prev, data]);
      } catch (err) {
        console.error('Failed to parse WS message', err);
      }
    };

    socket.onclose = () => {
      console.log('Disconnected from Chat Socket');
      setIsConnected(false);
    };

    socketRef.current = socket;

    return () => {
      socket.close();
    };
  }, [userId, token]);

  const sendMessage = (receiverId: number, content: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify({
        to: receiverId,
        msg: content
      });
      socketRef.current.send(payload);
      
      // Optimistically add to our own list
      setMessages((prev) => [...prev, { sender: 'me', msg: content }]);
    } else {
      console.error("Socket not connected");
    }
  };

  return { isConnected, messages, sendMessage };
};
