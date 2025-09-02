/**
 * Initialize global RailHub API instance
 */

document.addEventListener('DOMContentLoaded', function() {
  // Create global API instance
  window.railhubAPI = new RailHubAPI();
  console.log('Global API client initialized with baseURL:', window.railhubAPI.baseURL);
  
  // Show API endpoint information on the page
  const showApiInfo = () => {
    // Create an info bar at the top of the page
    const infoBar = document.createElement('div');
    infoBar.id = 'api-info-bar';
    infoBar.style.position = 'fixed';
    infoBar.style.top = '0';
    infoBar.style.left = '0';
    infoBar.style.width = '100%';
    infoBar.style.backgroundColor = '#f8f8f8';
    infoBar.style.borderBottom = '1px solid #ddd';
    infoBar.style.padding = '5px 10px';
    infoBar.style.fontSize = '12px';
    infoBar.style.color = '#666';
    infoBar.style.zIndex = '9999';
    infoBar.style.textAlign = 'center';
    infoBar.style.display = 'flex';
    infoBar.style.justifyContent = 'center';
    infoBar.style.alignItems = 'center';
    
    // Check if using main domain or API subdomain
    const baseUrl = window.railhubAPI.baseURL;
    let message, color;
    
    if (baseUrl.includes('railhubpictures.org/api') && !baseUrl.includes('api.railhubpictures.org')) {
      message = `✅ Using main domain API: ${baseUrl}`;
      color = 'green';
    } else if (baseUrl.includes('api.railhubpictures.org')) {
      message = `⚠️ Using API subdomain: ${baseUrl} (may not work)`;
      color = 'orange';
    } else if (baseUrl.includes('localhost')) {
      message = `🔧 Using development server: ${baseUrl}`;
      color = 'blue';
    } else {
      message = `API endpoint: ${baseUrl}`;
      color = '#666';
    }
    
    infoBar.innerHTML = `<span style="color: ${color}">${message}</span>`;
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.marginLeft = '10px';
    closeBtn.style.border = 'none';
    closeBtn.style.background = 'none';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontSize = '12px';
    closeBtn.style.padding = '0';
    closeBtn.style.color = '#666';
    
    closeBtn.addEventListener('click', () => {
      infoBar.style.display = 'none';
    });
    
    infoBar.appendChild(closeBtn);
    document.body.appendChild(infoBar);
  };
  
  // Show API info after a short delay
  setTimeout(showApiInfo, 1000);
  
  // Initialize Clerk authentication if the script is loaded
  if (typeof initClerkAuth === 'function') {
    initClerkAuth().then(clerk => {
      if (clerk && clerk.user) {
        console.log('User already authenticated');
      }
    });
  }
  
  // Automatically test the connection after loading
  if (window.railhubAPI.testConnection) {
    window.railhubAPI.testConnection().then(result => {
      console.log('Auto connection test result:', result);
      if (result && result.success) {
        console.log(`Connection successful using ${result.protocol}!`);
      }
    }).catch(err => {
      console.error('Auto connection test failed:', err);
    });
  }
});
