import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { timeAgo, formatSalary } from '../utils/helpers';
import { apiPost, apiDelete } from '../utils/api';

const cardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: 12,
  padding: 16,
  marginBottom: 8,
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  cursor: 'pointer',
  transition: 'box-shadow 0.2s ease',
  animation: 'fadeIn 0.3s ease',
};

const topRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
};

const titleStyle = {
  fontWeight: 600,
  fontSize: 16,
  color: '#0a66c2',
  marginBottom: 4,
  lineHeight: 1.3,
};

const companyStyle = {
  fontSize: 14,
  color: '#191919',
  fontWeight: 500,
};

const locationStyle = {
  fontSize: 13,
  color: '#666666',
  marginTop: 2,
};

const badgeRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
  marginTop: 10,
};

const badgeStyle = {
  padding: '4px 10px',
  borderRadius: 12,
  fontSize: 12,
  fontWeight: 500,
  backgroundColor: '#e8f0fe',
  color: '#0a66c2',
};

const greenBadge = {
  ...badgeStyle,
  backgroundColor: '#e6f4ea',
  color: '#057642',
};

const salaryStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: '#057642',
  marginTop: 10,
};

const skillsRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
  marginTop: 10,
};

const skillTagStyle = {
  padding: '3px 8px',
  borderRadius: 4,
  fontSize: 12,
  backgroundColor: '#f3f2ef',
  color: '#666666',
};

const bottomRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 12,
  paddingTop: 10,
  borderTop: '1px solid #e0e0e0',
};

const timeTextStyle = {
  fontSize: 12,
  color: '#666666',
};

const bookmarkBtnStyle = {
  minWidth: 44,
  minHeight: 44,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  border: 'none',
  background: 'none',
  padding: 0,
};

const BookmarkIcon = ({ filled }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? '#0a66c2' : 'none'} stroke={filled ? '#0a66c2' : '#666666'} strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
  </svg>
);

export default function JobCard({ job, onSaveToggle }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(job.user_has_saved || job.saved || false);

  const skills = Array.isArray(job.skills)
    ? job.skills
    : typeof job.skills === 'string'
    ? job.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const handleSave = async (e) => {
    e.stopPropagation();
    try {
      if (saved) {
        await apiDelete(`/jobs/${job.id}/save`);
        setSaved(false);
      } else {
        await apiPost(`/jobs/${job.id}/save`);
        setSaved(true);
      }
      if (onSaveToggle) onSaveToggle(job.id, !saved);
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleClick = () => {
    navigate(`/jobs/${job.id}`);
  };

  const salaryMin = job.salary_min || job.salaryMin;
  const salaryMax = job.salary_max || job.salaryMax;
  const jobType = job.job_type || job.jobType;
  const experienceLevel = job.experience_level || job.experienceLevel;
  const companyName = job.company_name || job.company || '';

  return (
    <div style={cardStyle} onClick={handleClick}>
      <div style={topRowStyle}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={titleStyle}>{job.title}</div>
          <div style={companyStyle}>{companyName}</div>
          <div style={locationStyle}>{job.location || 'Remote'}</div>
        </div>
        <button style={bookmarkBtnStyle} onClick={handleSave} aria-label={saved ? 'Unsave' : 'Save'}>
          <BookmarkIcon filled={saved} />
        </button>
      </div>

      <div style={badgeRowStyle}>
        {jobType && <span style={badgeStyle}>{jobType.replace('_', ' ')}</span>}
        {experienceLevel && <span style={greenBadge}>{experienceLevel.replace('_', ' ')}</span>}
      </div>

      {(salaryMin || salaryMax) && (
        <div style={salaryStyle}>
          {salaryMin && salaryMax
            ? `${formatSalary(salaryMin)} - ${formatSalary(salaryMax)}`
            : salaryMin
            ? `From ${formatSalary(salaryMin)}`
            : `Up to ${formatSalary(salaryMax)}`}
        </div>
      )}

      {skills.length > 0 && (
        <div style={skillsRowStyle}>
          {skills.slice(0, 3).map((skill, idx) => (
            <span key={idx} style={skillTagStyle}>{skill}</span>
          ))}
          {skills.length > 3 && (
            <span style={skillTagStyle}>+{skills.length - 3}</span>
          )}
        </div>
      )}

      <div style={bottomRowStyle}>
        <span style={timeTextStyle}>{timeAgo(job.created_at || job.createdAt)}</span>
        {job.application_status && (
          <span style={{
            ...badgeStyle,
            backgroundColor: job.application_status === 'accepted' ? '#e6f4ea' : job.application_status === 'rejected' ? '#fce8e6' : '#e8f0fe',
            color: job.application_status === 'accepted' ? '#057642' : job.application_status === 'rejected' ? '#c5221f' : '#0a66c2',
          }}>
            {job.application_status}
          </span>
        )}
      </div>
    </div>
  );
}
