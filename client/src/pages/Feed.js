import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiGet, apiPost } from '../utils/api';
import { getInitials, getAvatarColor } from '../utils/helpers';
import PostCard from '../components/PostCard';

const pageStyle = {
  paddingBottom: 72,
  minHeight: '100vh',
};

const topBarStyle = {
  position: 'sticky',
  top: 0,
  zIndex: 100,
  backgroundColor: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
};

const logoText = {
  fontSize: 22,
  fontWeight: 700,
  color: '#0a66c2',
};

const searchBtnStyle = {
  width: 44,
  height: 44,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  cursor: 'pointer',
  border: 'none',
  background: 'none',
};

const createPostCardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: 12,
  padding: 16,
  margin: '8px 8px 0',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
};

const createPostRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
};

const promptInputStyle = {
  flex: 1,
  height: 44,
  borderRadius: 22,
  border: '1px solid #e0e0e0',
  padding: '0 16px',
  fontSize: 14,
  color: '#666666',
  backgroundColor: '#f3f2ef',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
};

const expandedTextareaStyle = {
  width: '100%',
  minHeight: 100,
  borderRadius: 8,
  border: '1px solid #e0e0e0',
  padding: 12,
  fontSize: 16,
  resize: 'vertical',
  outline: 'none',
  fontFamily: 'inherit',
  marginTop: 12,
  boxSizing: 'border-box',
};

const postBtnStyle = {
  height: 36,
  padding: '0 20px',
  borderRadius: 18,
  backgroundColor: '#0a66c2',
  color: '#ffffff',
  fontWeight: 600,
  fontSize: 14,
  border: 'none',
  cursor: 'pointer',
  marginTop: 10,
  marginLeft: 'auto',
  display: 'block',
  transition: 'opacity 0.2s',
};

const feedContainerStyle = {
  padding: '8px 8px 0',
};

const spinnerStyle = {
  display: 'flex',
  justifyContent: 'center',
  padding: 24,
};

const emptyStyle = {
  textAlign: 'center',
  padding: 48,
  color: '#666666',
  fontSize: 15,
};

const pullIndicatorStyle = {
  textAlign: 'center',
  padding: '12px 0',
  color: '#0a66c2',
  fontSize: 13,
  fontWeight: 500,
};

const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

export default function Feed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const observerRef = useRef();
  const touchStartY = useRef(0);
  const [pullDistance, setPullDistance] = useState(0);

  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    try {
      const data = await apiGet(`/posts/feed?page=${pageNum}&limit=10`);
      const newPosts = data.posts || data || [];
      if (append) {
        setPosts((prev) => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }
      setHasMore(newPosts.length >= 10);
    } catch (err) {
      console.error('Feed error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, true);
  }, [page, hasMore, loading, fetchPosts]);

  const lastPostRef = useCallback(
    (node) => {
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          handleLoadMore();
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [handleLoadMore, hasMore]
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchPosts(1);
  };

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (window.scrollY === 0 && touchStartY.current > 0) {
      const diff = e.touches[0].clientY - touchStartY.current;
      if (diff > 0 && diff < 120) {
        setPullDistance(diff);
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 60) {
      handleRefresh();
    }
    setPullDistance(0);
    touchStartY.current = 0;
  };

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;
    setPosting(true);
    try {
      const data = await apiPost('/posts', { content: postContent });
      const newPost = data.post || data;
      setPosts((prev) => [newPost, ...prev]);
      setPostContent('');
      setShowCreate(false);
    } catch (err) {
      console.error('Create post error:', err);
    } finally {
      setPosting(false);
    }
  };

  const avatarBg = getAvatarColor(`${user?.first_name || ''} ${user?.last_name || ''}`);

  return (
    <div
      style={pageStyle}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div style={topBarStyle}>
        <span style={logoText}>JobConnect</span>
        <button style={searchBtnStyle} onClick={() => navigate('/search')}>
          <SearchIcon />
        </button>
      </div>

      {pullDistance > 0 && (
        <div style={{
          ...pullIndicatorStyle,
          opacity: pullDistance / 60,
          transform: `translateY(${pullDistance / 3}px)`,
        }}>
          {pullDistance > 60 ? 'Release to refresh' : 'Pull to refresh'}
        </div>
      )}

      {refreshing && (
        <div style={pullIndicatorStyle}>Refreshing...</div>
      )}

      <div style={createPostCardStyle}>
        <div style={createPostRowStyle}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: avatarBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 15,
              flexShrink: 0,
              cursor: 'pointer',
            }}
            onClick={() => navigate(`/profile/${user?.id}`)}
          >
            {getInitials(user?.first_name, user?.last_name)}
          </div>
          <div style={promptInputStyle} onClick={() => setShowCreate(true)}>
            What do you want to talk about?
          </div>
        </div>
        {showCreate && (
          <>
            <textarea
              style={expandedTextareaStyle}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Share your thoughts, articles, or ideas..."
              autoFocus
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                style={{ ...postBtnStyle, backgroundColor: 'transparent', color: '#666666' }}
                onClick={() => { setShowCreate(false); setPostContent(''); }}
              >
                Cancel
              </button>
              <button
                style={{ ...postBtnStyle, opacity: postContent.trim() && !posting ? 1 : 0.5 }}
                onClick={handleCreatePost}
                disabled={!postContent.trim() || posting}
              >
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </>
        )}
      </div>

      <div style={feedContainerStyle}>
        {loading && posts.length === 0 ? (
          <div style={spinnerStyle}>
            <div style={{
              width: 32,
              height: 32,
              border: '3px solid #e0e0e0',
              borderTopColor: '#0a66c2',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
          </div>
        ) : posts.length === 0 ? (
          <div style={emptyStyle}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>No posts yet</div>
            <p>Start connecting with people to see their posts here.</p>
          </div>
        ) : (
          posts.map((post, index) => (
            <div
              key={post.id || index}
              ref={index === posts.length - 1 ? lastPostRef : null}
            >
              <PostCard post={post} />
            </div>
          ))
        )}
        {hasMore && posts.length > 0 && (
          <div style={spinnerStyle}>
            <div style={{
              width: 24,
              height: 24,
              border: '3px solid #e0e0e0',
              borderTopColor: '#0a66c2',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
          </div>
        )}
      </div>
    </div>
  );
}
