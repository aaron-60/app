import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const containerStyle = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
  backgroundColor: '#f3f2ef',
};

const logoStyle = {
  fontSize: 28,
  fontWeight: 700,
  color: '#0a66c2',
  marginBottom: 8,
};

const subtitleStyle = {
  fontSize: 15,
  color: '#666666',
  marginBottom: 32,
  textAlign: 'center',
};

const formStyle = {
  width: '100%',
  maxWidth: 400,
  backgroundColor: '#ffffff',
  borderRadius: 12,
  padding: 24,
  boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
};

const inputGroupStyle = {
  marginBottom: 16,
};

const labelStyle = {
  display: 'block',
  fontSize: 14,
  fontWeight: 500,
  color: '#191919',
  marginBottom: 6,
};

const inputStyle = {
  width: '100%',
  height: 48,
  borderRadius: 8,
  border: '1px solid #e0e0e0',
  padding: '0 16px',
  fontSize: 16,
  outline: 'none',
  transition: 'border-color 0.2s ease',
  boxSizing: 'border-box',
};

const buttonStyle = {
  width: '100%',
  height: 48,
  borderRadius: 24,
  backgroundColor: '#0a66c2',
  color: '#ffffff',
  fontSize: 16,
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
  marginTop: 8,
};

const errorStyle = {
  backgroundColor: '#fce8e6',
  color: '#c5221f',
  padding: '10px 14px',
  borderRadius: 8,
  fontSize: 14,
  marginBottom: 16,
};

const linkContainerStyle = {
  textAlign: 'center',
  marginTop: 20,
  fontSize: 14,
  color: '#666666',
};

const linkStyle = {
  color: '#0a66c2',
  fontWeight: 600,
  marginLeft: 4,
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={logoStyle}>JobConnect</div>
      <div style={subtitleStyle}>Sign in to your professional community</div>
      <form style={formStyle} onSubmit={handleSubmit}>
        {error && <div style={errorStyle}>{error}</div>}
        <div style={inputGroupStyle}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            style={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            autoComplete="email"
          />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            style={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          style={{
            ...buttonStyle,
            opacity: loading ? 0.7 : 1,
          }}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <div style={linkContainerStyle}>
        Don't have an account?
        <Link to="/register" style={linkStyle}>Register</Link>
      </div>
    </div>
  );
}
