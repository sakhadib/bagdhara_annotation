// Centralized API service for making authenticated requests
class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE || 'https://bdbackend-ten.vercel.app/api'; 
    // Fallback to '/api' for local dev (proxy will catch it)
  }

  // Helper to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Request failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  // Auth endpoints
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(userData) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Master/Idiom endpoints
  async getIdioms(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/master?${queryString}` : '/master';
    return this.request(endpoint, { method: 'GET' });
  }

  async getIdiom(id) {
    return this.request(`/master/${id}`, { method: 'GET' });
  }

  async updateIdiom(id, data) {
    return this.request(`/master/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getNextIdiomId(currentId) {
    return this.request(`/master/next/${currentId}`, { method: 'GET' });
  }

  async getRandomPendingIdiom() {
    return this.request('/master/random/pending', { method: 'GET' });
  }

  // Search idioms
  async searchIdioms(query, filters = {}) {
    const params = { q: query, ...filters };
    return this.getIdioms(params);
  }
}

export default new ApiService();