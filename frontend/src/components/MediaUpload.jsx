import React, { useState, useEffect } from 'react';
import { UploadCloud, Bookmark, Images, Loader2, UserX, LogIn } from 'lucide-react';
import { uploadMedia, attachImageToEvent } from '../services/api';

export default function MediaUpload({
  events,
  currentUser,
  selectedEventIdForUpload,
  setSelectedEventIdForUpload,
  onMediaUploaded,
  showToast,
  setActiveTab
}) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Please log in or select a user profile first.', 'error');
      setActiveTab('users');
      return;
    }

    if (!file) {
      showToast('Please select an image file to upload.', 'error');
      return;
    }

    setLoading(true);
    try {
      const mediaResponse = await uploadMedia(file, selectedEventIdForUpload);
      showToast('Image stored in Google Cloud Storage!', 'success');

      if (selectedEventIdForUpload && mediaResponse.fileUrl) {
        let fullUrl = mediaResponse.fileUrl;
        if (fullUrl.startsWith('/api/')) {
          fullUrl = `http://localhost:8080${fullUrl}`;
        }
        await attachImageToEvent(selectedEventIdForUpload, fullUrl);
      }

      setFile(null);
      setPreviewUrl('');
      await onMediaUploaded();
      setActiveTab('gallery');
    } catch (err) {
      console.error('Error uploading media:', err);
      showToast('Media upload failed. Ensure media-service is running.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter events for current user
  const userEvents = currentUser
    ? events.filter((ev) => String(ev.userId) === String(currentUser.id))
    : events;

  if (!currentUser) {
    return (
      <section id="view-upload" className="tab-view">
        <div className="form-wrapper glass-card upload-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <UserX size={48} style={{ color: '#ef4444', marginBottom: '16px' }} />
          <h2>Login Required to Upload Media</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            Please select or create a user profile before uploading photos to Google Cloud Storage.
          </p>
          <button className="btn btn-primary" onClick={() => setActiveTab('users')}>
            <LogIn size={18} /> Select User Profile / Log In
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="view-upload" className="tab-view">
      <div className="form-wrapper glass-card upload-card">
        <div className="form-header">
          <UploadCloud className="form-icon" />
          <div>
            <h2>GCP Cloud Media Uploader</h2>
            <p>Authenticated as <strong>{currentUser.name}</strong> ({currentUser.email})</p>
          </div>
        </div>

        <form id="upload-media-form" onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="upload-event-select"><Bookmark size={16} /> Select Memory Event *</label>
            <select
              id="upload-event-select"
              value={selectedEventIdForUpload}
              onChange={(e) => setSelectedEventIdForUpload(e.target.value)}
              required
            >
              <option value="">-- Choose Target Memory Event --</option>
              {userEvents.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.eventDate || 'No Date'})
                </option>
              ))}
            </select>
            {userEvents.length === 0 && (
              <span style={{ fontSize: '0.78rem', color: '#f59e0b', marginTop: '4px' }}>
                No events found for {currentUser.name}. Create a new memory first.
              </span>
            )}
          </div>

          <div className="upload-dropzone" id="upload-dropzone">
            <Images className="dropzone-icon" size={48} />
            <h3>Drag & Drop Image or Click to Browse</h3>
            <p>Supports PNG, JPG, JPEG, WEBP (Max 10MB)</p>
            <input
              type="file"
              id="media-file-input"
              accept="image/*"
              required
              onChange={handleFileChange}
            />

            {previewUrl && (
              <div className="file-preview-container">
                <img src={previewUrl} alt="Preview" />
                <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              id="upload-media-submit-btn"
              className="btn btn-primary full-width"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />}
              {loading ? ' Uploading to GCP Bucket...' : ' Upload Photo to Cloud Storage'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
