// Global script to load Cloudflare integration on all pages
(function() {
    // Add cloudflare integration script to head
    function addCloudflareIntegration() {
        // Check if already added
        if (document.querySelector('script[src="assets/scripts/cloudflare/cloudflare-integration.js"]')) {
            return;
        }
        
        // Create and add script tag
        const script = document.createElement('script');
        script.src = 'assets/scripts/cloudflare/cloudflare-integration.js';
        document.head.appendChild(script);
    }
    
    // Execute when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addCloudflareIntegration);
    } else {
        addCloudflareIntegration();
    }
})();
