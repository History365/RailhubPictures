/**
 * RailHub Pictures Emergency API Client
 * 
 * This is a fallback client that works when Cloudflare Workers are down
 * It implements workarounds to continue functioning even when API endpoints fail
 */

class EmergencyRailHubAPI {
  constructor() {
    console.warn("🚨 INITIALIZING EMERGENCY API CLIENT 🚨");
    
    // Always use the main domain in HTTPS
    this.baseURL = 'https://railhubpictures.org';
    
    // Get auth token from localStorage if available
    this.token = localStorage.getItem('auth_token');
    
    // Set connection status
    this.connectionStatus = {
      connected: true,
      emergency: true,
      endpoint: {
        url: this.baseURL,
        type: 'emergency_fallback',
        description: 'Emergency Fallback (main domain)'
      },
      lastChecked: new Date(),
      error: null
    };
    
    // Cache for mock data
    this._mockDataCache = {
      photos: [],
      units: []
    };
    
    // Try to pre-fetch some data from the homepage
    this._prefetchData();
    
    // Show alert to users
    this._showEmergencyBanner();
  }
  
  // Pre-fetch data from the homepage to use as mock data
  async _prefetchData() {
    try {
      console.log("Pre-fetching data from homepage for emergency mode");
      const mainPageResp = await fetch(this.baseURL, {
        method: 'GET',
        headers: { 'Accept': 'text/html' }
      });
      
      if (mainPageResp.ok) {
        const mainPageText = await mainPageResp.text();
        
        // Extract images for mock photo data
        const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
        let match;
        let mockId = 1000;
        
        while ((match = imgRegex.exec(mainPageText)) !== null) {
          const imgSrc = match[1];
          if (imgSrc.includes('.jpg') || imgSrc.includes('.png') || imgSrc.includes('.jpeg')) {
            this._mockDataCache.photos.push({
              id: mockId++,
              url: imgSrc.startsWith('http') ? imgSrc : this.baseURL + (imgSrc.startsWith('/') ? '' : '/') + imgSrc,
              title: "Image from homepage",
              emergency_mode: true,
              description: "API is in emergency mode. This data is extracted from the homepage."
            });
          }
        }
        
        console.log(`Pre-fetched ${this._mockDataCache.photos.length} images for emergency mode`);
        
        // Create mock locomotive data
        this._mockDataCache.units = [
          { id: 1, road_name: "BNSF", road_number: "1234", model: "ES44DC" },
          { id: 2, road_name: "UP", road_number: "5678", model: "SD70ACe" },
          { id: 3, road_name: "CPKC", road_number: "9012", model: "ES44AC" },
          { id: 4, road_name: "NS", road_number: "3456", model: "SD40-2" },
          { id: 5, road_name: "CSX", road_number: "7890", model: "ET44AH" }
        ];
      }
    } catch (error) {
      console.error("Error pre-fetching emergency data:", error);
    }
  }
  
  // Show emergency mode banner
  _showEmergencyBanner() {
    if (document.getElementById('api-emergency-banner')) {
      return; // Banner already exists
    }
    
    const banner = document.createElement('div');
    banner.id = 'api-emergency-banner';
    banner.style.position = 'fixed';
    banner.style.top = '0';
    banner.style.left = '0';
    banner.style.width = '100%';
    banner.style.backgroundColor = '#f8d7da';
    banner.style.color = '#721c24';
    banner.style.padding = '10px';
    banner.style.textAlign = 'center';
    banner.style.fontWeight = 'bold';
    banner.style.zIndex = '9999';
    banner.style.borderBottom = '1px solid #f5c6cb';
    
    banner.innerHTML = `
      🚨 API EMERGENCY MODE 🚨
      <br>
      <span style="font-weight: normal; font-size: 0.9em">
        The API is currently experiencing issues. Limited functionality available.
        <button id="hide-emergency-banner" style="margin-left: 10px; padding: 3px 8px; background: #721c24; color: white; border: none; cursor: pointer; border-radius: 3px;">
          Hide
        </button>
      </span>
    `;
    
    document.body.appendChild(banner);
    
    // Add event listener to hide button
    document.getElementById('hide-emergency-banner').addEventListener('click', () => {
      banner.style.display = 'none';
    });
    
    // Add some margin to the body to prevent content from being hidden behind the banner
    const currentBodyMargin = parseInt(getComputedStyle(document.body).marginTop) || 0;
    document.body.style.marginTop = (currentBodyMargin + banner.offsetHeight) + 'px';
  }
  
  // Get default fetch options with authorization header
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
  
  // Try to auto-detect the best endpoint
  async detectBestEndpoint() {
    console.log("Emergency mode active - using main domain only");
    return {
      url: this.baseURL,
      type: 'emergency_fallback',
      description: 'Emergency Fallback'
    };
  }
  
  // Test connection to all endpoints
  async testConnection() {
    console.log("Running connection test in emergency mode");
    
    // Only test the main domain
    try {
      const response = await fetch(this.baseURL, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        signal: AbortSignal.timeout(3000)
      });
      
      const result = {
        endpoint: {
          url: this.baseURL,
          type: 'emergency_fallback',
          description: 'Emergency Fallback'
        },
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        responseTime: 0,
        error: null
      };
      
      return {
        success: response.ok,
        message: response.ok ? 'Emergency mode active and connected' : 'Emergency mode active but connection failed',
        currentBaseURL: this.baseURL,
        results: [result],
        emergency: true
      };
    } catch (error) {
      return {
        success: false,
        message: 'Emergency mode active but connection failed',
        currentBaseURL: this.baseURL,
        results: [{
          endpoint: {
            url: this.baseURL,
            type: 'emergency_fallback',
            description: 'Emergency Fallback'
          },
          success: false,
          status: null,
          statusText: null,
          responseTime: null,
          error: error.message || 'Unknown error'
        }],
        emergency: true
      };
    }
  }
  
  // Check if we're authenticated
  isAuthenticated() {
    return !!this.token;
  }
  
  // Set the authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }
  
  // Clear the authentication token (logout)
  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }
  
  // Perform API request with fallbacks for emergency mode
  async _fetch(endpoint, options = {}) {
    try {
      console.log(`Emergency mode API request: ${endpoint}`);
      
      // Handle specific endpoints with mock data
      if (endpoint.includes('/photos/latest')) {
        console.log("Returning mock photo data in emergency mode");
        return this._mockDataCache.photos;
      } 
      else if (endpoint.includes('/photos/') && !endpoint.includes('/upload')) {
        // For specific photo, return first mock photo
        console.log("Returning mock single photo in emergency mode");
        return this._mockDataCache.photos[0] || {
          id: 999,
          url: `${this.baseURL}/assets/images/logo.jpg`,
          title: "Placeholder Image",
          emergency_mode: true,
          description: "API is in emergency mode. This is placeholder data."
        };
      }
      else if (endpoint.includes('/units')) {
        // For units, return mock data
        console.log("Returning mock units data in emergency mode");
        return this._mockDataCache.units;
      }
      else if (endpoint.includes('/photos/upload') && options.method === 'POST') {
        // For upload, try direct upload but expect it to fail
        console.log("Attempting upload in emergency mode");
        try {
          // Try direct upload to the main domain /upload path
          const uploadResp = await fetch(`${this.baseURL}/upload`, this._getOptions(options));
          
          if (uploadResp.ok) {
            return { success: true, message: "Upload processed in emergency mode" };
          } else {
            console.warn("Upload failed with status:", uploadResp.status);
            return { 
              success: false, 
              error: "Upload failed in emergency mode.",
              emergency_mode: true
            };
          }
        } catch (uploadError) {
          console.error("Upload failed in emergency mode:", uploadError);
          return { 
            success: false, 
            error: "Unable to upload in emergency mode. Please try again later.",
            emergency_mode: true
          };
        }
      }
      else if (endpoint.includes('/users/')) {
        // For user profiles, return mock user data
        return {
          id: 1,
          username: "emergency_user",
          displayName: "Emergency Mode User",
          bio: "API is in emergency mode. This is mock user data.",
          emergency_mode: true,
          photos: this._mockDataCache.photos.slice(0, 5) // First 5 mock photos
        };
      }
      
      // For any other endpoint, try to fetch from the main domain
      try {
        // Try direct access to main domain (no /api)
        const url = `${this.baseURL}${endpoint.replace(/^\/api/, '')}`;
        console.log(`Attempting fetch from: ${url}`);
        
        const response = await fetch(url, this._getOptions(options));
        
        if (response.ok) {
          try {
            // Try to parse as JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              return await response.json();
            } else {
              // Return raw response if not JSON
              return response;
            }
          } catch (parseError) {
            console.warn("Error parsing response as JSON:", parseError);
            return response;
          }
        } else {
          // If fetch fails, return an appropriate emergency response
          console.warn(`Fetch failed with status: ${response.status}`);
          return {
            success: false,
            error: `API request failed in emergency mode: ${response.status}`,
            emergency_mode: true
          };
        }
      } catch (fetchError) {
        console.error("Fetch failed in emergency mode:", fetchError);
        return {
          success: false,
          error: `Failed to connect in emergency mode: ${fetchError.message}`,
          emergency_mode: true
        };
      }
    } catch (error) {
      console.error("Error in emergency API call:", error);
      return {
        success: false,
        error: `Emergency mode error: ${error.message}`,
        emergency_mode: true
      };
    }
  }
  
  // API endpoint implementations that use _fetch
  
  async getLatestPhotos(limit = 20) {
    return await this._fetch(`/photos/latest?limit=${limit}`);
  }
  
  async getPhoto(id) {
    return await this._fetch(`/photos/${id}`);
  }
  
  async uploadPhoto(formData) {
    return await this._fetch('/photos/upload', {
      method: 'POST',
      body: formData
    });
  }
  
  async getUnitPhotos(unitId) {
    return await this._fetch(`/units/${unitId}/photos`);
  }
  
  async getUserProfile(identifier) {
    return await this._fetch(`/users/${identifier}`);
  }
  
  async getAllUnits() {
    return await this._fetch('/units');
  }
  
  async getSuggestedEdits() {
    return await this._fetch('/admin/suggestions');
  }
  
  async processSuggestedEdit(id, action) {
    return await this._fetch(`/admin/suggestions/${id}/${action}`, {
      method: 'POST'
    });
  }
}
