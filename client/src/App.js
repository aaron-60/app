import React, { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import BottomNav from './components/BottomNav';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import JobSearch from './pages/JobSearch';
import JobDetail from './pages/JobDetail';
import PostJob from './pages/PostJob';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Connections from './pages/Connections';
import Messages from './pages/Messages';
import Conversation from './pages/Conversation';
import Notifications from './pages/Notifications';
import Search from './pages/Search';

function AppRoutes() {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', background: '#f3f2ef'
      }}>
        <div style={{
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: 32, fontWeight: 700, color: '#0a66c2', marginBottom: 16
          }}>
            JobConnect
          </div>
          <div style={{
            width: 36, height: 36, border: '3px solid #e0e0e0',
            borderTopColor: '#0a66c2', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto'
          }} />
        </div>
      </div>
    );
  }

  const hideBottomNav = ['/login', '/register'].includes(location.pathname) ||
    location.pathname.startsWith('/messages/') && location.pathname.split('/').length > 2;

  const showBottomNav = user && !hideBottomNav;

  return (
    <>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

        <Route path="/" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><JobSearch /></ProtectedRoute>} />
        <Route path="/jobs/post" element={<ProtectedRoute><PostJob /></ProtectedRoute>} />
        <Route path="/jobs/:id" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/connections" element={<ProtectedRoute><Connections /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/messages/:userId" element={<ProtectedRoute><Conversation /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {showBottomNav && <BottomNav />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
