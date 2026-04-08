'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MessageSquareDashed, Clock, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getConversations, ConversationPreview } from '@/services/chatService';

export default function ChatListPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const data = await getConversations();
        setConversations(data);
      } catch (error) {
        console.error("Failed to load conversations", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
    
    // Optional: Poll for updates every 10s to keep "last message" fresh
    const interval = setInterval(fetchChats, 10000);
    return () => clearInterval(interval);
  }, []);

  // Filter based on search
  const filteredChats = conversations.filter(c => 
    c.partner_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    
    // If today, show time (10:30 AM)
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // If this week, show day (Mon)
    if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    // Otherwise show date (12/05)
    return date.toLocaleDateString([], { month: 'numeric', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      
      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..." 
            className="pl-9 bg-gray-50 border-transparent focus:bg-white transition-all rounded-xl" 
          />
        </div>
      </div>

      {/* CHAT LIST */}
      <div className="px-4 py-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
             <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredChats.length > 0 ? (
          <div className="space-y-1">
            {filteredChats.map((chat) => (
              <div 
                key={chat.partner_id}
                onClick={() => router.push(`/chat/${chat.partner_id}`)}
                className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors"
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold text-lg overflow-hidden border border-white shadow-sm">
                    {chat.partner_image ? (
                      <img src={chat.partner_image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      chat.partner_name[0]?.toUpperCase()
                    )}
                  </div>
                  {/* Online Status Dot */}
                  {chat.is_online && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-gray-900 truncate pr-2 group-hover:text-blue-600 transition-colors">
                      {chat.partner_name}
                    </h3>
                    <span className={`text-xs whitespace-nowrap ${chat.unread_count ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                      {formatTime(chat.last_message_time)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className={`text-sm truncate pr-4 ${chat.unread_count ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                      {chat.last_message || <span className="italic text-gray-400">Start a conversation</span>}
                    </p>
                    
                    {/* Unread Badge */}
                    {chat.unread_count ? (
                       <div className="h-5 min-w-[1.25rem] px-1.5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm shadow-blue-200">
                         {chat.unread_count}
                       </div>
                    ) : (
                       <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity -mr-1" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <MessageSquareDashed className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No messages yet</h3>
            <p className="text-sm text-gray-500 max-w-xs mt-2">
              Matches you interact with will appear here. Go explore to find new roommates!
            </p>
            <button 
              onClick={() => router.push('/explore')}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Start Matching
            </button>
          </div>
        )}
      </div>
    </div>
  );
}