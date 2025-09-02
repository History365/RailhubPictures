// Photo display script for Cloudflare integration
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a page that displays photos
    const photoGrids = document.querySelectorAll('.photo-grid, .photos-container');
    if (photoGrids.length > 0) {
        loadAndDisplayPhotos();
    }
    
    // Check if we're on a single photo page
    const singlePhoto = document.querySelector('.photo-detail');
    if (singlePhoto) {
        loadSinglePhoto();
    }
    
    // Check if we're on a user profile page
    const userProfile = document.querySelector('.profile-photos');
    if (userProfile) {
        loadUserProfilePhotos();
    }
});

// Load and display photos on the homepage or gallery pages
async function loadAndDisplayPhotos() {
    try {
        // Get the container for photos
        const photoContainer = document.querySelector('.photo-grid') || 
                              document.querySelector('.photos-container');
        if (!photoContainer) return;
        
        // Show loading state
        photoContainer.innerHTML = '<div class="loading">Loading photos...</div>';
        
        // Get photos from API
        const photos = await window.railhubAPI.getLatestPhotos(20);
        
        // Clear loading indicator
        photoContainer.innerHTML = '';
        
        if (!photos || photos.length === 0) {
            photoContainer.innerHTML = '<div class="no-photos">No photos found</div>';
            return;
        }
        
        // Display each photo
        photos.forEach(photo => {
            const photoElement = createPhotoElement(photo);
            photoContainer.appendChild(photoElement);
        });
    } catch (error) {
        console.error('Error loading photos:', error);
        const photoContainer = document.querySelector('.photo-grid') || 
                              document.querySelector('.photos-container');
        if (photoContainer) {
            photoContainer.innerHTML = '<div class="error">Error loading photos</div>';
        }
    }
}

// Create a photo element for display in the grid
function createPhotoElement(photo) {
    const photoDiv = document.createElement('div');
    photoDiv.className = 'photo-item';
    
    // Get primary locomotive info
    let primaryUnit = photo.units?.find(u => u.is_primary) || photo.units?.[0];
    let unitInfo = primaryUnit ? 
        `${primaryUnit.railroad} ${primaryUnit.number} - ${primaryUnit.model || 'Unknown'}` : 
        'Unknown Locomotive';
    
    // Format date
    let photoDate = photo.photo_date ? 
        new Date(photo.photo_date).toLocaleDateString() : 
        'Unknown Date';
    
    // Create photo HTML
    photoDiv.innerHTML = `
        <a href="showpictureid=${photo.id}.html" class="photo-link">
            <div class="photo-wrapper">
                <img src="${window.railhubAPI.getImageURL(photo.filename)}" 
                     alt="${photo.title || unitInfo}" 
                     class="photo-image"
                     loading="lazy">
            </div>
            <div class="photo-info">
                <h3 class="photo-title">${photo.title || unitInfo}</h3>
                <div class="photo-meta">
                    <span class="photo-railroad">${primaryUnit?.railroad || ''}</span>
                    <span class="photo-date">${photoDate}</span>
                </div>
                <div class="photo-user">
                    By: ${photo.display_name || photo.username || 'Anonymous'}
                </div>
            </div>
        </a>
    `;
    
    return photoDiv;
}

// Load a single photo for the photo detail page
async function loadSinglePhoto() {
    try {
        // Get photo ID from URL
        const photoId = getPhotoIdFromUrl();
        if (!photoId) return;
        
        // Get photo container
        const photoContainer = document.querySelector('.photo-detail');
        if (!photoContainer) return;
        
        // Show loading state
        photoContainer.innerHTML = '<div class="loading">Loading photo...</div>';
        
        // Get photo from API
        const photo = await window.railhubAPI.getPhoto(photoId);
        
        if (!photo) {
            photoContainer.innerHTML = '<div class="error">Photo not found</div>';
            return;
        }
        
        // Format date
        let photoDate = photo.photo_date ? 
            new Date(photo.photo_date).toLocaleDateString() : 
            'Unknown Date';
        
        // Create locomotives list
        let locomotivesList = '';
        if (photo.units && photo.units.length > 0) {
            locomotivesList = '<ul class="locomotives-list">';
            photo.units.forEach(unit => {
                locomotivesList += `<li class="${unit.is_primary ? 'primary-unit' : ''}">
                    <a href="locopictureid=${unit.id}.html">
                        ${unit.railroad} ${unit.number} - ${unit.model || 'Unknown'}
                        ${unit.is_primary ? ' (Primary)' : ''}
                    </a>
                </li>`;
            });
            locomotivesList += '</ul>';
        }
        
        // Create photo HTML
        photoContainer.innerHTML = `
            <div class="photo-main">
                <img src="${window.railhubAPI.getImageURL(photo.filename)}" 
                     alt="${photo.title || 'Photo detail'}" 
                     class="main-image">
            </div>
            <div class="photo-sidebar">
                <h1 class="photo-title">${photo.title || 'Untitled Photo'}</h1>
                <div class="photo-meta">
                    <div class="meta-item">
                        <span class="meta-label">Date:</span>
                        <span class="meta-value">${photoDate}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Location:</span>
                        <span class="meta-value">${photo.location || 'Unknown'}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Photographer:</span>
                        <span class="meta-value">
                            <a href="user/${photo.username || photo.user_id}.html">
                                ${photo.display_name || photo.username || 'Anonymous'}
                            </a>
                        </span>
                    </div>
                </div>
                
                <div class="photo-locomotives">
                    <h2>Locomotives</h2>
                    ${locomotivesList || 'No locomotives associated with this photo'}
                </div>
                
                <div class="photo-description">
                    <h2>Description</h2>
                    <p>${photo.description || 'No description provided'}</p>
                </div>
                
                <div class="photo-stats">
                    <div class="stat">
                        <span class="stat-value">${photo.view_count || 0}</span>
                        <span class="stat-label">Views</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${photo.comment_count || 0}</span>
                        <span class="stat-label">Comments</span>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading photo:', error);
        const photoContainer = document.querySelector('.photo-detail');
        if (photoContainer) {
            photoContainer.innerHTML = '<div class="error">Error loading photo</div>';
        }
    }
}

// Load photos for a user profile
async function loadUserProfilePhotos() {
    try {
        // Get username from URL
        const username = getUsernameFromUrl();
        if (!username) return;
        
        // Get photo container
        const photoContainer = document.querySelector('.profile-photos');
        if (!photoContainer) return;
        
        // Show loading state
        photoContainer.innerHTML = '<div class="loading">Loading photos...</div>';
        
        // Get user profile from API
        const userProfile = await window.railhubAPI.getUserProfile(username);
        
        if (!userProfile) {
            photoContainer.innerHTML = '<div class="error">User not found</div>';
            return;
        }
        
        // Update profile info if needed
        updateProfileInfo(userProfile.profile);
        
        // Display photos
        if (!userProfile.photos || userProfile.photos.length === 0) {
            photoContainer.innerHTML = '<div class="no-photos">This user has not uploaded any photos yet</div>';
            return;
        }
        
        // Clear loading indicator
        photoContainer.innerHTML = '';
        
        // Display each photo
        userProfile.photos.forEach(photo => {
            const photoElement = createPhotoElement(photo);
            photoContainer.appendChild(photoElement);
        });
    } catch (error) {
        console.error('Error loading user profile photos:', error);
        const photoContainer = document.querySelector('.profile-photos');
        if (photoContainer) {
            photoContainer.innerHTML = '<div class="error">Error loading photos</div>';
        }
    }
}

// Update profile information on the user profile page
function updateProfileInfo(profile) {
    if (!profile) return;
    
    // Update username
    const usernameElement = document.querySelector('.profile-username');
    if (usernameElement) {
        usernameElement.textContent = profile.display_name || profile.username || 'Anonymous';
    }
    
    // Update avatar
    const avatarElement = document.querySelector('.profile-avatar img');
    if (avatarElement) {
        avatarElement.src = profile.avatar_url || 'assets/images/default-avatar.png';
        avatarElement.alt = profile.display_name || profile.username || 'User Avatar';
    }
    
    // Update bio
    const bioElement = document.querySelector('.profile-bio');
    if (bioElement) {
        bioElement.textContent = profile.bio || 'No bio provided';
    }
}

// Helper function to get photo ID from URL
function getPhotoIdFromUrl() {
    const url = window.location.href;
    const match = url.match(/showpictureid=(\d+)/);
    return match ? match[1] : null;
}

// Helper function to get username from URL
function getUsernameFromUrl() {
    const url = window.location.href;
    const match = url.match(/user\/([^/]+)\.html/);
    return match ? match[1] : null;
}
