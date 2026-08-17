import io from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('gallery_token');
    this.socket = null;
    this.eventListeners = new Map();
  }

  // Initialize real-time connection
  initializeSocket(galleryId) {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to real-time server');
      if (galleryId && this.token) {
        this.socket.emit('gallery-auth', { galleryId, token: this.token });
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from real-time server');
    });

    // Set up event listeners
    this.socket.on('favorites-updated', (data) => {
      this.emit('favorites-updated', data);
    });

    this.socket.on('photos-uploaded', (data) => {
      this.emit('photos-uploaded', data);
    });

    this.socket.on('user-activity', (data) => {
      this.emit('user-activity', data);
    });

    return this.socket;
  }

  // Event system for real-time updates
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => callback(data));
    }
  }

  // Track activity for real-time features
  trackActivity(type, data = {}) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('gallery-activity', { type, data, timestamp: Date.now() });
    }
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('gallery_token', token);
    } else {
      localStorage.removeItem('gallery_token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Gallery Authentication
  async authenticateGallery(galleryId, password) {
    const response = await this.request('/gallery/auth', {
      method: 'POST',
      body: JSON.stringify({ galleryId, password }),
    });

    if (response.token) {
      this.setToken(response.token);
      this.initializeSocket(response.gallery.id);
    }

    return response;
  }

  // Gallery Operations
  async getGallery(galleryId) {
    const response = await this.request(`/gallery/${galleryId}`);
    this.trackActivity('gallery_view', { galleryId });
    return response;
  }

  async toggleFavorite(galleryId, imageId) {
    const response = await this.request(`/gallery/${galleryId}/favorite`, {
      method: 'POST',
      body: JSON.stringify({ imageId }),
    });
    this.trackActivity('favorite_toggle', { galleryId, imageId });
    return response;
  }

  // Shopping Cart
  async addToCart(galleryId, imageId, productType, price, quantity = 1, size = null) {
    const response = await this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ galleryId, imageId, productType, price, quantity, size }),
    });
    this.trackActivity('cart_add', { galleryId, imageId, productType });
    return response;
  }

  async getCart(galleryId) {
    return this.request(`/cart/${galleryId}`);
  }

  // Consultations
  async bookConsultation(consultationData) {
    const response = await this.request('/consultations', {
      method: 'POST',
      body: JSON.stringify(consultationData),
    });
    this.trackActivity('consultation_booked', { type: consultationData.consultation?.title });
    return response;
  }

  // Inquiries
  async submitInquiry(inquiryData) {
    const response = await this.request('/inquiries', {
      method: 'POST',
      body: JSON.stringify(inquiryData),
    });
    this.trackActivity('inquiry_submitted', { sessionType: inquiryData.sessionType });
    return response;
  }

  // CRM
  async getClients(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/clients${queryString ? '?' + queryString : ''}`);
  }

  async addClientNote(clientId, note) {
    return this.request(`/clients/${clientId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  }

  async updateClientStatus(clientId, status) {
    return this.request(`/clients/${clientId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Email Marketing
  async sendWeeklyOffer(campaignData) {
    return this.request('/campaigns/weekly-offer', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  }

  async sendFestiveCampaign(campaignData) {
    return this.request('/campaigns/festive', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  }

  async getCampaignHistory() {
    return this.request('/campaigns');
  }

  async getCRMAnalytics() {
    return this.request('/crm/analytics');
  }

  // Downloads
  async requestDownload(galleryId, imageIds, type) {
    const response = await this.request(`/gallery/${galleryId}/download`, {
      method: 'POST',
      body: JSON.stringify({ imageIds, type }),
    });
    this.trackActivity('download_requested', { galleryId, count: imageIds.length, type });
    return response;
  }

  // Email
  async sendEmail(emailData) {
    return this.request('/send-email', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }

  // Health Check
  async healthCheck() {
    return this.request('/health');
  }

  // Logout
  logout() {
    this.setToken(null);
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventListeners.clear();
  }
}

export const apiService = new ApiService();
export default apiService;