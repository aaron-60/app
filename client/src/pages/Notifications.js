import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPut } from '../utils/api';
import { timeAgo, getInitials } from '../utils/helpers';

const notifIcons = {
  connection_request: { icon: '👤', color: '#0a66c2' },
  connection_accepted: { icon: '🤝', color: '#057642' },
  job_application: { icon: '💼', color: '#b24020' },
  message: { icon: '💬', color: '#0a66c2' },
  post_like: { icon: '👍', color: '#0a66c2' },
  post_comment: { icon: '💬', color: '#057642' }
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await apiGet('/notifications');
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await apiPut(`/api/notifications/${id}/read`);
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, is_read: 1 } : n
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiPut('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotifClick = (notif) => {
    if (!notif.is_read) markAsRead(notif.id);
    switch (notif.type) {
      case 'connection_request':
      case 'connection_accepted':
        navigate('/connections');
        break;
      case 'message':
        navigate('/messages');
        break;
      case 'job_application':
        navigate('/jobs');
        break;
      case 'post_like':
      case 'post_comment':
        navigate('/');
        break;
      default:
        break;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const styles = {
    container: { minHeight: '100vh', background: '#f3f2ef', paddingBottom: 80 },
    header: {
      background: '#fff', padding: '16px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', borderBottom: '1px solid #e0e0e0',
      position: 'sticky', top: 0, zIndex: 10
    },
    title: { fontSize: 20, fontWeight: 700, color: '#191919', margin: 0 },
    markAllBtn: {
      background: 'none', border: 'none', color: '#0a66c2', fontSize: 14,
      fontWeight: 600, cursor: 'pointer', padding: '8px 0'
    },
    notifItem: (isRead) => ({
      display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px',
      background: isRead ? '#fff' : '#e8f0fe', borderBottom: '1px solid #f0f0f0',
      cursor: 'pointer', transition: 'background 0.2s'
    }),
    iconCircle: (color) => ({
      width: 44, height: 44, borderRadius: '50%', background: `${color}15`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 20, flexShrink: 0
    }),
    notifContent: { flex: 1 },
    notifMessage: { fontSize: 14, color: '#191919', lineHeight: 1.4 },
    notifTime: { fontSize: 12, color: '#999', marginTop: 4 },
    unreadDot: {
      width: 8, height: 8, borderRadius: '50%', background: '#0a66c2',
      flexShrink: 0, marginTop: 6
    },
    spinner: {
      width: 36, height: 36, border: '3px solid #e0e0e0', borderTopColor: '#0a66c2',
      borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '40px auto',
      display: 'block'
    },
    empty: { textAlign: 'center', padding: 60, color: '#666' },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyText: { fontSize: 16, fontWeight: 500 },
    emptySubtext: { fontSize: 14, color: '#999', marginTop: 4 }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Notifications</h1>
        {unreadCount > 0 && (
          <button style={styles.markAllBtn} onClick={markAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div style={styles.spinner} />
      ) : notifications.length > 0 ? (
        <div style={{ background: '#fff' }}>
          {notifications.map(notif => {
            const config = notifIcons[notif.type] || { icon: '🔔', color: '#666' };
            return (
              <div key={notif.id} style={styles.notifItem(notif.is_read)}
                onClick={() => handleNotifClick(notif)}>
                <div style={styles.iconCircle(config.color)}>{config.icon}</div>
                <div style={styles.notifContent}>
                  <div style={styles.notifMessage}>{notif.message}</div>
                  <div style={styles.notifTime}>{timeAgo(notif.created_at)}</div>
                </div>
                {!notif.is_read && <div style={styles.unreadDot} />}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>🔔</div>
          <div style={styles.emptyText}>No notifications</div>
          <div style={styles.emptySubtext}>We'll notify you about important updates</div>
        </div>
      )}
    </div>
  );
}
