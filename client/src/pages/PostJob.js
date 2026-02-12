import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apiPost } from '../utils/api';

const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Remote'];
const experienceLevels = ['Entry', 'Mid', 'Senior', 'Lead'];

export default function PostJob() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState({
    company: '',
    title: '',
    description: '',
    location: '',
    type: 'Full-time',
    experience_level: 'Mid',
    salary_min: '',
    salary_max: '',
    skills_required: []
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !form.skills_required.includes(skill)) {
      setForm({ ...form, skills_required: [...form.skills_required, skill] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setForm({ ...form, skills_required: form.skills_required.filter(s => s !== skill) });
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company || !form.title || !form.description) {
      setError('Company, title, and description are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        salary_min: form.salary_min ? parseInt(form.salary_min) : null,
        salary_max: form.salary_max ? parseInt(form.salary_max) : null,
        skills_required: form.skills_required.join(',')
      };
      const res = await apiPost('/api/jobs', payload);
      if (res.error) throw new Error(res.error);
      navigate('/jobs');
    } catch (err) {
      setError(err.message || 'Failed to post job');
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
      background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', marginRight: 12,
      padding: 8, color: '#191919'
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
      borderRadius: 8, outline: 'none', boxSizing: 'border-box', marginBottom: 16,
      transition: 'border-color 0.2s'
    },
    textarea: {
      width: '100%', minHeight: 120, padding: 16, fontSize: 16, border: '1px solid #e0e0e0',
      borderRadius: 8, outline: 'none', boxSizing: 'border-box', marginBottom: 16,
      fontFamily: 'inherit', resize: 'vertical', transition: 'border-color 0.2s'
    },
    select: {
      width: '100%', height: 48, padding: '0 12px', fontSize: 16, border: '1px solid #e0e0e0',
      borderRadius: 8, outline: 'none', boxSizing: 'border-box', marginBottom: 16,
      background: '#fff', cursor: 'pointer'
    },
    row: { display: 'flex', gap: 12 },
    half: { flex: 1 },
    skillsContainer: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    skillTag: {
      display: 'inline-flex', alignItems: 'center', background: '#e8f0fe', color: '#0a66c2',
      padding: '6px 12px', borderRadius: 16, fontSize: 14, fontWeight: 500
    },
    removeSkill: {
      background: 'none', border: 'none', marginLeft: 6, cursor: 'pointer',
      color: '#0a66c2', fontSize: 16, padding: 0, lineHeight: 1
    },
    skillInputRow: { display: 'flex', gap: 8 },
    addBtn: {
      height: 48, padding: '0 16px', background: '#0a66c2', color: '#fff', border: 'none',
      borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
    },
    submitBtn: {
      width: '100%', height: 52, background: '#0a66c2', color: '#fff', border: 'none',
      borderRadius: 26, fontSize: 16, fontWeight: 600, cursor: 'pointer',
      opacity: loading ? 0.7 : 1, marginTop: 8
    },
    error: {
      background: '#fef2f2', color: '#dc2626', padding: 12, borderRadius: 8,
      marginBottom: 16, fontSize: 14
    },
    sectionTitle: { fontSize: 16, fontWeight: 600, color: '#191919', marginBottom: 16 }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>&#8592;</button>
        <span style={styles.title}>Post a Job</span>
      </div>

      <form style={styles.form} onSubmit={handleSubmit}>
        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.card}>
          <div style={styles.sectionTitle}>Job Details</div>
          <label style={styles.label}>Company Name *</label>
          <input style={styles.input} name="company" value={form.company} onChange={handleChange}
            placeholder="e.g. Google" />

          <label style={styles.label}>Job Title *</label>
          <input style={styles.input} name="title" value={form.title} onChange={handleChange}
            placeholder="e.g. Senior Software Engineer" />

          <label style={styles.label}>Description *</label>
          <textarea style={styles.textarea} name="description" value={form.description}
            onChange={handleChange} placeholder="Describe the role, responsibilities, and requirements..." />

          <label style={styles.label}>Location</label>
          <input style={styles.input} name="location" value={form.location} onChange={handleChange}
            placeholder="e.g. San Francisco, CA" />
        </div>

        <div style={styles.card}>
          <div style={styles.sectionTitle}>Job Configuration</div>
          <div style={styles.row}>
            <div style={styles.half}>
              <label style={styles.label}>Job Type</label>
              <select style={styles.select} name="type" value={form.type} onChange={handleChange}>
                {jobTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={styles.half}>
              <label style={styles.label}>Experience Level</label>
              <select style={styles.select} name="experience_level" value={form.experience_level}
                onChange={handleChange}>
                {experienceLevels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.half}>
              <label style={styles.label}>Min Salary ($)</label>
              <input style={styles.input} name="salary_min" type="number" value={form.salary_min}
                onChange={handleChange} placeholder="50000" />
            </div>
            <div style={styles.half}>
              <label style={styles.label}>Max Salary ($)</label>
              <input style={styles.input} name="salary_max" type="number" value={form.salary_max}
                onChange={handleChange} placeholder="120000" />
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.sectionTitle}>Required Skills</div>
          {form.skills_required.length > 0 && (
            <div style={styles.skillsContainer}>
              {form.skills_required.map(skill => (
                <span key={skill} style={styles.skillTag}>
                  {skill}
                  <button type="button" style={styles.removeSkill} onClick={() => removeSkill(skill)}>×</button>
                </span>
              ))}
            </div>
          )}
          <div style={styles.skillInputRow}>
            <input style={{ ...styles.input, marginBottom: 0, flex: 1 }} value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)} onKeyDown={handleSkillKeyDown}
              placeholder="Type a skill and press Enter" />
            <button type="button" style={styles.addBtn} onClick={addSkill}>Add</button>
          </div>
        </div>

        <button type="submit" style={styles.submitBtn} disabled={loading}>
          {loading ? 'Posting...' : 'Post Job'}
        </button>
      </form>
    </div>
  );
}
