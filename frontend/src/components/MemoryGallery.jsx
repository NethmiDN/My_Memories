import React, { useState } from 'react';
import { Search, User as UserIcon, Calendar, MapPin, Plus, Image as ImageIcon, Film } from 'lucide-react';

export default function MemoryGallery({ events, users, onAttachMediaClick }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('ALL');

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ev.location && ev.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ev.description && ev.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesUser = userFilter === 'ALL' || String(ev.userId) === String(userFilter);

    return matchesSearch && matchesUser;
  });

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
                </div>

                <div className="event-content">
                  <span className="event-user-tag">
                    <UserIcon size={12} /> {userName}
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
    </section>
  );
}

