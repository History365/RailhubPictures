// Integration script for Cloudflare backend
document.addEventListener('DOMContentLoaded', function() {
    // Add script tags to all pages
    addCloudflareScripts();
    
    // Initialize data loading based on page type
    initializePageData();
});

// Add Cloudflare script tags to the page
function addCloudflareScripts() {
    // Check if scripts are already loaded
    if (document.querySelector('script[src="assets/scripts/cloudflare/api-client.js"]')) {
        return;
    }
    
    // Add API client script
    const apiScript = document.createElement('script');
    apiScript.src = 'assets/scripts/cloudflare/api-client.js';
    document.head.appendChild(apiScript);
    
    // Add Clerk integration script
    const clerkScript = document.createElement('script');
    clerkScript.src = 'assets/scripts/cloudflare/clerk-integration.js';
    document.head.appendChild(clerkScript);
    
    // Add photo display script
    const displayScript = document.createElement('script');
    displayScript.src = 'assets/scripts/cloudflare/photo-display.js';
    document.head.appendChild(displayScript);
    
    // Add search script if we're on the search page
    if (window.location.href.includes('search.html')) {
        const searchScript = document.createElement('script');
        searchScript.src = 'assets/scripts/cloudflare/search-handler.js';
        document.head.appendChild(searchScript);
    }
    
    // Add upload script if we're on the upload page
    if (window.location.href.includes('upload.html')) {
        const uploadScript = document.createElement('script');
        uploadScript.src = 'assets/scripts/cloudflare/upload-handler.js';
        document.head.appendChild(uploadScript);
    }
}

// Initialize data loading based on page type
function initializePageData() {
    // Delay initialization to ensure API client is loaded
    setTimeout(() => {
        if (!window.railhubAPI) {
            console.warn('API client not loaded yet, retrying...');
            setTimeout(initializePageData, 500);
            return;
        }
        
        const currentUrl = window.location.href;
        
        // Homepage
        if (currentUrl.includes('index.html') || currentUrl.endsWith('/')) {
            loadHomepageData();
        }
        
        // Railroad list page
        if (currentUrl.includes('railroadList.html')) {
            loadRailroadListData();
        }
        
        // Newest photos page
        if (currentUrl.includes('newestphotos.html')) {
            loadNewestPhotosData();
        }
        
        // Search page handled by search-handler.js
        
        // Upload page handled by upload-handler.js
        
        // Single photo page
        if (currentUrl.includes('showpictureid=')) {
            loadSinglePhotoData();
        }
        
        // Locomotive/unit page
        if (currentUrl.includes('locopictureid=') || currentUrl.includes('unit/')) {
            loadUnitData();
        }
        
        // User profile page
        if (currentUrl.includes('user/')) {
            loadUserProfileData();
        }
    }, 100);
}

// Load data for the homepage
async function loadHomepageData() {
    try {
        // Get the container for featured photos
        const featuredContainer = document.querySelector('.featured-photos');
        if (featuredContainer) {
            // Get latest photos
            const photos = await window.railhubAPI.getLatestPhotos(4);
            
            if (photos && photos.length > 0) {
                featuredContainer.innerHTML = '';
                
                // Display each photo
                photos.forEach(photo => {
                    const photoDiv = document.createElement('div');
                    photoDiv.className = 'featured-item';
                    
                    // Get primary locomotive info
                    let primaryUnit = photo.units?.find(u => u.is_primary) || photo.units?.[0];
                    let unitInfo = primaryUnit ? 
                        `${primaryUnit.railroad} ${primaryUnit.number}` : 
                        'Featured Photo';
                    
                    // Create photo HTML
                    photoDiv.innerHTML = `
                        <a href="showpictureid=${photo.id}.html" class="featured-link">
                            <img src="${window.railhubAPI.getImageURL(photo.filename)}" 
                                alt="${photo.title || unitInfo}" 
                                class="featured-image">
                            <div class="featured-info">
                                <h3>${photo.title || unitInfo}</h3>
                                <p>By: ${photo.display_name || photo.username || 'Anonymous'}</p>
                            </div>
                        </a>
                    `;
                    
                    featuredContainer.appendChild(photoDiv);
                });
            }
        }
        
        // Load random photos for hero rotation
        loadRandomHeroImages();
    } catch (error) {
        console.error('Error loading homepage data:', error);
    }
}

// Load random hero images for rotation
async function loadRandomHeroImages() {
    try {
        // Get hero section
        const heroSection = document.querySelector('.hero');
        if (!heroSection) return;
        
        // Get latest photos
        const photos = await window.railhubAPI.getLatestPhotos(20);
        
        if (photos && photos.length > 0) {
            // Select 5 random photos for rotation
            const randomPhotos = [];
            const usedIndices = new Set();
            
            while (randomPhotos.length < Math.min(5, photos.length)) {
                const randomIndex = Math.floor(Math.random() * photos.length);
                if (!usedIndices.has(randomIndex)) {
                    usedIndices.add(randomIndex);
                    randomPhotos.push(photos[randomIndex]);
                }
            }
            
            // Start rotation
            let currentIndex = 0;
            
            // Initial hero image
            updateHeroBackground(heroSection, randomPhotos[currentIndex]);
            
            // Rotate every 10 seconds
            setInterval(() => {
                currentIndex = (currentIndex + 1) % randomPhotos.length;
                updateHeroBackground(heroSection, randomPhotos[currentIndex]);
            }, 10000);
        }
    } catch (error) {
        console.error('Error loading random hero images:', error);
    }
}

// Update hero background image
function updateHeroBackground(heroElement, photo) {
    if (!photo) return;
    
    // Fade out
    heroElement.style.opacity = 0;
    
    // Wait for fade out
    setTimeout(() => {
        // Update background image
        heroElement.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('${window.railhubAPI.getImageURL(photo.filename)}')`;
        
        // Fade in
        heroElement.style.opacity = 1;
    }, 500);
}

// Load data for railroad list page
async function loadRailroadListData() {
    try {
        // Get the container for railroad list
        const railroadList = document.querySelector('.railroad-list');
        if (!railroadList) return;
        
        // Get all units from API
        const units = await window.railhubAPI.getAllUnits();
        
        if (!units || units.length === 0) {
            railroadList.innerHTML = '<div class="no-data">No railroad data available</div>';
            return;
        }
        
        // Extract unique railroads with counts
        const railroads = {};
        units.forEach(unit => {
            if (!railroads[unit.railroad]) {
                railroads[unit.railroad] = {
                    name: unit.railroad,
                    count: 0,
                    logo: getRailroadLogo(unit.railroad)
                };
            }
            railroads[unit.railroad].count++;
        });
        
        // Sort railroads by name
        const sortedRailroads = Object.values(railroads).sort((a, b) => {
            return a.name.localeCompare(b.name);
        });
        
        // Build HTML
        let html = '';
        
        sortedRailroads.forEach(railroad => {
            html += `
                <div class="railroad-card">
                    <img src="${railroad.logo}" alt="${railroad.name}" class="railroad-logo">
                    <h3>${railroad.name}</h3>
                    <p>${railroad.count} locomotives</p>
                    <a href="search.html?railroad=${encodeURIComponent(railroad.name)}" class="railroad-link">
                        View Details
                    </a>
                </div>
            `;
        });
        
        railroadList.innerHTML = html;
    } catch (error) {
        console.error('Error loading railroad data:', error);
        const railroadList = document.querySelector('.railroad-list');
        if (railroadList) {
            railroadList.innerHTML = '<div class="error">Error loading railroad data</div>';
        }
    }
}

// Get railroad logo based on name
function getRailroadLogo(railroad) {
    // Map of railroad names to logo files
    const logoMap = {
        'BNSF': 'assets/images/logos/BNSF-logo.png',
        'UP': 'assets/images/logos/UP-logo.png',
        'CSX': 'assets/images/logos/CSX-logo.png',
        'NS': 'assets/images/logos/NS-logo.png',
        'CN': 'assets/images/logos/CN-logo.png',
        'CPKC': 'assets/images/logos/CPKC-logo.png',
        // Add more railroads as needed
    };
    
    return logoMap[railroad] || 'assets/images/logos/logo.jpg';
}

// Load data for newest photos page
async function loadNewestPhotosData() {
    try {
        // Get the container for photos
        const photoContainer = document.querySelector('.photos-container') || 
                              document.querySelector('.photo-grid');
        if (!photoContainer) return;
        
        // Show loading state
        photoContainer.innerHTML = '<div class="loading">Loading latest photos...</div>';
        
        // Get latest photos from API
        const photos = await window.railhubAPI.getLatestPhotos(30);
        
        if (!photos || photos.length === 0) {
            photoContainer.innerHTML = '<div class="no-photos">No photos available</div>';
            return;
        }
        
        // Clear loading indicator
        photoContainer.innerHTML = '';
        
        // Display each photo
        photos.forEach(photo => {
            const photoElement = document.createElement('div');
            photoElement.className = 'photo-item';
            
            // Get primary locomotive info
            let primaryUnit = photo.units?.find(u => u.is_primary) || photo.units?.[0];
            let unitInfo = primaryUnit ? 
                `${primaryUnit.railroad} ${primaryUnit.number}` : 
                'Photo';
                
            // Format date
            let photoDate = photo.photo_date ? 
                new Date(photo.photo_date).toLocaleDateString() : 
                'Unknown Date';
            
            // Create photo HTML
            photoElement.innerHTML = `
                <a href="showpictureid=${photo.id}.html" class="photo-link">
                    <div class="photo-wrapper">
                        <img src="${window.railhubAPI.getImageURL(photo.filename)}" 
                             alt="${photo.title || unitInfo}" 
                             class="photo-image"
                             loading="lazy">
                    </div>
                    <div class="photo-info">
                        <h3>${photo.title || unitInfo}</h3>
                        <div class="photo-meta">
                            <span>${photoDate}</span>
                            <span>By: ${photo.display_name || photo.username || 'Anonymous'}</span>
                        </div>
                    </div>
                </a>
            `;
            
            photoContainer.appendChild(photoElement);
        });
    } catch (error) {
        console.error('Error loading newest photos:', error);
        const photoContainer = document.querySelector('.photos-container') || 
                              document.querySelector('.photo-grid');
        if (photoContainer) {
            photoContainer.innerHTML = '<div class="error">Error loading photos</div>';
        }
    }
}

// Load data for single photo page - Implementation in photo-display.js

// Load data for locomotive/unit page
async function loadUnitData() {
    try {
        // Get unit ID from URL
        const unitId = getUnitIdFromUrl();
        if (!unitId) return;
        
        // Get unit container
        const unitContainer = document.querySelector('.unit-detail');
        if (!unitContainer) return;
        
        // Show loading state
        unitContainer.innerHTML = '<div class="loading">Loading locomotive data...</div>';
        
        // Get unit data from API
        const unit = await window.railhubAPI.getUnit(unitId);
        
        if (!unit) {
            unitContainer.innerHTML = '<div class="error">Locomotive not found</div>';
            return;
        }
        
        // Get photos for this unit
        const photos = await window.railhubAPI.getUnitPhotos(unitId);
        
        // Create unit HTML
        let html = `
            <div class="unit-header">
                <h1>${unit.railroad} ${unit.number}</h1>
                <div class="unit-model">${unit.model || 'Unknown Model'}</div>
            </div>
            
            <div class="unit-details">
                ${unit.serial_number ? `<div class="detail-row"><span>Serial Number:</span> ${unit.serial_number}</div>` : ''}
                ${unit.order_number ? `<div class="detail-row"><span>Order Number:</span> ${unit.order_number}</div>` : ''}
                ${unit.frame_number ? `<div class="detail-row"><span>Frame Number:</span> ${unit.frame_number}</div>` : ''}
                ${unit.built_date ? `<div class="detail-row"><span>Built Date:</span> ${new Date(unit.built_date).toLocaleDateString()}</div>` : ''}
            </div>
            
            <div class="unit-notes">
                <h2>Notes</h2>
                <p>${unit.notes || 'No notes available for this locomotive.'}</p>
            </div>
        `;
        
        // Add photos section
        html += '<div class="unit-photos"><h2>Photos</h2>';
        
        if (!photos || photos.length === 0) {
            html += '<div class="no-photos">No photos available for this locomotive</div>';
        } else {
            html += '<div class="photos-grid">';
            
            photos.forEach(photo => {
                const photoDate = photo.photo_date ? 
                    new Date(photo.photo_date).toLocaleDateString() : 
                    'Unknown Date';
                
                html += `
                    <div class="photo-item">
                        <a href="showpictureid=${photo.id}.html" class="photo-link">
                            <img src="${window.railhubAPI.getImageURL(photo.filename)}" 
                                 alt="${photo.title || 'Photo'}" 
                                 class="photo-image">
                            <div class="photo-info">
                                <div class="photo-title">${photo.title || 'Untitled Photo'}</div>
                                <div class="photo-meta">
                                    <span>${photoDate}</span>
                                    <span>By: ${photo.display_name || photo.username || 'Anonymous'}</span>
                                </div>
                            </div>
                        </a>
                    </div>
                `;
            });
            
            html += '</div>';
        }
        
        html += '</div>';
        
        // Update container
        unitContainer.innerHTML = html;
    } catch (error) {
        console.error('Error loading unit data:', error);
        const unitContainer = document.querySelector('.unit-detail');
        if (unitContainer) {
            unitContainer.innerHTML = '<div class="error">Error loading locomotive data</div>';
        }
    }
}

// Load data for user profile page - Implementation in photo-display.js

// Helper functions for getting IDs from URLs
function getUnitIdFromUrl() {
    const url = window.location.href;
    
    // Check for locopictureid format
    let match = url.match(/locopictureid=(\d+)/);
    if (match) return match[1];
    
    // Check for unit/:id format
    match = url.match(/unit\/(\d+)\.html/);
    if (match) return match[1];
    
    return null;
}

// Add unit methods to API client
if (window.railhubAPI) {
    // Get unit details
    window.railhubAPI.getUnit = async function(unitId) {
        return await this._fetch(`/units/${unitId}`);
    };
    
    // Get photos for a unit
    window.railhubAPI.getUnitPhotos = async function(unitId) {
        return await this._fetch(`/units/${unitId}/photos`);
    };
}
