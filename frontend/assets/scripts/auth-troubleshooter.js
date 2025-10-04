/**
 * Auth Troubleshooter Script
 * This script will help diagnose authentication issues with the Railhub Pictures API
 */

// Initialize the troubleshooter when the page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔍 Auth Troubleshooter: Initializing');
  
  // Add the troubleshooter button to the page
  addTroubleshooterButton();
  
  // Start automatic checks after a delay
  setTimeout(() => {
    runAutomaticChecks();
  }, 2000);
});

// Add a floating troubleshooter button to the page
function addTroubleshooterButton() {
  const button = document.createElement('button');
  button.textContent = '🔧 Auth Fix';
  button.style.position = 'fixed';
  button.style.bottom = '20px';
  button.style.right = '20px';
  button.style.padding = '10px 15px';
  button.style.backgroundColor = '#f44336';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';
  button.style.zIndex = '9999';
  button.style.fontWeight = 'bold';
  button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
  
  button.addEventListener('click', () => {
    showTroubleshooterDialog();
  });
  
  document.body.appendChild(button);
}

// Show the troubleshooter dialog
function showTroubleshooterDialog() {
  // Create the dialog
  const dialog = document.createElement('div');
  dialog.style.position = 'fixed';
  dialog.style.top = '50%';
  dialog.style.left = '50%';
  dialog.style.transform = 'translate(-50%, -50%)';
  dialog.style.backgroundColor = 'white';
  dialog.style.padding = '20px';
  dialog.style.borderRadius = '8px';
  dialog.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
  dialog.style.zIndex = '10000';
  dialog.style.maxWidth = '600px';
  dialog.style.width = '90%';
  dialog.style.maxHeight = '80vh';
  dialog.style.overflow = 'auto';
  
  dialog.innerHTML = `
    <h2 style="margin-top: 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Auth Troubleshooter</h2>
    <div id="troubleshooter-status">
      <p>Running checks...</p>
      <div style="display: flex; justify-content: center; margin: 20px 0;">
        <div style="width: 40px; height: 40px; border: 5px solid #f3f3f3; border-top: 5px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </div>
    <div id="troubleshooter-actions" style="margin-top: 20px; display: none;">
      <button id="fix-auth" style="background-color: #4CAF50; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">Fix Authentication</button>
      <button id="test-api" style="background-color: #2196F3; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">Test API</button>
      <button id="close-dialog" style="background-color: #f44336; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;">Close</button>
    </div>
  `;
  
  document.body.appendChild(dialog);
  
  // Run the checks
  runDiagnostics(dialog);
  
  // Add event listeners to buttons
  setTimeout(() => {
    const actionsDiv = dialog.querySelector('#troubleshooter-actions');
    actionsDiv.style.display = 'block';
    
    dialog.querySelector('#fix-auth').addEventListener('click', fixAuthentication);
    dialog.querySelector('#test-api').addEventListener('click', testApi);
    dialog.querySelector('#close-dialog').addEventListener('click', () => {
      document.body.removeChild(dialog);
    });
  }, 2000);
  
  // Add overlay
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
  overlay.style.zIndex = '9999';
  
  overlay.addEventListener('click', () => {
    document.body.removeChild(dialog);
    document.body.removeChild(overlay);
  });
  
  document.body.appendChild(overlay);
}

// Run diagnostics
async function runDiagnostics(dialog) {
  const statusDiv = dialog.querySelector('#troubleshooter-status');
  
  // Check if Clerk is available
  const clerkAvailable = window.Clerk !== undefined;
  let clerkReady = false;
  let userSignedIn = false;
  let tokenAvailable = false;
  
  statusDiv.innerHTML = '<h3>Running Checks...</h3>';
  
  // Check if Clerk is loaded
  statusDiv.innerHTML += `
    <p>✅ Clerk script loaded: ${clerkAvailable ? 'Yes' : 'No'}</p>
  `;
  
  // Wait for Clerk to be ready
  if (clerkAvailable) {
    statusDiv.innerHTML += `<p>⏳ Checking if Clerk is ready...</p>`;
    
    try {
      if (window.Clerk.isReady) {
        clerkReady = true;
        statusDiv.innerHTML = statusDiv.innerHTML.replace('⏳ Checking if Clerk is ready...', '✅ Clerk is ready');
      } else {
        statusDiv.innerHTML = statusDiv.innerHTML.replace('⏳ Checking if Clerk is ready...', '❌ Clerk is not ready');
      }
    } catch (error) {
      statusDiv.innerHTML = statusDiv.innerHTML.replace('⏳ Checking if Clerk is ready...', `❌ Error checking Clerk: ${error.message}`);
    }
  }
  
  // Check if user is signed in
  if (clerkReady) {
    statusDiv.innerHTML += `<p>⏳ Checking if user is signed in...</p>`;
    
    try {
      userSignedIn = window.Clerk.user !== null;
      statusDiv.innerHTML = statusDiv.innerHTML.replace(
        '⏳ Checking if user is signed in...', 
        userSignedIn ? `✅ User is signed in (${window.Clerk.user.primaryEmailAddress.emailAddress})` : '❌ User is not signed in'
      );
    } catch (error) {
      statusDiv.innerHTML = statusDiv.innerHTML.replace('⏳ Checking if user is signed in...', `❌ Error checking user: ${error.message}`);
    }
  }
  
  // Check if token is available
  if (userSignedIn) {
    statusDiv.innerHTML += `<p>⏳ Checking if auth token is available...</p>`;
    
    try {
      const token = await window.Clerk.session.getToken();
      tokenAvailable = token !== null && token !== undefined;
      statusDiv.innerHTML = statusDiv.innerHTML.replace(
        '⏳ Checking if auth token is available...', 
        tokenAvailable ? '✅ Auth token is available' : '❌ Auth token is not available'
      );
    } catch (error) {
      statusDiv.innerHTML = statusDiv.innerHTML.replace('⏳ Checking if auth token is available...', `❌ Error getting token: ${error.message}`);
    }
  }
  
  // Check API debug endpoint
  statusDiv.innerHTML += `<p>⏳ Testing API debug endpoint...</p>`;
  
  try {
    const response = await fetch('https://railhubpictures.org/api/debug', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    statusDiv.innerHTML = statusDiv.innerHTML.replace(
      '⏳ Testing API debug endpoint...', 
      response.ok ? '✅ API debug endpoint is accessible' : `❌ API debug endpoint returned error: ${response.status}`
    );
  } catch (error) {
    statusDiv.innerHTML = statusDiv.innerHTML.replace('⏳ Testing API debug endpoint...', `❌ Error accessing API debug endpoint: ${error.message}`);
  }
  
  // Check API auth test endpoint
  statusDiv.innerHTML += `<p>⏳ Testing API auth test endpoint...</p>`;
  
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (tokenAvailable) {
      const token = await window.Clerk.session.getToken();
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch('https://railhubpictures.org/api/auth/test', {
      method: 'GET',
      headers
    });
    
    const authData = await response.json();
    
    statusDiv.innerHTML = statusDiv.innerHTML.replace(
      '⏳ Testing API auth test endpoint...', 
      response.ok 
        ? `✅ Auth test response: ${authData.authenticated ? 'Authenticated' : 'Not authenticated'}`
        : `❌ Auth test returned error: ${response.status}`
    );
    
    // Show full auth test results
    statusDiv.innerHTML += `
      <div style="background-color: #f8f8f8; padding: 10px; border-radius: 4px; margin-top: 10px; overflow: auto; max-height: 200px;">
        <pre style="margin: 0;">${JSON.stringify(authData, null, 2)}</pre>
      </div>
    `;
  } catch (error) {
    statusDiv.innerHTML = statusDiv.innerHTML.replace('⏳ Testing API auth test endpoint...', `❌ Error accessing API auth test endpoint: ${error.message}`);
  }
  
  // Summary
  statusDiv.innerHTML += `
    <div style="margin-top: 20px; padding: 10px; border-radius: 4px; background-color: ${
      tokenAvailable ? '#e8f5e9' : '#ffebee'
    };">
      <h3 style="margin-top: 0;">Summary</h3>
      <p>${
        tokenAvailable 
          ? '✅ All authentication components appear to be working correctly.' 
          : '❌ There are issues with the authentication setup.'
      }</p>
    </div>
  `;
}

// Fix authentication issues
async function fixAuthentication() {
  try {
    // Force reload Clerk scripts
    const oldScript = document.querySelector('script[data-clerk-publishable-key]');
    if (oldScript) {
      oldScript.remove();
    }
    
    // Create new Clerk script
    const newScript = document.createElement('script');
    newScript.async = true;
    newScript.crossOrigin = 'anonymous';
    newScript.setAttribute('data-clerk-publishable-key', 'pk_test_Y29tbXVuYWwtY2F0LTI1LmNsZXJrLmFjY291bnRzLmRldiQ');
    newScript.src = 'https://communal-cat-25.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js';
    newScript.type = 'text/javascript';
    
    document.head.appendChild(newScript);
    
    // Wait for Clerk to load
    await new Promise((resolve) => {
      const checkClerk = setInterval(() => {
        if (window.Clerk) {
          clearInterval(checkClerk);
          resolve();
        }
      }, 100);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkClerk);
        resolve();
      }, 5000);
    });
    
    alert('Authentication components have been reloaded. Please try your action again.');
    
    // Reload the page
    window.location.reload();
  } catch (error) {
    alert(`Error fixing authentication: ${error.message}`);
  }
}

// Test the API
async function testApi() {
  try {
    // Get token if available
    let token = null;
    if (window.Clerk && window.Clerk.session) {
      token = await window.Clerk.session.getToken();
    }
    
    // Headers
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Try the profile endpoint
    const response = await fetch('https://railhubpictures.org/api/profile', {
      method: 'GET',
      headers
    });
    
    const data = await response.json();
    
    alert(`API test result: ${response.ok ? 'Success' : 'Failed'}\n\nStatus: ${response.status}\n\nResponse: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    alert(`API test error: ${error.message}`);
  }
}

// Run automatic checks without showing the UI
async function runAutomaticChecks() {
  console.group('🔍 Auth Troubleshooter: Automatic Checks');
  
  try {
    // Check if Clerk is available
    console.log('Checking if Clerk is available...');
    const clerkAvailable = window.Clerk !== undefined;
    console.log('Clerk available:', clerkAvailable);
    
    if (!clerkAvailable) {
      console.warn('Clerk is not available. Authentication will not work.');
      console.groupEnd();
      return;
    }
    
    // Wait for Clerk to be ready
    console.log('Waiting for Clerk to be ready...');
    if (!window.Clerk.isReady) {
      await new Promise((resolve) => {
        const checkClerk = setInterval(() => {
          if (window.Clerk.isReady) {
            clearInterval(checkClerk);
            resolve();
          }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkClerk);
          resolve();
        }, 5000);
      });
    }
    
    console.log('Clerk ready:', window.Clerk.isReady);
    
    // Check if user is signed in
    const userSignedIn = window.Clerk.user !== null;
    console.log('User signed in:', userSignedIn);
    
    if (!userSignedIn) {
      console.warn('User is not signed in. Authentication will not work.');
      console.groupEnd();
      return;
    }
    
    // Try to get token
    console.log('Getting auth token...');
    const token = await window.Clerk.session.getToken();
    console.log('Token available:', !!token);
    
    // Make sure window.API_CONFIG is set
    if (!window.API_CONFIG) {
      console.warn('window.API_CONFIG is not set. Creating it now.');
      window.API_CONFIG = {
        BASE_URL: 'https://railhubpictures.org',
        DEBUG: true
      };
    }
    
    console.log('API_CONFIG:', window.API_CONFIG);
    
    // Try a test request to the auth test endpoint
    console.log('Testing auth endpoint...');
    const response = await fetch('https://railhubpictures.org/api/auth/test', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    const data = await response.json();
    console.log('Auth test response:', data);
    
    if (data.authenticated) {
      console.log('✅ Authentication is working correctly!');
    } else {
      console.warn('❌ Authentication is not working. Please click the Auth Fix button in the bottom right corner.');
    }
  } catch (error) {
    console.error('Error during automatic checks:', error);
  }
  
  console.groupEnd();
}

/**
 * Advanced fix for authentication issues
 */
async function advancedFixAuth() {
  console.group('🛠️ Advanced Auth Fix');
  console.log('Starting advanced authentication fix...');
  
  // Step 1: Check Clerk script
  if (typeof window.Clerk === 'undefined') {
    console.error('Clerk script is missing. Cannot fix authentication.');
    alert('Clerk authentication system is not loaded. Please reload the page and try again.');
    console.groupEnd();
    return false;
  }
  
  // Step 2: Reinitialize Clerk
  console.log('Reinitializing Clerk...');
  try {
    await Clerk.load();
    console.log('Clerk reinitialized successfully.');
  } catch (error) {
    console.error('Failed to reinitialize Clerk:', error);
  }
  
  // Step 3: Check if user is signed in
  if (!window.Clerk.user) {
    console.log('User is not signed in. Redirecting to sign in page...');
    localStorage.setItem('authRedirectUrl', window.location.href);
    window.location.href = '/login.html';
    console.groupEnd();
    return false;
  }
  
  // Step 4: Try to get a fresh token
  console.log('Getting fresh authentication token...');
  try {
    const token = await window.Clerk.session.getToken();
    console.log('Token received:', token ? 'Yes (token hidden)' : 'No');
    
    // Step 5: Test the token
    console.log('Testing token with API...');
    const response = await fetch(`${window.API_CONFIG?.BASE_URL || 'https://railhubpictures.org'}/api/auth/test`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    console.log('Auth test result:', result);
    
    if (result.authenticated) {
      console.log('✅ Authentication fixed successfully!');
      alert('Authentication fixed successfully! The page will now reload.');
      window.location.reload();
      console.groupEnd();
      return true;
    } else {
      console.error('Authentication still failing after fix attempts.');
      alert('Authentication issues persist. Please try signing out and signing in again.');
    }
  } catch (error) {
    console.error('Error during authentication fix:', error);
  }
  
  console.groupEnd();
  return false;
}

// Export the functions for use in the console
window.authTroubleshooter = {
  showDialog: showTroubleshooterDialog,
  runChecks: runAutomaticChecks,
  fixAuth: fixAuthentication,
  advancedFixAuth: advancedFixAuth,
  testApi: testApi
};