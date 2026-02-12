import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiGet, apiPost, apiDelete } from '../utils/api';
import { timeAgo, formatSalary } from '../utils/helpers';

const pageStyle = {
  paddingBottom: 72,
  minHeight: '100vh',
  backgroundColor: '#f3f2ef',
};

const headerStyle = {
  position: 'sticky',
  top: 0,
  zIndex: 100,
  backgroundColor: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  padding: '12px 16px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  gap: 12,
};

const backBtnStyle = {
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

const cardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: 12,
  margin: '8px 8px 0',
  padding: 20,
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
};

const titleStyle = {
  fontSize: 22,
  fontWeight: 700,
  color: '#191919',
  lineHeight: 1.3,
};

const companyStyle = {
  fontSize: 16,
  fontWeight: 500,
  color: '#191919',
  marginTop: 6,
};

const metaStyle = {
  fontSize: 14,
  color: '#666666',
  marginTop: 4,
};

const badgeRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  marginTop: 14,
};

const badgeStyle = {
  padding: '6px 14px',
  borderRadius: 16,
  fontSize: 13,
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
  fontSize: 18,
  fontWeight: 700,
  color: '#057642',
  marginTop: 14,
};

const sectionTitleStyle = {
  fontSize: 16,
  fontWeight: 700,
  color: '#191919',
  marginBottom: 8,
};

const descriptionStyle = {
  fontSize: 14,
  lineHeight: 1.7,
  color: '#191919',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
};

const skillsRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
};

const skillTagStyle = {
  padding: '6px 14px',
  borderRadius: 16,
  fontSize: 13,
  backgroundColor: '#f3f2ef',
  color: '#666666',
};

const actionBarStyle = {
  display: 'flex',
  gap: 10,
  marginTop: 20,
  paddingTop: 16,
  borderTop: '1px solid #e0e0e0',
};

const applyBtnStyle = {
  flex: 1,
  height: 48,
  borderRadius: 24,
  backgroundColor: '#0a66c2',
  color: '#ffffff',
  fontSize: 16,
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const appliedBtnStyle = {
  ...applyBtnStyle,
  backgroundColor: '#057642',
  cursor: 'default',
};

const saveBtnStyle = {
  width: 48,
  height: 48,
  borderRadius: 24,
  border: '1.5px solid #e0e0e0',
  backgroundColor: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const modalOverlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  zIndex: 1000,
  padding: 0,
};

const modalContent = {
  backgroundColor: '#ffffff',
  borderRadius: '16px 16px 0 0',
  padding: 24,
  width: '100%',
  maxWidth: 500,
  maxHeight: '80vh',
  overflowY: 'auto',
  animation: 'slideUp 0.3s ease',
};

const textareaStyle = {
  width: '100%',
  minHeight: 150,
  borderRadius: 8,
  border: '1px solid #e0e0e0',
  padding: 14,
  fontSize: 16,
  resize: 'vertical',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

const spinnerStyle = {
  display: 'flex',
  justifyContent: 'center',
  padding: 48,
};

const viewAppsBtnStyle = {
  ...applyBtnStyle,
  backgroundColor: '#057642',
};

const BackArrow = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#191919" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const BookmarkIcon = ({ filled }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? '#0a66c2' : 'none'} stroke={filled ? '#0a66c2' : '#666666'} strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
  </svg>
);

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applications, setApplications] = useState([]);
  const [showApplications, setShowApplications] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const data = await apiGet(`/jobs/${id}`);
        const jobData = data.job || data;
        setJob(jobData);
        setSaved(jobData.user_has_saved || jobData.saved || false);
        setApplied(jobData.user_has_applied || jobData.applied || false);
      } catch (err) {
        console.error('Fetch job error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleSave = async () => {
    try {
      const data = await apiPost(`/jobs/${id}/save`);
      setSaved(data.saved !== undefined ? data.saved : !saved);
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleApply = async () => {
    if (applying) return;
    setApplying(true);
    try {
      await apiPost(`/jobs/${id}/apply`, { cover_letter: coverLetter });
      setApplied(true);
      setShowModal(false);
      setCoverLetter('');
    } catch (err) {
      console.error('Apply error:', err);
    } finally {
      setApplying(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const data = await apiGet(`/jobs/${id}/applications`);
      setApplications(data.applications || data || []);
      setShowApplications(true);
    } catch (err) {
      console.error('Fetch applications error:', err);
    }
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={headerStyle}>
          <button style={backBtnStyle} onClick={() => navigate(-1)}>
            <BackArrow />
          </button>
          <span style={{ fontWeight: 600, fontSize: 17 }}>Job Details</span>
        </div>
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
      </div>
    );
  }

  if (!job) {
    return (
      <div style={pageStyle}>
        <div style={headerStyle}>
          <button style={backBtnStyle} onClick={() => navigate(-1)}>
            <BackArrow />
          </button>
          <span style={{ fontWeight: 600, fontSize: 17 }}>Job Details</span>
        </div>
        <div style={{ textAlign: 'center', padding: 48, color: '#666666' }}>
          Job not found.
        </div>
      </div>
    );
  }

  const skillsRaw = job.skills_required || job.skills || '';
  const skills = Array.isArray(skillsRaw)
    ? skillsRaw
    : typeof skillsRaw === 'string'
    ? skillsRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const isOwner = user && (job.posted_by === user.id || job.user_id === user.id);
  const salaryMin = job.salary_min || job.salaryMin;
  const salaryMax = job.salary_max || job.salaryMax;
  const jobType = job.type || job.job_type || job.jobType;
  const experienceLevel = job.experience_level || job.experienceLevel;
  const companyName = job.company_name || job.company || '';

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <button style={backBtnStyle} onClick={() => navigate(-1)}>
          <BackArrow />
        </button>
        <span style={{ fontWeight: 600, fontSize: 17, flex: 1 }}>Job Details</span>
      </div>

      <div style={cardStyle}>
        <div style={titleStyle}>{job.title}</div>
        <div style={companyStyle}>{companyName}</div>
        <div style={metaStyle}>{job.location || 'Remote'}</div>
        <div style={metaStyle}>{timeAgo(job.created_at || job.createdAt)}</div>

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

        <div style={actionBarStyle}>
          {isOwner ? (
            <button style={viewAppsBtnStyle} onClick={fetchApplications}>
              View Applications
            </button>
          ) : applied ? (
            <button style={appliedBtnStyle} disabled>Applied</button>
          ) : (
            <button style={applyBtnStyle} onClick={() => setShowModal(true)}>
              Apply Now
            </button>
          )}
          <button
            style={{ ...saveBtnStyle, borderColor: saved ? '#0a66c2' : '#e0e0e0' }}
            onClick={handleSave}
          >
            <BookmarkIcon filled={saved} />
          </button>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={sectionTitleStyle}>About the role</div>
        <div style={descriptionStyle}>{job.description}</div>
      </div>

      {skills.length > 0 && (
        <div style={cardStyle}>
          <div style={sectionTitleStyle}>Required Skills</div>
          <div style={skillsRowStyle}>
            {skills.map((skill, idx) => (
              <span key={idx} style={skillTagStyle}>{skill}</span>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div style={modalOverlay} onClick={() => setShowModal(false)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Apply to {job.title}</div>
            <div style={{ fontSize: 14, color: '#666666', marginBottom: 16 }}>{companyName}</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Cover Letter (optional)</div>
            <textarea
              style={textareaStyle}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell the employer why you're a great fit for this role..."
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button
                style={{ ...applyBtnStyle, backgroundColor: '#e0e0e0', color: '#666666', flex: 'unset', padding: '0 24px' }}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                style={{ ...applyBtnStyle, opacity: applying ? 0.7 : 1 }}
                onClick={handleApply}
                disabled={applying}
              >
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showApplications && (
        <div style={modalOverlay} onClick={() => setShowApplications(false)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
              Applications ({applications.length})
            </div>
            {applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: '#666666' }}>
                No applications yet.
              </div>
            ) : (
              applications.map((app, idx) => {
                const applicant = app.user || app.applicant || {};
                return (
                  <div key={app.id || idx} style={{
                    padding: 14,
                    borderBottom: idx < applications.length - 1 ? '1px solid #e0e0e0' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>
                        {applicant.first_name} {applicant.last_name}
                      </div>
                      <div style={{ fontSize: 13, color: '#666666', marginTop: 2 }}>
                        {applicant.headline || applicant.email}
                      </div>
                      {app.cover_letter && (
                        <div style={{ fontSize: 13, color: '#191919', marginTop: 6, fontStyle: 'italic' }}>
                          "{app.cover_letter.substring(0, 100)}{app.cover_letter.length > 100 ? '...' : ''}"
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: '#666666', marginTop: 4 }}>
                        {timeAgo(app.created_at || app.applied_at)}
                      </div>
                    </div>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 500,
                      backgroundColor: app.status === 'accepted' ? '#e6f4ea' : app.status === 'rejected' ? '#fce8e6' : '#e8f0fe',
                      color: app.status === 'accepted' ? '#057642' : app.status === 'rejected' ? '#c5221f' : '#0a66c2',
                    }}>
                      {app.status || 'pending'}
                    </span>
                  </div>
                );
              })
            )}
            <button
              style={{ ...applyBtnStyle, marginTop: 16, backgroundColor: '#e0e0e0', color: '#666666' }}
              onClick={() => setShowApplications(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
