// Mobile Menu Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const mobileNavButton = document.querySelector('.mobile-nav-button');
    const mobileMenuContainer = document.querySelector('.mobile-menu-container');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    const mobileSearchToggle = document.querySelector('.mobile-search-toggle');
    const mobileSearchForm = document.querySelector('.mobile-search-form');
    
    // Toggle mobile menu
    if (mobileNavButton && mobileMenuContainer && mobileMenuOverlay) {
        mobileNavButton.addEventListener('click', function() {
            mobileMenuContainer.classList.add('active');
            mobileMenuOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
        });
    
        // Close mobile menu
        function closeMenu() {
            mobileMenuContainer.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            document.body.style.overflow = ''; // Re-enable scrolling
        }
    
        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', closeMenu);
        }
    
        if (mobileMenuOverlay) {
            mobileMenuOverlay.addEventListener('click', closeMenu);
        }
    
        // Close menu when clicking a link (optional)
        const mobileMenuLinks = document.querySelectorAll('.mobile-menu-nav a');
        if (mobileMenuLinks.length) {
            mobileMenuLinks.forEach(link => {
                link.addEventListener('click', closeMenu);
            });
        }
    }
    
    // Toggle mobile search form
    if (mobileSearchToggle && mobileSearchForm) {
        mobileSearchToggle.addEventListener('click', function() {
            mobileSearchForm.classList.toggle('active');
        });
        
        // Close search when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileSearchToggle.contains(e.target) && !mobileSearchForm.contains(e.target)) {
                mobileSearchForm.classList.remove('active');
            }
        });
    }
    
    // Update mobile date
    function updateMobileDate() {
        const mobileDateElement = document.querySelector('.mobile-date');
        if (mobileDateElement) {
            const today = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            mobileDateElement.textContent = today.toLocaleDateString('en-US', options);
        }
    }
    
    // Update date on page load
    updateMobileDate();
});