'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getChatHistory, getWebSocketUrl, Message } from '@/services/chatService';
import { getUserPublicProfile } from '@/services/authService';
import { MessageSquareDashed, Send, Phone, Video, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// We need a way to know "Who am I?". In a real app, decode this from the token.
// For this demo, we'll cheat slightly and grab it from localStorage or context.
const getCurrentUserId = () => {
  // Simple hack for the competition: decode the token or store ID on login
  // You can also just fetch /auth/me endpoint if you built it
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
     // JWTs are 3 parts separated by dots. The middle part is base64 encoded JSON.
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id;
  } catch (e) {
    return null;
  }
};

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  
  //Handle ID logic
  const rawId = params.partnerId || params.id;
  const partnerId = parseInt(rawId as string);
  const myId = getCurrentUserId();

  // --- NEW STATE FOR USERNAME ---
  const [partnerName, setPartnerName] = useState(`User #${partnerId}`);

  useEffect(() => {
    if (isNaN(partnerId)) {
      alert("Invalid User ID. returning to matches.");
      router.push('/matches');
    }
  }, [partnerId, router]);

// --- FETCH USERNAME HERE ---
  getUserPublicProfile(partnerId)
    .then(user => setPartnerName(user.username))
    .catch(err => console.error("Could not load partner name", err));
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('Connecting...');
  
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Load History & Connect Socket
  useEffect(() => {
    if (!myId) return;

    // A. Fetch old history
    getChatHistory(partnerId).then(data => {
      setMessages(data);
      scrollToBottom();
    });

    // B. Connect WebSocket
    const wsUrl = getWebSocketUrl(myId);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => setStatus('Online');
    
    ws.onmessage = (event) => {
      // Receive incoming message from backend
      const data = JSON.parse(event.data);
      // Backend sends: {"sender": 123, "msg": "Hello"}
      const newMsg: Message = {
        sender_id: data.sender,
        receiver_id: myId, // It was sent TO me
        content: data.msg,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMsg]);
      scrollToBottom();
    };

    ws.onclose = () => setStatus('Disconnected');

    socketRef.current = ws;

    return () => {
      ws.close();
    };
  }, [partnerId, myId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current || !myId) return;

    // 1. Send to Backend via WebSocket
    const payload = {
      to: partnerId,
      msg: input
    };
    socketRef.current.send(JSON.stringify(payload));

    // 2. Optimistically add to UI (so it feels instant)
    const myMsg: Message = {
      sender_id: myId,
      receiver_id: partnerId,
      content: input,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, myMsg]);
    setInput('');
    scrollToBottom();
  };

  return (
    // mb-20: Ensure extra safety margin at bottom on mobile.
    <div className="flex flex-col h-[calc(100dvh-6rem)] bg-white overflow-hidden rounded-2xl border border-gray-200 shadow-sm m-4">
      
      {/* Chat Header */}
      <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={() => router.back()}>
             ←
          </Button>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
             {partnerName[0]?.toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{partnerName}</h3>
            <span className="text-xs text-green-500 flex items-center gap-1">● Active now</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Phone className="w-5 h-5 cursor-pointer hover:text-blue-500" />
          <Video className="w-5 h-5 cursor-pointer hover:text-blue-500" />
          <MoreVertical className="w-5 h-5 cursor-pointer hover:text-gray-600" />
        </div>
      </div>

      {/* Messages Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
            <MessageSquareDashed className="w-16 h-16 mb-2" />
            <p>No messages yet. Say hi!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender_id === myId;
            return (
              <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                  isMe 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                }`}>
                  <p>{msg.content}</p>
                  <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area (Fixed at bottom of container) */}
      <div className="p-4 bg-white border-t border-gray-100 shrink-0">
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-50 border-gray-200 focus-visible:ring-blue-500 rounded-full px-4"
          />
          <Button type="submit" size="icon" className="rounded-full bg-blue-600 hover:bg-blue-700 w-10 h-10 shrink-0" disabled={!input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

    </div>
  );
}