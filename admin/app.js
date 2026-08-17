// ==================================================================
// GRAMTIME VISUALS - ADMIN DASHBOARD
// Consultation management system
// ==================================================================

const API = ADMIN_CONFIG.API_BASE_URL;
let consultations = [];
let currentFilter = 'all';
let selectedConsultation = null;

// ── API helpers ──────────────────────────────────────────────
async function apiRequest(endpoint, options = {}) {
  const url = `${API}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

async function loadConsultations() {
  showLoading();
  try {
    const data = await apiRequest('/consultations');
    consultations = data.consultations || [];
    renderDashboard();
  } catch (error) {
    // If backend is down, show empty state
    consultations = [];
    renderDashboard();
  }
}

async function updateStatus(id, status) {
  try {
    await apiRequest(`/consultations/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    await loadConsultations();
  } catch (error) {
    alert('Failed to update status. Is the backend running?');
  }
}

async function deleteConsultation(id) {
  if (!confirm('Delete this consultation? This cannot be undone.')) return;
  try {
    await apiRequest(`/consultations/${id}`, { method: 'DELETE' });
    await loadConsultations();
  } catch (error) {
    alert('Failed to delete consultation.');
  }
}

// ── Render functions ─────────────────────────────────────────
function renderApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="admin-layout">
      ${renderSidebar()}
      <div class="main-content" id="main-content">
        ${renderDashboard()}
      </div>
    </div>
  `;
  attachEventListeners();
}

function renderSidebar() {
  return `
    <aside class="sidebar">
      <div class="sidebar-logo">
        <h1>GRAMTIME <span>VISUALS</span></h1>
        <p>// ADMIN PANEL</p>
      </div>
      <div class="nav-item active" data-page="consultations">
        <span class="icon">◈</span>
        <span>Consultations</span>
      </div>
      <div class="nav-item" data-page="clients">
        <span class="icon">◉</span>
        <span>Clients</span>
      </div>
      <div class="nav-item" data-page="analytics">
        <span class="icon">◊</span>
        <span>Analytics</span>
      </div>
      <div class="nav-item" data-page="settings">
        <span class="icon">⚙</span>
        <span>Settings</span>
      </div>
      <div class="sidebar-footer">
        <div class="status-indicator">
          <div class="status-dot"></div>
          <span>System Online</span>
        </div>
      </div>
    </aside>
  `;
}

function renderDashboard() {
  const filtered = currentFilter === 'all'
    ? consultations
    : consultations.filter(c => (c.status || 'pending') === currentFilter);

  const stats = {
    total: consultations.length,
    pending: consultations.filter(c => (c.status || 'pending') === 'pending').length,
    confirmed: consultations.filter(c => c.status === 'confirmed').length,
    completed: consultations.filter(c => c.status === 'completed').length,
  };

  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  mainContent.innerHTML = `
    <div class="page-header ar-fade-in">
      <div class="breadcrumb">
        <div class="dot"></div>
        <span>GRAMTIME.VISUALS // CONSULTATION.MANAGER</span>
      </div>
      <h2>CONSULTATION <span class="accent">DASHBOARD</span></h2>
      <p class="subtitle">View and manage all consultation bookings from the website</p>
    </div>

    <div class="stats-grid ar-fade-in" style="animation-delay: 0.1s">
      <div class="stat-card">
        <div class="icon">◈</div>
        <div class="label">Total Bookings</div>
        <div class="value">${stats.total}</div>
      </div>
      <div class="stat-card">
        <div class="icon">⏳</div>
        <div class="label">Pending</div>
        <div class="value">${stats.pending}</div>
      </div>
      <div class="stat-card">
        <div class="icon">✓</div>
        <div class="label">Confirmed</div>
        <div class="value">${stats.confirmed}</div>
      </div>
      <div class="stat-card">
        <div class="icon">★</div>
        <div class="label">Completed</div>
        <div class="value">${stats.completed}</div>
      </div>
    </div>

    <div class="filter-bar ar-fade-in" style="animation-delay: 0.15s">
      <button class="filter-btn ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">◈ All</button>
      <button class="filter-btn ${currentFilter === 'pending' ? 'active' : ''}" data-filter="pending">◦ Pending</button>
      <button class="filter-btn ${currentFilter === 'confirmed' ? 'active' : ''}" data-filter="confirmed">◦ Confirmed</button>
      <button class="filter-btn ${currentFilter === 'completed' ? 'active' : ''}" data-filter="completed">◦ Completed</button>
      <button class="filter-btn ${currentFilter === 'cancelled' ? 'active' : ''}" data-filter="cancelled">◦ Cancelled</button>
      <button class="refresh-btn" id="refresh-btn">↻ REFRESH</button>
    </div>

    <div class="consultation-list" id="consultation-list">
      ${renderConsultationList(filtered)}
    </div>
  `;

  attachEventListeners();
}

function renderConsultationList(list) {
  if (list.length === 0) {
    return `
      <div class="empty-state ar-fade-in">
        <div class="icon">◈</div>
        <h3>No consultations found</h3>
        <p>New bookings from the website will appear here.</p>
      </div>
    `;
  }

  return list.map((c, i) => renderConsultationCard(c, i)).join('');
}

function renderConsultationCard(c, index) {
  const status = c.status || 'pending';
  const client = c.client || {};
  const eventDetails = c.eventDetails || {};
  const createdDate = c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : '—';

  const consultDate = c.date ? new Date(c.date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }) : '—';

  return `
    <div class="consultation-card ar-fade-in" style="animation-delay: ${index * 0.05}s" data-id="${c.id}">
      <div class="scan-line"></div>
      <div class="card-header">
        <div>
          <div class="ref-id">◈ ${c.id || 'GTV-UNKNOWN'}</div>
          <div style="font-size: 0.65rem; color: rgba(255,255,255,0.3); margin-top: 4px;">
            Booked: ${createdDate}
          </div>
        </div>
        <div class="status-badge status-${status}">${status}</div>
      </div>

      <div class="card-body">
        <div class="detail-group">
          <div class="label">Client</div>
          <div class="value">${client.firstName || ''} ${client.lastName || ''}</div>
        </div>
        <div class="detail-group">
          <div class="label">Session Type</div>
          <div class="value">${c.consultationTitle || c.consultationType || '—'}</div>
        </div>
        <div class="detail-group">
          <div class="label">Date</div>
          <div class="value">${consultDate}</div>
        </div>
        <div class="detail-group">
          <div class="label">Time</div>
          <div class="value" style="color: var(--hud-green);">${c.time || '—'}</div>
        </div>
        <div class="detail-group">
          <div class="label">Email</div>
          <div class="value">${client.email || '—'}</div>
        </div>
        <div class="detail-group">
          <div class="label">Phone</div>
          <div class="value">${client.phone || '—'}</div>
        </div>
      </div>

      <div class="card-footer">
        <button class="action-btn" onclick="showDetail('${c.id}')">VIEW DETAILS</button>
        ${status === 'pending' ? `<button class="action-btn" onclick="confirmStatus('${c.id}')">✓ CONFIRM</button>` : ''}
        ${status === 'confirmed' ? `<button class="action-btn" onclick="completeStatus('${c.id}')">★ COMPLETE</button>` : ''}
        ${status !== 'cancelled' && status !== 'completed' ? `<button class="action-btn danger" onclick="cancelStatus('${c.id}')">✕ CANCEL</button>` : ''}
        <button class="action-btn danger" onclick="deleteConsultation('${c.id}')">🗑 DELETE</button>
      </div>
    </div>
  `;
}

function showLoading() {
  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    mainContent.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <div>LOADING CONSULTATIONS...</div>
      </div>
    `;
  }
}

// ── Detail Modal ─────────────────────────────────────────────
function showDetail(id) {
  const c = consultations.find(x => x.id === id);
  if (!c) return;

  const client = c.client || {};
  const eventDetails = c.eventDetails || {};
  const status = c.status || 'pending';
  const createdDate = c.createdAt ? new Date(c.createdAt).toLocaleString() : '—';
  const consultDate = c.date ? new Date(c.date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }) : '—';

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal" onclick="event.stopPropagation()">
      <div class="modal-header">
        <h3>◈ CONSULTATION DETAILS</h3>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <div class="modal-body">
        <div class="detail-row">
          <div class="label">Reference ID</div>
          <div class="value" style="color: var(--hud-green);">${c.id}</div>
        </div>
        <div class="detail-row">
          <div class="label">Status</div>
          <div class="value"><span class="status-badge status-${status}">${status}</span></div>
        </div>
        <div class="detail-row">
          <div class="label">Session Type</div>
          <div class="value">${c.consultationTitle || c.consultationType || '—'}</div>
        </div>
        <div class="detail-row">
          <div class="label">Duration</div>
          <div class="value">${c.duration || '—'}</div>
        </div>
        <div class="detail-row">
          <div class="label">Location</div>
          <div class="value">${c.location || '—'}</div>
        </div>
        <div class="detail-row">
          <div class="label">Date</div>
          <div class="value">${consultDate}</div>
        </div>
        <div class="detail-row">
          <div class="label">Time</div>
          <div class="value" style="color: var(--hud-green);">${c.time || '—'}</div>
        </div>
        <div class="detail-row">
          <div class="label">Booked On</div>
          <div class="value">${createdDate}</div>
        </div>
        <div class="detail-row">
          <div class="label">Client Name</div>
          <div class="value">${client.firstName || ''} ${client.lastName || ''}</div>
        </div>
        <div class="detail-row">
          <div class="label">Email</div>
          <div class="value">${client.email || '—'}</div>
        </div>
        <div class="detail-row">
          <div class="label">Phone</div>
          <div class="value">${client.phone || '—'}</div>
        </div>
        <div class="detail-row">
          <div class="label">Preferred Contact</div>
          <div class="value" style="text-transform: capitalize;">${c.preferredContact || '—'}</div>
        </div>
        <div class="detail-row">
          <div class="label">Event Type</div>
          <div class="value" style="text-transform: capitalize;">${eventDetails.eventType || '—'}</div>
        </div>
        <div class="detail-row">
          <div class="label">Event Date</div>
          <div class="value">${eventDetails.eventDate || '—'}</div>
        </div>
        <div class="detail-row">
          <div class="label">Budget</div>
          <div class="value">${eventDetails.budget || '—'}</div>
        </div>
        <div class="detail-row">
          <div class="label">Message</div>
          <div class="value">${c.message || '—'}</div>
        </div>
      </div>
    </div>
  `;
  modal.onclick = closeModal;
  document.body.appendChild(modal);
}

function closeModal() {
  const modal = document.querySelector('.modal-overlay');
  if (modal) modal.remove();
}

// ── Status actions ───────────────────────────────────────────
function confirmStatus(id) { updateStatus(id, 'confirmed'); }
function completeStatus(id) { updateStatus(id, 'completed'); }
function cancelStatus(id) { updateStatus(id, 'cancelled'); }

// ── Event listeners ──────────────────────────────────────────
function attachEventListeners() {
  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      renderDashboard();
    });
  });

  // Refresh button
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadConsultations);
  }

  // Nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      const page = item.dataset.page;
      if (page === 'consultations') {
        loadConsultations();
      } else {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.innerHTML = `
            <div class="page-header ar-fade-in">
              <div class="breadcrumb">
                <div class="dot"></div>
                <span>GRAMTIME.VISUALS // ${page.toUpperCase()}.MODULE</span>
              </div>
              <h2>${page.toUpperCase()} <span class="accent">MODULE</span></h2>
              <p class="subtitle">This module is coming soon.</p>
            </div>
            <div class="empty-state ar-fade-in">
              <div class="icon">◈</div>
              <h3>Module under construction</h3>
              <p>The ${page} module will be available in a future update.</p>
            </div>
          `;
        }
      }
    });
  });
}

// ── Auto-refresh every 30 seconds ────────────────────────────
setInterval(() => {
  if (document.querySelector('.modal-overlay') === null) {
    loadConsultations();
  }
}, 30000);

// ── Initialize ───────────────────────────────────────────────
renderApp();
loadConsultations();