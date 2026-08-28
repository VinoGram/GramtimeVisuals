const BASE = '/api';

function getToken() {
  return localStorage.getItem('admin_token');
}

function headers() {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  const t = getToken();
  if (t) h['Authorization'] = `Bearer ${t}`;
  return h;
}

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: headers(), ...opts });
  if (res.status === 401 || res.status === 403) {
    clearToken();
    window.location.reload();
    throw new Error('Session expired');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}

export const api = {
  login: (username: string, password: string) =>
    req<{ token: string }>('/admin/login', { method: 'POST', body: JSON.stringify({ username, password }) }),

  getBookings: () => req<{ bookings: any[] }>('/bookings'),
  updateBookingStatus: (id: string, status: string) =>
    req(`/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  deleteBooking: (id: string) => req(`/bookings/${id}`, { method: 'DELETE' }),
  approveBooking: (id: string) => req(`/bookings/${id}/approve`, { method: 'POST' }),

  getConsultations: () => req<{ consultations: any[] }>('/consultations'),
  updateConsultationStatus: (id: string, status: string) =>
    req(`/consultations/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  deleteConsultation: (id: string) => req(`/consultations/${id}`, { method: 'DELETE' }),

  getClients: () => req<{ clients: any[] }>('/clients'),
  addClient: (data: any) => req('/clients', { method: 'POST', body: JSON.stringify(data) }),
  updateClientStatus: (id: string, status: string) =>
    req(`/clients/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  addClientNote: (id: string, note: string) =>
    req(`/clients/${id}/notes`, { method: 'POST', body: JSON.stringify({ note }) }),
  deleteClient: (id: string) => req(`/clients/${id}`, { method: 'DELETE' }),

  getGalleries: () => req<{ galleries: any[] }>('/admin/galleries'),
  createGallery: (data: any) => req('/admin/galleries', { method: 'POST', body: JSON.stringify(data) }),
  deleteGallery: (id: string) => req(`/admin/galleries/${id}`, { method: 'DELETE' }),

  uploadGalleryImages: (id: string, files: FileList) => {
    const token = getToken();
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('images', f));
    return fetch(`${BASE}/admin/galleries/${id}/images`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(r => {
      if (r.status === 401 || r.status === 403) { clearToken(); window.location.reload(); throw new Error('Session expired'); }
      return r.json();
    });
  },

  deleteGalleryImage: (galleryId: string, imageId: string) =>
    req(`/admin/galleries/${galleryId}/images/${imageId}`, { method: 'DELETE' }),

  getInquiries: () => req<{ inquiries: any[] }>('/admin/inquiries'),

  getCampaigns: () => req<{ campaigns: any[] }>('/campaigns'),
  sendWeeklyOffer: (data: any) => req('/campaigns/weekly-offer', { method: 'POST', body: JSON.stringify(data) }),
  sendFestiveCampaign: (data: any) => req('/campaigns/festive', { method: 'POST', body: JSON.stringify(data) }),
  uploadCampaignFlyer: (title: string, file: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('flyer', file);
    formData.append('title', title);
    return fetch(`${BASE}/campaigns/flyer`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(r => {
      if (r.status === 401 || r.status === 403) { clearToken(); window.location.reload(); throw new Error('Session expired'); }
      return r.json();
    });
  },
  toggleCampaignActive: (id: string, active: boolean) =>
    req(`/campaigns/${id}/active`, { method: 'PATCH', body: JSON.stringify({ active }) }),
  deleteCampaign: (id: string) => req(`/campaigns/${id}`, { method: 'DELETE' }),

  sendEmail: (data: any) => req('/send-email', { method: 'POST', body: JSON.stringify(data) }),

  getNewsletterSubscribers: () => req<{ subscribers: any[] }>('/newsletter/subscribers'),
  deleteNewsletterSubscriber: (id: string) => req(`/newsletter/subscribers/${id}`, { method: 'DELETE' }),
  sendNewsletter: (data: { subject: string; body: string; frequency: string }) =>
    req('/newsletter/send', { method: 'POST', body: JSON.stringify(data) }),

  getPress: () => req<{ pressItems: any[] }>('/press'),
  addPress: (data: any) => req('/press', { method: 'POST', body: JSON.stringify(data) }),
  updatePress: (id: string, data: any) => req(`/press/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePress: (id: string) => req(`/press/${id}`, { method: 'DELETE' }),

  getPortfolioFolders: () => req<{ folders: any[] }>('/portfolio/folders'),
  createPortfolioFolder: (formData: FormData) => {
    const token = getToken();
    return fetch(`${BASE}/portfolio/folders`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(r => {
      if (r.status === 401 || r.status === 403) { clearToken(); window.location.reload(); throw new Error('Session expired'); }
      return r.json();
    });
  },
  deletePortfolioFolder: (id: string) => req(`/portfolio/folders/${id}`, { method: 'DELETE' }),

  getPortfolio: (folderId?: string) => req<{ images: any[] }>(`/portfolio${folderId ? `?folderId=${folderId}` : ''}`),
  addPortfolioImage: (formData: FormData) => {
    const token = getToken();
    return fetch(`${BASE}/portfolio`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(r => {
      if (r.status === 401 || r.status === 403) { clearToken(); window.location.reload(); throw new Error('Session expired'); }
      return r.json();
    });
  },
  updatePortfolioImage: (id: string, data: any) =>
    req(`/portfolio/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePortfolioImage: (id: string) => req(`/portfolio/${id}`, { method: 'DELETE' }),

  getBlogPosts: () => req<{ posts: any[] }>('/blog'),
  addBlogPost: (formData: FormData) => {
    const token = getToken();
    return fetch(`${BASE}/blog`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(r => {
      if (r.status === 401 || r.status === 403) { clearToken(); window.location.reload(); throw new Error('Session expired'); }
      return r.json();
    });
  },
  deleteBlogPost: (id: string) => req(`/blog/${id}`, { method: 'DELETE' }),
};

export function saveToken(token: string) { localStorage.setItem('admin_token', token); }
export function clearToken() { localStorage.removeItem('admin_token'); }
export function isLoggedIn() { return !!getToken(); }
