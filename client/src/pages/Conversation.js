import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apiGet, apiPost } from '../utils/api';
import { timeAgo, getInitials } from '../utils/helpers';

export default function Conversation() {
  const { userId } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadMessages();
    loadUser();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadUser = async () => {
    try {
      const data = await apiGet(`/api/users/${userId}`);
      setOtherUser(data.user || data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMessages = async () => {
    try {
      const data = await apiGet(`/api/messages/${userId}`);
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      await apiPost(`/api/messages/${userId}`, { content: newMessage.trim() });
      setNewMessage('');
      await loadMessages();
      inputRef.current?.focus();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const styles = {
    container: {
      display: 'flex', flexDirection: 'column', height: '100vh',
      background: '#f3f2ef'
    },
    header: {
      background: '#fff', padding: '12px 16px', display: 'flex', alignItems: 'center',
      borderBottom: '1px solid #e0e0e0', flexShrink: 0, zIndex: 10
    },
    backBtn: {
      background: 'none', border: 'none', fontSize: 24, cursor: 'pointer',
      padding: 8, color: '#191919', marginRight: 8
    },
    headerAvatar: {
      width: 36, height: 36, borderRadius: '50%', background: '#0a66c2',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: 14, fontWeight: 600, marginRight: 10
    },
    headerName: { fontSize: 16, fontWeight: 600, color: '#191919' },
    headerHeadline: { fontSize: 12, color: '#666' },
    messagesList: {
      flex: 1, overflowY: 'auto', padding: 16,
      display: 'flex', flexDirection: 'column', gap: 8
    },
    messageBubble: (isMine) => ({
      maxWidth: '75%', padding: '10px 14px', borderRadius: 16,
      fontSize: 15, lineHeight: 1.4, wordBreak: 'break-word',
      alignSelf: isMine ? 'flex-end' : 'flex-start',
      background: isMine ? '#0a66c2' : '#fff',
      color: isMine ? '#fff' : '#191919',
      borderBottomRightRadius: isMine ? 4 : 16,
      borderBottomLeftRadius: isMine ? 16 : 4,
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
    }),
    messageTime: (isMine) => ({
      fontSize: 11, color: isMine ? 'rgba(255,255,255,0.7)' : '#999',
      marginTop: 4
    }),
    inputContainer: {
      background: '#fff', padding: '12px 16px',
      borderTop: '1px solid #e0e0e0', flexShrink: 0,
      paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))'
    },
    inputForm: { display: 'flex', gap: 8, alignItems: 'center' },
    input: {
      flex: 1, height: 44, padding: '0 16px', fontSize: 16,
      border: '1px solid #e0e0e0', borderRadius: 22, outline: 'none',
      boxSizing: 'border-box'
    },
    sendBtn: {
      width: 44, height: 44, borderRadius: '50%', border: 'none',
      background: '#0a66c2', color: '#fff', fontSize: 18, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: (!newMessage.trim() || sending) ? 0.5 : 1,
      flexShrink: 0
    },
    spinner: {
      width: 36, height: 36, border: '3px solid #e0e0e0', borderTopColor: '#0a66c2',
      borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '40px auto'
    },
    empty: { textAlign: 'center', padding: 40, color: '#999', fontSize: 15 }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/messages')}>&#8592;</button>
        {otherUser && (
          <>
            <div style={styles.headerAvatar}>
              {otherUser.avatar ? (
                <img src={otherUser.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                getInitials(otherUser.first_name, otherUser.last_name)
              )}
            </div>
            <div>
              <div style={styles.headerName}>{otherUser.first_name} {otherUser.last_name}</div>
              {otherUser.headline && <div style={styles.headerHeadline}>{otherUser.headline}</div>}
            </div>
          </>
        )}
      </div>

      <div style={styles.messagesList}>
        {loading ? (
          <div style={styles.spinner} />
        ) : messages.length > 0 ? (
          messages.map(msg => {
            const isMine = msg.sender_id === currentUser?.id;
            return (
              <div key={msg.id} style={styles.messageBubble(isMine)}>
                <div>{msg.content}</div>
                <div style={styles.messageTime(isMine)}>{timeAgo(msg.created_at)}</div>
              </div>
            );
          })
        ) : (
          <div style={styles.empty}>
            No messages yet. Say hello!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputContainer}>
        <form style={styles.inputForm} onSubmit={handleSend}>
          <input ref={inputRef} style={styles.input} value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write a message..." autoFocus />
          <button type="submit" style={styles.sendBtn}
            disabled={!newMessage.trim() || sending}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
