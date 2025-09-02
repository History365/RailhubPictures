/**
 * Cloudflare Worker Deployment Checker
 * 
 * This utility helps diagnose issues with Cloudflare Workers deployments
 */

class CloudflareWorkerChecker {
  constructor() {
    // Include both API subdomain and main domain endpoints
    this.endpoints = [
      // Main domain endpoints (more likely to work)
      'https://railhubpictures.org/api/health',
      'https://railhubpictures.org/api',
      'https://railhubpictures.org',
      'http://railhubpictures.org/api/health',
      'http://railhubpictures.org/api',
      'http://railhubpictures.org',
      // API subdomain endpoints (original ones)
      'https://api.railhubpictures.org/api/health',
      'https://api.railhubpictures.org/api',
      'https://api.railhubpictures.org',
      'http://api.railhubpictures.org/api/health',
      'http://api.railhubpictures.org/api',
      'http://api.railhubpictures.org'
    ];
  }
  
  /**
   * Check if the worker is responding correctly
   */
  async checkWorker() {
    const results = {};
    
    for (const endpoint of this.endpoints) {
      results[endpoint] = await this.testEndpoint(endpoint);
    }
    
    return results;
  }
  
  /**
   * Test a specific endpoint
   */
  async testEndpoint(endpoint) {
    try {
      console.log(`Testing endpoint: ${endpoint}`);
      const startTime = new Date().getTime();
      
      const response = await fetch(endpoint, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      const endTime = new Date().getTime();
      const responseTime = endTime - startTime;
      
      let body = null;
      try {
        body = await response.text();
        try {
          body = JSON.parse(body);
        } catch (e) {
          // Keep as text if not JSON
        }
      } catch (e) {
        body = null;
      }
      
      return {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        responseTime,
        headers: this.headersToObject(response.headers),
        body
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        errorType: error.name
      };
    }
  }
  
  /**
   * Convert Headers object to plain object
   */
  headersToObject(headers) {
    const result = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
}

// Make it available globally
window.cfWorkerChecker = new CloudflareWorkerChecker();
