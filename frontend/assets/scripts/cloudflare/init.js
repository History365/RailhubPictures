/**
 * Initialize global RailHub API instance
 */

document.addEventListener('DOMContentLoaded', function() {
  // Create global API instance
  window.railhubAPI = new RailHubAPI();
  console.log('Global API client initialized with baseURL:', window.railhubAPI.baseURL);
  
  // Track if the info bar has been created
  let apiInfoBar = null;
  
  // Show API endpoint information on the page
  const showApiInfo = (connectionStatus) => {
    // Remove existing info bar if present
    if (apiInfoBar) {
      apiInfoBar.remove();
    }
    
    // Create a new info bar
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
    infoBar.style.justifyContent = 'space-between';
    infoBar.style.alignItems = 'center';
    
    // Create the main content container
    const contentContainer = document.createElement('div');
    contentContainer.style.display = 'flex';
    contentContainer.style.alignItems = 'center';
    contentContainer.style.flexGrow = '1';
    contentContainer.style.justifyContent = 'center';
    
    // Check if using main domain or API subdomain
    const baseUrl = window.railhubAPI.baseURL;
    let message, color, icon;
    
    // Determine the message, color, and icon based on the endpoint
    if (!window.railhubAPI.connectionStatus.connected) {
      icon = '❌';
      message = `API Connection Failed: ${window.railhubAPI.connectionStatus.error || 'Unknown error'}`;
      color = 'red';
    } else if (baseUrl.includes('railhub-api.railhubpictures.org')) {
      icon = '✓';
      message = `Connected to Direct Worker: ${baseUrl}`;
      color = 'green';
    } else if (baseUrl.includes('api.railhubpictures.org')) {
      icon = '✓';
      message = `Connected to API Subdomain: ${baseUrl}`;
      color = 'green';
    } else if (baseUrl.includes('railhubpictures.org/api')) {
      icon = '✓';
      message = `Connected to Main Domain API: ${baseUrl} (Using workaround for /api path)`;
      color = 'green';
    } else if (baseUrl.includes('railhubpictures.org') && !baseUrl.includes('/api')) {
      icon = '✓';
      message = `Connected to Main Domain: ${baseUrl} (Direct mode)`;
      color = 'green';
    } else if (baseUrl.includes('localhost')) {
      icon = '🔧';
      message = `Using Development Server: ${baseUrl}`;
      color = 'blue';
    } else {
      icon = '⚠️';
      message = `Unknown API Endpoint: ${baseUrl}`;
      color = '#666';
    }
    
    contentContainer.innerHTML = `<span style="color: ${color}; font-weight: bold; margin-right: 5px;">${icon}</span><span style="color: ${color}">${message}</span>`;
    
    // Create a diagnostics button
    const diagButton = document.createElement('button');
    diagButton.innerText = 'Run Diagnostics';
    diagButton.style.fontSize = '11px';
    diagButton.style.padding = '2px 5px';
    diagButton.style.marginLeft = '10px';
    diagButton.style.border = '1px solid #ccc';
    diagButton.style.borderRadius = '3px';
    diagButton.style.background = '#f0f0f0';
    diagButton.style.cursor = 'pointer';
    
    diagButton.addEventListener('click', async () => {
      diagButton.disabled = true;
      diagButton.innerText = 'Running...';
      
      try {
        const results = await window.railhubAPI.testConnection();
        showDiagnosticResults(results);
        diagButton.innerText = 'Run Again';
        diagButton.disabled = false;
      } catch (err) {
        console.error('Diagnostics failed:', err);
        diagButton.innerText = 'Error: Try Again';
        diagButton.disabled = false;
      }
    });
    
    contentContainer.appendChild(diagButton);
    infoBar.appendChild(contentContainer);
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.border = 'none';
    closeBtn.style.background = 'none';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontSize = '12px';
    closeBtn.style.padding = '0';
    closeBtn.style.color = '#666';
    closeBtn.style.marginLeft = '10px';
    
    closeBtn.addEventListener('click', () => {
      infoBar.style.display = 'none';
    });
    
    infoBar.appendChild(closeBtn);
    document.body.appendChild(infoBar);
    
    // Store the reference
    apiInfoBar = infoBar;
    return infoBar;
  };
  
  // Function to show detailed diagnostic results
  const showDiagnosticResults = (results) => {
    // Create a modal to show the results
    const modalOverlay = document.createElement('div');
    modalOverlay.style.position = 'fixed';
    modalOverlay.style.top = '0';
    modalOverlay.style.left = '0';
    modalOverlay.style.width = '100%';
    modalOverlay.style.height = '100%';
    modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modalOverlay.style.zIndex = '10000';
    modalOverlay.style.display = 'flex';
    modalOverlay.style.justifyContent = 'center';
    modalOverlay.style.alignItems = 'center';
    
    const modal = document.createElement('div');
    modal.style.backgroundColor = 'white';
    modal.style.borderRadius = '5px';
    modal.style.padding = '20px';
    modal.style.maxWidth = '80%';
    modal.style.maxHeight = '80%';
    modal.style.overflow = 'auto';
    modal.style.position = 'relative';
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '10px';
    closeBtn.style.right = '10px';
    closeBtn.style.border = 'none';
    closeBtn.style.background = 'none';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontSize = '18px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.color = '#666';
    
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modalOverlay);
    });
    
    // Create the content
    const title = document.createElement('h2');
    title.innerText = 'API Connection Diagnostics';
    title.style.marginTop = '0';
    
    const summary = document.createElement('p');
    summary.innerHTML = results.success ? 
      '<span style="color: green; font-weight: bold;">✅ Connection Success:</span> At least one API endpoint is working.' : 
      '<span style="color: red; font-weight: bold;">❌ Connection Failure:</span> All API endpoints failed.';
    
    const currentEndpoint = document.createElement('p');
    currentEndpoint.innerHTML = `<strong>Current API Endpoint:</strong> ${results.currentBaseURL}`;
    
    // Create a table for the results
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '15px';
    table.style.fontSize = '14px';
    
    // Add table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr style="background-color: #f0f0f0;">
        <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Endpoint</th>
        <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Status</th>
        <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Response Time</th>
        <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Details</th>
      </tr>
    `;
    table.appendChild(thead);
    
    // Add table body
    const tbody = document.createElement('tbody');
    results.results.forEach(result => {
      const tr = document.createElement('tr');
      
      // Create cells
      const endpointCell = document.createElement('td');
      endpointCell.style.padding = '8px';
      endpointCell.style.border = '1px solid #ddd';
      endpointCell.innerHTML = `<strong>${result.endpoint.description}</strong><br><small>${result.endpoint.url}</small>`;
      
      const statusCell = document.createElement('td');
      statusCell.style.padding = '8px';
      statusCell.style.border = '1px solid #ddd';
      if (result.success) {
        statusCell.innerHTML = `<span style="color: green;">✅ Success</span><br><small>${result.status} ${result.statusText || ''}</small>`;
      } else if (result.error) {
        statusCell.innerHTML = `<span style="color: red;">❌ Error</span><br><small>${result.error}</small>`;
      } else {
        statusCell.innerHTML = `<span style="color: red;">❌ Failed</span><br><small>${result.status} ${result.statusText || ''}</small>`;
      }
      
      const timeCell = document.createElement('td');
      timeCell.style.padding = '8px';
      timeCell.style.border = '1px solid #ddd';
      timeCell.innerText = result.responseTime ? `${result.responseTime}ms` : 'N/A';
      
      const detailsCell = document.createElement('td');
      detailsCell.style.padding = '8px';
      detailsCell.style.border = '1px solid #ddd';
      
      // Add a button to show response details if available
      if (result.headers || result.body) {
        const detailsBtn = document.createElement('button');
        detailsBtn.innerText = 'Show Details';
        detailsBtn.style.padding = '2px 5px';
        detailsBtn.style.fontSize = '12px';
        
        detailsBtn.addEventListener('click', () => {
          const detailsContent = document.createElement('div');
          detailsContent.style.marginTop = '5px';
          detailsContent.style.fontSize = '12px';
          detailsContent.style.whiteSpace = 'pre-wrap';
          
          if (result.headers) {
            const headersTitle = document.createElement('h4');
            headersTitle.innerText = 'Response Headers:';
            headersTitle.style.margin = '5px 0';
            detailsContent.appendChild(headersTitle);
            
            const headersList = document.createElement('pre');
            headersList.style.backgroundColor = '#f8f8f8';
            headersList.style.padding = '5px';
            headersList.style.overflow = 'auto';
            headersList.style.maxHeight = '100px';
            headersList.innerText = JSON.stringify(result.headers, null, 2);
            detailsContent.appendChild(headersList);
          }
          
          if (result.body) {
            const bodyTitle = document.createElement('h4');
            bodyTitle.innerText = 'Response Body:';
            bodyTitle.style.margin = '5px 0';
            detailsContent.appendChild(bodyTitle);
            
            const bodyContent = document.createElement('pre');
            bodyContent.style.backgroundColor = '#f8f8f8';
            bodyContent.style.padding = '5px';
            bodyContent.style.overflow = 'auto';
            bodyContent.style.maxHeight = '200px';
            bodyContent.innerText = typeof result.body === 'object' ? 
              JSON.stringify(result.body, null, 2) : result.body;
            detailsContent.appendChild(bodyContent);
          }
          
          // Replace button with content
          detailsCell.removeChild(detailsBtn);
          detailsCell.appendChild(detailsContent);
          
          // Add a collapse button
          const collapseBtn = document.createElement('button');
          collapseBtn.innerText = 'Hide Details';
          collapseBtn.style.padding = '2px 5px';
          collapseBtn.style.fontSize = '12px';
          collapseBtn.style.marginTop = '5px';
          
          collapseBtn.addEventListener('click', () => {
            detailsCell.removeChild(detailsContent);
            detailsCell.removeChild(collapseBtn);
            detailsCell.appendChild(detailsBtn);
          });
          
          detailsCell.appendChild(collapseBtn);
        });
        
        detailsCell.appendChild(detailsBtn);
      } else {
        detailsCell.innerText = 'No details available';
      }
      
      // Add cells to row
      tr.appendChild(endpointCell);
      tr.appendChild(statusCell);
      tr.appendChild(timeCell);
      tr.appendChild(detailsCell);
      
      // Add row to table
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    
    // Create a button to switch endpoints
    const switchEndpointBtn = document.createElement('button');
    switchEndpointBtn.innerText = 'Switch to Best Working Endpoint';
    switchEndpointBtn.style.padding = '8px 15px';
    switchEndpointBtn.style.margin = '15px 0';
    switchEndpointBtn.style.background = '#4CAF50';
    switchEndpointBtn.style.color = 'white';
    switchEndpointBtn.style.border = 'none';
    switchEndpointBtn.style.borderRadius = '4px';
    switchEndpointBtn.style.cursor = 'pointer';
    
    switchEndpointBtn.addEventListener('click', async () => {
      await window.railhubAPI.detectBestEndpoint();
      document.body.removeChild(modalOverlay);
      showApiInfo();
    });
    
    // Add elements to the modal
    modal.appendChild(closeBtn);
    modal.appendChild(title);
    modal.appendChild(summary);
    modal.appendChild(currentEndpoint);
    modal.appendChild(table);
    modal.appendChild(switchEndpointBtn);
    modalOverlay.appendChild(modal);
    
    // Add to body
    document.body.appendChild(modalOverlay);
  };
  
  // Listen for API connection events
  window.addEventListener('api:connected', (event) => {
    console.log('API connected event:', event.detail);
    showApiInfo();
  });
  
  window.addEventListener('api:connectionFailed', (event) => {
    console.error('API connection failed event:', event.detail);
    showApiInfo();
  });
  
  // Show API info immediately and after a delay to ensure it's visible
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
        console.log(`Connection successful!`);
        showApiInfo();
      }
    }).catch(err => {
      console.error('Auto connection test failed:', err);
    });
  }
});
