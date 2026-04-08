import api from './api';

export interface Message {
  id?: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  timestamp?: string;
}

export interface ConversationPreview {
  partner_id: number;
  partner_name: string;
  partner_image?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
  is_online?: boolean;
}

export const getChatHistory = async (partnerId: number) => {
  const response = await api.get<Message[]>(`/chat/history/${partnerId}`);
  return response.data;
};

export const getConversations = async () => {
  const response = await api.get<ConversationPreview[]>('/chat/conversations');
  return response.data;
};

// Helper to get the WebSocket URL with authentication
export const getWebSocketUrl = (userId: number) => {
  // 1. Get the base API URL
  const BASE_URL = "https://fitnest-backend-7533.onrender.com";

  // 2. Convert "http" -> "ws" and "https" -> "wss" automatically
  // This ensures that when you are on Render (https), you get Secure WebSockets (wss)
  const SOCKET_URL = BASE_URL.replace(/^http/, 'ws');

  // 3. Connect!
  const token = localStorage.getItem('token');
  // Note: WebSockets use 'ws://' instead of 'http://'
  return `${SOCKET_URL}/chat/ws/${userId}/${token}`;
};
