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
        // Create FormData from the form
        const formData = new FormData(uploadForm);
        
        // Log the upload attempt
        console.log('Preparing to upload photo via API client');
        console.log('Using auth token:', api.token ? 'Yes (token found)' : 'No (token missing)');
        
        // Show uploading progress indicator (optional)
        const statusDiv = document.createElement('div');
        statusDiv.className = 'upload-status';
        statusDiv.innerHTML = 'Uploading... Please wait.';
        submitButton.parentNode.appendChild(statusDiv);
        
        // Use the API client's uploadPhoto method which handles all path and endpoint issues
        let uploadResult;
        try {
          // First try using the API client's method
          uploadResult = await api.uploadPhoto(formData);
          console.log('Upload result from API client:', uploadResult);
        } catch (apiError) {
          console.error('API client upload failed:', apiError);
          
          // Show a more specific error message in the status div
          statusDiv.innerHTML = `API upload failed: ${apiError.message}. Trying direct upload...`;
          
          // Fall back to direct upload if the API client method fails
          throw apiError; // Will be caught by the outer catch block
        }
        
        // If we get here, the API client method worked
        if (uploadResult) {
          console.log('Upload completed with result:', uploadResult);
          
          // Check if it's an error response
          if (uploadResult.error) {
            throw new Error(uploadResult.error);
          }
          
          // If success, show message and redirect
          if (uploadResult.success) {
            statusDiv.innerHTML = 'Upload successful!';
            // Show success message
            alert('Photo uploaded successfully!');
            
            // Redirect to the photo page or homepage
            window.location.href = '/index.html';
            return;
          }
        }
        
        // If we get here, we need to try a direct fetch as a last resort
        console.log('API client method did not return success, trying direct fetch');
        statusDiv.innerHTML = 'Trying direct upload...';
        
        // Construct the best possible URL for direct upload
        const uploadUrl = api.baseURL.endsWith('/api') 
          ? `${api.baseURL}/photos/upload`
          : api.baseURL.endsWith('/api/') 
              ? `${api.baseURL}photos/upload` 
              : `${api.baseURL}/api/photos/upload`;
          
        console.log('Direct upload to:', uploadUrl);
        
        const response = await fetch(uploadUrl, {
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
        
        // Create a more detailed error message with troubleshooting advice
        let errorMessage = 'Upload failed: ' + error.message;
        
        // Add more context based on the error
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage += '\n\nPossible causes:\n' +
            '- The API server may be down\n' +
            '- There may be a network connectivity issue\n' +
            '- CORS settings may be blocking the request\n\n' +
            'Try again later or contact support if the problem persists.';
        } else if (error.message.includes('404')) {
          errorMessage += '\n\nThe API endpoint was not found. This may indicate a configuration issue with the Cloudflare Worker.';
        } else if (error.message.includes('401') || error.message.includes('403')) {
          errorMessage += '\n\nAuthentication failed. Please try logging out and logging back in.';
        }
        
        // Show the error message
        alert(errorMessage);
        
        // Reset button and clear any status elements
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
        
        // Remove any status div that might have been added
        const statusDiv = uploadForm.querySelector('.upload-status');
        if (statusDiv) {
          statusDiv.remove();
        }
        
        // Log the detailed error information to the console
        console.group('Upload Error Details');
        console.error('Error message:', error.message);
        console.error('API base URL:', api.baseURL);
        console.error('Authentication present:', !!api.token);
        console.groupEnd();
      }
    });
  }
});
