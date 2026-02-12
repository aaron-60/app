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

const rowStyle = {
  display: 'flex',
  gap: 12,
};

const inputGroupStyle = {
  marginBottom: 16,
  flex: 1,
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

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.first_name || !form.last_name || !form.email || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={logoStyle}>JobConnect</div>
      <div style={subtitleStyle}>Make the most of your professional life</div>
      <form style={formStyle} onSubmit={handleSubmit}>
        {error && <div style={errorStyle}>{error}</div>}
        <div style={rowStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>First name</label>
            <input
              type="text"
              style={inputStyle}
              value={form.first_name}
              onChange={handleChange('first_name')}
              placeholder="First name"
              autoComplete="given-name"
            />
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Last name</label>
            <input
              type="text"
              style={inputStyle}
              value={form.last_name}
              onChange={handleChange('last_name')}
              placeholder="Last name"
              autoComplete="family-name"
            />
          </div>
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            style={inputStyle}
            value={form.email}
            onChange={handleChange('email')}
            placeholder="Enter your email"
            autoComplete="email"
          />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            style={inputStyle}
            value={form.password}
            onChange={handleChange('password')}
            placeholder="6+ characters"
            autoComplete="new-password"
          />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>Confirm password</label>
          <input
            type="password"
            style={inputStyle}
            value={form.confirm_password}
            onChange={handleChange('confirm_password')}
            placeholder="Confirm your password"
            autoComplete="new-password"
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
          {loading ? 'Creating account...' : 'Join now'}
        </button>
      </form>
      <div style={linkContainerStyle}>
        Already have an account?
        <Link to="/login" style={linkStyle}>Sign in</Link>
      </div>
    </div>
  );
}
