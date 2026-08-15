import React, { useState } from 'react';
import { Search, User as UserIcon, Calendar, MapPin, Plus, Image as ImageIcon, Film, Edit3, Trash2, X, Check, Loader2, AlertTriangle } from 'lucide-react';
import { updateEvent, deleteEvent } from '../services/api';

export default function MemoryGallery({ events, users, currentUser, onAttachMediaClick, onEventChanged, showToast }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('ALL');

  // Edit Modal State
  const [editingEvent, setEditingEvent] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Delete Confirmation Modal State
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ev.location && ev.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ev.description && ev.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesUser = userFilter === 'ALL' || String(ev.userId) === String(userFilter);

    return matchesSearch && matchesUser;
  });

  const handleStartEdit = (ev) => {
    setEditingEvent(ev);
    setEditTitle(ev.title || '');
    setEditDate(ev.eventDate || '');
    setEditLocation(ev.location || '');
    setEditDesc(ev.description || '');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingEvent || !editTitle.trim()) return;

    setLoadingEdit(true);
    try {
      const updatedData = {
        userId: editingEvent.userId,
        title: editTitle.trim(),
        eventDate: editDate,
        location: editLocation.trim(),
        description: editDesc.trim(),
        imageUrls: editingEvent.imageUrls || []
      };

      await updateEvent(editingEvent.id, updatedData);
      showToast(`Memory '${editTitle}' updated in MongoDB!`, 'success');
      setEditingEvent(null);
      await onEventChanged();
    } catch (err) {
      console.error('Error updating event:', err);
      showToast('Failed to update event.', 'error');
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingEvent) return;

    setLoadingDelete(true);
    try {
      await deleteEvent(deletingEvent.id);
      showToast(`Memory event '${deletingEvent.title}' deleted from MongoDB.`, 'info');
      setDeletingEvent(null);
      await onEventChanged();
    } catch (err) {
      console.error('Error deleting event:', err);
      showToast('Failed to delete event.', 'error');
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <section id="view-gallery" className="tab-view">
      <div className="view-header">
        <div>
          <h2>Explore Your Memories</h2>
          <p className="section-desc">Stored securely across distributed Microservices (MongoDB & Google Cloud Storage).</p>
        </div>
        <div className="filter-bar">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              id="gallery-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, location..."
            />
          </div>
          <select
            id="user-filter-select"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          >
            <option value="ALL">All Users</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div id="gallery-grid" className="gallery-grid">
        {filteredEvents.length === 0 ? (
          <div className="loading-state">
            <Film size={36} />
            <p>No memory events found. Create your first memory event to get started!</p>
          </div>
        ) : (
          filteredEvents.map((ev) => {
            const user = users.find((u) => String(u.id) === String(ev.userId));
            const userName = user ? user.name : `User #${ev.userId || 'Unknown'}`;
            const primaryImg = ev.imageUrls && ev.imageUrls.length > 0 ? ev.imageUrls[0] : null;
            const isOwner = currentUser && String(currentUser.id) === String(ev.userId);

            return (
              <div key={ev.id || ev.title} className="event-card glass-card">
                <div className="event-media-container">
                  {primaryImg ? (
                    <img
                      src={primaryImg}
                      alt={ev.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=60';
                      }}
                    />
                  ) : (
                    <div className="no-media-placeholder">
                      <ImageIcon size={32} />
                      <span>No GCP Media Attached</span>
                    </div>
                  )}

                  {/* Card Quick Action Buttons */}
                  <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleStartEdit(ev)}
                      className="icon-btn"
                      title="Edit Event"
                      style={{ width: '32px', height: '32px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)' }}
                    >
                      <Edit3 size={14} style={{ color: '#60a5fa' }} />
                    </button>
                    <button
                      onClick={() => setDeletingEvent(ev)}
                      className="icon-btn"
                      title="Delete Event"
                      style={{ width: '32px', height: '32px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)' }}
                    >
                      <Trash2 size={14} style={{ color: '#f87171' }} />
                    </button>
                  </div>
                </div>

                <div className="event-content">
                  <span className="event-user-tag">
                    <UserIcon size={12} /> {userName} {isOwner ? '★ (You)' : ''}
                  </span>
                  <h3 className="event-title">{ev.title}</h3>
                  <p className="event-desc">{ev.description || 'No description provided.'}</p>

                  <div className="event-meta">
                    <span>
                      <Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />
                      {ev.eventDate || 'N/A'}
                    </span>
                    <span>
                      <MapPin size={13} style={{ display: 'inline', marginRight: '4px' }} />
                      {ev.location || 'Unknown'}
                    </span>
                  </div>
                </div>

                <div className="event-card-actions">
                  <button
                    className="btn btn-secondary btn-sm full-width"
                    onClick={() => onAttachMediaClick(ev.id)}
                  >
                    <Plus size={14} /> Attach Media
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* EDIT EVENT MODAL */}
      {editingEvent && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card form-wrapper" style={{ maxWidth: '540px', width: '90%', position: 'relative' }}>
            <div className="form-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Edit3 className="form-icon" size={24} />
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Edit Memory Event</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dispatches <code>PUT /api/events/{editingEvent.id}</code> to MongoDB</p>
                </div>
              </div>
              <button onClick={() => setEditingEvent(null)} className="icon-btn" style={{ width: '32px', height: '32px' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Memory Title *</label>
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
              </div>

              <div className="form-grid" style={{ marginBottom: '14px' }}>
                <div className="form-group">
                  <label>Date *</label>
                  <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Description</label>
                <textarea rows={3} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setEditingEvent(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loadingEdit}>
                  {loadingEdit ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                  {loadingEdit ? ' Saving Changes...' : ' Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM USER-FRIENDLY DELETE CONFIRMATION MODAL */}
      {deletingEvent && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '90%', padding: '28px 24px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.35)', boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <AlertTriangle size={28} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>
              Delete Memory Event?
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '16px' }}>
              Are you sure you want to permanently delete <strong style={{ color: '#f87171' }}>"{deletingEvent.title}"</strong> from MongoDB? This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
              <button
                type="button"
                className="btn btn-secondary full-width"
                onClick={() => setDeletingEvent(null)}
                disabled={loadingDelete}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn full-width"
                onClick={handleConfirmDelete}
                disabled={loadingDelete}
                style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)' }}
              >
                {loadingDelete ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                {loadingDelete ? ' Deleting...' : ' Yes, Delete Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
