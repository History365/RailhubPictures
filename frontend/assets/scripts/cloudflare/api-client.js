/**
 * RailHub Pictures API Client for Cloudflare Workers
 * 
 * This client connects the frontend to the Cloudflare Workers API
 */

class RailHubAPI {
  constructor() {
    // Define endpoints in priority order - optimized for reliability
    this.endpoints = [
      {
        url: 'https://railhubpictures.org',
        type: 'main_domain_https',
        description: 'Main Domain HTTPS'
      },
      {
        url: 'https://api.railhubpictures.org', 
        type: 'api_subdomain', 
        description: 'API Subdomain'
      },
      {
        url: 'https://railhub-api.railhubpictures.org',
        type: 'worker',
        description: 'Direct Worker URL'
      },
      {
        url: 'http://localhost:8787',
        type: 'local_dev',
        description: 'Local Development'
      }
    ];
    
    // Get any previously working API base URL from localStorage
    const savedBaseURL = localStorage.getItem('api_base_url');
    
    // Set the API base URL with fallbacks
    if (savedBaseURL) {
      // Use the previously working URL if we have one
      this.baseURL = savedBaseURL;
      console.log('Using previously successful API baseURL:', this.baseURL);
    } else {
      // Default to main domain for best compatibility
      this.baseURL = this.endpoints[0].url;
      console.log('Using default API baseURL:', this.baseURL);
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
      
      // Enhanced endpoint testing paths - test both the base domain and specific API endpoints
      const testPaths = [
        '', // Base domain test
        '/api/photos/latest?limit=1' // Specific API endpoint test
      ];
      
      // Try each endpoint in order until one works
      let bestEndpoint = null;
      
      for (const endpoint of this.endpoints) {
        let endpointWorks = false;
        
        // Try each test path for this endpoint
        for (const testPath of testPaths) {
          try {
            // Skip testing this path for this endpoint if it's not appropriate
            if (testPath.startsWith('/api/') && endpoint.url.includes('/api')) {
              continue; // Avoid double /api/api paths
            }
            
            const testUrl = `${endpoint.url}${testPath}`;
            console.log(`Testing endpoint: ${testUrl}`);
            
            const response = await fetch(testUrl, {
              method: 'GET',
              mode: 'cors',
              cache: 'no-cache',
              headers: {
                'Accept': 'application/json, text/html, */*',
              },
              signal: AbortSignal.timeout(5000) // 5 second timeout for better reliability
            });
            
            // Consider it working if we get a 2xx or 3xx response
            if (response.ok || (response.status >= 200 && response.status < 400)) {
              console.log(`✅ Endpoint working: ${testUrl} (Status: ${response.status})`);
              
              // Save this as a working endpoint (but keep checking for better ones)
              if (!bestEndpoint) {
                bestEndpoint = endpoint;
              }
              
              endpointWorks = true;
              
              // If this path was a specific API test and it worked, this endpoint is better
              if (testPath.includes('/api/')) {
                bestEndpoint = endpoint;
                break; // This is the best endpoint, stop testing other paths
              }
            } else {
              console.warn(`❌ Path ${testPath} on ${endpoint.description} failed with status: ${response.status}`);
            }
          } catch (pathError) {
            console.error(`Error testing ${testPath} on ${endpoint.description}:`, pathError.message);
          }
        }
        
        // If we found a working endpoint that passes all API tests, stop testing others
        if (endpointWorks && bestEndpoint === endpoint) {
          console.log(`✅ Found optimal endpoint: ${endpoint.description}`);
          break;
        }
      }
      
      // If we found a working endpoint, use it
      if (bestEndpoint) {
        console.log(`✅ Best endpoint: ${bestEndpoint.description}`);
        this.baseURL = bestEndpoint.url;
        this.connectionStatus = {
          connected: true,
          endpoint: bestEndpoint,
          lastChecked: new Date(),
          error: null
        };
        
        localStorage.setItem('api_base_url', this.baseURL);
        console.log('Auto-detected and saved API endpoint:', this.baseURL);
        
        // Broadcast an event that we connected
        const event = new CustomEvent('api:connected', { 
          detail: {
            endpoint: bestEndpoint,
            baseURL: this.baseURL
          }
        });
        window.dispatchEvent(event);
        
        return bestEndpoint;
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
      // Fix the endpoint URL construction
      
      // Get the base domain
      let baseUrl = this.baseURL;
      
      // Ensure we're using HTTPS
      if (baseUrl.startsWith('http:')) {
        baseUrl = baseUrl.replace('http:', 'https:');
      }
      
      // Remove any trailing slashes from base URL
      baseUrl = baseUrl.replace(/\/+$/, '');
      
      // Make sure the endpoint has consistent format
      let fixedEndpoint = endpoint;
      
      // Ensure endpoint starts with slash
      if (!fixedEndpoint.startsWith('/')) {
        fixedEndpoint = '/' + fixedEndpoint;
      }
      
      // Simplify the URL construction logic to be more reliable
      // This is a critical fix for the Cloudflare Worker routing issue
      
      // Check if we're dealing with the main domain or a subdomain
      const isMainDomain = baseUrl.includes('railhubpictures.org') && 
                          !baseUrl.includes('api.') && 
                          !baseUrl.includes('railhub-api.');
      
      // Build URL differently based on domain type
      let url;
      
      if (isMainDomain) {
        // On main domain, use explicit /api prefix
        if (!fixedEndpoint.startsWith('/api/') && fixedEndpoint !== '/api') {
          url = `${baseUrl}/api${fixedEndpoint}`;
        } else {
          url = `${baseUrl}${fixedEndpoint}`;
        }
      } else {
        // On API subdomains, handle path differently
        if (fixedEndpoint.startsWith('/api/')) {
          // Remove /api prefix for api.* subdomains
          url = `${baseUrl}${fixedEndpoint.substring(4)}`;
        } else if (fixedEndpoint === '/api') {
          // Just use root for /api
          url = baseUrl;
        } else {
          // No need to add /api prefix on API subdomains
          url = `${baseUrl}${fixedEndpoint}`;
        }
      }
      
      console.log(`Making API request to: ${url}`);
      
      // Add retry logic for transient failures
      const MAX_RETRIES = 3;
      const RETRY_DELAY = 1000; // 1 second
      
      // Helper function for delay between retries
      const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
      
      // Attempt the fetch with the constructed URL
      let finalResponse;
      let lastError;
      
      try {
        // Add consistent fetch options
        const fetchOptions = this._getOptions(options);
        
        // Add CORS mode and credentials for better reliability
        fetchOptions.mode = 'cors';
        fetchOptions.credentials = 'same-origin';
        
        // Try multiple times for transient failures
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          try {
            // Create a fresh AbortSignal for each attempt
            fetchOptions.signal = AbortSignal.timeout(10000); // 10 second timeout
            
            console.log(`Attempt ${attempt}/${MAX_RETRIES} for ${url}`);
            finalResponse = await fetch(url, fetchOptions);
            
            // If successful or we get a definitive error (not a server error), stop retrying
            if (finalResponse.ok || (finalResponse.status !== 500 && finalResponse.status !== 503)) {
              break;
            }
            
            console.warn(`Got ${finalResponse.status} status, will retry...`);
            
            // Wait before next attempt (only if not the last attempt)
            if (attempt < MAX_RETRIES) {
              await delay(RETRY_DELAY * attempt); // Increasing delay with each attempt
            }
          } catch (retryError) {
            lastError = retryError;
            console.warn(`Attempt ${attempt} failed:`, retryError.message);
            
            // If network error and not last attempt, retry
            if (attempt < MAX_RETRIES) {
              await delay(RETRY_DELAY * attempt);
            } else {
              throw retryError; // Rethrow on last attempt
            }
          }
        }
        console.log(`Response from ${url}: ${finalResponse.status} ${finalResponse.statusText}`);
        
        // If we get a 404 or 500 response but the main domain is accessible,
        // the worker route is likely misconfigured. Try fallback paths.
        if ((finalResponse.status === 404 || finalResponse.status === 500) && isMainDomain) {
          console.warn(`Got ${finalResponse.status} from main API URL. Trying alternative paths...`);
          throw new Error(`API returned ${finalResponse.status}`);
        }
      } catch (initialError) {
        console.warn(`Initial fetch to ${url} failed:`, initialError);
        
        // Define better fallback strategies
        const alternativeUrls = [];
        
        // Always try direct path without /api prefix as a fallback
        if (fixedEndpoint.startsWith('/api/')) {
          alternativeUrls.push(`${baseUrl}${fixedEndpoint.substring(4)}`);
        }
        
        // Try the main domain directly as another fallback
        if (!isMainDomain) {
          const mainDomain = 'https://railhubpictures.org';
          alternativeUrls.push(`${mainDomain}${fixedEndpoint}`);
          alternativeUrls.push(`${mainDomain}/api${fixedEndpoint.replace(/^\/api/, '')}`);
        }
        
        console.log('Trying alternative URLs:', alternativeUrls);
        
        let success = false;
        let lastError = initialError;
        
        // Try each alternative URL
        for (const altUrl of alternativeUrls) {
          try {
            console.log(`Trying alternative URL: ${altUrl}`);
            
            // Use same fetch options for consistency
            const fetchOptions = this._getOptions(options);
            fetchOptions.mode = 'cors';
            fetchOptions.credentials = 'same-origin';
            
            finalResponse = await fetch(altUrl, fetchOptions);
            
            if (finalResponse.ok) {
              // If this worked, update the baseURL for future requests
              const altUrlObj = new URL(altUrl);
              const pathParts = altUrlObj.pathname.split('/');
              
              // Store the successful base URL for future requests
              const successfulBase = `${altUrlObj.protocol}//${altUrlObj.host}`;
              localStorage.setItem('api_base_url', successfulBase);
              console.log(`Updated API base URL to: ${successfulBase}`);
              
              // Update current instance
              this.baseURL = successfulBase;
              
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
