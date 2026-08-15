import React, { useState } from 'react';
import { CloudSun, LogIn, UserPlus, Mail, Signature, ArrowRight, UserCheck, ShieldCheck, Loader2 } from 'lucide-react';
import { createUser } from '../services/api';

export default function Auth({ users, onLoginSuccess, showToast, onRefreshUsers }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Sign In (Email Lookup)
  const handleSignIn = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    const foundUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (foundUser) {
      showToast(`Welcome back, ${foundUser.name}!`, 'success');
      onLoginSuccess(foundUser);
    } else {
      setErrorMsg(`No account registered with '${cleanEmail}'. Please click 'Sign Up' below to create a new profile.`);
    }
  };

  // Handle Sign Up (User Creation)
  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      setErrorMsg('Please fill in both name and email fields.');
      return;
    }

    // Check if email already exists
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      setErrorMsg(`An account with '${cleanEmail}' already exists. Switching to Sign In.`);
      onLoginSuccess(existing);
      return;
    }

    setLoading(true);
    try {
      const newUser = await createUser({ name: cleanName, email: cleanEmail });
      showToast(`Account created for '${newUser.name}' in MySQL database!`, 'success');
      await onRefreshUsers();
      onLoginSuccess(newUser);
    } catch (err) {
      console.error('Sign up error:', err);
      setErrorMsg('Failed to register user. Please ensure API Gateway and user-service are running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="form-wrapper glass-card auth-card" style={{ maxWidth: '480px', width: '100%', padding: '36px 32px' }}>
        {/* Header & Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="brand-icon" style={{ width: '56px', height: '56px', margin: '0 auto 16px auto', borderRadius: '16px', fontSize: '1.8rem' }}>
            <CloudSun size={32} />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            My Memories
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            Spring Cloud Microservices & Media Platform
          </p>
        </div>

        {/* Toggle Mode Tabs */}
        <div className="nav-tabs" style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <button
            type="button"
            className={`tab-btn ${!isSignUp ? 'active' : ''}`}
            onClick={() => { setIsSignUp(false); setErrorMsg(''); }}
            style={{ justifyContent: 'center' }}
          >
            <LogIn size={16} /> Sign In
          </button>
          <button
            type="button"
            className={`tab-btn ${isSignUp ? 'active' : ''}`}
            onClick={() => { setIsSignUp(true); setErrorMsg(''); }}
            style={{ justifyContent: 'center' }}
          >
            <UserPlus size={16} /> Sign Up
          </button>
        </div>

        {/* Error Message Alert */}
        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '10px 14px', borderRadius: '8px', fontSize: '0.83rem', marginBottom: '20px' }}>
            {errorMsg}
          </div>
        )}

        {/* SIGN IN FORM */}
        {!isSignUp ? (
          <form onSubmit={handleSignIn}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label htmlFor="auth-email-input"><Mail size={16} /> Registered Email Address *</label>
              <input
                id="auth-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. sarah.j@example.com"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary full-width" style={{ padding: '12px', fontSize: '0.95rem' }}>
              Sign In to Dashboard <ArrowRight size={18} />
            </button>

            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => { setIsSignUp(true); setErrorMsg(''); }}
                style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Sign Up Now
              </button>
            </div>
          </form>
        ) : (
          /* SIGN UP FORM */
          <form onSubmit={handleSignUp}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label htmlFor="signup-name-input"><Signature size={16} /> Full Name *</label>
              <input
                id="signup-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label htmlFor="signup-email-input"><Mail size={16} /> Email Address *</label>
              <input
                id="signup-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. sarah.j@example.com"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary full-width" disabled={loading} style={{ padding: '12px', fontSize: '0.95rem' }}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : <UserCheck size={18} />}
              {loading ? ' Creating Profile in MySQL...' : ' Register & Sign In'}
            </button>

            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => { setIsSignUp(false); setErrorMsg(''); }}
                style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* Quick Demo Selector for Existing Database Profiles */}
        {users && users.length > 0 && (
          <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <ShieldCheck size={14} style={{ color: '#10b981' }} /> Quick Sign In (Registered MySQL Profiles):
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {users.map((u) => (
                <button
                  key={u.id || u.email}
                  type="button"
                  onClick={() => {
                    showToast(`Signed in as ${u.name}`, 'success');
                    onLoginSuccess(u);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.78rem', borderRadius: '16px' }}
                >
                  <UserCheck size={12} /> {u.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
