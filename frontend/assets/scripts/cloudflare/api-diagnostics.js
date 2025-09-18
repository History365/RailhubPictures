/**
 * Advanced API Connection Diagnostics Tool for RailHub Pictures
 * 
 * This utility helps identify and fix API connectivity issues with Cloudflare Workers
 */

class ApiDiagnostics {
  constructor() {
    this.endpoints = [
      {
        url: 'https://railhub-api.railhubpictures.org/api',
        description: 'Direct Worker URL'
      },
      {
        url: 'https://api.railhubpictures.org/api',
        description: 'API Subdomain'
      },
      {
        url: 'https://railhubpictures.org/api',
        description: 'Main Domain API Path'
      },
      {
        url: 'http://localhost:8787/api',
        description: 'Local Development'
      }
    ];
    
    this.apiClient = window.railhubAPI;
    this.lastResults = null;
  }
  
  /**
   * Run comprehensive API diagnostics
   * @returns {Promise<Object>} Diagnostic results
   */
  async runDiagnostics() {
    console.log('Running comprehensive API diagnostics...');
    
    const results = {
      timestamp: new Date().toISOString(),
      currentEndpoint: this.apiClient.baseURL,
      endpoints: {},
      dnsCheck: {},
      workerCheck: {},
      overall: {
        success: false,
        bestEndpoint: null,
        issues: []
      }
    };
    
    // Test all endpoints
    for (const endpoint of this.endpoints) {
      console.log(`Testing endpoint: ${endpoint.description}...`);
      results.endpoints[endpoint.url] = await this.testEndpoint(endpoint);
      
      // If this endpoint works, it might be the best one
      if (results.endpoints[endpoint.url].success) {
        results.overall.success = true;
        
        // Prefer direct worker URL, then API subdomain, then main domain
        if (!results.overall.bestEndpoint ||
            (endpoint.url.includes('railhub-api') && !results.overall.bestEndpoint.url.includes('railhub-api'))) {
          results.overall.bestEndpoint = endpoint;
        }
      }
    }
    
    // Test DNS resolution for each domain
    console.log('Checking DNS resolution...');
    const domains = ['railhubpictures.org', 'api.railhubpictures.org', 'railhub-api.railhubpictures.org'];
    
    for (const domain of domains) {
      results.dnsCheck[domain] = await this.checkDns(domain);
      
      // Check for DNS issues
      if (!results.dnsCheck[domain].resolves) {
        results.overall.issues.push({
          type: 'dns',
          domain: domain,
          message: `DNS resolution failed for ${domain}`
        });
      }
    }
    
    // Check worker routes
    console.log('Testing worker route configuration...');
    results.workerCheck = await this.testWorkerRoutes();
    
    // Check for worker configuration issues
    for (const [route, result] of Object.entries(results.workerCheck)) {
      if (!result.success) {
        results.overall.issues.push({
          type: 'worker',
          route: route,
          message: `Worker route not configured correctly for ${route}: ${result.error || result.status}`
        });
      }
    }
    
    // Generate recommendations
    results.recommendations = this.generateRecommendations(results);
    
    this.lastResults = results;
    return results;
  }
  
  /**
   * Test a single API endpoint
   * @param {Object} endpoint - The endpoint to test
   * @returns {Promise<Object>} Test results
   */
  async testEndpoint(endpoint) {
    try {
      console.log(`Testing ${endpoint.description} (${endpoint.url})...`);
      const startTime = performance.now();
      
      const response = await fetch(`${endpoint.url}/photos/latest?limit=1`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      // Try to parse JSON response
      let data = null;
      let error = null;
      
      try {
        if (response.headers.get('content-type')?.includes('application/json')) {
          data = await response.json();
        }
      } catch (e) {
        error = `JSON parse error: ${e.message}`;
      }
      
      return {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        responseTime,
        data: data,
        error: error
      };
    } catch (e) {
      return {
        success: false,
        error: e.message || 'Unknown error',
        responseTime: null
      };
    }
  }
  
  /**
   * Check DNS resolution for a domain
   * @param {string} domain - Domain to check
   * @returns {Promise<Object>} DNS check result
   */
  async checkDns(domain) {
    try {
      console.log(`Checking DNS for ${domain}...`);
      const startTime = performance.now();
      
      // We just make a HEAD request to the domain to see if it resolves
      const response = await fetch(`https://${domain}/favicon.ico`, {
        method: 'HEAD',
        mode: 'no-cors', // This allows us to check if the domain resolves
        cache: 'no-cache',
        signal: AbortSignal.timeout(3000) // 3 second timeout
      });
      
      const endTime = performance.now();
      
      return {
        resolves: true,
        responseTime: Math.round(endTime - startTime),
        error: null
      };
    } catch (e) {
      return {
        resolves: false,
        responseTime: null,
        error: e.message || 'Unknown error'
      };
    }
  }
  
  /**
   * Test worker routes configuration
   * @returns {Promise<Object>} Worker route test results
   */
  async testWorkerRoutes() {
    const routes = {
      '/api/photos/latest': 'Main API endpoint',
      '/api': 'API root',
      '/photos/latest': 'Photo endpoint without /api prefix',
    };
    
    const results = {};
    
    for (const [path, description] of Object.entries(routes)) {
      try {
        console.log(`Testing route: ${path}...`);
        
        // Test with the direct worker URL
        const workerUrl = `https://railhub-api.railhubpictures.org${path}`;
        
        const response = await fetch(workerUrl, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          headers: {
            'Accept': 'application/json'
          },
          signal: AbortSignal.timeout(3000) // 3 second timeout
        });
        
        results[path] = {
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          error: null
        };
      } catch (e) {
        results[path] = {
          success: false,
          status: null,
          statusText: null,
          error: e.message || 'Unknown error'
        };
      }
    }
    
    return results;
  }
  
  /**
   * Generate recommendations based on diagnostic results
   * @param {Object} results - Diagnostic results
   * @returns {Array<string>} Recommendations
   */
  generateRecommendations(results) {
    const recommendations = [];
    
    // Check if any endpoint is working
    if (!results.overall.success) {
      recommendations.push("No working API endpoints found. Check that your Cloudflare Worker is deployed correctly.");
      recommendations.push("Verify that your API routes are correctly configured in wrangler.toml.");
    } else {
      recommendations.push(`Use the working endpoint: ${results.overall.bestEndpoint.url} (${results.overall.bestEndpoint.description})`);
    }
    
    // Check DNS issues
    const dnsIssues = Object.entries(results.dnsCheck).filter(([_, result]) => !result.resolves);
    if (dnsIssues.length > 0) {
      recommendations.push(`Fix DNS resolution for: ${dnsIssues.map(([domain]) => domain).join(', ')}`);
      recommendations.push("Check your Cloudflare DNS settings and ensure all subdomains are properly configured.");
    }
    
    // Check worker route issues
    const routeIssues = Object.entries(results.workerCheck).filter(([_, result]) => !result.success);
    if (routeIssues.length > 0) {
      recommendations.push("Update your Worker route configuration in wrangler.toml:");
      recommendations.push(`
[[routes]]
pattern = "api.railhubpictures.org/*"
zone_name = "railhubpictures.org"

[[routes]]
pattern = "railhubpictures.org/api/*"
zone_name = "railhubpictures.org"

[[routes]]
pattern = "railhub-api.railhubpictures.org/*"
zone_name = "railhubpictures.org"
      `);
    }
    
    // Add recommendation to update the worker code
    if (routeIssues.length > 0) {
      recommendations.push("Make sure your worker.js handles paths correctly for both domain.com/api and api.domain.com patterns.");
    }
    
    return recommendations;
  }
  
  /**
   * Switch to the best working endpoint
   * @returns {Promise<boolean>} Success
   */
  async switchToBestEndpoint() {
    if (!this.lastResults) {
      await this.runDiagnostics();
    }
    
    if (this.lastResults.overall.success && this.lastResults.overall.bestEndpoint) {
      const bestUrl = this.lastResults.overall.bestEndpoint.url;
      this.apiClient.baseURL = bestUrl;
      localStorage.setItem('api_base_url', bestUrl);
      console.log(`Switched to best endpoint: ${bestUrl}`);
      return true;
    }
    
    return false;
  }
  
  /**
   * Create diagnostics UI
   * @param {HTMLElement} container - Container element
   * @returns {HTMLElement} Diagnostics UI element
   */
  createDiagnosticsUI(container) {
    const ui = document.createElement('div');
    ui.className = 'api-diagnostics-ui';
    ui.style.padding = '20px';
    ui.style.backgroundColor = '#f8f8f8';
    ui.style.border = '1px solid #ddd';
    ui.style.borderRadius = '5px';
    ui.style.margin = '20px 0';
    ui.style.fontFamily = 'Arial, sans-serif';
    
    // Create header
    const header = document.createElement('div');
    header.innerHTML = '<h2 style="margin-top:0;">API Connection Diagnostics</h2>';
    ui.appendChild(header);
    
    // Create status display
    const statusDisplay = document.createElement('div');
    statusDisplay.className = 'status-display';
    statusDisplay.style.marginBottom = '20px';
    statusDisplay.style.padding = '15px';
    statusDisplay.style.backgroundColor = '#fff';
    statusDisplay.style.border = '1px solid #ddd';
    statusDisplay.style.borderRadius = '5px';
    
    statusDisplay.innerHTML = `
      <div><strong>Current API Endpoint:</strong> <span id="current-endpoint">${this.apiClient.baseURL}</span></div>
      <div><strong>Connection Status:</strong> <span id="connection-status">Checking...</span></div>
    `;
    ui.appendChild(statusDisplay);
    
    // Create actions
    const actions = document.createElement('div');
    actions.className = 'diagnostic-actions';
    actions.style.display = 'flex';
    actions.style.gap = '10px';
    actions.style.flexWrap = 'wrap';
    actions.style.marginBottom = '20px';
    
    // Run diagnostics button
    const runButton = document.createElement('button');
    runButton.innerText = 'Run Complete Diagnostics';
    runButton.style.padding = '10px 15px';
    runButton.style.backgroundColor = '#4a90e2';
    runButton.style.color = 'white';
    runButton.style.border = 'none';
    runButton.style.borderRadius = '4px';
    runButton.style.cursor = 'pointer';
    
    // Switch endpoint button
    const switchButton = document.createElement('button');
    switchButton.innerText = 'Use Best Working Endpoint';
    switchButton.style.padding = '10px 15px';
    switchButton.style.backgroundColor = '#4CAF50';
    switchButton.style.color = 'white';
    switchButton.style.border = 'none';
    switchButton.style.borderRadius = '4px';
    switchButton.style.cursor = 'pointer';
    
    actions.appendChild(runButton);
    actions.appendChild(switchButton);
    ui.appendChild(actions);
    
    // Create results container
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'diagnostics-results';
    resultsContainer.style.display = 'none';
    ui.appendChild(resultsContainer);
    
    // Add event listener for run diagnostics
    runButton.addEventListener('click', async () => {
      runButton.disabled = true;
      runButton.innerText = 'Running Diagnostics...';
      statusDisplay.querySelector('#connection-status').innerHTML = 'Checking...';
      resultsContainer.style.display = 'none';
      
      try {
        const results = await this.runDiagnostics();
        
        // Update status display
        if (results.overall.success) {
          statusDisplay.querySelector('#connection-status').innerHTML = 
            '<span style="color:green; font-weight:bold;">✅ Connected</span>';
        } else {
          statusDisplay.querySelector('#connection-status').innerHTML = 
            '<span style="color:red; font-weight:bold;">❌ Failed</span>';
        }
        
        statusDisplay.querySelector('#current-endpoint').innerText = this.apiClient.baseURL;
        
        // Display results
        resultsContainer.innerHTML = '';
        
        // Create summary
        const summary = document.createElement('div');
        summary.className = 'diagnostics-summary';
        summary.style.marginBottom = '20px';
        summary.style.padding = '15px';
        summary.style.backgroundColor = results.overall.success ? '#e7f9e7' : '#ffecec';
        summary.style.border = `1px solid ${results.overall.success ? '#c3e8c3' : '#f5c8c8'}`;
        summary.style.borderRadius = '5px';
        
        summary.innerHTML = `
          <h3 style="margin-top:0; color:${results.overall.success ? '#2e7d32' : '#c62828'}">
            ${results.overall.success ? '✅ API Connection Successful' : '❌ API Connection Failed'}
          </h3>
          <p><strong>Timestamp:</strong> ${new Date(results.timestamp).toLocaleString()}</p>
          ${results.overall.bestEndpoint ? 
            `<p><strong>Best Endpoint:</strong> ${results.overall.bestEndpoint.description} (${results.overall.bestEndpoint.url})</p>` :
            ''}
          <p><strong>Issues Found:</strong> ${results.overall.issues.length}</p>
        `;
        resultsContainer.appendChild(summary);
        
        // Create recommendations section
        if (results.recommendations && results.recommendations.length > 0) {
          const recommendations = document.createElement('div');
          recommendations.className = 'recommendations';
          recommendations.style.marginBottom = '20px';
          recommendations.style.padding = '15px';
          recommendations.style.backgroundColor = '#fff9e6';
          recommendations.style.border = '1px solid #ffe0b2';
          recommendations.style.borderRadius = '5px';
          
          recommendations.innerHTML = `
            <h3 style="margin-top:0; color:#f57c00;">Recommendations</h3>
            <ul style="margin-bottom:0;">
              ${results.recommendations.map(rec => `<li>${rec.replace(/\n/g, '<br>')}</li>`).join('')}
            </ul>
          `;
          resultsContainer.appendChild(recommendations);
        }
        
        // Create endpoint results table
        const endpointsSection = document.createElement('div');
        endpointsSection.innerHTML = '<h3>Endpoint Tests</h3>';
        
        const endpointsTable = document.createElement('table');
        endpointsTable.style.width = '100%';
        endpointsTable.style.borderCollapse = 'collapse';
        endpointsTable.style.marginBottom = '20px';
        
        // Add table header
        endpointsTable.innerHTML = `
          <thead>
            <tr style="background-color:#f0f0f0;">
              <th style="padding:10px; text-align:left; border:1px solid #ddd;">Endpoint</th>
              <th style="padding:10px; text-align:left; border:1px solid #ddd;">Status</th>
              <th style="padding:10px; text-align:left; border:1px solid #ddd;">Response Time</th>
              <th style="padding:10px; text-align:left; border:1px solid #ddd;">Details</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(results.endpoints).map(([url, result]) => `
              <tr>
                <td style="padding:10px; border:1px solid #ddd;">
                  ${this.endpoints.find(e => e.url === url)?.description || 'Unknown'}<br>
                  <small>${url}</small>
                </td>
                <td style="padding:10px; border:1px solid #ddd;">
                  ${result.success ? 
                    `<span style="color:green; font-weight:bold;">✅ Success</span>` : 
                    `<span style="color:red; font-weight:bold;">❌ Failed</span>`}
                  ${result.status ? `<br><small>${result.status} ${result.statusText || ''}</small>` : ''}
                </td>
                <td style="padding:10px; border:1px solid #ddd;">
                  ${result.responseTime !== null ? `${result.responseTime}ms` : 'N/A'}
                </td>
                <td style="padding:10px; border:1px solid #ddd;">
                  ${result.error ? `Error: ${result.error}` : result.success ? 'API responded successfully' : 'Request failed'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        `;
        
        endpointsSection.appendChild(endpointsTable);
        resultsContainer.appendChild(endpointsSection);
        
        // Create DNS check results
        const dnsSection = document.createElement('div');
        dnsSection.innerHTML = '<h3>DNS Resolution Tests</h3>';
        
        const dnsTable = document.createElement('table');
        dnsTable.style.width = '100%';
        dnsTable.style.borderCollapse = 'collapse';
        dnsTable.style.marginBottom = '20px';
        
        // Add DNS table content
        dnsTable.innerHTML = `
          <thead>
            <tr style="background-color:#f0f0f0;">
              <th style="padding:10px; text-align:left; border:1px solid #ddd;">Domain</th>
              <th style="padding:10px; text-align:left; border:1px solid #ddd;">Status</th>
              <th style="padding:10px; text-align:left; border:1px solid #ddd;">Response Time</th>
              <th style="padding:10px; text-align:left; border:1px solid #ddd;">Details</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(results.dnsCheck).map(([domain, result]) => `
              <tr>
                <td style="padding:10px; border:1px solid #ddd;">${domain}</td>
                <td style="padding:10px; border:1px solid #ddd;">
                  ${result.resolves ? 
                    `<span style="color:green; font-weight:bold;">✅ Resolves</span>` : 
                    `<span style="color:red; font-weight:bold;">❌ Failed</span>`}
                </td>
                <td style="padding:10px; border:1px solid #ddd;">
                  ${result.responseTime !== null ? `${result.responseTime}ms` : 'N/A'}
                </td>
                <td style="padding:10px; border:1px solid #ddd;">
                  ${result.error ? `Error: ${result.error}` : result.resolves ? 'Domain resolves correctly' : 'Domain resolution failed'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        `;
        
        dnsSection.appendChild(dnsTable);
        resultsContainer.appendChild(dnsSection);
        
        // Show the results container
        resultsContainer.style.display = 'block';
        
        // Update button
        runButton.disabled = false;
        runButton.innerText = 'Run Complete Diagnostics';
        
      } catch (error) {
        console.error('Diagnostics failed:', error);
        
        statusDisplay.querySelector('#connection-status').innerHTML = 
          '<span style="color:red; font-weight:bold;">❌ Error</span>';
          
        resultsContainer.innerHTML = `
          <div style="padding:15px; background-color:#ffecec; border:1px solid #f5c8c8; border-radius:5px;">
            <h3 style="margin-top:0; color:#c62828;">Diagnostics Error</h3>
            <p>${error.message || 'Unknown error occurred while running diagnostics'}</p>
          </div>
        `;
        resultsContainer.style.display = 'block';
        
        runButton.disabled = false;
        runButton.innerText = 'Run Complete Diagnostics';
      }
    });
    
    // Add event listener for switch endpoint
    switchButton.addEventListener('click', async () => {
      switchButton.disabled = true;
      switchButton.innerText = 'Switching...';
      
      try {
        const success = await this.switchToBestEndpoint();
        
        if (success) {
          statusDisplay.querySelector('#current-endpoint').innerText = this.apiClient.baseURL;
          statusDisplay.querySelector('#connection-status').innerHTML = 
            '<span style="color:green; font-weight:bold;">✅ Connected</span>';
            
          // Trigger an event that we switched endpoints
          const event = new CustomEvent('api:endpointSwitched', {
            detail: { baseURL: this.apiClient.baseURL }
          });
          window.dispatchEvent(event);
        } else {
          statusDisplay.querySelector('#connection-status').innerHTML = 
            '<span style="color:red; font-weight:bold;">❌ No working endpoint found</span>';
        }
      } catch (error) {
        console.error('Switch endpoint failed:', error);
        statusDisplay.querySelector('#connection-status').innerHTML = 
          '<span style="color:red; font-weight:bold;">❌ Error switching endpoint</span>';
      }
      
      switchButton.disabled = false;
      switchButton.innerText = 'Use Best Working Endpoint';
    });
    
    // Append to container if provided
    if (container) {
      container.appendChild(ui);
    }
    
    return ui;
  }
}

// Export to global scope
window.ApiDiagnostics = ApiDiagnostics;

// Create global instance for easy access
document.addEventListener('DOMContentLoaded', () => {
  if (window.railhubAPI) {
    window.apiDiagnostics = new ApiDiagnostics();
    console.log('API Diagnostics tool initialized');
  }
});
