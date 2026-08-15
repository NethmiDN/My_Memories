import React from 'react';
import { Sun, Moon, RefreshCw, Image, CalendarPlus, Users, Upload, CloudSun, UserCheck, LogOut } from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  isDarkMode,
  toggleTheme,
  onRefresh,
  currentUser,
  onLogout
}) {
  const initial = currentUser && currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="app-header glass-card">
      <div className="header-container">
        {/* Brand Header */}
        <div className="brand">
          <div className="brand-icon">
            <CloudSun size={24} />
          </div>
          <div className="brand-text">
            <h1>My Memories</h1>
            <span className="subtitle">React & Cloud Microservices</span>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <nav className="nav-tabs">
          <button
            id="tab-btn-gallery"
            className={`tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
            onClick={() => setActiveTab('gallery')}
          >
            <Image size={18} /> Memory Gallery
          </button>
          <button
            id="tab-btn-create-event"
            className={`tab-btn ${activeTab === 'create-event' ? 'active' : ''}`}
            onClick={() => setActiveTab('create-event')}
          >
            <CalendarPlus size={18} /> New Memory
          </button>
          <button
            id="tab-btn-users"
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} /> Users
          </button>
          <button
            id="tab-btn-upload"
            className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <Upload size={18} /> Upload Media
          </button>
        </nav>

        {/* User Session Badge & Actions */}
        <div className="header-actions">
          {currentUser && (
            <div
              className="user-session-badge"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.83rem'
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'var(--accent-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.75rem'
                }}
              >
                {initial}
              </div>
              <span style={{ fontWeight: 700 }}>{currentUser.name}</span>
              <button
                onClick={onLogout}
                title="Sign Out"
                className="btn btn-secondary btn-sm"
                style={{
                  padding: '3px 8px',
                  fontSize: '0.75rem',
                  marginLeft: '4px',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  color: '#f87171'
                }}
              >
                <LogOut size={12} /> Sign Out
              </button>
            </div>
          )}

          <button
            id="theme-toggle-btn"
            className="icon-btn"
            onClick={toggleTheme}
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            id="refresh-all-btn"
            className="btn btn-secondary btn-sm"
            onClick={onRefresh}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>
    </header>
  );
}
