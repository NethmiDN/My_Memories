/**
 * My Memories - Frontend Architecture Logic
 * Communicates with backend microservices via Spring Cloud API Gateway (Port 8080)
 */

const GATEWAY_BASE_URL = 'http://localhost:8080';
const EUREKA_BASE_URL = 'http://localhost:8761';

// Global Application State
const state = {
  users: [],
  events: [],
  activeTab: 'gallery',
  isDarkMode: true
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  console.log('My Memories App Initialized');
  checkSystemMeshStatus();
  refreshData();
});

/**
 * Switch Active View Tab
 */
function switchTab(tabId) {
  state.activeTab = tabId;
  
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-view').forEach(view => view.classList.remove('active'));

  const activeBtn = document.getElementById(`tab-btn-${tabId}`);
  const activeView = document.getElementById(`view-${tabId}`);

  if (activeBtn) activeBtn.classList.add('active');
  if (activeView) activeView.classList.add('active');
}

/**
 * Theme Toggle Functionality
 */
function toggleTheme() {
  state.isDarkMode = !state.isDarkMode;
  const body = document.body;
  const themeIcon = document.getElementById('theme-icon');

  if (state.isDarkMode) {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
    themeIcon.className = 'fa-solid fa-sun';
  } else {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
    themeIcon.className = 'fa-solid fa-moon';
  }
}

/**
 * Check Microservices Connectivity & Mesh Status
 */
async function checkSystemMeshStatus() {
  const services = [
    { id: 'status-gateway', url: `${GATEWAY_BASE_URL}/actuator/health` },
    { id: 'status-user-service', url: `${GATEWAY_BASE_URL}/api/users` },
    { id: 'status-event-service', url: `${GATEWAY_BASE_URL}/api/events` },
    { id: 'status-media-service', url: `${GATEWAY_BASE_URL}/api/media` }
  ];

  for (const s of services) {
    const el = document.getElementById(s.id);
    if (!el) continue;
    
    try {
      const response = await fetch(s.url, { method: 'OPTIONS' }).catch(() => fetch(s.url, { method: 'GET' }));
      if (response.ok || response.status === 405 || response.status === 404) {
        el.className = 'status-pill status-online';
      } else {
        el.className = 'status-pill status-offline';
      }
    } catch (err) {
      // In standalone demo or startup state
      el.className = 'status-pill status-offline';
    }
  }
}

/**
 * Fetch All Data from Backend via Gateway
 */
async function refreshData() {
  await Promise.all([fetchUsers(), fetchEvents()]);
  renderAllViews();
}

/**
 * 1. USER SERVICE INTEGRATION (MySQL)
 */
async function fetchUsers() {
  try {
    const res = await fetch(`${GATEWAY_BASE_URL}/api/users`);
    if (res.ok) {
      state.users = await res.json();
    } else {
      console.warn('Could not fetch users via Gateway. Status:', res.status);
    }
  } catch (err) {
    console.error('Error fetching users:', err);
  }
}

async function handleCreateUser(e) {
  e.preventDefault();
  const nameInput = document.getElementById('user-name-input');
  const emailInput = document.getElementById('user-email-input');
  const submitBtn = document.getElementById('create-user-submit-btn');

  const userData = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim()
  };

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

  try {
    const res = await fetch(`${GATEWAY_BASE_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (res.ok || res.status === 201) {
      const newUser = await res.json();
      showToast(`User profile '${newUser.name}' created successfully!`, 'success');
      nameInput.value = '';
      emailInput.value = '';
      await fetchUsers();
      renderAllViews();
      switchTab('create-event');
    } else {
      showToast('Failed to create user. Status: ' + res.status, 'error');
    }
  } catch (err) {
    console.error('Error creating user:', err);
    showToast('Network error connecting to Gateway', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-user-check"></i> Register User Profile';
  }
}

/**
 * 2. EVENT SERVICE INTEGRATION (MongoDB)
 */
async function fetchEvents() {
  try {
    const res = await fetch(`${GATEWAY_BASE_URL}/api/events`);
    if (res.ok) {
      state.events = await res.json();
    } else {
      console.warn('Could not fetch events via Gateway. Status:', res.status);
    }
  } catch (err) {
    console.error('Error fetching events:', err);
  }
}

async function handleCreateEvent(e) {
  e.preventDefault();
  const userSelect = document.getElementById('event-user-select');
  const titleInput = document.getElementById('event-title-input');
  const dateInput = document.getElementById('event-date-input');
  const locationInput = document.getElementById('event-location-input');
  const descInput = document.getElementById('event-desc-input');
  const submitBtn = document.getElementById('create-event-submit-btn');

  const eventData = {
    userId: parseInt(userSelect.value, 10),
    title: titleInput.value.trim(),
    eventDate: dateInput.value,
    location: locationInput.value.trim(),
    description: descInput.value.trim()
  };

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Dispatching to Event Service...';

  try {
    const res = await fetch(`${GATEWAY_BASE_URL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });

    if (res.ok || res.status === 201) {
      const newEvent = await res.json();
      showToast(`Memory event '${newEvent.title}' saved to MongoDB!`, 'success');
      titleInput.value = '';
      locationInput.value = '';
      descInput.value = '';
      await fetchEvents();
      renderAllViews();
      
      // Auto-select in upload form
      const uploadSelect = document.getElementById('upload-event-select');
      if (uploadSelect && newEvent.id) {
        uploadSelect.value = newEvent.id;
      }
      switchTab('upload');
    } else {
      showToast('Failed to save memory event. Status: ' + res.status, 'error');
    }
  } catch (err) {
    console.error('Error creating event:', err);
    showToast('Network error connecting to Gateway', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Save Memory Event';
  }
}

/**
 * 3. MEDIA SERVICE INTEGRATION (GCP Cloud Storage)
 */
function handleFileSelect(event) {
  const file = event.target.files[0];
  const container = document.getElementById('file-preview-container');
  const img = document.getElementById('file-preview-img');
  const name = document.getElementById('file-preview-name');

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
      name.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
      container.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  } else {
    container.classList.add('hidden');
  }
}

async function handleUploadMedia(e) {
  e.preventDefault();
  const eventSelect = document.getElementById('upload-event-select');
  const fileInput = document.getElementById('media-file-input');
  const submitBtn = document.getElementById('upload-media-submit-btn');

  if (!fileInput.files || fileInput.files.length === 0) {
    showToast('Please select an image file to upload.', 'error');
    return;
  }

  const file = fileInput.files[0];
  const eventId = eventSelect.value;

  const formData = new FormData();
  formData.append('file', file);
  if (eventId) {
    formData.append('eventId', eventId);
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading to GCP Bucket...';

  try {
    const res = await fetch(`${GATEWAY_BASE_URL}/api/media/upload`, {
      method: 'POST',
      body: formData
    });

    if (res.ok || res.status === 201) {
      const mediaResponse = await res.json();
      showToast('Image successfully stored in GCP Cloud Storage!', 'success');

      // If eventId was selected, patch event image gallery
      if (eventId && mediaResponse.fileUrl) {
        let fullMediaUrl = mediaResponse.fileUrl;
        if (fullMediaUrl.startsWith('/api/')) {
          fullMediaUrl = `${GATEWAY_BASE_URL}${fullMediaUrl}`;
        }
        await addImageToEvent(eventId, fullMediaUrl);
      }

      fileInput.value = '';
      document.getElementById('file-preview-container').classList.add('hidden');
      await fetchEvents();
      renderAllViews();
      switchTab('gallery');
    } else {
      showToast('GCP Media Upload failed. Status: ' + res.status, 'error');
    }
  } catch (err) {
    console.error('Error uploading media:', err);
    showToast('Network error connecting to Gateway', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Upload Photo to Cloud Storage';
  }
}

async function addImageToEvent(eventId, imageUrl) {
  try {
    await fetch(`${GATEWAY_BASE_URL}/api/events/${eventId}/images`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: imageUrl })
    });
  } catch (err) {
    console.error('Failed to attach image to event:', err);
  }
}

/**
 * UI Rendering Functions
 */
function renderAllViews() {
  renderUserDropdowns();
  renderUserList();
  renderGallery();
}

function renderUserDropdowns() {
  const eventUserSelect = document.getElementById('event-user-select');
  const userFilterSelect = document.getElementById('user-filter-select');

  let optionsHtml = '<option value="">-- Choose User --</option>';
  state.users.forEach(u => {
    optionsHtml += `<option value="${u.id}">${u.name} (${u.email})</option>`;
  });

  if (eventUserSelect) eventUserSelect.innerHTML = optionsHtml;

  let filterHtml = '<option value="ALL">All Users</option>';
  state.users.forEach(u => {
    filterHtml += `<option value="${u.id}">${u.name}</option>`;
  });
  if (userFilterSelect) userFilterSelect.innerHTML = filterHtml;
}

function renderUserList() {
  const container = document.getElementById('users-list-container');
  const badge = document.getElementById('user-count-badge');

  if (badge) badge.textContent = `${state.users.length} Users`;

  if (!container) return;

  if (state.users.length === 0) {
    container.innerHTML = `
      <div class="loading-state">
        <i class="fa-solid fa-user-slash"></i>
        <p>No user profiles registered yet in MySQL.</p>
      </div>
    `;
    return;
  }

  let html = '';
  state.users.forEach(u => {
    const initial = u.name ? u.name.charAt(0).toUpperCase() : 'U';
    html += `
      <div class="user-item-card">
        <div class="user-avatar">${initial}</div>
        <div class="user-details">
          <span class="user-name">${escapeHtml(u.name)}</span>
          <span class="user-email">${escapeHtml(u.email)}</span>
        </div>
        <span class="badge" style="background: rgba(255,255,255,0.1);">ID: ${u.id}</span>
      </div>
    `;
  });

  container.innerHTML = html;
}

function renderGallery(filteredEvents = null) {
  const grid = document.getElementById('gallery-grid');
  const uploadEventSelect = document.getElementById('upload-event-select');

  const eventsToRender = filteredEvents || state.events;

  // Populate upload dropdown with available memory events
  if (uploadEventSelect) {
    let uploadOpts = '<option value="">-- Choose Target Memory Event --</option>';
    state.events.forEach(e => {
      uploadOpts += `<option value="${e.id}">${escapeHtml(e.title)} (${e.eventDate || 'No Date'})</option>`;
    });
    uploadEventSelect.innerHTML = uploadOpts;
  }

  if (!grid) return;

  if (eventsToRender.length === 0) {
    grid.innerHTML = `
      <div class="loading-state">
        <i class="fa-solid fa-photo-film"></i>
        <p>No memory events found. Create your first memory event to get started!</p>
      </div>
    `;
    return;
  }

  let html = '';
  eventsToRender.forEach(ev => {
    const user = state.users.find(u => u.id === ev.userId);
    const userName = user ? user.name : `User #${ev.userId || 'Unknown'}`;
    const primaryImg = (ev.imageUrls && ev.imageUrls.length > 0) ? ev.imageUrls[0] : null;

    html += `
      <div class="event-card glass-card">
        <div class="event-media-container">
          ${primaryImg ? `<img src="${escapeHtml(primaryImg)}" alt="${escapeHtml(ev.title)}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=60';">` 
                      : `<div class="no-media-placeholder"><i class="fa-solid fa-image fa-2x"></i><span>No GCP Media Attached</span></div>`}
        </div>

        <div class="event-content">
          <span class="event-user-tag"><i class="fa-solid fa-user"></i> ${escapeHtml(userName)}</span>
          <h3 class="event-title">${escapeHtml(ev.title)}</h3>
          <p class="event-desc">${escapeHtml(ev.description || 'No description provided.')}</p>
          
          <div class="event-meta">
            <span><i class="fa-solid fa-calendar"></i> ${ev.eventDate || 'N/A'}</span>
            <span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(ev.location || 'Unknown')}</span>
          </div>
        </div>

        <div class="event-card-actions">
          <button class="btn btn-secondary btn-sm full-width" onclick="selectEventForUpload('${ev.id}')">
            <i class="fa-solid fa-plus"></i> Attach Media
          </button>
        </div>
      </div>
    `;
  });

  grid.innerHTML = html;
}

function selectEventForUpload(eventId) {
  const uploadSelect = document.getElementById('upload-event-select');
  if (uploadSelect) {
    uploadSelect.value = eventId;
  }
  switchTab('upload');
}

function filterGallery() {
  const search = document.getElementById('gallery-search-input').value.toLowerCase();
  const userIdFilter = document.getElementById('user-filter-select').value;

  const filtered = state.events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search) || 
                          (e.location && e.location.toLowerCase().includes(search)) ||
                          (e.description && e.description.toLowerCase().includes(search));
    const matchesUser = userIdFilter === 'ALL' || e.userId == userIdFilter;
    return matchesSearch && matchesUser;
  });

  renderGallery(filtered);
}

function filterGalleryByUser() {
  filterGallery();
}

/**
 * Toast Notifications Helper
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-check-circle';
  if (type === 'error') icon = 'fa-exclamation-triangle';

  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
