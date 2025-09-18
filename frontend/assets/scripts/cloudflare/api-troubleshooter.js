/**
 * API Troubleshooter
 * 
 * This helper displays diagnostic information and tests connectivity
 */

document.addEventListener('DOMContentLoaded', function() {
  // Add the troubleshooter button
  const troubleshooterBtn = document.createElement('button');
  troubleshooterBtn.textContent = 'API Troubleshooter';
  troubleshooterBtn.id = 'api-troubleshooter-btn';
  troubleshooterBtn.style.position = 'fixed';
  troubleshooterBtn.style.bottom = '20px';
  troubleshooterBtn.style.right = '20px';
  troubleshooterBtn.style.zIndex = '9999';
  troubleshooterBtn.style.padding = '10px 15px';
  troubleshooterBtn.style.backgroundColor = '#444';
  troubleshooterBtn.style.color = '#fff';
  troubleshooterBtn.style.border = 'none';
  troubleshooterBtn.style.borderRadius = '5px';
  troubleshooterBtn.style.cursor = 'pointer';
  document.body.appendChild(troubleshooterBtn);
  
  // Create the troubleshooter dialog
  const troubleshooterDialog = document.createElement('div');
  troubleshooterDialog.id = 'api-troubleshooter-dialog';
  troubleshooterDialog.style.position = 'fixed';
  troubleshooterDialog.style.top = '50%';
  troubleshooterDialog.style.left = '50%';
  troubleshooterDialog.style.transform = 'translate(-50%, -50%)';
  troubleshooterDialog.style.backgroundColor = '#fff';
  troubleshooterDialog.style.padding = '20px';
  troubleshooterDialog.style.borderRadius = '8px';
  troubleshooterDialog.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
  troubleshooterDialog.style.zIndex = '10000';
  troubleshooterDialog.style.display = 'none';
  troubleshooterDialog.style.maxWidth = '80%';
  troubleshooterDialog.style.width = '600px';
  troubleshooterDialog.style.maxHeight = '80vh';
  troubleshooterDialog.style.overflow = 'auto';
  
  // Add content to dialog
  troubleshooterDialog.innerHTML = `
    <h2 style="margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">API Connection Troubleshooter</h2>
    
    <div style="margin-bottom: 20px;">
      <h3>Current API Settings</h3>
      <div id="api-settings"></div>
    </div>
    
    <div style="margin-bottom: 20px;">
      <h3>Connection Tests</h3>
      <div id="connection-tests">
        <button id="test-https">Test HTTPS</button>
        <button id="test-http">Test HTTP</button>
        <button id="test-dns">Test DNS</button>
        <button id="test-cf-worker">Test CF Worker</button>
      </div>
      <div id="connection-results" style="margin-top: 10px; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">
        No tests run yet
      </div>
    </div>
    
    <div style="margin-bottom: 20px;">
      <h3>Switch API Endpoint</h3>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
        <button id="use-https-main">Use HTTPS (Main Domain)</button>
        <button id="use-http-main">Use HTTP (Main Domain)</button>
        <button id="use-https-api">Use HTTPS (API Subdomain)</button>
        <button id="use-http-api">Use HTTP (API Subdomain)</button>
        <button id="use-localhost" style="grid-column: span 2;">Use Localhost (Development)</button>
      </div>
    </div>
    
    <div style="text-align: right; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
      <button id="close-troubleshooter">Close</button>
    </div>
  `;
  
  document.body.appendChild(troubleshooterDialog);
  
  // Add event listeners
  troubleshooterBtn.addEventListener('click', function() {
    troubleshooterDialog.style.display = 'block';
    
    // Update API settings display
    const apiSettings = document.getElementById('api-settings');
    const api = window.railhubAPI || new RailHubAPI();
    
    apiSettings.innerHTML = `
      <p><strong>Base URL:</strong> ${api.baseURL}</p>
      <p><strong>Authentication:</strong> ${api.token ? 'Token Present' : 'No Token'}</p>
    `;
  });
  
  document.getElementById('close-troubleshooter').addEventListener('click', function() {
    troubleshooterDialog.style.display = 'none';
  });
  
  // Test HTTPS
  document.getElementById('test-https').addEventListener('click', async function() {
    const resultsDiv = document.getElementById('connection-results');
    resultsDiv.innerHTML = 'Testing HTTPS connection...';
    
    try {
      const response = await fetch('https://api.railhubpictures.org/api/photos/latest', {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        timeout: 5000
      });
      
      if (response.ok) {
        resultsDiv.innerHTML = `✅ HTTPS connection successful! Status: ${response.status}`;
      } else {
        resultsDiv.innerHTML = `❌ HTTPS connection failed. Status: ${response.status} ${response.statusText}`;
      }
    } catch (error) {
      resultsDiv.innerHTML = `❌ HTTPS connection error: ${error.message}`;
    }
  });
  
  // Test HTTP
  document.getElementById('test-http').addEventListener('click', async function() {
    const resultsDiv = document.getElementById('connection-results');
    resultsDiv.innerHTML = 'Testing HTTP connection...';
    
    try {
      const response = await fetch('http://api.railhubpictures.org/api/photos/latest', {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        timeout: 5000
      });
      
      if (response.ok) {
        resultsDiv.innerHTML = `✅ HTTP connection successful! Status: ${response.status}`;
      } else {
        resultsDiv.innerHTML = `❌ HTTP connection failed. Status: ${response.status} ${response.statusText}`;
      }
    } catch (error) {
      resultsDiv.innerHTML = `❌ HTTP connection error: ${error.message}`;
    }
  });
  
  // Test DNS
  document.getElementById('test-dns').addEventListener('click', async function() {
    const resultsDiv = document.getElementById('connection-results');
    resultsDiv.innerHTML = 'Testing DNS resolution...';
    
    if (window.dnsChecker) {
      try {
        const results = await window.dnsChecker.checkDomains();
        let output = '<h4>DNS Resolution Results:</h4><ul>';
        
        for (const domain in results) {
          const result = results[domain];
          if (result.reachable) {
            output += `<li>${domain}: ✅ Reachable (${result.responseTime}ms via ${result.protocol})</li>`;
          } else {
            output += `<li>${domain}: ❌ Not reachable (${result.error})</li>`;
          }
        }
        
        output += '</ul>';
        resultsDiv.innerHTML = output;
      } catch (error) {
        resultsDiv.innerHTML = `Error running DNS tests: ${error.message}`;
      }
    } else {
      resultsDiv.innerHTML = 'DNS Checker not available. Make sure dns-checker.js is loaded.';
    }
  });
  
  // Use HTTPS (Main Domain) - RECOMMENDED
  document.getElementById('use-https-main').addEventListener('click', function() {
    const api = window.railhubAPI || new RailHubAPI();
    api.baseURL = 'https://railhubpictures.org/api/';
    localStorage.setItem('api_base_url', api.baseURL);
    
    // Update display
    document.getElementById('api-settings').innerHTML = `
      <p><strong>Base URL:</strong> ${api.baseURL}</p>
      <p><strong>Authentication:</strong> ${api.token ? 'Token Present' : 'No Token'}</p>
      <p style="color: green;">✅ Switched to HTTPS protocol on main domain (recommended)</p>
    `;
  });
  
  // Use HTTP (Main Domain)
  document.getElementById('use-http-main').addEventListener('click', function() {
    const api = window.railhubAPI || new RailHubAPI();
    api.baseURL = 'http://railhubpictures.org/api/';
    localStorage.setItem('api_base_url', api.baseURL);
    
    // Update display
    document.getElementById('api-settings').innerHTML = `
      <p><strong>Base URL:</strong> ${api.baseURL}</p>
      <p><strong>Authentication:</strong> ${api.token ? 'Token Present' : 'No Token'}</p>
      <p style="color: green;">✅ Switched to HTTP protocol on main domain</p>
    `;
  });
  
  // Use HTTPS (API Subdomain) - THROWING WORKER ERROR
  document.getElementById('use-https-api').addEventListener('click', function() {
    const api = window.railhubAPI || new RailHubAPI();
    api.baseURL = 'https://api.railhubpictures.org/api/';
    localStorage.setItem('api_base_url', api.baseURL);
    
    // Update display
    document.getElementById('api-settings').innerHTML = `
      <p><strong>Base URL:</strong> ${api.baseURL}</p>
      <p><strong>Authentication:</strong> ${api.token ? 'Token Present' : 'No Token'}</p>
      <p style="color: red;">❌ Switched to HTTPS protocol on API subdomain (throwing Worker error 1101)</p>
      <p style="color: #666; font-size: 0.9em;">Note: The API subdomain is resolving but the Worker is throwing an error. Use main domain path instead.</p>
    `;
  });
  
  // Use HTTP (API Subdomain)
  document.getElementById('use-http-api').addEventListener('click', function() {
    const api = window.railhubAPI || new RailHubAPI();
    api.baseURL = 'http://api.railhubpictures.org/api/';
    localStorage.setItem('api_base_url', api.baseURL);
    
    // Update display
    document.getElementById('api-settings').innerHTML = `
      <p><strong>Base URL:</strong> ${api.baseURL}</p>
      <p><strong>Authentication:</strong> ${api.token ? 'Token Present' : 'No Token'}</p>
      <p style="color: blue;">ℹ️ Switched to HTTP protocol on API subdomain</p>
    `;
  });
  
  // Use Localhost (Development)
  document.getElementById('use-localhost').addEventListener('click', function() {
    const api = window.railhubAPI || new RailHubAPI();
    api.baseURL = 'http://localhost:8787/api/';
    localStorage.setItem('api_base_url', api.baseURL);
    
    // Update display
    document.getElementById('api-settings').innerHTML = `
      <p><strong>Base URL:</strong> ${api.baseURL}</p>
      <p><strong>Authentication:</strong> ${api.token ? 'Token Present' : 'No Token'}</p>
      <p style="color: blue;">ℹ️ Switched to localhost (development mode)</p>
    `;
  });
  
  // Test CF Worker
  document.getElementById('test-cf-worker').addEventListener('click', async function() {
    const resultsDiv = document.getElementById('connection-results');
    resultsDiv.innerHTML = '<p>Testing Cloudflare Worker deployment...</p>';
    
    if (window.cfWorkerChecker) {
      try {
        resultsDiv.innerHTML += '<p>This may take a few moments...</p>';
        const results = await window.cfWorkerChecker.checkWorker();
        
        let output = '<h4>Cloudflare Worker Results:</h4>';
        let foundWorkingEndpoint = false;
        
        for (const endpoint in results) {
          const result = results[endpoint];
          output += `<div style="margin-bottom: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">`;
          output += `<strong>Endpoint:</strong> ${endpoint}<br>`;
          
          if (result.success) {
            foundWorkingEndpoint = true;
            output += `<span style="color: green;">✅ Success (${result.status} ${result.statusText})</span><br>`;
            output += `<strong>Response Time:</strong> ${result.responseTime}ms<br>`;
            
            if (result.headers) {
              output += `<details><summary><strong>Headers</strong></summary><pre style="font-size: 12px; overflow: auto; max-height: 200px;">${JSON.stringify(result.headers, null, 2)}</pre></details>`;
            }
            
            if (result.body) {
              output += `<details><summary><strong>Body</strong></summary><pre style="font-size: 12px; overflow: auto; max-height: 200px;">${typeof result.body === 'object' ? JSON.stringify(result.body, null, 2) : result.body}</pre></details>`;
            }
          } else {
            output += `<span style="color: red;">❌ Failed: ${result.error || result.statusText}</span><br>`;
          }
          
          output += `</div>`;
        }
        
        if (foundWorkingEndpoint) {
          output += `<p style="color: green; font-weight: bold;">✅ Cloudflare Worker is deployed and responding on at least one endpoint!</p>`;
        } else {
          output += `<p style="color: red; font-weight: bold;">❌ Cloudflare Worker is not responding on any endpoint.</p>`;
          output += `<p>Possible issues:</p>`;
          output += `<ul>`;
          output += `<li>Worker not deployed correctly</li>`;
          output += `<li>DNS not configured to point to the Worker</li>`;
          output += `<li>CORS policy blocking requests</li>`;
          output += `<li>Worker crashed or has errors</li>`;
          output += `</ul>`;
        }
        
        resultsDiv.innerHTML = output;
      } catch (error) {
        resultsDiv.innerHTML = `Error testing Cloudflare Worker: ${error.message}`;
      }
    } else {
      resultsDiv.innerHTML = 'Cloudflare Worker Checker not available. Make sure cf-worker-checker.js is loaded.';
    }
  });
});
