// Photo upload handler that uses the Cloudflare API client

document.addEventListener('DOMContentLoaded', function() {
  const uploadForm = document.getElementById('photoUploadForm');
  
  if (uploadForm) {
    uploadForm.addEventListener('submit', async function(event) {
      event.preventDefault();
      
      // Show loading indicator
      const submitButton = uploadForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.innerHTML;
      submitButton.disabled = true;
      submitButton.innerHTML = 'Uploading... <span class="spinner"></span>';
      
      try {
        // Create API client instance
        const api = new RailHubAPI();
        
        // Create FormData from the form
        const formData = new FormData(uploadForm);
        
        // Send the form data to the API
        const response = await fetch(api.baseURL + '/photos/upload', {
          method: 'POST',
          headers: {
            // Don't set Content-Type header with FormData
            'Authorization': `Bearer ${api.token}`
          },
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
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
