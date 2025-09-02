/**
 * RailHub Pictures API Client for Cloudflare Workers
 * 
 * This client connects the frontend to the Cloudflare Workers API
 */

class RailHubAPI {
  constructor() {
    // Define endpoints in priority order - updated based on test results
    this.endpoints = [
      {
        url: 'https://railhubpictures.org',
        type: 'main_domain_https',
        description: 'Main Domain HTTPS'
      },
      {
        url: 'https://railhubpictures.org/api',
        type: 'main_domain_api_https',
        description: 'Main Domain API Path HTTPS'
      },
      {
        url: 'https://railhub-api.railhubpictures.org/api',
        type: 'worker',
        description: 'Direct Worker URL'
      },
      {
        url: 'https://api.railhubpictures.org/api', 
        type: 'api_subdomain', 
        description: 'API Subdomain'
      },
      {
        url: 'http://localhost:8787/api',
        type: 'local_dev',
        description: 'Local Development'
      }
    ];
    
    // Set the API base URL
    // Check if we have a previously working URL in localStorage
    const savedBaseURL = localStorage.getItem('api_base_url');
    if (savedBaseURL) {
      this.baseURL = savedBaseURL;
      console.log('Using saved API baseURL:', this.baseURL);
    } else {
      // Default to direct worker URL
      this.baseURL = this.endpoints[0].url;
    }
    
    // Store connection status
    this.connectionStatus = {
      connected: false,
      endpoint: null,
      lastChecked: null,
      error: null
    };
    
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
      
      // Based on the latest test results:
      // - Only https://railhubpictures.org (without /api path) is working
      // - API paths don't work on any domain
      // - HTTP doesn't work
      
      // First, try the main domain on HTTPS without /api path since that's what works
      try {
        const mainDomainHttps = 'https://railhubpictures.org';
        console.log(`Prioritizing known working endpoint: ${mainDomainHttps}`);
        
        const response = await fetch(mainDomainHttps, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          headers: {
            'Accept': 'application/json, text/html, */*',
          },
          signal: AbortSignal.timeout(3000) // 3 second timeout
        });
        
        if (response.ok) {
          console.log(`✅ Main domain HTTPS is working!`);
          // Use the main domain with /api for API client compatibility
          this.baseURL = 'https://railhubpictures.org';
          this.connectionStatus = {
              connected: true,
              endpoint: endpoint,
              lastChecked: new Date(),
              error: null
            };
            
            localStorage.setItem('api_base_url', this.baseURL);
            console.log('Auto-detected and saved API endpoint:', this.baseURL);
            
            // Broadcast an event that we connected
            const event = new CustomEvent('api:connected', { 
              detail: {
                endpoint: endpoint,
                baseURL: this.baseURL
              }
            });
            window.dispatchEvent(event);
            
            return endpoint;
          } else {
            console.warn(`❌ Endpoint ${endpoint.description} failed with status: ${response.status}`);
          }
        } catch (endpointError) {
          console.error(`Error testing ${endpoint.description}:`, endpointError);
        }
      }
      
      // If we get here, no endpoints worked
      console.error('❌ All API endpoints failed!');
      this.connectionStatus = {
        connected: false,
        endpoint: null,
        lastChecked: new Date(),
        error: 'All endpoints failed'
      };
      
      // Broadcast an event that we failed to connect
      const event = new CustomEvent('api:connectionFailed', { 
        detail: { 
          error: 'All endpoints failed'
        }
      });
      window.dispatchEvent(event);
      
      return null;
    } catch (e) {
      console.error('Error auto-detecting API endpoint:', e);
      this.connectionStatus = {
        connected: false,
        endpoint: null,
        lastChecked: new Date(),
        error: e.message || 'Unknown error'
      };
      return null;
    }
  }
  
  // Test all endpoints and return detailed results
  async testConnection() {
    const results = [];
    let anySuccess = false;
    
    // Test each endpoint
    for (const endpoint of this.endpoints) {
      try {
        console.log(`Testing ${endpoint.description}...`);
        const startTime = performance.now();
        
        const response = await fetch(`${endpoint.url}/photos/latest?limit=1`, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          headers: {
            'Accept': 'application/json'
          },
          // Use AbortController to implement timeout
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);
        
        let responseBody = null;
        try {
          if (response.headers.get('content-type')?.includes('application/json')) {
            responseBody = await response.json();
          } else if (response.headers.get('content-type')?.includes('text')) {
            responseBody = await response.text();
          }
        } catch (e) {
          console.warn(`Could not parse response from ${endpoint.description}:`, e);
        }
        
        const result = {
          endpoint: endpoint,
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          responseTime,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseBody,
          error: null
        };
        
        if (response.ok) {
          console.log(`✅ ${endpoint.description} successful in ${responseTime}ms`);
          anySuccess = true;
          
          // Update the baseURL if this is our first success
          if (!this.connectionStatus.connected) {
            this.baseURL = endpoint.url;
            localStorage.setItem('api_base_url', this.baseURL);
            console.log(`Switched to ${endpoint.description}: ${this.baseURL}`);
            
            this.connectionStatus = {
              connected: true,
              endpoint: endpoint,
              lastChecked: new Date(),
              error: null
            };
          }
        } else {
          console.warn(`❌ ${endpoint.description} failed with status: ${response.status} ${response.statusText}`);
        }
        
        results.push(result);
      } catch (error) {
        console.error(`Error testing ${endpoint.description}:`, error);
        results.push({
          endpoint: endpoint,
          success: false,
          status: null,
          statusText: null,
          responseTime: null,
          headers: null,
          body: null,
          error: error.message || 'Unknown error'
        });
      }
    }
    
    // Return the detailed results with overall status
    return {
      success: anySuccess,
      message: anySuccess ? 'At least one endpoint is working' : 'All endpoints failed',
      currentBaseURL: this.baseURL,
      results: results
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
      // Based on the latest test results:
      // - Only https://railhubpictures.org base domain is working
      // - None of the /api paths are working
      // - HTTP connections are failing
      
      // Get the base domain without /api path
      let baseUrl = this.baseURL;
      
      // If the baseURL contains /api, remove it since it won't work
      if (baseUrl.includes('/api')) {
        baseUrl = baseUrl.replace('/api', '');
      }
      
      // Ensure we're using HTTPS since that's what works
      if (baseUrl.startsWith('http:')) {
        baseUrl = baseUrl.replace('http:', 'https:');
      }
      
      // Remove any trailing slashes
      baseUrl = baseUrl.replace(/\/+$/, '');
      
      // For endpoints, remove the /api prefix if present
      let fixedEndpoint = endpoint;
      if (fixedEndpoint.startsWith('/api/')) {
        fixedEndpoint = fixedEndpoint.substring(4); // Remove /api
      }
      
      // Ensure endpoint starts with slash
      if (!fixedEndpoint.startsWith('/') && fixedEndpoint.length > 0) {
        fixedEndpoint = '/' + fixedEndpoint;
      }
      
      // Build the final URL
      let url = `${baseUrl}${fixedEndpoint}`;
      console.log(`Making API request to: ${url}`);
      
      // Attempt the fetch with the modified URL
      let finalResponse;
      try {
        finalResponse = await fetch(url, this._getOptions(options));
        console.log(`Response from ${url}: ${finalResponse.status} ${finalResponse.statusText}`);
      } catch (initialError) {
        console.warn(`Initial fetch to ${url} failed:`, initialError);
        
        // Try alternative strategies
        const alternativeUrls = [
          // Try with /api prefix
          `${baseUrl}/api${fixedEndpoint}`,
          // Try with original endpoint
          `${baseUrl}${endpoint}`,
          // Try with HTTPS if not already
          url.replace('http:', 'https:')
        ];
        
        let success = false;
        let lastError = initialError;
        
        for (const altUrl of alternativeUrls) {
          try {
            console.log(`Trying alternative URL: ${altUrl}`);
            finalResponse = await fetch(altUrl, this._getOptions(options));
            
            if (finalResponse.ok) {
              url = altUrl;
              success = true;
              break;
            }
          } catch (altError) {
            console.warn(`Alternative URL ${altUrl} failed:`, altError);
            lastError = altError;
          }
        }
        
        if (!success) {
          throw lastError;
        }
      }
      
      const response = finalResponse;
      
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
