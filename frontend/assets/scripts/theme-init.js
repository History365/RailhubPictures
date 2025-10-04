/**
 * Theme initialization script for Railhub Pictures
 * This script ensures dark mode is properly applied on page load
 * before other scripts load to prevent flickering
 */
(function() {
    // Get saved theme from localStorage or use light as default
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Apply theme to html element
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
    
    // Apply proper theme variables
    if (savedTheme === 'dark') {
        document.documentElement.style.setProperty('--background-color', '#212529');
        document.documentElement.style.setProperty('--text-color', '#e9ecef');
        document.documentElement.style.setProperty('--footer-bg', '#212529');
        document.documentElement.style.setProperty('--footer-text', '#e9ecef');
        document.documentElement.style.setProperty('--border-color', '#495057');
        document.documentElement.style.setProperty('--header-background', '#212529');
        document.documentElement.style.setProperty('--nav-link', '#e9ecef');
        document.documentElement.style.setProperty('--secondary-text', '#e9ecef');
        document.documentElement.style.setProperty('--button-background', '#495057');
        document.documentElement.style.setProperty('--button-text', '#e9ecef');
        document.documentElement.style.setProperty('--input-background', '#343a40');
        document.documentElement.style.setProperty('--shadow-color', 'rgba(0,0,0,0.5)');
    } else {
        document.documentElement.style.setProperty('--background-color', '#ffffff');
        document.documentElement.style.setProperty('--text-color', '#212529');
        document.documentElement.style.setProperty('--footer-bg', '#f8f8f8');
        document.documentElement.style.setProperty('--footer-text', '#666');
        document.documentElement.style.setProperty('--border-color', '#eee');
        document.documentElement.style.setProperty('--header-background', '#ffffff');
        document.documentElement.style.setProperty('--nav-link', '#495057');
        document.documentElement.style.setProperty('--secondary-text', '#6c757d');
        document.documentElement.style.setProperty('--button-background', '#007bff');
        document.documentElement.style.setProperty('--button-text', '#ffffff');
        document.documentElement.style.setProperty('--input-background', '#ffffff');
        document.documentElement.style.setProperty('--shadow-color', 'rgba(0,0,0,0.1)');
    }
})();