import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const spinnerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  background: '#f3f2ef',
};

const dotStyle = {
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: '#0a66c2',
  margin: '0 4px',
  animation: 'pulse 1.4s ease-in-out infinite',
};

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={spinnerStyle}>
        <div style={{ ...dotStyle, animationDelay: '0s' }} />
        <div style={{ ...dotStyle, animationDelay: '0.2s' }} />
        <div style={{ ...dotStyle, animationDelay: '0.4s' }} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
