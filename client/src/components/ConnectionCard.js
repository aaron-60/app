import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInitials, getAvatarColor } from '../utils/helpers';
import { apiPost, apiPut, apiDelete } from '../utils/api';

const cardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: 12,
  padding: 16,
  marginBottom: 8,
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  animation: 'fadeIn 0.3s ease',
};

const avatarStyle = {
  width: 56,
  height: 56,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#ffffff',
  fontWeight: 700,
  fontSize: 18,
  flexShrink: 0,
  cursor: 'pointer',
};

const infoStyle = {
  flex: 1,
  minWidth: 0,
  cursor: 'pointer',
};

const nameStyle = {
  fontWeight: 600,
  fontSize: 15,
  color: '#191919',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const headlineStyle = {
  fontSize: 13,
  color: '#666666',
  marginTop: 2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const mutualStyle = {
  fontSize: 12,
  color: '#666666',
  marginTop: 4,
};

const btnBase = {
  minHeight: 36,
  minWidth: 44,
  padding: '0 16px',
  borderRadius: 20,
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  border: 'none',
  flexShrink: 0,
};

const connectBtn = {
  ...btnBase,
  backgroundColor: '#0a66c2',
  color: '#ffffff',
};

const pendingBtn = {
  ...btnBase,
  backgroundColor: '#e0e0e0',
  color: '#666666',
  cursor: 'default',
};

const acceptBtn = {
  ...btnBase,
  backgroundColor: '#0a66c2',
  color: '#ffffff',
};

const rejectBtn = {
  ...btnBase,
  backgroundColor: 'transparent',
  color: '#666666',
  border: '1px solid #e0e0e0',
  padding: '0 12px',
  marginRight: 6,
};

const messageBtn = {
  ...btnBase,
  backgroundColor: 'transparent',
  color: '#0a66c2',
  border: '1.5px solid #0a66c2',
};

export default function ConnectionCard({ connection, status, onUpdate }) {
  const navigate = useNavigate();
  const [currentStatus, setCurrentStatus] = useState(status || 'suggestion');
  const [loading, setLoading] = useState(false);

  const user = connection.user || connection;
  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  const bgColor = getAvatarColor(fullName);

  const handleConnect = async () => {
    setLoading(true);
    try {
      await apiPost('/connections/request', { to_user_id: user.id });
      setCurrentStatus('pending_sent');
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Connect error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      const connectionId = connection.connection_id || connection.id;
      await apiPut(`/connections/${connectionId}/accept`);
      setCurrentStatus('connected');
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Accept error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      const connectionId = connection.connection_id || connection.id;
      await apiDelete(`/connections/${connectionId}`);
      setCurrentStatus('rejected');
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Reject error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToProfile = () => {
    if (user.id) navigate(`/profile/${user.id}`);
  };

  const handleMessage = () => {
    if (user.id) navigate(`/messages/${user.id}`);
  };

  if (currentStatus === 'rejected') return null;

  return (
    <div style={cardStyle}>
      <div
        style={{ ...avatarStyle, backgroundColor: bgColor }}
        onClick={handleNavigateToProfile}
      >
        {user.avatar_url ? (
          <img src={user.avatar_url} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          getInitials(user.first_name, user.last_name)
        )}
      </div>

      <div style={infoStyle} onClick={handleNavigateToProfile}>
        <div style={nameStyle}>{fullName || 'Unknown User'}</div>
        <div style={headlineStyle}>{user.headline || ''}</div>
        {connection.mutual_connections !== undefined && (
          <div style={mutualStyle}>{connection.mutual_connections} mutual connection{connection.mutual_connections !== 1 ? 's' : ''}</div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {currentStatus === 'suggestion' && (
          <button style={connectBtn} onClick={handleConnect} disabled={loading}>
            {loading ? '...' : 'Connect'}
          </button>
        )}
        {currentStatus === 'pending_sent' && (
          <button style={pendingBtn} disabled>Pending</button>
        )}
        {currentStatus === 'pending_received' && (
          <>
            <button style={rejectBtn} onClick={handleReject} disabled={loading}>
              Ignore
            </button>
            <button style={acceptBtn} onClick={handleAccept} disabled={loading}>
              {loading ? '...' : 'Accept'}
            </button>
          </>
        )}
        {currentStatus === 'connected' && (
          <button style={messageBtn} onClick={handleMessage}>
            Message
          </button>
        )}
      </div>
    </div>
  );
}
