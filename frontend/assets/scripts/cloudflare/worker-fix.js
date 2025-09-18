/**
 * Cloudflare Worker API Fix
 * This script helps identify and fix common issues with Cloudflare Workers API
 * 
 * Based on the test results showing:
 * - Main domain HTTPS responding at base URL but not /api path
 * - API subdomain not responding
 * - HTTP connections not working
 */

document.addEventListener('DOMContentLoaded', function() {
  // Create UI container
  const container = document.createElement('div');
  container.id = 'worker-fix-container';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.maxWidth = '800px';
  container.style.margin = '20px auto';
  container.style.padding = '20px';
  container.style.backgroundColor = '#f5f5f5';
  container.style.borderRadius = '5px';
  container.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  
  // Add title
  const title = document.createElement('h1');
  title.textContent = 'RailHub Pictures API Fix';
  title.style.color = '#333';
  title.style.marginTop = '0';
  container.appendChild(title);
  
  // Add description
  const description = document.createElement('p');
  description.textContent = 'This tool will help diagnose and fix issues with your Cloudflare Worker API configuration.';
  container.appendChild(description);
  
  // Create status section
  const statusSection = document.createElement('div');
  statusSection.style.backgroundColor = '#fff';
  statusSection.style.padding = '15px';
  statusSection.style.borderRadius = '5px';
  statusSection.style.marginBottom = '20px';
  statusSection.style.border = '1px solid #ddd';
  
  // Current status
  const statusTitle = document.createElement('h2');
  statusTitle.textContent = 'Current API Status';
  statusTitle.style.marginTop = '0';
  statusSection.appendChild(statusTitle);
  
  // API endpoint info
  const endpointInfo = document.createElement('div');
  endpointInfo.innerHTML = `
    <p><strong>Base URL:</strong> <span id="current-base-url">${window.railhubAPI?.baseURL || 'Not initialized'}</span></p>
    <p><strong>Authentication:</strong> <span id="auth-status">${window.railhubAPI?.isAuthenticated() ? 'Token Present' : 'Not Authenticated'}</span></p>
    <p><strong>Connection Status:</strong> <span id="connection-status">Checking...</span></p>
  `;
  statusSection.appendChild(endpointInfo);
  
  container.appendChild(statusSection);
  
  // Create issues section
  const issuesSection = document.createElement('div');
  issuesSection.style.backgroundColor = '#fff';
  issuesSection.style.padding = '15px';
  issuesSection.style.borderRadius = '5px';
  issuesSection.style.marginBottom = '20px';
  issuesSection.style.border = '1px solid #ddd';
  
  const issuesTitle = document.createElement('h2');
  issuesTitle.textContent = 'Identified Issues';
  issuesTitle.style.marginTop = '0';
  issuesSection.appendChild(issuesTitle);
  
  const issuesList = document.createElement('ul');
  issuesList.id = 'issues-list';
  issuesList.innerHTML = '<li>Checking for issues...</li>';
  issuesSection.appendChild(issuesList);
  
  container.appendChild(issuesSection);
  
  // Create solutions section
  const solutionsSection = document.createElement('div');
  solutionsSection.style.backgroundColor = '#fff';
  solutionsSection.style.padding = '15px';
  solutionsSection.style.borderRadius = '5px';
  solutionsSection.style.marginBottom = '20px';
  solutionsSection.style.border = '1px solid #ddd';
  
  const solutionsTitle = document.createElement('h2');
  solutionsTitle.textContent = 'Recommended Solutions';
  solutionsTitle.style.marginTop = '0';
  solutionsSection.appendChild(solutionsTitle);
  
  // Code blocks for solutions
  const wranglerConfig = document.createElement('div');
  wranglerConfig.innerHTML = `
    <h3>1. Update wrangler.toml</h3>
    <p>Ensure your wrangler.toml includes these routes:</p>
    <pre style="background:#f1f1f1; padding:10px; border-radius:4px; overflow-x:auto;">[[routes]]
pattern = "api.railhubpictures.org/*"
zone_name = "railhubpictures.org"

[[routes]]
pattern = "railhubpictures.org/api/*"
zone_name = "railhubpictures.org"

[[routes]]
pattern = "railhub-api.railhubpictures.org/*"
zone_name = "railhubpictures.org"</pre>
  `;
  solutionsSection.appendChild(wranglerConfig);
  
  const workerCode = document.createElement('div');
  workerCode.innerHTML = `
    <h3>2. Fix worker.js path handling</h3>
    <p>Add this code to your worker.js file just after you get the URL and pathname:</p>
    <pre style="background:#f1f1f1; padding:10px; border-radius:4px; overflow-x:auto;">// Get URL and pathname
const url = new URL(request.url);
let pathname = url.pathname;

// Handle requests from api.railhubpictures.org or railhub-api.railhubpictures.org
const host = url.hostname;
if ((host === 'api.railhubpictures.org' || host === 'railhub-api.railhubpictures.org') && !pathname.startsWith('/api/')) {
  // Remove leading slash if exists and prepend /api/ to ensure consistency
  pathname = '/api/' + pathname.replace(/^\//, '');
}</pre>
  `;
  solutionsSection.appendChild(workerCode);
  
  const dnsSettings = document.createElement('div');
  dnsSettings.innerHTML = `
    <h3>3. Check DNS Settings</h3>
    <p>Verify these DNS records in your Cloudflare dashboard:</p>
    <ul>
      <li><strong>api.railhubpictures.org</strong> - CNAME to your Cloudflare Workers subdomain or properly configured A record</li>
      <li><strong>railhub-api.railhubpictures.org</strong> - CNAME to your Cloudflare Workers subdomain or properly configured A record</li>
    </ul>
  `;
  solutionsSection.appendChild(dnsSettings);
  
  const deploymentSection = document.createElement('div');
  deploymentSection.innerHTML = `
    <h3>4. Re-deploy your worker</h3>
    <p>Deploy your updated worker with:</p>
    <pre style="background:#f1f1f1; padding:10px; border-radius:4px; overflow-x:auto;">cd backend
npx wrangler deploy</pre>
  `;
  solutionsSection.appendChild(deploymentSection);
  
  container.appendChild(solutionsSection);
  
  // Create action buttons
  const actionsSection = document.createElement('div');
  actionsSection.style.display = 'flex';
  actionsSection.style.gap = '10px';
  actionsSection.style.marginTop = '20px';
  
  const testButton = document.createElement('button');
  testButton.textContent = 'Test API Connection';
  testButton.style.padding = '10px 20px';
  testButton.style.backgroundColor = '#007bff';
  testButton.style.color = 'white';
  testButton.style.border = 'none';
  testButton.style.borderRadius = '5px';
  testButton.style.cursor = 'pointer';
  testButton.addEventListener('click', runDiagnostics);
  actionsSection.appendChild(testButton);
  
  const fixButton = document.createElement('button');
  fixButton.textContent = 'Apply Frontend Fix';
  fixButton.style.padding = '10px 20px';
  fixButton.style.backgroundColor = '#28a745';
  fixButton.style.color = 'white';
  fixButton.style.border = 'none';
  fixButton.style.borderRadius = '5px';
  fixButton.style.cursor = 'pointer';
  fixButton.addEventListener('click', applyFrontendFix);
  actionsSection.appendChild(fixButton);
  
  container.appendChild(actionsSection);
  
  // Add to page
  document.body.appendChild(container);
  
  // Run initial tests
  setTimeout(runDiagnostics, 1000);
  
  // Test the API connection and identify issues
  async function runDiagnostics() {
    const connectionStatus = document.getElementById('connection-status');
    const issuesList = document.getElementById('issues-list');
    const baseUrlElement = document.getElementById('current-base-url');
    
    connectionStatus.textContent = 'Testing...';
    connectionStatus.style.color = 'orange';
    issuesList.innerHTML = '<li>Running diagnostics...</li>';
    baseUrlElement.textContent = window.railhubAPI?.baseURL || 'Not initialized';
    
    try {
      // Test direct API access
      let apiWorking = false;
      try {
        const testResponse = await fetch(`${window.railhubAPI.baseURL}/photos/latest`, {
          headers: { 'Accept': 'application/json' },
          method: 'GET',
          cache: 'no-cache'
        });
        
        apiWorking = testResponse.ok;
        connectionStatus.textContent = apiWorking ? 'Connected' : `Failed (${testResponse.status})`;
        connectionStatus.style.color = apiWorking ? 'green' : 'red';
      } catch (e) {
        connectionStatus.textContent = `Error: ${e.message}`;
        connectionStatus.style.color = 'red';
      }
      
      // Test all endpoints
      const testResults = await window.railhubAPI.testConnection();
      
      // Identify issues
      const issues = [];
      
      if (!testResults.success) {
        issues.push('No API endpoints are working properly.');
      }
      
      if (!testResults.results.some(r => r.endpoint.url.includes('api.railhubpictures.org') && r.success)) {
        issues.push('API subdomain (api.railhubpictures.org) is not responding correctly.');
      }
      
      if (!testResults.results.some(r => r.endpoint.url.includes('railhub-api.railhubpictures.org') && r.success)) {
        issues.push('Direct worker URL (railhub-api.railhubpictures.org) is not responding correctly.');
      }
      
      if (!testResults.results.some(r => r.endpoint.url.includes('/api') && r.success)) {
        issues.push('API path on main domain (/api) is not configured correctly in worker routes.');
      }
      
      if (issues.length === 0) {
        issues.push('No critical issues detected.');
      }
      
      // Update issues list
      issuesList.innerHTML = issues.map(issue => `<li>${issue}</li>`).join('');
    } catch (error) {
      connectionStatus.textContent = 'Error running diagnostics';
      connectionStatus.style.color = 'red';
      issuesList.innerHTML = `<li>Error: ${error.message}</li>`;
    }
  }
  
  // Apply frontend workarounds
  function applyFrontendFix() {
    // Use the HTTP version of the main domain as it's most likely to work based on test results
    window.railhubAPI.baseURL = 'http://railhubpictures.org/api/';
    localStorage.setItem('api_base_url', window.railhubAPI.baseURL);
    
    // Update UI
    const baseUrlElement = document.getElementById('current-base-url');
    baseUrlElement.textContent = window.railhubAPI.baseURL;
    
    alert('Applied frontend fix! Using HTTP main domain with path workaround. This is a temporary solution until the Cloudflare Worker is properly configured.');
    
    // Refresh connection status
    runDiagnostics();
  }
});
