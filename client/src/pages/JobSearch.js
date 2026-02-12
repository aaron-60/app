import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../utils/api';
import JobCard from '../components/JobCard';

const pageStyle = {
  paddingBottom: 72,
  minHeight: '100vh',
};

const headerStyle = {
  position: 'sticky',
  top: 0,
  zIndex: 100,
  backgroundColor: '#ffffff',
  padding: '12px 16px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
};

const headerTitleStyle = {
  fontSize: 20,
  fontWeight: 700,
  color: '#191919',
  marginBottom: 12,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const searchRowStyle = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
};

const searchInputStyle = {
  flex: 1,
  height: 44,
  borderRadius: 8,
  border: '1px solid #e0e0e0',
  padding: '0 14px',
  fontSize: 16,
  outline: 'none',
  backgroundColor: '#f3f2ef',
};

const filterBtnStyle = {
  width: 44,
  height: 44,
  borderRadius: 8,
  border: '1px solid #e0e0e0',
  backgroundColor: '#f3f2ef',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
};

const tabsStyle = {
  display: 'flex',
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e0e0e0',
};

const tabStyle = {
  flex: 1,
  padding: '12px 8px',
  textAlign: 'center',
  fontSize: 14,
  fontWeight: 600,
  color: '#666666',
  cursor: 'pointer',
  border: 'none',
  background: 'none',
  borderBottom: '2px solid transparent',
  transition: 'all 0.2s ease',
  minHeight: 44,
};

const activeTabStyle = {
  ...tabStyle,
  color: '#0a66c2',
  borderBottomColor: '#0a66c2',
};

const filterSectionStyle = {
  backgroundColor: '#ffffff',
  padding: 16,
  margin: '0 0 4px',
  borderBottom: '1px solid #e0e0e0',
};

const filterLabelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: '#191919',
  marginBottom: 8,
  marginTop: 12,
};

const filterRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
};

const chipStyle = {
  padding: '6px 14px',
  borderRadius: 16,
  fontSize: 13,
  border: '1px solid #e0e0e0',
  cursor: 'pointer',
  transition: 'all 0.2s',
  background: '#ffffff',
  color: '#666666',
  minHeight: 36,
  display: 'inline-flex',
  alignItems: 'center',
};

const activeChipStyle = {
  ...chipStyle,
  backgroundColor: '#e8f0fe',
  borderColor: '#0a66c2',
  color: '#0a66c2',
};

const contentStyle = {
  padding: '8px 8px 0',
};

const postJobBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  padding: '0 16px',
  height: 36,
  borderRadius: 18,
  backgroundColor: '#0a66c2',
  color: '#ffffff',
  fontSize: 14,
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
};

const emptyStyle = {
  textAlign: 'center',
  padding: 48,
  color: '#666666',
  fontSize: 15,
};

const spinnerStyle = {
  display: 'flex',
  justifyContent: 'center',
  padding: 24,
};

const paginationStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: 8,
  padding: '16px 0',
};

const pageBtnStyle = {
  minWidth: 44,
  height: 44,
  borderRadius: 8,
  border: '1px solid #e0e0e0',
  backgroundColor: '#ffffff',
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const FilterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth="2">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="11" y1="18" x2="13" y2="18" />
  </svg>
);

const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Remote'];
const experienceLevels = ['Entry', 'Mid', 'Senior', 'Lead'];

export default function JobSearch() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('search');
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    job_type: '',
    experience_level: '',
    location: '',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 10);
      if (search) params.append('q', search);
      if (filters.job_type) params.append('type', filters.job_type);
      if (filters.experience_level) params.append('experience_level', filters.experience_level);
      if (filters.location) params.append('location', filters.location);

      const data = await apiGet(`/jobs?${params.toString()}`);
      setJobs(data.jobs || data || []);
      setTotalPages(data.pagination?.pages || data.totalPages || 1);
    } catch (err) {
      console.error('Fetch jobs error:', err);
    } finally {
      setLoading(false);
    }
  }, [search, filters, page]);

  const fetchApplications = useCallback(async () => {
    try {
      const data = await apiGet('/jobs/user/applications');
      setApplications(data.applications || data || []);
    } catch (err) {
      console.error('Fetch applications error:', err);
    }
  }, []);

  const fetchSavedJobs = useCallback(async () => {
    try {
      const data = await apiGet('/jobs/user/saved');
      setSavedJobs(data.saved_jobs || data.jobs || data || []);
    } catch (err) {
      console.error('Fetch saved jobs error:', err);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'search') fetchJobs();
    else if (activeTab === 'applications') fetchApplications();
    else if (activeTab === 'saved') fetchSavedJobs();
  }, [activeTab, fetchJobs, fetchApplications, fetchSavedJobs]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const toggleFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? '' : value,
    }));
    setPage(1);
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div style={headerTitleStyle}>
          <span>Jobs</span>
          <button style={postJobBtnStyle} onClick={() => navigate('/jobs/post')}>
            + Post Job
          </button>
        </div>
        <form onSubmit={handleSearch} style={searchRowStyle}>
          <input
            type="text"
            style={searchInputStyle}
            placeholder="Search jobs, companies, skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="button" style={filterBtnStyle} onClick={() => setShowFilters(!showFilters)}>
            <FilterIcon />
          </button>
        </form>
      </div>

      <div style={tabsStyle}>
        <button
          style={activeTab === 'search' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('search')}
        >
          Search
        </button>
        <button
          style={activeTab === 'applications' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('applications')}
        >
          Applications
        </button>
        <button
          style={activeTab === 'saved' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('saved')}
        >
          Saved
        </button>
      </div>

      {showFilters && activeTab === 'search' && (
        <div style={filterSectionStyle}>
          <div style={filterLabelStyle}>Job Type</div>
          <div style={filterRowStyle}>
            {jobTypes.map((type) => (
              <span
                key={type}
                style={filters.job_type === type ? activeChipStyle : chipStyle}
                onClick={() => toggleFilter('job_type', type)}
              >
                {type}
              </span>
            ))}
          </div>
          <div style={filterLabelStyle}>Experience Level</div>
          <div style={filterRowStyle}>
            {experienceLevels.map((level) => (
              <span
                key={level}
                style={filters.experience_level === level ? activeChipStyle : chipStyle}
                onClick={() => toggleFilter('experience_level', level)}
              >
                {level}
              </span>
            ))}
          </div>
          <div style={filterLabelStyle}>Location</div>
          <input
            type="text"
            style={{ ...searchInputStyle, width: '100%', marginTop: 4, height: 40 }}
            placeholder="City, state, or remote"
            value={filters.location}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, location: e.target.value }));
              setPage(1);
            }}
          />
        </div>
      )}

      <div style={contentStyle}>
        {loading ? (
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
        ) : activeTab === 'search' ? (
          <>
            {jobs.length === 0 ? (
              <div style={emptyStyle}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>No jobs found</div>
                <p>Try adjusting your search or filters.</p>
              </div>
            ) : (
              <>
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
                {totalPages > 1 && (
                  <div style={paginationStyle}>
                    <button
                      style={{ ...pageBtnStyle, opacity: page <= 1 ? 0.5 : 1 }}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      Prev
                    </button>
                    <span style={{ display: 'flex', alignItems: 'center', fontSize: 14, color: '#666666' }}>
                      {page} / {totalPages}
                    </span>
                    <button
                      style={{ ...pageBtnStyle, opacity: page >= totalPages ? 0.5 : 1 }}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : activeTab === 'applications' ? (
          applications.length === 0 ? (
            <div style={emptyStyle}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>No applications yet</div>
              <p>Start applying to jobs to track them here.</p>
            </div>
          ) : (
            applications.map((app) => (
              <JobCard
                key={app.id || app.job_id}
                job={{ ...app.job, ...app, application_status: app.status }}
              />
            ))
          )
        ) : (
          savedJobs.length === 0 ? (
            <div style={emptyStyle}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>No saved jobs</div>
              <p>Bookmark jobs to save them for later.</p>
            </div>
          ) : (
            savedJobs.map((job) => (
              <JobCard key={job.id} job={{ ...job, saved: true }} />
            ))
          )
        )}
      </div>
    </div>
  );
}
