/**
 * API Authentication Test Script
 * This script will directly test the API endpoints to diagnose authentication issues
 */

// Debug information container
const debugInfo = {
  apiBaseUrl: 'https://railhubpictures.org',
  token: null,
  userId: null,
  requestHeaders: {},
  responseData: {}
};

// Create a debug UI container
function createDebugUI() {
  // Check if UI already exists
  if (document.getElementById('api-auth-debug')) {
    return;
  }

  // Create UI elements
  const debugContainer = document.createElement('div');
  debugContainer.id = 'api-auth-debug';
  debugContainer.style.position = 'fixed';
  debugContainer.style.top = '50%';
  debugContainer.style.left = '50%';
  debugContainer.style.transform = 'translate(-50%, -50%)';
  debugContainer.style.backgroundColor = '#fff';
  debugContainer.style.padding = '20px';
  debugContainer.style.borderRadius = '8px';
  debugContainer.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
  debugContainer.style.zIndex = '10000';
  debugContainer.style.maxWidth = '800px';
  debugContainer.style.width = '90%';
  debugContainer.style.maxHeight = '80vh';
  debugContainer.style.overflow = 'auto';

  debugContainer.innerHTML = `
    <h2 style="margin-top: 0; margin-bottom: 20px;">API Authentication Debugger</h2>
    
    <div style="display: flex; margin-bottom: 20px;">
      <div style="flex: 1; padding-right: 20px;">
        <h3>Current Configuration</h3>
        <div id="config-info" style="background: #f5f5f5; padding: 10px; border-radius: 4px;">Loading...</div>
        
        <h3 style="margin-top: 20px;">Actions</h3>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button id="test-auth-btn" style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">Test Authentication</button>
          <button id="test-profile-btn" style="padding: 8px 16px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">Test Profile API</button>
          <button id="fix-auth-btn" style="padding: 8px 16px; background: #FF9800; color: white; border: none; border-radius: 4px; cursor: pointer;">Apply Auth Fix</button>
          <button id="debug-mode-btn" style="padding: 8px 16px; background: #9C27B0; color: white; border: none; border-radius: 4px; cursor: pointer;">Enable Debug Mode</button>
        </div>
      </div>
      
      <div style="flex: 1; padding-left: 20px; border-left: 1px solid #eee;">
        <h3>Results</h3>
        <div id="result-container" style="background: #f5f5f5; padding: 10px; border-radius: 4px; max-height: 300px; overflow: auto;">
          <div style="color: #666;">No tests run yet</div>
        </div>
      </div>
    </div>
    
    <h3>API Response</h3>
    <pre id="api-response" style="background: #f5f5f5; padding: 10px; border-radius: 4px; max-height: 200px; overflow: auto; white-space: pre-wrap;">No API response yet</pre>
    
    <div style="margin-top: 20px; text-align: right;">
      <button id="close-debug-btn" style="padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
    </div>
  `;

  // Create overlay
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
  overlay.style.zIndex = '9999';

  // Add to document
  document.body.appendChild(overlay);
  document.body.appendChild(debugContainer);

  // Add event listeners
  document.getElementById('close-debug-btn').addEventListener('click', () => {
    document.body.removeChild(overlay);
    document.body.removeChild(debugContainer);
  });

  document.getElementById('test-auth-btn').addEventListener('click', testAuthentication);
  document.getElementById('test-profile-btn').addEventListener('click', testProfileAPI);
  document.getElementById('fix-auth-btn').addEventListener('click', applyAuthFix);
  document.getElementById('debug-mode-btn').addEventListener('click', toggleDebugMode);

  // Initial load of config info
  loadConfigInfo();
}

// Load and display configuration info
async function loadConfigInfo() {
  const configInfo = document.getElementById('config-info');
  
  try {
    // Check for Clerk
    const clerkAvailable = !!window.Clerk;
    let userInfo = 'Not signed in';
    let tokenAvailable = false;
    
    if (clerkAvailable && window.Clerk.user) {
      userInfo = `Signed in as: ${window.Clerk.user.primaryEmailAddress?.emailAddress || 'Unknown'}`;
      
      try {
        const token = await window.Clerk.session.getToken();
        tokenAvailable = !!token;
        debugInfo.token = token;
        if (token) {
          debugInfo.userId = window.Clerk.user.id;
        }
      } catch (error) {
        console.error('Error getting token:', error);
      }
    }
    
    // Check for API configuration
    const apiConfig = window.API_CONFIG || { BASE_URL: 'Unknown' };
    
    configInfo.innerHTML = `
      <div><strong>Clerk Status:</strong> ${clerkAvailable ? 'Available' : 'Not Available'}</div>
      <div><strong>User:</strong> ${userInfo}</div>
      <div><strong>Auth Token:</strong> ${tokenAvailable ? 'Available' : 'Not Available'}</div>
      <div><strong>API Base URL:</strong> ${apiConfig.BASE_URL}</div>
      <div><strong>Debug Mode:</strong> ${apiConfig.DEBUG ? 'Enabled' : 'Disabled'}</div>
    `;
  } catch (error) {
    configInfo.innerHTML = `<div style="color: red;">Error loading configuration: ${error.message}</div>`;
  }
}

// Test authentication
async function testAuthentication() {
  const resultContainer = document.getElementById('result-container');
  const apiResponse = document.getElementById('api-response');
  
  resultContainer.innerHTML = '<div style="color: #2196F3;">Testing authentication...</div>';
  
  try {
    const token = await getAuthToken();
    
    if (!token) {
      resultContainer.innerHTML += `<div style="color: red;">No authentication token available. Please make sure you're logged in.</div>`;
      return;
    }
    
    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    debugInfo.requestHeaders = headers;
    
    // Make request to auth test endpoint
    resultContainer.innerHTML += `<div>Sending request to auth test endpoint...</div>`;
    
    const response = await fetch(`${debugInfo.apiBaseUrl}/api/auth/test`, {
      method: 'GET',
      headers
    });
    
    const data = await response.json();
    debugInfo.responseData = data;
    
    // Display result
    resultContainer.innerHTML += `<div style="color: ${data.authenticated ? 'green' : 'red'}">
      Authentication ${data.authenticated ? 'Successful' : 'Failed'}
    </div>`;
    
    if (!data.authenticated) {
      resultContainer.innerHTML += `<div style="color: orange;">Error: ${data.error || 'Unknown error'}</div>`;
    }
    
    // Update API response display
    apiResponse.textContent = JSON.stringify(data, null, 2);
    
  } catch (error) {
    resultContainer.innerHTML += `<div style="color: red;">Error testing authentication: ${error.message}</div>`;
    console.error('Auth test error:', error);
  }
}

// Test profile API
async function testProfileAPI() {
  const resultContainer = document.getElementById('result-container');
  const apiResponse = document.getElementById('api-response');
  
  resultContainer.innerHTML = '<div style="color: #2196F3;">Testing profile API...</div>';
  
  try {
    const token = await getAuthToken();
    
    if (!token) {
      resultContainer.innerHTML += `<div style="color: red;">No authentication token available. Please make sure you're logged in.</div>`;
      return;
    }
    
    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    debugInfo.requestHeaders = headers;
    
    // Make request to profile API
    resultContainer.innerHTML += `<div>Sending request to profile API...</div>`;
    
    // Try both with and without debug parameters
    let response = await fetch(`${debugInfo.apiBaseUrl}/api/profile`, {
      method: 'GET',
      headers
    });
    
    // If first attempt fails, try with debug parameter
    if (!response.ok) {
      resultContainer.innerHTML += `<div style="color: orange;">First attempt failed with status ${response.status}. Trying with debug parameters...</div>`;
      
      response = await fetch(`${debugInfo.apiBaseUrl}/api/profile?debug_auth=true&user_id=${debugInfo.userId || 'unknown'}`, {
        method: 'GET',
        headers
      });
    }
    
    const data = await response.json();
    debugInfo.responseData = data;
    
    // Display result
    if (response.ok) {
      resultContainer.innerHTML += `<div style="color: green;">Profile API request successful!</div>`;
    } else {
      resultContainer.innerHTML += `<div style="color: red;">Profile API request failed with status: ${response.status}</div>`;
      
      if (data.error) {
        resultContainer.innerHTML += `<div style="color: orange;">Error: ${data.error}</div>`;
      }
    }
    
    // Update API response display
    apiResponse.textContent = JSON.stringify(data, null, 2);
    
  } catch (error) {
    resultContainer.innerHTML += `<div style="color: red;">Error testing profile API: ${error.message}</div>`;
    console.error('Profile API test error:', error);
  }
}

// Apply authentication fix
async function applyAuthFix() {
  const resultContainer = document.getElementById('result-container');
  
  resultContainer.innerHTML = '<div style="color: #2196F3;">Applying authentication fix...</div>';
  
  try {
    // Fix 1: Ensure API_CONFIG is set properly
    window.API_CONFIG = {
      BASE_URL: 'https://railhubpictures.org',
      DEBUG: true
    };
    
    resultContainer.innerHTML += `<div>Fix 1: Set API_CONFIG.BASE_URL to ${window.API_CONFIG.BASE_URL}</div>`;
    
    // Fix 2: Reload Clerk scripts
    resultContainer.innerHTML += `<div>Fix 2: Reloading Clerk authentication...</div>`;
    
    // This will work if Clerk is already available
    if (window.Clerk) {
      await window.Clerk.load({
        // Force reload Clerk
        appearance: {
          variables: { colorPrimary: window.Clerk.appearance?.variables?.colorPrimary || '#667eea' }
        }
      });
      
      resultContainer.innerHTML += `<div style="color: green;">Clerk reloaded successfully</div>`;
    } else {
      resultContainer.innerHTML += `<div style="color: orange;">Clerk not available, cannot reload</div>`;
    }
    
    // Fix 3: Add a debugger URL parameter for future API calls
    resultContainer.innerHTML += `<div>Fix 3: Enabling debug mode for API calls</div>`;
    window.API_CONFIG.DEBUG = true;
    
    // Update config display
    loadConfigInfo();
    
    resultContainer.innerHTML += `<div style="color: green; margin-top: 10px; font-weight: bold;">All fixes applied. Please try accessing your profile again.</div>`;
    
    // Run a test after applying fixes
    setTimeout(testAuthentication, 1000);
    
  } catch (error) {
    resultContainer.innerHTML += `<div style="color: red;">Error applying fixes: ${error.message}</div>`;
    console.error('Fix application error:', error);
  }
}

// Toggle debug mode
function toggleDebugMode() {
  const resultContainer = document.getElementById('result-container');
  
  try {
    if (!window.API_CONFIG) {
      window.API_CONFIG = {
        BASE_URL: 'https://railhubpictures.org',
        DEBUG: true
      };
      resultContainer.innerHTML = '<div>Created API_CONFIG with DEBUG=true</div>';
    } else {
      window.API_CONFIG.DEBUG = !window.API_CONFIG.DEBUG;
      resultContainer.innerHTML = `<div>Toggled DEBUG mode: ${window.API_CONFIG.DEBUG ? 'ON' : 'OFF'}</div>`;
    }
    
    // Update config display
    loadConfigInfo();
  } catch (error) {
    resultContainer.innerHTML += `<div style="color: red;">Error toggling debug mode: ${error.message}</div>`;
  }
}

// Helper function to get auth token
async function getAuthToken() {
  if (!window.Clerk || !window.Clerk.session) {
    console.error('Clerk not available or user not signed in');
    return null;
  }
  
  try {
    return await window.Clerk.session.getToken();
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

// Add a button to open the debugger
function addDebuggerButton() {
  const button = document.createElement('button');
  button.textContent = '🔍 Debug API';
  button.style.position = 'fixed';
  button.style.bottom = '20px';
  button.style.left = '20px';
  button.style.padding = '10px 15px';
  button.style.backgroundColor = '#2196F3';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';
  button.style.zIndex = '9999';
  button.style.fontWeight = 'bold';
  button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
  
  button.addEventListener('click', createDebugUI);
  
  document.body.appendChild(button);
}

// Initialize the script
document.addEventListener('DOMContentLoaded', () => {
  console.log('API Authentication Debug Tool loaded');
  
  // Add the debug button after a short delay
  setTimeout(addDebuggerButton, 1000);
});

// Expose the API for console usage
window.apiAuthDebugger = {
  showDebugger: createDebugUI,
  testAuth: testAuthentication,
  testProfile: testProfileAPI,
  applyFix: applyAuthFix,
  toggleDebug: toggleDebugMode
};