import React, { useState, useEffect } from 'react';
import { CalendarPlus, User, Heading, CalendarDays, MapPin, AlignLeft, UploadCloud, Loader2 } from 'lucide-react';
import { createEvent } from '../services/api';

export default function EventCreation({
  users,
  currentUser,
  onEventCreated,
  showToast,
  setActiveTab,
  setSelectedEventIdForUpload
}) {
  const [userId, setUserId] = useState('');
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setUserId(String(currentUser.id));
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId || !title.trim() || !eventDate) return;

    setLoading(true);
    try {
      const eventData = {
        userId: parseInt(userId, 10),
        title: title.trim(),
        eventDate,
        location: location.trim(),
        description: description.trim(),
      };

      const newEvent = await createEvent(eventData);
      showToast(`Memory event '${newEvent.title}' saved to MongoDB!`, 'success');

      setTitle('');
      setLocation('');
      setDescription('');
      await onEventCreated();

      if (newEvent.id) {
        setSelectedEventIdForUpload(newEvent.id);
      }
      setActiveTab('upload');
    } catch (err) {
      console.error('Error creating event:', err);
      showToast('Failed to save memory event. Ensure Gateway and event-service are running.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="view-create-event" className="tab-view">
      <div className="form-wrapper glass-card">
        <div className="form-header">
          <CalendarPlus className="form-icon" />
          <div>
            <h2>Create New Memory Event</h2>
            <p>Dispatched to <code>event-service</code> (MongoDB Document Database)</p>
          </div>
        </div>

        <form id="create-event-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="event-user-select"><User size={16} /> Select User *</label>
              <select
                id="event-user-select"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              >
                <option value="">-- Choose User --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email}) {currentUser && String(currentUser.id) === String(u.id) ? '★ (You)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="event-title-input"><Heading size={16} /> Memory Title *</label>
              <input
                id="event-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Summer Vacation in Paris"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="event-date-input"><CalendarDays size={16} /> Date *</label>
              <input
                id="event-date-input"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="event-location-input"><MapPin size={16} /> Location</label>
              <input
                id="event-location-input"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Paris, France"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="event-desc-input"><AlignLeft size={16} /> Description</label>
              <textarea
                id="event-desc-input"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write details about this unforgettable memory..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="reset"
              className="btn btn-secondary"
              onClick={() => {
                setTitle('');
                setLocation('');
                setDescription('');
              }}
            >
              Reset
            </button>
            <button
              type="submit"
              id="create-event-submit-btn"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />}
              {loading ? ' Saving Memory...' : ' Save Memory Event'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
