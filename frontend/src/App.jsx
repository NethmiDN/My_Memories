import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import StatusBar from './components/StatusBar';
import MemoryGallery from './components/MemoryGallery';
import EventCreation from './components/EventCreation';
import UserManagement from './components/UserManagement';
import MediaUpload from './components/MediaUpload';
import Toast from './components/Toast';
import Auth from './components/Auth';

import { getUsers, getEvents, checkMeshStatus } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('gallery');
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [meshStatus, setMeshStatus] = useState({ gateway: false, users: false, events: false, media: false });

  // Active Authenticated User state
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('my_memories_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [selectedEventIdForUpload, setSelectedEventIdForUpload] = useState('');
  const [toasts, setToasts] = useState([]);

  // Toast notification helper
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  // Login handler
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('my_memories_current_user', JSON.stringify(user));
      setActiveTab('gallery');
    }
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('my_memories_current_user');
    showToast('Signed out of session.', 'info');
  };

  // Fetch initial data from microservices gateway
  const fetchData = useCallback(async () => {
    try {
      const [fetchedUsers, fetchedEvents, status] = await Promise.all([
        getUsers().catch(() => []),
        getEvents().catch(() => []),
        checkMeshStatus().catch(() => ({ gateway: false, users: false, events: false, media: false })),
      ]);

      setUsers(fetchedUsers || []);
      setEvents(fetchedEvents || []);
      setMeshStatus(status || {});
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Theme toggle
  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    }
  };

  const handleAttachMediaClick = (eventId) => {
    setSelectedEventIdForUpload(eventId);
    setActiveTab('upload');
  };

  return (
    <div className="app-root">
      {/* Dynamic Ambient Background Glows */}
      <div className="bg-shape bg-shape-1"></div>
      <div className="bg-shape bg-shape-2"></div>
      <div className="bg-shape bg-shape-3"></div>

      {/* Toast Popups */}
      <Toast toasts={toasts} />

      {/* 1. AUTHENTICATION GATEWAY (SIGN IN / SIGN UP) */}
      {!currentUser ? (
        <Auth
          users={users}
          onLoginSuccess={handleLoginSuccess}
          showToast={showToast}
          onRefreshUsers={fetchData}
        />
      ) : (
        /* 2. PROTECTED DASHBOARD (AUTHENTICATED) */
        <>
          {/* Header Bar */}
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
            onRefresh={fetchData}
            currentUser={currentUser}
            onLogout={handleLogout}
          />

          {/* Microservices Mesh Status */}
          <StatusBar meshStatus={meshStatus} />

          {/* Dashboard Views */}
          <main className="app-main">
            {activeTab === 'gallery' && (
              <MemoryGallery
                events={events}
                users={users}
                currentUser={currentUser}
                onAttachMediaClick={handleAttachMediaClick}
              />
            )}

            {activeTab === 'create-event' && (
              <EventCreation
                users={users}
                currentUser={currentUser}
                onEventCreated={fetchData}
                showToast={showToast}
                setActiveTab={setActiveTab}
                setSelectedEventIdForUpload={setSelectedEventIdForUpload}
              />
            )}

            {activeTab === 'users' && (
              <UserManagement
                users={users}
                currentUser={currentUser}
                onSelectUser={handleLoginSuccess}
                onUserCreated={fetchData}
                showToast={showToast}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'upload' && (
              <MediaUpload
                events={events}
                currentUser={currentUser}
                selectedEventIdForUpload={selectedEventIdForUpload}
                setSelectedEventIdForUpload={setSelectedEventIdForUpload}
                onMediaUploaded={fetchData}
                showToast={showToast}
                setActiveTab={setActiveTab}
              />
            )}
          </main>

          {/* Footer */}
          <footer className="app-footer glass-card">
            <p>My Memories React SPA &copy; 2026. Built with React 18, Vite, Spring Cloud Microservices, & Google Cloud Storage.</p>
          </footer>
        </>
      )}
    </div>
  );
}
