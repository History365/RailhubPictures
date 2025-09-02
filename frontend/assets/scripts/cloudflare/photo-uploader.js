// Photo upload handler that uses the Cloudflare API client

document.addEventListener('DOMContentLoaded', function() {
  const uploadForm = document.getElementById('photoUploadForm');
  
  if (uploadForm) {
    uploadForm.addEventListener('submit', async function(event) {
      event.preventDefault();
      
      // Check if we have a global API instance
      const api = window.railhubAPI || new RailHubAPI();
      
      // Check if user is authenticated
      if (!api.isAuthenticated()) {
        console.warn('User is not authenticated. Token:', api.token);
        
        // Try to get authentication from Clerk if available
        if (window.Clerk && window.Clerk.user) {
          try {
            const token = await window.Clerk.session.getToken();
            api.setToken(token);
            console.log('Got new token from Clerk');
          } catch (e) {
            console.error('Failed to get token from Clerk:', e);
            alert('Please sign in to upload photos');
            return;
          }
        } else {
          alert('Please sign in to upload photos');
          return;
        }
      }
      
      // Show loading indicator
      const submitButton = uploadForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.innerHTML;
      submitButton.disabled = true;
      submitButton.innerHTML = 'Uploading... <span class="spinner"></span>';
      
      try {
        // Already have the api instance from above
        // const api = new RailHubAPI();
        
        // Create FormData from the form
        const formData = new FormData(uploadForm);
        
        console.log('Uploading to:', api.baseURL + '/photos/upload');
        console.log('Using auth token:', api.token ? 'Yes (token found)' : 'No (token missing)');
        
        // Send the form data to the API
        const response = await fetch(api.baseURL + '/photos/upload', {
          method: 'POST',
          headers: {
            // Don't set Content-Type header with FormData
            'Authorization': `Bearer ${api.token || ''}`
          },
          body: formData,
          // Add mode credentials for CORS
          mode: 'cors',
          credentials: 'same-origin'
        });
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`Upload failed (${response.status}): ${errorText || response.statusText}`);
        }
        
        const result = await response.json();
        
        // Show success message
        alert('Photo uploaded successfully!');
        
        // Redirect to the photo page or homepage
        window.location.href = '/index.html';
        
      } catch (error) {
        console.error('Upload error:', error);
        alert('Upload failed: ' + error.message);
        
        // Reset button
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
      }
    });
  }
});
