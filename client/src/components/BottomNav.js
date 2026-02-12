import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiGet } from '../utils/api';

const navStyle = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  height: 56,
  backgroundColor: '#ffffff',
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  boxShadow: '0 -1px 6px rgba(0,0,0,0.1)',
  zIndex: 1000,
  paddingBottom: 'env(safe-area-inset-bottom)',
};

const tabStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  height: '100%',
  minWidth: 44,
  minHeight: 44,
  position: 'relative',
  cursor: 'pointer',
  transition: 'color 0.2s ease',
  border: 'none',
  background: 'none',
  padding: 0,
};

const labelStyle = {
  fontSize: 10,
  marginTop: 2,
  fontWeight: 500,
};

const badgeStyle = {
  position: 'absolute',
  top: 4,
  right: '50%',
  marginRight: -16,
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: '#cc1016',
};

const HomeIcon = ({ color }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
    <path d="M23 9v2h-2v7a3 3 0 01-3 3h-4v-6h-4v6H6a3 3 0 01-3-3v-7H1V9l11-7 5 3.18V2h3v5.09z" />
  </svg>
);

const JobsIcon = ({ color }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
    <path d="M17 6V5a3 3 0 00-3-3h-4a3 3 0 00-3 3v1H2v5a3 3 0 003 3h14a3 3 0 003-3V6h-5zm-2 0H9V5a1 1 0 011-1h4a1 1 0 011 1v1zM2 19v-3.07A4.97 4.97 0 005 17h14a4.97 4.97 0 003-1.07V19a3 3 0 01-3 3H5a3 3 0 01-3-3z" />
  </svg>
);

const ConnectionsIcon = ({ color }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
    <path d="M12 16v6H3v-6a3 3 0 013-3h3a3 3 0 013 3zm5.5-3A3.5 3.5 0 1014 9.5a3.5 3.5 0 003.5 3.5zm1 2h-2a2.5 2.5 0 00-2.5 2.5V22h7v-4.5a2.5 2.5 0 00-2.5-2.5zM7.5 2A4.5 4.5 0 1012 6.5 4.49 4.49 0 007.5 2z" />
  </svg>
);

const MessagesIcon = ({ color }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
    <path d="M16 4H8a7 7 0 000 14h4v4l8.16-5.39A6.78 6.78 0 0023 11a7 7 0 00-7-7zm-8 8.5A1.5 1.5 0 116.5 11 1.5 1.5 0 018 12.5zm4 0a1.5 1.5 0 111.5-1.5 1.5 1.5 0 01-1.5 1.5zm4 0a1.5 1.5 0 111.5-1.5 1.5 1.5 0 01-1.5 1.5z" />
  </svg>
);

const NotificationsIcon = ({ color }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
    <path d="M22 19h-8.28a2 2 0 11-3.44 0H2v-1a4.52 4.52 0 011.17-2.83l1-1.17H4V9a8 8 0 0116 0v5h-.17l1 1.17A4.52 4.52 0 0122 18z" />
  </svg>
);

const tabs = [
  { path: '/', label: 'Home', Icon: HomeIcon },
  { path: '/jobs', label: 'Jobs', Icon: JobsIcon },
  { path: '/connections', label: 'Network', Icon: ConnectionsIcon },
  { path: '/messages', label: 'Messages', Icon: MessagesIcon },
  { path: '/notifications', label: 'Alerts', Icon: NotificationsIcon },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await apiGet('/notifications');
        const notifications = data.notifications || data || [];
        const unread = Array.isArray(notifications)
          ? notifications.filter((n) => !n.read).length
          : 0;
        setUnreadCount(unread);
      } catch (err) {
        // silently fail
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav style={navStyle}>
      {tabs.map(({ path, label, Icon }) => {
        const active = isActive(path);
        const color = active ? '#0a66c2' : '#666666';
        return (
          <button
            key={path}
            style={tabStyle}
            onClick={() => navigate(path)}
            aria-label={label}
          >
            <Icon color={color} />
            <span style={{ ...labelStyle, color }}>{label}</span>
            {path === '/notifications' && unreadCount > 0 && (
              <span style={badgeStyle} />
            )}
          </button>
        );
      })}
    </nav>
  );
}
