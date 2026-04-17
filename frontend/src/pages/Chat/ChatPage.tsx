import Header from '../../components/Header'
import './ChatPage.css'
import { useEffect, useState, useRef } from 'react'
import type { ChatMessage } from '../../types'
import { useAuth } from '../../context/AuthContext'
import { authenticatedFetch } from '../../lib/api'

export default function ChatPage() {
  const { user } = useAuth();
  const [inbox, setInbox] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchInbox = async () => {
      try {
        const res = await authenticatedFetch('/api/chat/conversations');
        const data = await res.json();
        setInbox(data || []);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchInbox();
  }, [user]);

  useEffect(() => {
    if (!user || !activeChat) return;
    const loadHistoryAndConnect = async () => {
      try {
        const historyRes = await authenticatedFetch(`/api/chat/history/${activeChat.id}?limit=50`);
        const messagesData = await historyRes.json();
        setMessages(messagesData || []);

        const token = await user.getIdToken();
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        ws.current = new WebSocket(`${protocol}//${window.location.host}/api/chat/ws/${user.uid}/${token}`);
        
        ws.current.onmessage = (event) => {
          const incoming = JSON.parse(event.data);
          // incoming format: {"sender": user_id, "msg": content}
          if (incoming.sender === activeChat.id || incoming.sender === user.uid) {
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              sender_id: incoming.sender,
              receiver_id: incoming.sender === user.uid ? activeChat.id : user.uid,
              content: incoming.msg,
              timestamp: new Date().toISOString()
            } as any]);
          }
        };
      } catch (err: any) {
        setError(err.message);
      }
    };
    loadHistoryAndConnect();
    return () => ws.current?.close();
  }, [user, activeChat]);

  const handleSend = () => {
    if (!message.trim() || !user || !activeChat || !ws.current) return;
    ws.current.send(JSON.stringify({
      to: activeChat.id,
      msg: message
    }));
    setMessage('');
  };

  if (error) {
    return (
      <div className="chat-layout">
        <Header />
        <main className="chat-main" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1.5rem', borderRadius: '8px', border: '1px solid #f87171' }}>
            <h2 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>SYSTEM HALTED</h2>
            <p>{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="chat-layout">
      <Header />

      <main className="chat-main">
        {/* === SIDEBAR: INBOX === */}
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h2 className="sidebar-title">Tin nhắn</h2>
            <div className="chat-search">
              <input type="text" placeholder="Tìm kiếm hội thoại..." />
            </div>
          </div>

          <div className="inbox-list">
            {inbox.map(chat => (
              <div 
                key={chat.id} 
                className={`inbox-item ${activeChat?.id === chat.id ? 'active' : ''}`}
                onClick={() => setActiveChat(chat)}
              >
                <div className="inbox-avatar-wrap">
                  <img src={chat.avatar || 'https://via.placeholder.com/80'} alt={chat.name} className="inbox-avatar" />
                  {chat.online && <div className="online-indicator" />}
                </div>
                <div className="inbox-info">
                  <div className="inbox-header">
                    <span className="inbox-name">{chat.name}</span>
                    <span className="inbox-time">{new Date(chat.last_activity).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className="inbox-footer">
                    <p className="inbox-msg">{chat.lastMessage}</p>
                    {chat.unread > 0 && <span className="unread-badge">{chat.unread}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* === CHAT WINDOW === */}
        <section className="chat-window">
          {activeChat ? (
            <>
              {/* Header */}
              <header className="chat-win-header">
                <div className="chat-win-user">
                  <img src={activeChat.avatar || 'https://via.placeholder.com/80'} alt={activeChat.name} className="win-avatar" />
                  <div className="win-info">
                    <h3 className="win-name">{activeChat.name}</h3>
                    <span className="win-status">{activeChat.online ? 'Đang hoạt động' : 'Ngoại tuyến'}</span>
                  </div>
                </div>
                
                <div className="chat-win-actions">
                  <button className="btn-view-listing">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    Xem phòng đang quan tâm
                  </button>
                  <button className="win-action-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                  </button>
                </div>
              </header>

              {/* Messages Area */}
              <div className="chat-messages">
                <div className="msg-date-divider">Hôm nay</div>
                
                {messages.map(msg => {
                  const isMe = msg.sender_id === user?.uid;
                  return (
                    <div key={msg.id} className={`msg-bubble-wrap ${isMe ? 'me' : 'them'}`}>
                      {!isMe && <img src={activeChat.avatar || 'https://via.placeholder.com/80'} alt="" className="msg-avatar" />}
                      <div className="msg-bubble">
                        <p>{msg.content}</p>
                        <span className="msg-time">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer Input */}
              <footer className="chat-input-area">
                <button className="input-action-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                </button>
                <div className="input-wrapper">
                  <input 
                    type="text" 
                    placeholder="Nhập tin nhắn..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  />
                </div>
                <button className="btn-send" onClick={handleSend} disabled={!message.trim()}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                </button>
              </footer>
            </>
          ) : (
            <div style={{display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#6b7280'}}>
              Chọn một hội thoại để bắt đầu
            </div>
          )}


        </section>
      </main>
    </div>
  )
}
