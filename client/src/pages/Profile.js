import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apiGet, apiPost } from '../utils/api';
import PostCard from '../components/PostCard';
import { getInitials } from '../utils/helpers';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [connectionId, setConnectionId] = useState(null);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = !id || id === currentUser?.id;
  const profileId = isOwnProfile ? currentUser?.id : id;

  useEffect(() => {
    if (!profileId) return;
    loadProfile();
    loadPosts();
  }, [profileId]);

  const loadProfile = async () => {
    try {
      const data = await apiGet(`/api/users/${profileId}`);
      setProfile(data.user || data);
      setConnectionStatus(data.connectionStatus || null);
      setConnectionId(data.connectionId || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      const data = await apiGet(`/api/users/${profileId}/posts`);
      setPosts(data.posts || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConnect = async () => {
    try {
      await apiPost(`/api/connections/request/${profileId}`);
      setConnectionStatus('pending_sent');
    } catch (err) {
      console.error(err);
    }
  };

  const skills = profile?.skills ? profile.skills.split(',').map(s => s.trim()).filter(Boolean) : [];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={spinnerStyle} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
        <p style={{ fontSize: 18 }}>User not found</p>
      </div>
    );
  }

  const styles = {
    container: { minHeight: '100vh', background: '#f3f2ef', paddingBottom: 80 },
    header: {
      background: '#fff', position: 'sticky', top: 0, zIndex: 10,
      padding: '12px 16px', display: 'flex', alignItems: 'center',
      borderBottom: '1px solid #e0e0e0'
    },
    backBtn: {
      background: 'none', border: 'none', fontSize: 24, cursor: 'pointer',
      padding: 8, color: '#191919', marginRight: 8
    },
    banner: {
      height: 120, background: 'linear-gradient(135deg, #0a66c2 0%, #004182 100%)',
      position: 'relative'
    },
    profileCard: {
      background: '#fff', margin: '0 0 8px', padding: '0 16px 20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
    },
    avatarContainer: { marginTop: -40, marginBottom: 12 },
    avatar: {
      width: 80, height: 80, borderRadius: '50%', border: '4px solid #fff',
      background: '#0a66c2', display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: 28, fontWeight: 600, overflow: 'hidden'
    },
    name: { fontSize: 22, fontWeight: 700, color: '#191919', margin: 0 },
    headline: { fontSize: 15, color: '#666', marginTop: 4 },
    location: { fontSize: 14, color: '#999', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 },
    actionRow: { display: 'flex', gap: 8, marginTop: 16 },
    primaryBtn: {
      flex: 1, height: 36, background: '#0a66c2', color: '#fff', border: 'none',
      borderRadius: 18, fontSize: 14, fontWeight: 600, cursor: 'pointer'
    },
    secondaryBtn: {
      flex: 1, height: 36, background: '#fff', color: '#0a66c2', border: '1px solid #0a66c2',
      borderRadius: 18, fontSize: 14, fontWeight: 600, cursor: 'pointer'
    },
    disabledBtn: {
      flex: 1, height: 36, background: '#e0e0e0', color: '#666', border: 'none',
      borderRadius: 18, fontSize: 14, fontWeight: 600, cursor: 'default'
    },
    section: {
      background: '#fff', margin: '0 0 8px', padding: 20,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
    },
    sectionTitle: { fontSize: 18, fontWeight: 700, color: '#191919', marginBottom: 12 },
    summary: { fontSize: 15, color: '#444', lineHeight: 1.6, whiteSpace: 'pre-wrap' },
    skillsContainer: { display: 'flex', flexWrap: 'wrap', gap: 8 },
    skillTag: {
      background: '#e8f0fe', color: '#0a66c2', padding: '6px 14px',
      borderRadius: 16, fontSize: 14, fontWeight: 500
    },
    statRow: { display: 'flex', gap: 24, marginTop: 12 },
    stat: { textAlign: 'center' },
    statNum: { fontSize: 18, fontWeight: 700, color: '#191919' },
    statLabel: { fontSize: 12, color: '#666' },
    info: { fontSize: 14, color: '#666', marginTop: 4 }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>&#8592;</button>
        <span style={{ fontSize: 18, fontWeight: 600 }}>Profile</span>
      </div>

      <div style={styles.banner} />

      <div style={styles.profileCard}>
        <div style={styles.avatarContainer}>
          <div style={styles.avatar}>
            {profile.avatar ? (
              <img src={profile.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              getInitials(profile.first_name, profile.last_name)
            )}
          </div>
        </div>
        <h1 style={styles.name}>{profile.first_name} {profile.last_name}</h1>
        {profile.headline && <div style={styles.headline}>{profile.headline}</div>}
        {profile.location && (
          <div style={styles.location}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#999"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            {profile.location}
          </div>
        )}
        {profile.industry && <div style={styles.info}>{profile.industry}</div>}
        {profile.experience_years > 0 && (
          <div style={styles.info}>{profile.experience_years} years experience</div>
        )}

        <div style={styles.actionRow}>
          {isOwnProfile ? (
            <button style={styles.primaryBtn} onClick={() => navigate('/profile/edit')}>
              Edit Profile
            </button>
          ) : connectionStatus === 'accepted' ? (
            <button style={styles.secondaryBtn} onClick={() => navigate(`/messages/${profileId}`)}>
              Message
            </button>
          ) : connectionStatus === 'pending_sent' ? (
            <button style={styles.disabledBtn}>Pending</button>
          ) : connectionStatus === 'pending_received' ? (
            <button style={styles.primaryBtn}>Accept Request</button>
          ) : (
            <button style={styles.primaryBtn} onClick={handleConnect}>Connect</button>
          )}
        </div>
      </div>

      {profile.summary && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>About</h2>
          <p style={styles.summary}>{profile.summary}</p>
        </div>
      )}

      {skills.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Skills</h2>
          <div style={styles.skillsContainer}>
            {skills.map(skill => (
              <span key={skill} style={styles.skillTag}>{skill}</span>
            ))}
          </div>
        </div>
      )}

      {posts.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Posts</h2>
          {posts.map(post => (
            <PostCard key={post.id} post={post} currentUser={currentUser} onUpdate={loadPosts} />
          ))}
        </div>
      )}
    </div>
  );
}

const spinnerStyle = {
  width: 36, height: 36, border: '3px solid #e0e0e0', borderTopColor: '#0a66c2',
  borderRadius: '50%', animation: 'spin 0.8s linear infinite'
};
