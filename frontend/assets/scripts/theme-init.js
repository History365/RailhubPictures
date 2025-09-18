/**
 * Early Theme Initializer
 * This script runs before any other scripts to set the theme as early as possible
 * to prevent flickering when the page loads
 */
(function() {
    // Get theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme');
    
    // Check if system preference is dark and no saved theme
    if (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
})();
