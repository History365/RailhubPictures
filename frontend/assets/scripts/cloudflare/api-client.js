/**
 * RailHub Pictures API Client for Cloudflare Workers
 * 
 * This client connects the frontend to the Cloudflare Workers API
 */

class RailHubAPI {
  constructor() {
    // Set the API base URL
    this.baseURL = 'https://api.railhubpictures.org/api';
    // Alternative for development
    // this.baseURL = 'http://localhost:8787/api';
    
    // Get auth token from localStorage if available
    this.token = localStorage.getItem('auth_token');
  }

  /**
   * Set the authentication token
   * @param {string} token - JWT token
   */
  setToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  /**
   * Clear the authentication token (logout)
   */
  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  /**
   * Get default fetch options with authorization header
   * @returns {Object} Fetch options
   */
  _getOptions(options = {}) {
    const headers = {
      ...options.headers
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return {
      ...options,
      headers
    };
  }

  /**
   * Perform API request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response data
   */
  async _fetch(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, this._getOptions(options));
      
      // If response is not JSON, return the raw response
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return response;
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Get latest photos
   * @param {number} limit - Number of photos to retrieve
   * @returns {Promise<Array>} Array of photos
   */
  async getLatestPhotos(limit = 20) {
    return await this._fetch(`/photos/latest?limit=${limit}`);
  }

  /**
   * Get a specific photo by ID
   * @param {number} id - Photo ID
   * @returns {Promise<Object>} Photo data
   */
  async getPhoto(id) {
    return await this._fetch(`/photos/${id}`);
  }

  /**
   * Upload a new photo
   * @param {FormData} formData - Form data with photo and metadata
   * @returns {Promise<Object>} Upload result
   */
  async uploadPhoto(formData) {
    return await this._fetch('/photos/upload', {
      method: 'POST',
      body: formData
    });
  }

  /**
   * Get photos for a specific locomotive unit
   * @param {number} unitId - Unit ID
   * @returns {Promise<Array>} Array of photos
   */
  async getUnitPhotos(unitId) {
    return await this._fetch(`/units/${unitId}/photos`);
  }

  /**
   * Get user profile and photos
   * @param {string|number} identifier - User ID or username
   * @returns {Promise<Object>} User profile and photos
   */
  async getUserProfile(identifier) {
    return await this._fetch(`/users/${identifier}`);
  }

  /**
   * Get all locomotive units
   * @returns {Promise<Array>} Array of units
   */
  async getAllUnits() {
    return await this._fetch('/units');
  }

  /**
   * Get suggested edits (admin only)
   * @returns {Promise<Array>} Array of suggested edits
   */
  async getSuggestedEdits() {
    return await this._fetch('/admin/suggestions');
  }

  /**
   * Process a suggested edit (admin only)
   * @param {number} id - Suggestion ID
   * @param {string} action - 'approve' or 'reject'
   * @returns {Promise<Object>} Process result
   */
  async processSuggestedEdit(id, action) {
    return await this._fetch(`/admin/suggestions/${id}/${action}`, {
      method: 'POST'
    });
  }

  /**
   * Get full image URL from filename
   * @param {string} filename - Image filename
   * @returns {string} Full image URL
   */
  getImageURL(filename) {
    return `https://railhubimages.r2.dev/${filename}`;
    // Alternative for development
    // return `/uploads/${filename}`;
  }
}

// Create global API client instance
const railhubAPI = new RailHubAPI();

// Export the API client
window.railhubAPI = railhubAPI;
