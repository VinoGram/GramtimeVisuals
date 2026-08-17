const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('gallery_token');
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
    }

    return response;
  }

  // Gallery Operations
  async getGallery(galleryId) {
    return this.request(`/gallery/${galleryId}`);
  }

  async toggleFavorite(galleryId, imageId) {
    return this.request(`/gallery/${galleryId}/favorite`, {
      method: 'POST',
      body: JSON.stringify({ imageId }),
    });
  }

  // Shopping Cart
  async addToCart(galleryId, imageId, productType, price, quantity = 1) {
    return this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ galleryId, imageId, productType, price, quantity }),
    });
  }

  // Consultations
  async bookConsultation(consultationData) {
    return this.request('/consultations', {
      method: 'POST',
      body: JSON.stringify(consultationData),
    });
  }

  // Inquiries
  async submitInquiry(inquiryData) {
    return this.request('/inquiries', {
      method: 'POST',
      body: JSON.stringify(inquiryData),
    });
  }

  // CRM
  async getClients() {
    return this.request('/clients');
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
  }
}

export const apiService = new ApiService();
export default apiService;