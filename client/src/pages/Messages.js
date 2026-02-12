import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../utils/api';
import MessagePreview from '../components/MessagePreview';

export default function Messages() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const data = await apiGet('/api/messages/conversations');
      setConversations(data.conversations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = conversations.filter(c => {
    if (!search) return true;
    const name = `${c.first_name} ${c.last_name}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const styles = {
    container: { minHeight: '100vh', background: '#f3f2ef', paddingBottom: 80 },
    header: {
      background: '#fff', padding: '16px', borderBottom: '1px solid #e0e0e0',
      position: 'sticky', top: 0, zIndex: 10
    },
    title: { fontSize: 20, fontWeight: 700, color: '#191919', margin: '0 0 12px' },
    searchInput: {
      width: '100%', height: 40, padding: '0 16px', fontSize: 15,
      border: '1px solid #e0e0e0', borderRadius: 20, outline: 'none',
      boxSizing: 'border-box', background: '#f3f2ef'
    },
    content: { padding: 0 },
    empty: { textAlign: 'center', padding: 60, color: '#666' },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyText: { fontSize: 16, fontWeight: 500 },
    emptySubtext: { fontSize: 14, color: '#999', marginTop: 4 },
    spinner: {
      width: 36, height: 36, border: '3px solid #e0e0e0', borderTopColor: '#0a66c2',
      borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '40px auto',
      display: 'block'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Messaging</h1>
        <input style={styles.searchInput} placeholder="Search conversations..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div style={styles.content}>
        {loading ? (
          <div style={styles.spinner} />
        ) : filtered.length > 0 ? (
          <div style={{ background: '#fff' }}>
            {filtered.map(conv => (
              <MessagePreview key={conv.user_id || conv.id} conversation={conv}
                onClick={() => navigate(`/messages/${conv.user_id || conv.id}`)} />
            ))}
          </div>
        ) : (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>💬</div>
            <div style={styles.emptyText}>
              {search ? 'No conversations found' : 'No messages yet'}
            </div>
            <div style={styles.emptySubtext}>
              {search ? 'Try a different search' : 'Connect with people to start messaging'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
