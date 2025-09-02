// Worker Error Diagnostic Tool

document.addEventListener('DOMContentLoaded', function() {
  // Add diagnostic button to UI
  const diagButton = document.createElement('button');
  diagButton.textContent = 'Check Worker Status';
  diagButton.style.position = 'fixed';
  diagButton.style.bottom = '60px';
  diagButton.style.right = '20px';
  diagButton.style.backgroundColor = '#ff9800';
  diagButton.style.color = 'white';
  diagButton.style.border = 'none';
  diagButton.style.borderRadius = '4px';
  diagButton.style.padding = '8px 16px';
  diagButton.style.zIndex = '9999';
  diagButton.style.cursor = 'pointer';
  
  document.body.appendChild(diagButton);
  
  diagButton.addEventListener('click', async function() {
    // Create modal dialog
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '10000';
    
    const content = document.createElement('div');
    content.style.backgroundColor = 'white';
    content.style.padding = '20px';
    content.style.borderRadius = '8px';
    content.style.maxWidth = '90%';
    content.style.width = '600px';
    content.style.maxHeight = '80vh';
    content.style.overflow = 'auto';
    
    content.innerHTML = `
      <h2 style="margin-top:0">Worker Status Diagnostic</h2>
      <p>Testing Worker endpoints to find issues...</p>
      <div id="diag-results" style="background:#f5f5f5; padding:10px; border-radius:4px; margin-top:10px; font-family:monospace; white-space:pre-wrap;"></div>
      <button id="close-diag" style="margin-top:15px; padding:8px 16px; background:#444; color:white; border:none; border-radius:4px; float:right;">Close</button>
      <div style="clear:both"></div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    document.getElementById('close-diag').addEventListener('click', function() {
      document.body.removeChild(modal);
    });
    
    // Start diagnostic tests
    const resultsDiv = document.getElementById('diag-results');
    
    // List of endpoints to test
    const endpoints = [
      'https://railhubpictures.org/api/health',
      'https://railhubpictures.org/api',
      'https://api.railhubpictures.org/api/health',
      'https://api.railhubpictures.org/api'
    ];
    
    resultsDiv.textContent = "Running tests...\n\n";
    
    for (const endpoint of endpoints) {
      resultsDiv.textContent += `Testing ${endpoint}...\n`;
      
      try {
        const startTime = Date.now();
        const response = await fetch(endpoint, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          headers: {
            'Accept': 'application/json'
          }
        });
        const endTime = Date.now();
        
        if (response.ok) {
          let body;
          try {
            body = await response.text();
            try {
              body = JSON.parse(body);
              body = JSON.stringify(body, null, 2);
            } catch (e) {
              // Keep as text
            }
          } catch (e) {
            body = '[Could not read body]';
          }
          
          resultsDiv.textContent += `✅ Success! Status: ${response.status}, Time: ${endTime - startTime}ms\n`;
          resultsDiv.textContent += `Response: ${body}\n\n`;
        } else {
          resultsDiv.textContent += `❌ Failed with status: ${response.status} ${response.statusText}\n\n`;
        }
      } catch (error) {
        resultsDiv.textContent += `❌ Error: ${error.message}\n\n`;
      }
    }
    
    // Provide recommendations
    resultsDiv.textContent += "DIAGNOSIS:\n";
    resultsDiv.textContent += "- If main domain (/api) endpoints work but api.railhubpictures.org fails:\n";
    resultsDiv.textContent += "  The Worker is throwing an exception when accessed via the api subdomain.\n";
    resultsDiv.textContent += "  Check your Cloudflare Worker logs for Error 1101.\n\n";
    resultsDiv.textContent += "RECOMMENDATION:\n";
    resultsDiv.textContent += "- Continue using the main domain endpoint (railhubpictures.org/api)\n";
    resultsDiv.textContent += "- To fix the API subdomain, check your Worker code for hostname-specific issues\n";
  });
});
