/**
 * RailHub Pictures API Client for Cloudflare Workers
 * 
 * This client connects the frontend to the Cloudflare Workers API
 */

class RailHubAPI {
  constructor() {
    // Set the API base URL
    // Check if we have a previously working URL in localStorage
    const savedBaseURL = localStorage.getItem('api_base_url');
    if (savedBaseURL) {
      this.baseURL = savedBaseURL;
      console.log('Using saved API baseURL:', this.baseURL);
    } else {
      // Use the main domain instead of the API subdomain since api.railhubpictures.org is not resolving
      this.baseURL = 'https://railhubpictures.org/api';
      // Alternative for development
      // this.baseURL = 'http://localhost:8787/api';
    }
    
    // Get auth token from localStorage if available
    this.token = localStorage.getItem('auth_token');
    
    console.log('RailHubAPI initialized with baseURL:', this.baseURL);
    
    // Automatically try to detect the best endpoint
    this.detectBestEndpoint();
  }
  
  // Try to detect the best API endpoint
  async detectBestEndpoint() {
    try {
      console.log('Auto-detecting best API endpoint...');
      const result = await this.testConnection();
      
      if (result.success) {
        // Save the working protocol/URL to localStorage
        if (result.protocol === 'http') {
          this.baseURL = 'http://api.railhubpictures.org/api';
        } else {
          this.baseURL = 'https://api.railhubpictures.org/api';
        }
        
        localStorage.setItem('api_base_url', this.baseURL);
        console.log('Auto-detected and saved API endpoint:', this.baseURL);
      }
    } catch (e) {
      console.error('Error auto-detecting API endpoint:', e);
    }
  }
  
  // Test both HTTPS and HTTP connections
  async testConnection() {
    // Try HTTPS on main domain first
    try {
      console.log('Testing HTTPS connection on main domain...');
      const httpsResponse = await fetch('https://railhubpictures.org/api/photos/latest', {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
      });
      
      if (httpsResponse.ok) {
        console.log('HTTPS connection successful on main domain');
        this.baseURL = 'https://railhubpictures.org/api';
        return {
          success: true,
          protocol: 'https',
          status: httpsResponse.status,
          message: 'HTTPS connection successful on main domain'
        };
      } else {
        console.warn('HTTPS connection failed with status:', httpsResponse.status);
      }
    } catch (httpsError) {
      console.error('HTTPS connection error on main domain:', httpsError);
    }
    
    // Try HTTP on main domain as fallback
    try {
      console.log('Testing HTTP connection on main domain...');
      const httpResponse = await fetch('http://railhubpictures.org/api/photos/latest', {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
      });
      
      if (httpResponse.ok) {
        console.log('HTTP connection successful on main domain');
        // Update the baseURL to use HTTP
        this.baseURL = 'http://railhubpictures.org/api';
        console.log('Switched to HTTP baseURL:', this.baseURL);
        return {
          success: true,
          protocol: 'http',
          status: httpResponse.status,
          message: 'HTTP connection successful on main domain'
        };
      } else {
        console.warn('HTTP connection failed with status:', httpResponse.status);
      }
    } catch (httpError) {
      console.error('HTTP connection error on main domain:', httpError);
    }
    
    // Try localhost as final fallback (for local development)
    try {
      console.log('Testing localhost connection...');
      const localhostResponse = await fetch('http://localhost:8787/api/photos/latest', {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
      });
      
      if (localhostResponse.ok) {
        console.log('Localhost connection successful');
        // Update the baseURL to use localhost
        this.baseURL = 'http://localhost:8787/api';
        console.log('Switched to localhost baseURL:', this.baseURL);
        return {
          success: true,
          protocol: 'localhost',
          status: localhostResponse.status,
          message: 'Localhost connection successful, switched to localhost'
        };
      } else {
        console.warn('Localhost connection failed with status:', localhostResponse.status);
      }
    } catch (localhostError) {
      console.error('Localhost connection error:', localhostError);
    }
    
    return {
      success: false,
      message: 'Both HTTPS and HTTP connections failed'
    };
  }
  
  // Check if we're authenticated
  isAuthenticated() {
    return !!this.token;
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
