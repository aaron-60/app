import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';
import ConnectionCard from '../components/ConnectionCard';

const tabs = ['My Network', 'Pending', 'Discover'];

export default function Connections() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(0);
  const [connections, setConnections] = useState([]);
  const [pending, setPending] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [connData, pendData, sugData] = await Promise.all([
        apiGet('/connections'),
        apiGet('/api/connections/pending'),
        apiGet('/api/connections/suggestions')
      ]);
      setConnections(connData.connections || []);
      setPending(pendData.pending_requests || pendData.requests || []);
      setSuggestions(sugData.suggestions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (connectionId) => {
    try {
      await apiPut(`/api/connections/${connectionId}/accept`);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (connectionId) => {
    try {
      await apiPut(`/api/connections/${connectionId}/reject`);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConnect = async (userId) => {
    try {
      await apiPost(`/api/connections/request/${userId}`);
      setSuggestions(suggestions.filter(s => s.id !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (connectionId) => {
    try {
      await apiDelete(`/api/connections/${connectionId}`);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const styles = {
    container: { minHeight: '100vh', background: '#f3f2ef', paddingBottom: 80 },
    header: {
      background: '#fff', padding: '16px', borderBottom: '1px solid #e0e0e0',
      position: 'sticky', top: 0, zIndex: 10
    },
    title: { fontSize: 20, fontWeight: 700, color: '#191919', margin: 0 },
    tabs: {
      display: 'flex', background: '#fff', borderBottom: '1px solid #e0e0e0',
      position: 'sticky', top: 56, zIndex: 9
    },
    tab: (active) => ({
      flex: 1, padding: '14px 8px', textAlign: 'center', fontSize: 14, fontWeight: 600,
      color: active ? '#0a66c2' : '#666', background: 'none', border: 'none',
      borderBottom: active ? '2px solid #0a66c2' : '2px solid transparent',
      cursor: 'pointer', transition: 'all 0.2s'
    }),
    content: { padding: 16 },
    badge: {
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: '#cc1016', color: '#fff', borderRadius: 10, fontSize: 11,
      fontWeight: 700, minWidth: 18, height: 18, padding: '0 5px', marginLeft: 6
    },
    empty: { textAlign: 'center', padding: 40, color: '#666' },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyText: { fontSize: 16, fontWeight: 500 },
    emptySubtext: { fontSize: 14, color: '#999', marginTop: 4 },
    spinner: {
      width: 36, height: 36, border: '3px solid #e0e0e0', borderTopColor: '#0a66c2',
      borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '40px auto'
    },
    count: { fontSize: 14, color: '#666', marginBottom: 12 }
  };

  const renderContent = () => {
    if (loading) {
      return <div style={styles.spinner} />;
    }

    if (activeTab === 0) {
      return connections.length > 0 ? (
        <>
          <div style={styles.count}>{connections.length} connection{connections.length !== 1 ? 's' : ''}</div>
          {connections.map(conn => (
            <ConnectionCard key={conn.id} connection={conn} status="connected"
              onRemove={() => handleRemove(conn.connection_id || conn.id)} />
          ))}
        </>
      ) : (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>👥</div>
          <div style={styles.emptyText}>No connections yet</div>
          <div style={styles.emptySubtext}>Start building your network by discovering people</div>
        </div>
      );
    }

    if (activeTab === 1) {
      return pending.length > 0 ? (
        pending.map(req => (
          <ConnectionCard key={req.id} connection={req} status="pending_received"
            onAccept={() => handleAccept(req.connection_id || req.id)}
            onReject={() => handleReject(req.connection_id || req.id)} />
        ))
      ) : (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>📬</div>
          <div style={styles.emptyText}>No pending requests</div>
          <div style={styles.emptySubtext}>When someone sends you a request, it will appear here</div>
        </div>
      );
    }

    return suggestions.length > 0 ? (
      suggestions.map(user => (
        <ConnectionCard key={user.id} connection={user} status="suggestion"
          onConnect={() => handleConnect(user.id)} />
      ))
    ) : (
      <div style={styles.empty}>
        <div style={styles.emptyIcon}>🔍</div>
        <div style={styles.emptyText}>No suggestions right now</div>
        <div style={styles.emptySubtext}>Check back later for new people to connect with</div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Network</h1>
      </div>

      <div style={styles.tabs}>
        {tabs.map((tab, i) => (
          <button key={tab} style={styles.tab(activeTab === i)} onClick={() => setActiveTab(i)}>
            {tab}
            {i === 1 && pending.length > 0 && <span style={styles.badge}>{pending.length}</span>}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {renderContent()}
      </div>
    </div>
  );
}
