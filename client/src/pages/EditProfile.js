import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apiPut } from '../utils/api';

export default function EditProfile() {
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    headline: user?.headline || '',
    summary: user?.summary || '',
    location: user?.location || '',
    industry: user?.industry || '',
    experience_years: user?.experience_years || 0,
    skills: user?.skills || ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name) {
      setError('First and last name are required');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await apiPut('/api/users/profile', {
        ...form,
        experience_years: parseInt(form.experience_years) || 0
      });
      if (data.error) throw new Error(data.error);
      updateUser(data.user || data);
      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate(`/profile/${user.id}`), 1000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { minHeight: '100vh', background: '#f3f2ef', paddingBottom: 80 },
    header: {
      background: '#fff', padding: '12px 16px', display: 'flex', alignItems: 'center',
      borderBottom: '1px solid #e0e0e0', position: 'sticky', top: 0, zIndex: 10
    },
    backBtn: {
      background: 'none', border: 'none', fontSize: 24, cursor: 'pointer',
      padding: 8, color: '#191919', marginRight: 8
    },
    title: { fontSize: 18, fontWeight: 600, color: '#191919' },
    form: { padding: 16 },
    card: {
      background: '#fff', borderRadius: 12, padding: 20, marginBottom: 12,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
    },
    label: { display: 'block', fontSize: 14, fontWeight: 600, color: '#191919', marginBottom: 6 },
    input: {
      width: '100%', height: 48, padding: '0 16px', fontSize: 16, border: '1px solid #e0e0e0',
      borderRadius: 8, outline: 'none', boxSizing: 'border-box', marginBottom: 16
    },
    textarea: {
      width: '100%', minHeight: 100, padding: 16, fontSize: 16, border: '1px solid #e0e0e0',
      borderRadius: 8, outline: 'none', boxSizing: 'border-box', marginBottom: 16,
      fontFamily: 'inherit', resize: 'vertical'
    },
    row: { display: 'flex', gap: 12 },
    half: { flex: 1 },
    submitBtn: {
      width: '100%', height: 52, background: '#0a66c2', color: '#fff', border: 'none',
      borderRadius: 26, fontSize: 16, fontWeight: 600, cursor: 'pointer',
      opacity: loading ? 0.7 : 1
    },
    error: { background: '#fef2f2', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 },
    success: { background: '#f0fdf4', color: '#057642', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 },
    hint: { fontSize: 12, color: '#999', marginTop: -12, marginBottom: 16 }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>&#8592;</button>
        <span style={styles.title}>Edit Profile</span>
      </div>

      <form style={styles.form} onSubmit={handleSubmit}>
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <div style={styles.card}>
          <div style={styles.row}>
            <div style={styles.half}>
              <label style={styles.label}>First Name *</label>
              <input style={styles.input} name="first_name" value={form.first_name} onChange={handleChange} />
            </div>
            <div style={styles.half}>
              <label style={styles.label}>Last Name *</label>
              <input style={styles.input} name="last_name" value={form.last_name} onChange={handleChange} />
            </div>
          </div>

          <label style={styles.label}>Headline</label>
          <input style={styles.input} name="headline" value={form.headline} onChange={handleChange}
            placeholder="e.g. Senior Software Engineer at Google" />

          <label style={styles.label}>Location</label>
          <input style={styles.input} name="location" value={form.location} onChange={handleChange}
            placeholder="e.g. San Francisco, CA" />

          <label style={styles.label}>Industry</label>
          <input style={styles.input} name="industry" value={form.industry} onChange={handleChange}
            placeholder="e.g. Technology" />

          <label style={styles.label}>Years of Experience</label>
          <input style={styles.input} name="experience_years" type="number" min="0"
            value={form.experience_years} onChange={handleChange} />
        </div>

        <div style={styles.card}>
          <label style={styles.label}>About / Summary</label>
          <textarea style={styles.textarea} name="summary" value={form.summary} onChange={handleChange}
            placeholder="Tell people about yourself, your experience, and what you're looking for..." />

          <label style={styles.label}>Skills</label>
          <input style={styles.input} name="skills" value={form.skills} onChange={handleChange}
            placeholder="e.g. JavaScript, React, Node.js, Python" />
          <p style={styles.hint}>Separate skills with commas</p>
        </div>

        <button type="submit" style={styles.submitBtn} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
