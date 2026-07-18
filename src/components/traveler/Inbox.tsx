import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Conversation } from '../../types';
import Icon from './Icon';

export default function Inbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const fetchInbox = async () => {
      try {
        const res = await axios.get<{ conversations: Conversation[] }>(
          `${import.meta.env.VITE_API_URL}/api/traveler/inbox`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setConversations(res.data.conversations);
      } catch { /* empty */ }
      setLoading(false);
    };
    fetchInbox();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inbox</h2>
          <p className="text-sm text-gray-500 mt-1">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
            <Icon name="message" className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No conversations yet</h3>
          <p className="text-gray-500 text-sm mb-6">Start a conversation by messaging a tour host.</p>
          <Link to="/posts" className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all">
            Browse Tours
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <Link
              key={conv._id}
              to={`/traveler/chat/${conv._id}/${conv.post?._id || ''}`}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-teal-200 hover:shadow-sm transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                {conv.user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors truncate">{conv.user?.name || 'Unknown'}</h3>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                    {conv.lastMessage?.createdAt ? new Date(conv.lastMessage.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
                {conv.post?.title && (
                  <p className="text-xs text-teal-600 font-medium mt-0.5 truncate">{conv.post.title}</p>
                )}
                <p className="text-sm text-gray-500 truncate mt-0.5">{conv.lastMessage?.text || 'No messages yet'}</p>
              </div>
              {conv.unreadCount > 0 && (
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500 text-white text-xs font-bold flex items-center justify-center">
                  {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
