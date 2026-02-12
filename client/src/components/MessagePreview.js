import React from 'react';
import { useNavigate } from 'react-router-dom';
import { timeAgo, truncate, getInitials, getAvatarColor } from '../utils/helpers';

const containerStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: 16,
  gap: 12,
  backgroundColor: '#ffffff',
  cursor: 'pointer',
  transition: 'background-color 0.15s ease',
  borderBottom: '1px solid #e0e0e0',
  minHeight: 72,
};

const avatarStyle = {
  width: 48,
  height: 48,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#ffffff',
  fontWeight: 700,
  fontSize: 16,
  flexShrink: 0,
};

const contentWrapStyle = {
  flex: 1,
  minWidth: 0,
};

const topRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const nameStyle = {
  fontWeight: 600,
  fontSize: 15,
  color: '#191919',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const timeTextStyle = {
  fontSize: 12,
  color: '#666666',
  flexShrink: 0,
  marginLeft: 8,
};

const messageStyle = {
  fontSize: 13,
  color: '#666666',
  marginTop: 3,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const unreadDotStyle = {
  width: 10,
  height: 10,
  borderRadius: '50%',
  backgroundColor: '#0a66c2',
  flexShrink: 0,
  marginLeft: 8,
};

export default function MessagePreview({ conversation }) {
  const navigate = useNavigate();

  const user = conversation.other_user || conversation.user || {
    id: conversation.partner_id || conversation.user_id,
    first_name: conversation.partner_first_name || conversation.first_name,
    last_name: conversation.partner_last_name || conversation.last_name,
    headline: conversation.partner_headline || conversation.headline,
    avatar: conversation.partner_avatar || conversation.avatar,
  };
  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  const bgColor = getAvatarColor(fullName);
  const lastMessage = conversation.last_message || conversation.content || conversation.lastMessage || '';
  const lastTime = conversation.last_message_at || conversation.created_at || conversation.updated_at;
  const unread = conversation.unread || conversation.unread_count > 0;

  const handleClick = () => {
    navigate(`/messages/${user.id}`);
  };

  return (
    <div
      style={{
        ...containerStyle,
        backgroundColor: unread ? '#f0f7ff' : '#ffffff',
      }}
      onClick={handleClick}
    >
      <div style={{ ...avatarStyle, backgroundColor: bgColor }}>
        {user.avatar_url ? (
          <img src={user.avatar_url} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          getInitials(user.first_name, user.last_name)
        )}
      </div>

      <div style={contentWrapStyle}>
        <div style={topRowStyle}>
          <span style={{ ...nameStyle, fontWeight: unread ? 700 : 600 }}>
            {fullName || 'Unknown User'}
          </span>
          <span style={timeTextStyle}>{timeAgo(lastTime)}</span>
        </div>
        <div style={{
          ...messageStyle,
          fontWeight: unread ? 600 : 400,
          color: unread ? '#191919' : '#666666',
        }}>
          {truncate(typeof lastMessage === 'string' ? lastMessage : lastMessage?.content || '', 60)}
        </div>
      </div>

      {unread && <div style={unreadDotStyle} />}
    </div>
  );
}
