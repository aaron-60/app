import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../utils/api';
import ConnectionCard from '../components/ConnectionCard';
import JobCard from '../components/JobCard';

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('people');
  const [people, setPeople] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setPeople([]);
      setJobs([]);
      setSearched(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      performSearch(query.trim());
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query, activeTab]);

  const performSearch = async (q) => {
    setLoading(true);
    setSearched(true);
    try {
      if (activeTab === 'people') {
        const data = await apiGet(`/api/users/search?q=${encodeURIComponent(q)}`);
        setPeople(data.users || []);
      } else {
        const data = await apiGet(`/api/jobs?q=${encodeURIComponent(q)}`);
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { minHeight: '100vh', background: '#f3f2ef', paddingBottom: 80 },
    header: {
      background: '#fff', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8,
      borderBottom: '1px solid #e0e0e0', position: 'sticky', top: 0, zIndex: 10
    },
    backBtn: {
      background: 'none', border: 'none', fontSize: 24, cursor: 'pointer',
      padding: 8, color: '#191919', flexShrink: 0
    },
    searchInput: {
      flex: 1, height: 40, padding: '0 16px', fontSize: 16,
      border: '1px solid #e0e0e0', borderRadius: 20, outline: 'none',
      boxSizing: 'border-box', background: '#f3f2ef'
    },
    tabs: {
      display: 'flex', background: '#fff', borderBottom: '1px solid #e0e0e0',
      position: 'sticky', top: 64, zIndex: 9
    },
    tab: (active) => ({
      flex: 1, padding: '12px 8px', textAlign: 'center', fontSize: 14, fontWeight: 600,
      color: active ? '#0a66c2' : '#666', background: 'none', border: 'none',
      borderBottom: active ? '2px solid #0a66c2' : '2px solid transparent',
      cursor: 'pointer'
    }),
    content: { padding: 16 },
    spinner: {
      width: 36, height: 36, border: '3px solid #e0e0e0', borderTopColor: '#0a66c2',
      borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '40px auto',
      display: 'block'
    },
    empty: { textAlign: 'center', padding: 40, color: '#666' },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyText: { fontSize: 16, fontWeight: 500 },
    emptySubtext: { fontSize: 14, color: '#999', marginTop: 4 },
    resultCount: { fontSize: 14, color: '#666', marginBottom: 12 }
  };

  const renderResults = () => {
    if (loading) return <div style={styles.spinner} />;

    if (!searched) {
      return (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>🔍</div>
          <div style={styles.emptyText}>Search for {activeTab === 'people' ? 'people' : 'jobs'}</div>
          <div style={styles.emptySubtext}>
            {activeTab === 'people'
              ? 'Find professionals by name, headline, or skills'
              : 'Search jobs by title, company, or skills'}
          </div>
        </div>
      );
    }

    if (activeTab === 'people') {
      return people.length > 0 ? (
        <>
          <div style={styles.resultCount}>{people.length} result{people.length !== 1 ? 's' : ''}</div>
          {people.map(person => (
            <ConnectionCard key={person.id} connection={person} type="suggestion"
              onConnect={() => navigate(`/profile/${person.id}`)} connectLabel="View" />
          ))}
        </>
      ) : (
        <div style={styles.empty}>
          <div style={styles.emptyText}>No people found</div>
          <div style={styles.emptySubtext}>Try different keywords</div>
        </div>
      );
    }

    return jobs.length > 0 ? (
      <>
        <div style={styles.resultCount}>{jobs.length} result{jobs.length !== 1 ? 's' : ''}</div>
        {jobs.map(job => (
          <JobCard key={job.id} job={job} />
        ))}
      </>
    ) : (
      <div style={styles.empty}>
        <div style={styles.emptyText}>No jobs found</div>
        <div style={styles.emptySubtext}>Try different keywords or filters</div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>&#8592;</button>
        <input ref={inputRef} style={styles.searchInput} value={query}
          onChange={(e) => setQuery(e.target.value)} placeholder="Search..." />
      </div>

      <div style={styles.tabs}>
        <button style={styles.tab(activeTab === 'people')} onClick={() => setActiveTab('people')}>
          People
        </button>
        <button style={styles.tab(activeTab === 'jobs')} onClick={() => setActiveTab('jobs')}>
          Jobs
        </button>
      </div>

      <div style={styles.content}>
        {renderResults()}
      </div>
    </div>
  );
}
