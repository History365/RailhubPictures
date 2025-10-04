// Search functionality for Cloudflare database integration
document.addEventListener('DOMContentLoaded', function() {
    // Initialize search functionality if we're on the search page
    if (document.querySelector('.search-form')) {
        initializeSearch();
        
        // Check for URL parameters to perform search on page load
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('railroad') || urlParams.has('number') || urlParams.has('model')) {
            performSearch(urlParams);
        }
    }
});

// Initialize search form and functionality
function initializeSearch() {
    // Load railroad options for dropdown
    loadRailroadOptions();
    
    // Set up form submission
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(searchForm);
            const searchParams = new URLSearchParams();
            
            // Convert form data to URL parameters
            for (const [key, value] of formData.entries()) {
                if (value) searchParams.append(key, value);
            }
            
            // Update URL with search parameters
            const newUrl = window.location.pathname + '?' + searchParams.toString();
            window.history.pushState({}, '', newUrl);
            
            // Perform search
            performSearch(searchParams);
        });
    }
    
    // Set up clear button
    const clearButton = document.querySelector('.clear-button');
    if (clearButton) {
        clearButton.addEventListener('click', function() {
            // Clear form inputs
            const inputs = document.querySelectorAll('.search-form input, .search-form select');
            inputs.forEach(input => {
                input.value = '';
            });
            
            // Clear URL parameters
            window.history.pushState({}, '', window.location.pathname);
            
            // Clear results
            const resultsContainer = document.querySelector('.search-results');
            if (resultsContainer) {
                resultsContainer.innerHTML = '<div class="no-results">Enter search criteria above to find locomotives</div>';
            }
        });
    }
}

// Load railroad options from the API
async function loadRailroadOptions() {
    try {
        const railroadSelect = document.querySelector('select[name="railroad"]');
        if (!railroadSelect) return;
        
        // Show loading state
        railroadSelect.innerHTML = '<option value="">Loading...</option>';
        
        // Get all units from API
        const units = await window.railhubAPI.getAllUnits();
        
        // Extract unique railroads
        const railroads = [...new Set(units.map(unit => unit.railroad))].sort();
        
        // Clear loading state
        railroadSelect.innerHTML = '<option value="">All Railroads</option>';
        
        // Add options to select
        railroads.forEach(railroad => {
            const option = document.createElement('option');
            option.value = railroad;
            option.textContent = railroad;
            railroadSelect.appendChild(option);
        });
        
        // Initialize model dropdown
        const modelSelect = document.querySelector('select[name="model"]');
        if (modelSelect) {
            // Extract unique models
            const models = [...new Set(units.map(unit => unit.model).filter(Boolean))].sort();
            
            modelSelect.innerHTML = '<option value="">All Models</option>';
            
            // Add options to select
            models.forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                modelSelect.appendChild(option);
            });
        }
        
        // Set values from URL parameters if present
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('railroad')) {
            railroadSelect.value = urlParams.get('railroad');
        }
        if (modelSelect && urlParams.has('model')) {
            modelSelect.value = urlParams.get('model');
        }
    } catch (error) {
        console.error('Error loading railroad options:', error);
    }
}

// Perform search with given parameters
async function performSearch(searchParams) {
    try {
        const resultsContainer = document.querySelector('.search-results');
        if (!resultsContainer) return;
        
        // Show loading state
        resultsContainer.innerHTML = '<div class="loading">Searching...</div>';
        
        // Build query for API
        const queryParams = {
            railroad: searchParams.get('railroad') || '',
            number: searchParams.get('number') || '',
            model: searchParams.get('model') || '',
            serial: searchParams.get('serial') || '',
            order: searchParams.get('order') || '',
            frame: searchParams.get('frame') || ''
        };
        
        // Use the search API
        const units = await window.railhubAPI.searchUnits(queryParams);
        
        // Display results
        if (!units || units.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">No locomotives found matching your criteria</div>';
            return;
        }
        
        // Build results HTML
        let resultsHTML = `<div class="results-count">${units.length} locomotive${units.length > 1 ? 's' : ''} found</div>`;
        resultsHTML += '<div class="results-grid">';
        
        units.forEach(unit => {
            resultsHTML += `
                <div class="result-card">
                    <div class="result-header">
                        <h3>${unit.railroad} ${unit.number}</h3>
                        <span class="model">${unit.model || 'Unknown Model'}</span>
                    </div>
                    
                    <div class="result-details">
                        ${unit.serial_number ? `<div class="detail-row"><span>Serial:</span> ${unit.serial_number}</div>` : ''}
                        ${unit.order_number ? `<div class="detail-row"><span>Order:</span> ${unit.order_number}</div>` : ''}
                        ${unit.frame_number ? `<div class="detail-row"><span>Frame:</span> ${unit.frame_number}</div>` : ''}
                        ${unit.built_date ? `<div class="detail-row"><span>Built:</span> ${new Date(unit.built_date).toLocaleDateString()}</div>` : ''}
                    </div>
                    
                    <div class="result-footer">
                        <a href="unit/${unit.id}.html" class="view-button">View Photos</a>
                    </div>
                </div>
            `;
        });
        
        resultsHTML += '</div>';
        resultsContainer.innerHTML = resultsHTML;
    } catch (error) {
        console.error('Error performing search:', error);
        const resultsContainer = document.querySelector('.search-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = '<div class="error">Error searching locomotives</div>';
        }
    }
}

// Add search method to API client
if (window.railhubAPI) {
    window.railhubAPI.searchUnits = async function(params) {
        // Build query string from params
        const queryString = Object.entries(params)
            .filter(([_, value]) => value)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
        
        return await this._fetch(`/units/search?${queryString}`);
    };
}
