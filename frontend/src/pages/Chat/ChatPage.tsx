import Header from '../../components/Header'
import './ChatPage.css'
import { useState } from 'react'

const MOCK_CHATS = [
  {
    id: 'c1',
    name: 'Minh Tuấn',
    lastMessage: 'Hay quá, mình cũng vừa xem qua...',
    time: '12:45',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100&h=100',
    unread: 0,
    online: true
  },
  {
    id: 'c2',
    name: 'Hoàng Phát',
    lastMessage: 'Cảm ơn bạn nha!',
    time: 'T2',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100',
    unread: 0,
    online: false
  },
  {
    id: 'c3',
    name: 'Thảo Vy',
    lastMessage: 'Bạn rảnh khi nào đi xem phòng...',
    time: 'T6',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100',
    unread: 2,
    online: true
  }
]

const MOCK_MESSAGES = [
  { id: 1, sender: 'them', text: 'Chào bạn, mình thấy bạn cũng đang tìm phòng trọ khu vực Bách Khoa.', time: '10:30' },
  { id: 2, sender: 'me', text: 'Đúng rồi! Bạn định tìm ngân sách khoảng bao nhiêu?', time: '10:32' },
  { id: 3, sender: 'them', text: 'Mình có ngân sách tầm 3-4 triệu/tháng. Đang nhắm cái Studio mini bên Quận 10 á.', time: '10:35' },
  { id: 4, sender: 'me', text: 'Hay quá, mình cũng vừa xem qua phòng đó. Đi chung cho rẻ không?', time: '10:36' }
]

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState(MOCK_CHATS[0])
  const [message, setMessage] = useState('')

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
            {MOCK_CHATS.map(chat => (
              <div 
                key={chat.id} 
                className={`inbox-item ${activeChat.id === chat.id ? 'active' : ''}`}
                onClick={() => setActiveChat(chat)}
              >
                <div className="inbox-avatar-wrap">
                  <img src={chat.avatar} alt={chat.name} className="inbox-avatar" />
                  {chat.online && <div className="online-indicator" />}
                </div>
                <div className="inbox-info">
                  <div className="inbox-header">
                    <span className="inbox-name">{chat.name}</span>
                    <span className="inbox-time">{chat.time}</span>
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
          {/* Header */}
          <header className="chat-win-header">
            <div className="chat-win-user">
              <img src={activeChat.avatar} alt={activeChat.name} className="win-avatar" />
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
            
            {MOCK_MESSAGES.map(msg => (
              <div key={msg.id} className={`msg-bubble-wrap ${msg.sender}`}>
                {msg.sender === 'them' && <img src={activeChat.avatar} alt="" className="msg-avatar" />}
                <div className="msg-bubble">
                  <p>{msg.text}</p>
                  <span className="msg-time">{msg.time}</span>
                </div>
              </div>
            ))}
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
              />
            </div>
            <button className="btn-send" disabled={!message.trim()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </button>
          </footer>
        </section>
      </main>
    </div>
  )
}
