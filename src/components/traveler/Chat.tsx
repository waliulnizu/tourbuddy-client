import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import type { ChatMessage } from '../../types';
import Icon from './Icon';

export default function Chat() {
  const { otherUserId, postId } = useParams<{ otherUserId: string; postId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<{ name?: string; profilePicture?: string } | null>(null);
  const [postTitle, setPostTitle] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  const getUser = () => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const fetchMessages = async () => {
      try {
        const res = await axios.get<{ messages: ChatMessage[] }>(
          `${import.meta.env.VITE_API_URL}/api/traveler/messages/${otherUserId}/${postId}`,
          getHeaders()
        );
        setMessages(res.data.messages);
        if (res.data.messages.length > 0) {
          const user = getUser();
          const msg = res.data.messages[0];
          const myId = String(user?._id || user?.id);
          setOtherUser(String(msg.sender._id) === myId ? msg.receiver : msg.sender);
        }
        try {
          const postRes = await axios.get<{ post: { title: string } }>(
            `${import.meta.env.VITE_API_URL}/api/public/post/${postId}`
          );
          setPostTitle(postRes.data.post?.title || '');
        } catch { /* empty */ }
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/traveler/messages/read/${otherUserId}/${postId}`,
          {},
          getHeaders()
        );
      } catch { /* empty */ }
      setLoading(false);
    };
    fetchMessages();
  }, [otherUserId, postId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await axios.post<{ data: ChatMessage }>(
        `${import.meta.env.VITE_API_URL}/api/traveler/message`,
        { receiverId: otherUserId, postId, text: newMessage.trim() },
        getHeaders()
      );
      setMessages(prev => [...prev, res.data.data]);
      setNewMessage('');
      inputRef.current?.focus();
    } catch { /* empty */ }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <Link to="/traveler/inbox" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
          {otherUser?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div>
          <h2 className="font-bold text-gray-900">{otherUser?.name || 'Unknown'}</h2>
          {postTitle && (
            <Link to={`/post/${postId}`} className="text-xs text-teal-600 hover:text-teal-700 font-medium truncate block max-w-[250px]">
              {postTitle}
            </Link>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Icon name="message" className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const user = getUser();
            const isMine = String(msg.sender._id) === String(user?._id || user?.id);
            return (
              <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                  isMine
                    ? 'bg-teal-600 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-900 rounded-bl-md'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${isMine ? 'text-teal-200' : 'text-gray-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-end gap-3 pt-4 border-t border-gray-200">
        <textarea
          ref={inputRef}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none outline-none"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="p-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h14M13 5l7 7-7 7" /></svg>
        </button>
      </form>
    </div>
  );
}
