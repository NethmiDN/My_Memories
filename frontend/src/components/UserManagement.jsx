import React, { useState } from 'react';
import { UserPlus, Signature, Mail, UserCheck, Users, Loader2, LogIn } from 'lucide-react';
import { createUser } from '../services/api';

export default function UserManagement({
  users,
  currentUser,
  onSelectUser,
  onUserCreated,
  showToast,
  setActiveTab
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setLoading(true);
    try {
      const newUser = await createUser({ name: name.trim(), email: email.trim() });
      showToast(`User '${newUser.name}' created successfully in MySQL!`, 'success');
      setName('');
      setEmail('');
      await onUserCreated();
      onSelectUser(newUser);
      setActiveTab('create-event');
    } catch (err) {
      console.error('Error creating user:', err);
      showToast('Failed to create user. Ensure Gateway and user-service are running.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="view-users" className="tab-view">
      <div className="split-layout">
        {/* User Creation Form */}
        <div className="form-wrapper glass-card">
          <div className="form-header">
            <UserPlus className="form-icon" />
            <div>
              <h2>Create User Profile</h2>
              <p>Managed by <code>user-service</code> (MySQL Relational Database)</p>
            </div>
          </div>

          <form id="create-user-form" onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label htmlFor="user-name-input"><Signature size={16} /> Full Name *</label>
              <input
                id="user-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label htmlFor="user-email-input"><Mail size={16} /> Email Address *</label>
              <input
                id="user-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. sarah.j@example.com"
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                id="create-user-submit-btn"
                className="btn btn-primary full-width"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <UserCheck size={18} />}
                {loading ? ' Registering Profile...' : ' Register & Log In'}
              </button>
            </div>
          </form>
        </div>

        {/* Registered Users List */}
        <div className="glass-card table-wrapper">
          <div className="table-header">
            <h3><Users size={18} /> Registered Users & Login</h3>
            <span id="user-count-badge" className="badge">{users.length} Users</span>
          </div>

          <div id="users-list-container" className="users-list-container">
            {users.length === 0 ? (
              <div className="loading-state">
                <Users size={32} />
                <p>No user profiles registered yet in MySQL.</p>
              </div>
            ) : (
              users.map((u) => {
                const initial = u.name ? u.name.charAt(0).toUpperCase() : 'U';
                const isCurrent = currentUser && String(currentUser.id) === String(u.id);

                return (
                  <div key={u.id || u.email} className="user-item-card" style={isCurrent ? { borderColor: '#818cf8', background: 'rgba(99, 102, 241, 0.1)' } : {}}>
                    <div className="user-avatar">{initial}</div>
                    <div className="user-details">
                      <span className="user-name">{u.name} {isCurrent && <span style={{ fontSize: '0.7rem', color: '#818cf8', fontWeight: 800 }}>(Active Session)</span>}</span>
                      <span className="user-email">{u.email}</span>
                    </div>

                    <button
                      className={`btn btn-sm ${isCurrent ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => onSelectUser(u)}
                      style={{ fontSize: '0.78rem' }}
                    >
                      {isCurrent ? <UserCheck size={13} /> : <LogIn size={13} />}
                      {isCurrent ? ' Active' : ' Log In'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
