import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { timeAgo, getInitials, getAvatarColor } from '../utils/helpers';
import { apiPost, apiDelete } from '../utils/api';

const cardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: 12,
  marginBottom: 8,
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  overflow: 'hidden',
  animation: 'fadeIn 0.3s ease',
};

const headerStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  padding: 16,
  paddingBottom: 0,
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
  cursor: 'pointer',
};

const authorInfoStyle = {
  marginLeft: 12,
  flex: 1,
  minWidth: 0,
};

const nameStyle = {
  fontWeight: 600,
  fontSize: 15,
  color: '#191919',
  cursor: 'pointer',
};

const headlineStyle = {
  fontSize: 13,
  color: '#666666',
  marginTop: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const timeStyle = {
  fontSize: 12,
  color: '#666666',
  marginTop: 1,
};

const contentStyle = {
  padding: '12px 16px',
  fontSize: 14,
  lineHeight: 1.5,
  color: '#191919',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
};

const imageStyle = {
  width: '100%',
  maxHeight: 400,
  objectFit: 'cover',
};

const statsStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 16px',
  fontSize: 13,
  color: '#666666',
  borderBottom: '1px solid #e0e0e0',
};

const actionsStyle = {
  display: 'flex',
  padding: '4px 8px',
};

const actionBtnStyle = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  padding: '12px 8px',
  minHeight: 44,
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 500,
  color: '#666666',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  border: 'none',
  background: 'none',
};

const LikeIcon = ({ filled }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#0a66c2' : 'none'} stroke={filled ? '#0a66c2' : '#666666'} strokeWidth="2">
    <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
  </svg>
);

const CommentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth="2">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

export default function PostCard({ post, onUpdate }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.user_has_liked || post.liked || false);
  const [likeCount, setLikeCount] = useState(post.likes_count || post.like_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [commentCount, setCommentCount] = useState(post.comments_count || post.comment_count || 0);

  const author = post.author || post.user || {
    id: post.user_id,
    first_name: post.first_name,
    last_name: post.last_name,
    headline: post.author_headline || post.headline,
    avatar: post.author_avatar || post.avatar,
  };
  const authorName = `${author.first_name || ''} ${author.last_name || ''}`.trim();
  const bgColor = getAvatarColor(authorName);

  const handleLike = async () => {
    try {
      const data = await apiPost(`/posts/${post.id}/like`);
      if (data.liked !== undefined) {
        setLiked(data.liked);
        setLikeCount(data.likes_count ?? (data.liked ? likeCount + 1 : Math.max(0, likeCount - 1)));
      } else {
        setLiked(!liked);
        setLikeCount((c) => liked ? Math.max(0, c - 1) : c + 1);
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      const data = await apiPost(`/posts/${post.id}/comment`, { content: commentText });
      const newComment = data.comment || data;
      setComments((prev) => [...prev, newComment]);
      setCommentCount((c) => c + 1);
      setCommentText('');
    } catch (err) {
      console.error('Comment error:', err);
    }
  };

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <div
          style={{ ...avatarStyle, backgroundColor: bgColor }}
          onClick={() => author.id && navigate(`/profile/${author.id}`)}
        >
          {author.avatar_url ? (
            <img src={author.avatar_url} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            getInitials(author.first_name, author.last_name)
          )}
        </div>
        <div style={authorInfoStyle}>
          <div
            style={nameStyle}
            onClick={() => author.id && navigate(`/profile/${author.id}`)}
          >
            {authorName || 'Unknown User'}
          </div>
          <div style={headlineStyle}>{author.headline || ''}</div>
          <div style={timeStyle}>{timeAgo(post.created_at)}</div>
        </div>
      </div>

      <div style={contentStyle}>{post.content}</div>

      {post.image_url && (
        <img src={post.image_url} alt="" style={imageStyle} />
      )}

      <div style={statsStyle}>
        <span>{likeCount > 0 ? `${likeCount} like${likeCount !== 1 ? 's' : ''}` : ''}</span>
        <span>{commentCount > 0 ? `${commentCount} comment${commentCount !== 1 ? 's' : ''}` : ''}</span>
      </div>

      <div style={actionsStyle}>
        <button
          style={{
            ...actionBtnStyle,
            color: liked ? '#0a66c2' : '#666666',
            fontWeight: liked ? 600 : 500,
          }}
          onClick={handleLike}
        >
          <LikeIcon filled={liked} />
          Like
        </button>
        <button style={actionBtnStyle} onClick={() => setShowComments(!showComments)}>
          <CommentIcon />
          Comment
        </button>
      </div>

      {showComments && (
        <div style={{ padding: '0 16px 16px' }}>
          {comments.map((comment, idx) => {
            const cAuthor = comment.author || comment.user || {};
            const cName = `${cAuthor.first_name || ''} ${cAuthor.last_name || ''}`.trim();
            return (
              <div key={comment.id || idx} style={{ display: 'flex', marginBottom: 12, gap: 8 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: getAvatarColor(cName),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {getInitials(cAuthor.first_name, cAuthor.last_name)}
                </div>
                <div style={{ flex: 1, backgroundColor: '#f3f2ef', borderRadius: 8, padding: '8px 12px' }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{cName}</div>
                  <div style={{ fontSize: 13, marginTop: 2 }}>{comment.content}</div>
                  <div style={{ fontSize: 11, color: '#666666', marginTop: 4 }}>{timeAgo(comment.created_at)}</div>
                </div>
              </div>
            );
          })}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
              style={{
                flex: 1,
                height: 40,
                borderRadius: 20,
                border: '1px solid #e0e0e0',
                padding: '0 16px',
                fontSize: 14,
                outline: 'none',
              }}
            />
            <button
              onClick={handleComment}
              disabled={!commentText.trim()}
              style={{
                minWidth: 44,
                height: 40,
                borderRadius: 20,
                backgroundColor: commentText.trim() ? '#0a66c2' : '#e0e0e0',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: 14,
                border: 'none',
                cursor: commentText.trim() ? 'pointer' : 'default',
                transition: 'background-color 0.2s',
              }}
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
