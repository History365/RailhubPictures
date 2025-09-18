// Initialize API client
const apiClient = new RailHubAPI();

// Cached data for locomotives and photos
let locomotiveCache = null;
let photoCache = null;

// Function to fetch locomotive data from Cloudflare database
async function fetchLocomotiveData() {
    try {
        console.log("Fetching locomotive data from Cloudflare database...");
        if (locomotiveCache) {
            console.log("Using cached locomotive data");
            return locomotiveCache;
        }
        
        const response = await apiClient.get('/api/units');
        
        if (response && response.success && response.data) {
            console.log(`Successfully fetched ${response.data.length} locomotive records`);
            
            // Transform the data into the format our app expects
            const locomotives = {};
            
            response.data.forEach(unit => {
                // Handle the database fields correctly
                // The unit might have id, railroad, number, model, serial_number, order_number, 
                // frame_number, built_date, notes, created_at
                
                // Make sure number is a string for consistent lookups
                const unitNumber = (unit.number || '').toString();
                const railroad = unit.railroad || '';
                
                // Skip if there's no unit number or railroad
                if (!unitNumber || !railroad) return;
                
                if (!locomotives[unitNumber]) {
                    locomotives[unitNumber] = {};
                }
                
                // Map all the fields from the database
                locomotives[unitNumber][railroad] = {
                    id: unit.id || null,
                    model: unit.model || "Unknown",
                    status: "Active", // Default status since not in the schema
                    serialNumber: unit.serial_number || "Unknown",
                    orderNumber: unit.order_number || "Unknown",
                    frameNumber: unit.frame_number || "Unknown",
                    builder: unit.builder || "Unknown", // Not in schema but we'll keep it
                    buildDate: unit.built_date || "Unknown",
                    location: unit.location || "Unknown", // Not in schema but we'll keep it
                    notes: unit.notes || "",
                    photos: unit.photos || [],
                    createdAt: unit.created_at || new Date().toISOString()
                };
                
                console.log(`Processed ${railroad} ${unitNumber}: ${locomotives[unitNumber][railroad].model}`);
            });
            
            console.log("Processed locomotive data:", locomotives);
            
            // Cache the transformed data
            locomotiveCache = locomotives;
            return locomotives;
        } else {
            console.error("Failed to fetch locomotive data:", response);
            return useSampleLocomotiveData();
        }
    } catch (error) {
        console.error("Error fetching locomotive data:", error);
        return useSampleLocomotiveData();
    }
}

// Function to provide sample locomotive data as fallback
function useSampleLocomotiveData() {
    console.log("Using sample locomotive data as fallback");
    return {
        "4710": {
            CSX: { 
                model: "SD70MAC", 
                status: "Active", 
                serialNumber: "986532",
                builder: "EMD",
                buildDate: "08/1999",
                location: "Jacksonville, FL",
                notes: "Equipped with PTC, rebuilt in 2018",
                photos: ["locopictureid=1.html", "locopictureid=2.html"] 
            },
            BNSF: { 
                model: "ES44DC", 
                status: "Active", 
                serialNumber: "57389",
                builder: "GE",
                buildDate: "03/2005",
                location: "Barstow, CA",
                notes: "Heritage III paint scheme",
                photos: ["locopictureid=3.html"] 
            },
            UP: { 
                model: "SD70M", 
                status: "Deadline", 
                serialNumber: "645792",
                builder: "EMD",
                buildDate: "11/2000",
                location: "North Platte, NE",
                notes: "Awaiting overhaul",
                photos: ["locopictureid=5.html"] 
            }
        },
        "8937": {
            UP: { 
                model: "SD70ACe", 
                status: "Active", 
                serialNumber: "20145679",
                builder: "EMD",
                buildDate: "07/2014",
                location: "Fort Worth, TX",
                notes: "American flag decal on nose",
                photos: ["locopictureid=6.html", "locopictureid=7.html", "locopictureid=8.html"] 
            }
        },
        "7628": {
            BNSF: { 
                model: "ES44C4", 
                status: "Active", 
                serialNumber: "64578",
                builder: "GE",
                buildDate: "04/2012",
                location: "Alliance, NE",
                notes: "New paint applied 2023",
                photos: ["locopictureid=9.html", "locopictureid=10.html"] 
            }
        }
    };
}

// Function to fetch photo data from Cloudflare database
async function fetchPhotoData() {
    try {
        console.log("Fetching photo data from Cloudflare database...");
        if (photoCache) {
            console.log("Using cached photo data");
            return photoCache;
        }
        
        const response = await apiClient.get('/api/photos');
        
        if (response && response.success && response.data) {
            console.log(`Successfully fetched ${response.data.length} photo records`);
            
            // Transform the data into the format our app expects if needed
            const photos = response.data.map(photo => ({
                id: photo.id,
                railroad: photo.railroad,
                unitNumber: photo.unit_number || '',
                model: photo.model || 'Unknown',
                location: photo.location || 'Unknown',
                date: photo.date || new Date().toISOString().split('T')[0],
                photographer: photo.photographer_name || 'Unknown',
                type: photo.photo_type || 'roster',
                description: photo.description || `${photo.railroad} ${photo.unit_number}`,
                url: `locopictureid=${photo.id}.html`
            }));
            
            // Cache the transformed data
            photoCache = photos;
            return photos;
        } else {
            console.error("Failed to fetch photo data:", response);
            return useSamplePhotoData();
        }
    } catch (error) {
        console.error("Error fetching photo data:", error);
        return useSamplePhotoData();
    }
}

// Function to provide sample photo data as fallback
function useSamplePhotoData() {
    console.log("Using sample photo data as fallback");
    return [
        {
            id: 1,
            railroad: "CSX",
            unitNumber: "4710",
            model: "SD70MAC",
            location: "Jacksonville, FL",
            date: "2023-05-15",
            photographer: "John Smith",
            type: "roster",
            description: "CSX 4710 sitting in the Jacksonville yard",
            url: "locopictureid=1.html"
        },
        {
            id: 2,
            railroad: "CSX",
            unitNumber: "4710",
            model: "SD70MAC",
            location: "Waycross, GA",
            date: "2023-06-22",
            photographer: "Sarah Johnson",
            type: "action",
            description: "CSX 4710 leading a southbound manifest",
            url: "locopictureid=2.html"
        },
        {
            id: 3,
            railroad: "BNSF",
            unitNumber: "4710",
            model: "ES44DC",
            location: "Cajon Pass, CA",
            date: "2023-04-10",
            photographer: "Mike Williams",
            type: "scenic",
            description: "BNSF 4710 climbing through the mountains",
            url: "locopictureid=3.html"
        },
        {
            id: 5,
            railroad: "UP",
            unitNumber: "4710",
            model: "SD70M",
            location: "North Platte, NE",
            date: "2023-02-15",
            photographer: "Emily Davis",
            type: "roster",
            description: "UP 4710 in deadline row",
            url: "locopictureid=5.html"
        },
        {
            id: 6,
            railroad: "UP",
            unitNumber: "8937",
            model: "SD70ACe",
            location: "Fort Worth, TX",
            date: "2023-07-01",
            photographer: "David Wilson",
            type: "detail",
            description: "Close-up of the American flag decal on UP 8937",
            url: "locopictureid=6.html"
        },
        {
            id: 7,
            railroad: "UP",
            unitNumber: "8937",
            model: "SD70ACe",
            location: "Chicago, IL",
            date: "2023-08-10",
            photographer: "Lisa Martinez",
            type: "action",
            description: "UP 8937 leading an intermodal train",
            url: "locopictureid=7.html"
        },
        {
            id: 8,
            railroad: "UP",
            unitNumber: "8937",
            model: "SD70ACe",
            location: "Ogden, UT",
            date: "2023-09-05",
            photographer: "Kevin Brown",
            type: "scenic",
            description: "UP 8937 with mountains in the background",
            url: "locopictureid=8.html"
        },
        {
            id: 9,
            railroad: "BNSF",
            unitNumber: "7628",
            model: "ES44C4",
            location: "Alliance, NE",
            date: "2023-03-20",
            photographer: "Robert Taylor",
            type: "roster",
            description: "Freshly painted BNSF 7628",
            url: "locopictureid=9.html"
        },
        {
            id: 10,
            railroad: "BNSF",
            unitNumber: "7628",
            model: "ES44C4",
            location: "Galesburg, IL",
            date: "2023-06-15",
            photographer: "Amy Wilson",
            type: "action",
            description: "BNSF 7628 leading a coal train",
            url: "locopictureid=10.html"
        }
    ];
}

// Track the current search mode
let currentSearchType = 'locomotive';
let loadedLocomotives = null;
let loadedPhotos = null;

// Function to switch between search types
function switchSearchType(type) {
    currentSearchType = type;
    
    // Update tab appearance
    document.getElementById('locomotiveSearchTab').classList.toggle('active', type === 'locomotive');
    document.getElementById('photoSearchTab').classList.toggle('active', type === 'photo');
    
    // Show/hide appropriate search options
    document.getElementById('locomotiveSearchOptions').style.display = type === 'locomotive' ? 'block' : 'none';
    document.getElementById('photoSearchOptions').style.display = type === 'photo' ? 'block' : 'none';
    
    // Update search button text
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        searchButton.textContent = type === 'locomotive' ? 'Search Locomotives' : 'Search Photos';
    }
    
    // Clear previous search results
    document.getElementById('searchResults').innerHTML = '';
    
    // Pre-load data for the selected tab
    if (type === 'locomotive' && !loadedLocomotives) {
        showLoadingIndicator();
        fetchLocomotiveData().then(data => {
            loadedLocomotives = data;
            hideLoadingIndicator();
        });
    } else if (type === 'photo' && !loadedPhotos) {
        showLoadingIndicator();
        fetchPhotoData().then(data => {
            loadedPhotos = data;
            hideLoadingIndicator();
        });
    }
}

// Show loading indicator while data loads
function showLoadingIndicator() {
    const results = document.getElementById('searchResults');
    results.innerHTML = '<div class="loading-indicator"><div class="spinner"></div><p>Loading data from database...</p></div>';
}

// Hide loading indicator
function hideLoadingIndicator() {
    const loadingIndicator = document.querySelector('.loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}

// Main search function that handles both types
async function performSearch() {
    showLoadingIndicator();
    
    try {
        if (currentSearchType === 'locomotive') {
            await searchLocomotives();
        } else {
            await searchPhotos();
        }
    } catch (error) {
        console.error("Error performing search:", error);
        document.getElementById('searchResults').innerHTML = `
            <div class="no-results">
                <h3>Search Error</h3>
                <p>Sorry, there was an error processing your search. Please try again.</p>
            </div>
        `;
    } finally {
        hideLoadingIndicator();
    }
}

// Function to search for locomotives
async function searchLocomotives() {
    const searchTerm = document.getElementById('unitSearch').value.trim();
    const railroad = document.getElementById('railroad').value;
    const model = document.getElementById('model').value.trim().toUpperCase();
    
    // Fetch locomotive data if not already loaded
    if (!loadedLocomotives) {
        loadedLocomotives = await fetchLocomotiveData();
    }
    
    const activeOnly = document.getElementById('activeOnly').checked;
    const deadlineOnly = document.getElementById('deadlineOnly').checked;
    const scrappedOnly = document.getElementById('scrappedOnly').checked;
    const rebuiltOnly = document.getElementById('rebuiltOnly').checked;
    
    const includePhotos = document.getElementById('includePhotos').value;
    
    const resultsDiv = document.getElementById('searchResults');
    
    // Display search query
    const searchQueryDisplay = document.getElementById('searchQueryDisplay');
    const queryTextElement = document.getElementById('queryText');
    
    if (searchTerm || railroad || model) {
        let queryText = [];
        if (searchTerm) queryText.push(`"${searchTerm}"`);
        if (railroad) queryText.push(`${railroad} Railroad`);
        if (model) queryText.push(`Model ${model}`);
        
        queryTextElement.textContent = queryText.join(', ');
        searchQueryDisplay.style.display = 'flex';
    } else {
        searchQueryDisplay.style.display = 'none';
    }

    // Fetch data from Cloudflare database
    fetchLocomotiveData(searchTerm, railroad, model, activeOnly, deadlineOnly, scrappedOnly, rebuiltOnly, includePhotos)
        .then(results => {
            displayLocomotiveResults(results, resultsDiv);
        })
        .catch(error => {
            console.error('Error fetching locomotive data:', error);
            // Fall back to sample data if database fetch fails
            let results = searchLocomotivesFromSampleData(searchTerm, railroad, model, activeOnly, deadlineOnly, scrappedOnly, rebuiltOnly, includePhotos);
            displayLocomotiveResults(results, resultsDiv);
        });
}

// Function to fetch locomotive data from Cloudflare database
async function fetchLocomotiveData(searchTerm, railroad, model, activeOnly, deadlineOnly, scrappedOnly, rebuiltOnly, includePhotos) {
    try {
        // If the API client is available from cloudflare/api-client.js
        if (typeof apiClient !== 'undefined') {
            // Construct query parameters for the API
            const params = new URLSearchParams();
            if (searchTerm) params.append('number', searchTerm);
            if (railroad) params.append('railroad', railroad);
            if (model) params.append('model', model);
            
            if (activeOnly) params.append('status', 'Active');
            if (deadlineOnly) params.append('status', 'Deadline');
            if (scrappedOnly) params.append('status', 'Scrapped');
            if (rebuiltOnly) params.append('rebuilt', 'true');
            
            if (includePhotos === 'with') params.append('hasPhotos', 'true');
            if (includePhotos === 'without') params.append('hasPhotos', 'false');
            
            // Call the API endpoint
            const response = await apiClient.get('/api/units?' + params.toString());
            return response.data || [];
        }
        
        // If API client is not available, fall back to sample data
        throw new Error('API client not available');
    } catch (error) {
        console.error('Error fetching from database:', error);
        throw error;
    }
}

// Function to search locomotives from sample data (fallback)
function searchLocomotivesFromSampleData(searchTerm, railroad, model, activeOnly, deadlineOnly, scrappedOnly, rebuiltOnly, includePhotos) {
    let results = [];
    
    // Search for locomotives by number
    if (searchTerm && locomotives[searchTerm]) {
        const locoMatches = locomotives[searchTerm];
        
        for (const [rr, data] of Object.entries(locoMatches)) {
            // Apply railroad filter
            if (railroad && railroad !== rr) continue;
            
            // Apply model filter
            if (model && !data.model.toUpperCase().includes(model)) continue;
            
            // Apply status filters
            if (activeOnly && data.status !== "Active") continue;
            if (deadlineOnly && data.status !== "Deadline") continue;
            if (scrappedOnly && data.status !== "Scrapped") continue;
            if (rebuiltOnly && !data.notes.toLowerCase().includes("rebuilt")) continue;
            
            // Apply photo filters
            if (includePhotos === "with" && (!data.photos || data.photos.length === 0)) continue;
            if (includePhotos === "without" && data.photos && data.photos.length > 0) continue;
            
            // Add to results
            results.push({
                number: searchTerm,
                railroad: rr,
                ...data
            });
        }
    }
    
    // If no specific unit was searched, search by other criteria
    if (!searchTerm || results.length === 0) {
        for (const [number, railroads] of Object.entries(locomotives)) {
            for (const [rr, data] of Object.entries(railroads)) {
                // Apply filters
                if (railroad && railroad !== rr) continue;
                if (model && !data.model.toUpperCase().includes(model)) continue;
                if (activeOnly && data.status !== "Active") continue;
                if (deadlineOnly && data.status !== "Deadline") continue;
                if (scrappedOnly && data.status !== "Scrapped") continue;
                if (rebuiltOnly && !data.notes.toLowerCase().includes("rebuilt")) continue;
                if (includePhotos === "with" && (!data.photos || data.photos.length === 0)) continue;
                if (includePhotos === "without" && data.photos && data.photos.length > 0) continue;
                
                results.push({
                    number,
                    railroad: rr,
                    ...data
                });
            }
        }
    }
    
    return results;
}

// Function to display locomotive results
function displayLocomotiveResults(results, resultsDiv) {
    if (results && results.length > 0) {
        let resultsHTML = results.map(loco => {
            // Create status class
            let statusClass = '';
            switch (loco.status) {
                case 'Active': statusClass = 'status-active'; break;
                case 'Deadline': statusClass = 'status-deadline'; break;
                case 'Scrapped': statusClass = 'status-scrapped'; break;
                default: statusClass = '';
            }
            
            // Get the database ID if available
            const locoId = loco.id ? `<span class="db-id">(DB ID: ${loco.id})</span>` : '';
            
            return `
                <div class="locomotive-card">
                    <img src="assets/images/MG_3312.jpg" alt="${loco.railroad} ${loco.number}" class="locomotive-image">
                    <div class="locomotive-info">
                        <h3>${loco.railroad} ${loco.number} ${locoId} <span class="status-tag ${statusClass}">${loco.status}</span></h3>
                        
                        <div class="locomotive-meta">
                            <div class="meta-item">
                                <i class="icon">📋</i>
                                <span>${loco.model || 'Unknown'}</span>
                            </div>
                            <div class="meta-item">
                                <i class="icon">🏭</i>
                                <span>${loco.builder || 'Unknown'}</span>
                            </div>
                            <div class="meta-item">
                                <i class="icon">📅</i>
                                <span>${loco.buildDate || 'Unknown'}</span>
                            </div>
                        </div>
                        
                        <div class="locomotive-details">
                            <div class="detail-row">
                                <div class="detail-label">Serial #:</div>
                                <div class="detail-value">${loco.serialNumber || 'Unknown'}</div>
                            </div>
                            ${loco.orderNumber ? `
                            <div class="detail-row">
                                <div class="detail-label">Order #:</div>
                                <div class="detail-value">${loco.orderNumber}</div>
                            </div>` : ''}
                            ${loco.frameNumber ? `
                            <div class="detail-row">
                                <div class="detail-label">Frame #:</div>
                                <div class="detail-value">${loco.frameNumber}</div>
                            </div>` : ''}
                            <div class="detail-row">
                                <div class="detail-label">Location:</div>
                                <div class="detail-value">${loco.location || 'Unknown'}</div>
                            </div>
                            <div class="detail-row">
                                <div class="detail-label">Notes:</div>
                                <div class="detail-value">${loco.notes || 'No notes available'}</div>
                            </div>
                            ${loco.createdAt ? `
                            <div class="detail-row">
                                <div class="detail-label">Added:</div>
                                <div class="detail-value">${new Date(loco.createdAt).toLocaleDateString()}</div>
                            </div>` : ''}
                        </div>
                        
                        ${loco.photos && loco.photos.length > 0 ? 
                        `<a href="${loco.photos[0]}" class="photos-link">
                            View ${loco.photos.length} Photo${loco.photos.length !== 1 ? 's' : ''}
                        </a>` : 
                        `<span class="photos-link" style="background: #f0f0f0; color: #999;">No Photos Available</span>`}
                    </div>
                </div>
            `;
        }).join('');
        
        resultsDiv.innerHTML = `
            <h3 style="margin-bottom: 1.5rem; font-size: 1.3rem;">Locomotive Search Results</h3>
            <div class="results-grid">
                ${resultsHTML}
            </div>
        `;
    } else {
        resultsDiv.innerHTML = `
            <div class="no-results">
                <h3>No Locomotives Found</h3>
                <p>We couldn't find any locomotives matching your search criteria.</p>
                
                <div class="suggestions">
                    <h4>Suggestions:</h4>
                    <ul>
                        <li>Check the locomotive number for typos</li>
                        <li>Try searching with fewer filters</li>
                        <li>Try a different railroad or model</li>
                        <li>Use just the number without specifying a railroad</li>
                    </ul>
                </div>
            </div>
        `;
    }
}

// Function to search for photos
async function searchPhotos() {
    const unitNumber = document.getElementById('photoUnitSearch').value.trim();
    const railroad = document.getElementById('photoRailroad').value;
    const photographer = document.getElementById('photographer').value.trim().toLowerCase();
    const location = document.getElementById('location').value.trim().toLowerCase();
    
    const rosterShots = document.getElementById('rosterShots')?.checked || false;
    const actionShots = document.getElementById('actionShots')?.checked || false;
    const detailShots = document.getElementById('detailShots')?.checked || false;
    const scenicShots = document.getElementById('scenicShots')?.checked || false;
    
    const resultsDiv = document.getElementById('searchResults');
    
    // Fetch photo data if not already loaded
    if (!loadedPhotos) {
        loadedPhotos = await fetchPhotoData();
    }
    
    // Display search query
    const searchQueryDisplay = document.getElementById('searchQueryDisplay');
    const queryTextElement = document.getElementById('queryText');
    
    if (unitNumber || railroad || photographer || location || rosterShots || actionShots || detailShots || scenicShots) {
        let queryText = [];
        if (unitNumber) queryText.push(`Locomotive ${unitNumber}`);
        if (railroad) queryText.push(`${railroad} Railroad`);
        if (photographer) queryText.push(`Photographer: ${photographer}`);
        if (location) queryText.push(`Location: ${location}`);
        
        let photoTypes = [];
        if (rosterShots) photoTypes.push("Roster");
        if (actionShots) photoTypes.push("Action");
        if (detailShots) photoTypes.push("Detail");
        if (scenicShots) photoTypes.push("Scenic");
        
        if (photoTypes.length > 0) {
            queryText.push(`Photo Types: ${photoTypes.join(', ')}`);
        }
        
        queryTextElement.textContent = queryText.join(', ');
        searchQueryDisplay.style.display = 'flex';
    } else {
        searchQueryDisplay.style.display = 'none';
    }

    // Fetch data from Cloudflare database
    fetchPhotoData(unitNumber, railroad, photographer, location, rosterShots, actionShots, detailShots, scenicShots)
        .then(results => {
            displayPhotoResults(results, resultsDiv);
        })
        .catch(error => {
            console.error('Error fetching photo data:', error);
            // Fall back to sample data if database fetch fails
            let filteredPhotos = searchPhotosFromSampleData(unitNumber, railroad, photographer, location, 
                                            rosterShots, actionShots, detailShots, scenicShots);
            displayPhotoResults(filteredPhotos, resultsDiv);
        });
}

// Function to fetch photo data from Cloudflare database
async function fetchPhotoData(unitNumber, railroad, photographer, location, rosterShots, actionShots, detailShots, scenicShots) {
    try {
        // If the API client is available from cloudflare/api-client.js
        if (typeof apiClient !== 'undefined') {
            // Construct query parameters for the API
            const params = new URLSearchParams();
            if (unitNumber) params.append('unitNumber', unitNumber);
            if (railroad) params.append('railroad', railroad);
            if (photographer) params.append('photographer', photographer);
            if (location) params.append('location', location);
            
            let photoTypes = [];
            if (rosterShots) photoTypes.push("roster");
            if (actionShots) photoTypes.push("action");
            if (detailShots) photoTypes.push("detail");
            if (scenicShots) photoTypes.push("scenic");
            
            if (photoTypes.length > 0) {
                params.append('photoTypes', photoTypes.join(','));
            }
            
            // Call the API endpoint
            const response = await apiClient.get('/api/photos?' + params.toString());
            return response.data || [];
        }
        
        // If API client is not available, fall back to sample data
        throw new Error('API client not available');
    } catch (error) {
        console.error('Error fetching from database:', error);
        throw error;
    }
}

// Function to search photos from sample data (fallback)
function searchPhotosFromSampleData(unitNumber, railroad, photographer, location, rosterShots, actionShots, detailShots, scenicShots) {
    // Filter photos based on criteria
    let filteredPhotos = [...photos];
    
    if (unitNumber) {
        filteredPhotos = filteredPhotos.filter(photo => photo.unitNumber === unitNumber);
    }
    
    if (railroad) {
        filteredPhotos = filteredPhotos.filter(photo => photo.railroad === railroad);
    }
    
    if (photographer) {
        filteredPhotos = filteredPhotos.filter(photo => 
            photo.photographer.toLowerCase().includes(photographer)
        );
    }
    
    if (location) {
        filteredPhotos = filteredPhotos.filter(photo => 
            photo.location.toLowerCase().includes(location)
        );
    }
    
    // Filter by photo types
    if (rosterShots || actionShots || detailShots || scenicShots) {
        filteredPhotos = filteredPhotos.filter(photo => 
            (rosterShots && photo.type === 'roster') ||
            (actionShots && photo.type === 'action') ||
            (detailShots && photo.type === 'detail') ||
            (scenicShots && photo.type === 'scenic')
        );
    }
    
    return filteredPhotos;
}

// Function to display photo results
function displayPhotoResults(photos, resultsDiv) {
    if (photos && photos.length > 0) {
        const photoResults = photos.map(photo => `
            <div class="locomotive-card">
                <img src="assets/images/MG_3312.jpg" alt="${photo.railroad} ${photo.unitNumber}" class="locomotive-image">
                <div class="locomotive-info">
                    <h3>${photo.railroad} ${photo.unitNumber} - ${photo.model}</h3>
                    
                    <div class="locomotive-meta">
                        <div class="meta-item">
                            <i class="icon">📍</i>
                            <span>${photo.location}</span>
                        </div>
                        <div class="meta-item">
                            <i class="icon">📅</i>
                            <span>${photo.date}</span>
                        </div>
                        <div class="meta-item">
                            <i class="icon">📷</i>
                            <span>${photo.photographer}</span>
                        </div>
                    </div>
                    
                    <div class="locomotive-details">
                        <div class="detail-row">
                            <div class="detail-value">${photo.description}</div>
                        </div>
                    </div>
                    
                    <a href="${photo.url}" class="photos-link">
                        View Photo
                    </a>
                </div>
            </div>
        `).join('');
        
        resultsDiv.innerHTML = `
            <h3 style="margin-bottom: 1.5rem; font-size: 1.3rem;">Photo Search Results</h3>
            <div class="results-grid">
                ${photoResults}
            </div>
        `;
    } else {
        resultsDiv.innerHTML = `
            <div class="no-results">
                <h3>No Photos Found</h3>
                <p>We couldn't find any photos matching your search criteria.</p>
                
                <div class="suggestions">
                    <h4>Suggestions:</h4>
                    <ul>
                        <li>Check the locomotive number for typos</li>
                        <li>Try searching with fewer filters</li>
                        <li>Try a different railroad</li>
                        <li>Leave some fields blank for broader results</li>
                    </ul>
                </div>
            </div>
        `;
    }
}

// Reset all filters
function resetFilters() {
    if (currentSearchType === 'locomotive') {
        // Reset locomotive search inputs
        document.getElementById('unitSearch').value = '';
        document.getElementById('model').value = '';
        document.getElementById('railroad').selectedIndex = 0;
        document.getElementById('includePhotos').selectedIndex = 0;
        
        document.getElementById('activeOnly').checked = false;
        document.getElementById('deadlineOnly').checked = false;
        document.getElementById('scrappedOnly').checked = false;
        document.getElementById('rebuiltOnly').checked = false;
    } else {
        // Reset photo search inputs
        document.getElementById('photoUnitSearch').value = '';
        document.getElementById('photoRailroad').selectedIndex = 0;
        document.getElementById('photographer').value = '';
        document.getElementById('location').value = '';
        
        document.getElementById('rosterShots').checked = false;
        document.getElementById('actionShots').checked = false;
        document.getElementById('detailShots').checked = false;
        document.getElementById('scenicShots').checked = false;
    }
    
    // Clear results
    document.getElementById('searchResults').innerHTML = '';
}

// Clear search results and reset filters
function clearSearch() {
    // Reset all inputs
    document.getElementById('unitSearch').value = '';
    document.getElementById('photoUnitSearch').value = '';
    document.getElementById('model').value = '';
    document.getElementById('railroad').selectedIndex = 0;
    document.getElementById('photoRailroad').selectedIndex = 0;
    document.getElementById('includePhotos').selectedIndex = 0;
    document.getElementById('photographer').value = '';
    document.getElementById('location').value = '';
    
    document.getElementById('activeOnly').checked = false;
    document.getElementById('deadlineOnly').checked = false;
    document.getElementById('scrappedOnly').checked = false;
    document.getElementById('rebuiltOnly').checked = false;
    document.getElementById('rosterShots').checked = false;
    document.getElementById('actionShots').checked = false;
    document.getElementById('detailShots').checked = false;
    document.getElementById('scenicShots').checked = false;
    
    // Clear search query display
    document.getElementById('searchQueryDisplay').style.display = 'none';
    document.getElementById('queryText').textContent = '';
    
    // Clear header search field
    document.getElementById('headerSearchInput').value = '';
    
    // Clear results
    document.getElementById('searchResults').innerHTML = '';
    
    // Update URL to remove query parameter
    const newUrl = new URL(window.location);
    newUrl.searchParams.delete('q');
    window.history.pushState({}, '', newUrl);
}

// Function to immediately search without waiting for filter selection
async function performImmediateSearch(query) {
    if (!query) return;
    
    const resultsDiv = document.getElementById('searchResults');
    showLoadingIndicator();
    
    try {
        // Load locomotive and photo data from database
        const locomotives = await fetchLocomotiveData();
        const photos = await fetchPhotoData();
        
        // Search in the loaded data
        const locoResults = searchAllLocomotives(query, locomotives);
        const photoResults = searchAllPhotos(query, photos);
        
        // Display results
        if (locoResults.length > 0 || photoResults.length > 0) {
            let results = '';
            
            // Display locomotives if any found
            if (locoResults.length > 0) {
                results += `
                    <h3 style="margin-bottom: 1.5rem; font-size: 1.3rem;">Locomotive Results</h3>
                    <div class="results-grid">
                        ${locoResults.join('')}
                    </div>
                `;
            }
            
            // Display photos if any found
            if (photoResults.length > 0) {
                results += `
                    <h3 style="margin: 2rem 0 1.5rem; font-size: 1.3rem;">Photo Results</h3>
                    <div class="results-grid">
                        ${photoResults.join('')}
                    </div>
                `;
            }
            
            resultsDiv.innerHTML = results;
        } else {
            // No results found
            resultsDiv.innerHTML = `
                <div class="no-results">
                    <h3>No Results Found</h3>
                    <p>We couldn't find any results matching "${query}".</p>
                    
                    <div class="suggestions">
                        <h4>Suggestions:</h4>
                        <ul>
                            <li>Check your spelling</li>
                            <li>Try more general terms</li>
                            <li>Try different keywords</li>
                            <li>Use the advanced filters to refine your search</li>
                        </ul>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error performing search:', error);
        resultsDiv.innerHTML = `
            <div class="no-results">
                <h3>Search Error</h3>
                <p>There was an error processing your search. Please try again later.</p>
            </div>
        `;
    } finally {
        hideLoadingIndicator();
    }
}

// Fallback immediate search using sample data
function fallbackImmediateSearch(query, resultsDiv) {
    // Search in locomotives and photos using sample data
    let locoResults = searchAllLocomotives(query);
    let photoResults = searchAllPhotos(query);
    displayImmediateSearchResults(query, locoResults, photoResults, resultsDiv);
}

// Display results from immediate search
function displayImmediateSearchResults(query, locoResults, photoResults, resultsDiv) {
    let results = '';
    
    if (locoResults.length > 0 || photoResults.length > 0) {
        // Display locomotives if any found
        if (locoResults.length > 0) {
            results += `
                <h3 style="margin-bottom: 1.5rem; font-size: 1.3rem;">Locomotive Results</h3>
                <div class="results-grid">
                    ${displayLocomotiveResults(locoResults, null) || ''}
                </div>
            `;
        }
        
        // Display photos if any found
        if (photoResults.length > 0) {
            results += `
                <h3 style="margin: 2rem 0 1.5rem; font-size: 1.3rem;">Photo Results</h3>
                <div class="results-grid">
                    ${displayPhotoResults(photoResults, null) || ''}
                </div>
            `;
        }
        
        resultsDiv.innerHTML = results;
    } else {
        resultsDiv.innerHTML = `
            <div class="no-results">
                <h3>No Results Found</h3>
                <p>We couldn't find any results matching "${query}".</p>
                
                <div class="suggestions">
                    <h4>Suggestions:</h4>
                    <ul>
                        <li>Check your spelling</li>
                        <li>Try more general terms</li>
                        <li>Try different keywords</li>
                        <li>Use the advanced filters to refine your search</li>
                    </ul>
                </div>
            </div>
        `;
    }
}

// Helper function to search all locomotives
function searchAllLocomotives(query, data) {
    query = query.toLowerCase();
    let results = [];
    
    // Use provided data or fallback to loadedLocomotives or fetch fresh data
    const locomotives = data || loadedLocomotives || useSampleLocomotiveData();
    
    // Search through all locomotive data
    for (const [number, railroads] of Object.entries(locomotives)) {
        for (const [railroad, data] of Object.entries(railroads)) {
            // Check if query matches any locomotive data
            const searchableFields = [
                number,
                railroad,
                data.model || '',
                data.location || '',
                data.notes || '',
                data.builder || '',
                data.serialNumber || '',
                data.orderNumber || '',
                data.frameNumber || '',
                data.buildDate || ''
            ];
            
            // Join all fields into one string for easier searching
            const allText = searchableFields.join(' ').toLowerCase();
            
            if (allText.includes(query)) {
                results.push({
                    number,
                    railroad,
                    ...data
                });
            }
        }
    }
    
    return results;
}

// Helper function to search all photos
function searchAllPhotos(query, data) {
    query = query.toLowerCase();
    let results = [];
    
    // Use provided data or fallback to loadedPhotos or fetch fresh data
    const photos = data || loadedPhotos || useSamplePhotoData();
    
    // Search through all photo data
    for (const photo of photos) {
        // Check if query matches any photo data
        if (
            photo.unitNumber.toLowerCase().includes(query) ||
            photo.railroad.toLowerCase().includes(query) ||
            photo.model.toLowerCase().includes(query) ||
            photo.location.toLowerCase().includes(query) ||
            photo.photographer.toLowerCase().includes(query) ||
            photo.description.toLowerCase().includes(query) ||
            photo.type.toLowerCase().includes(query)
        ) {
            results.push(photo);
        }
    }
    
    return results;
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing search page...");
    
    // Preload locomotive and photo data in the background
    fetchLocomotiveData().then(data => {
        loadedLocomotives = data;
        console.log("Locomotive data preloaded:", Object.keys(data).length, "unique numbers");
    }).catch(error => {
        console.error("Error preloading locomotive data:", error);
    });
    
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');
    
    if (q) {
        // Set the value in both search fields (locomotive and photo)
        document.getElementById('unitSearch').value = q;
        document.getElementById('photoUnitSearch').value = q;
        
        // Display the query text
        document.getElementById('queryText').textContent = `"${q}"`;
        document.getElementById('searchQueryDisplay').style.display = 'flex';
        
        // Perform immediate search for both photos and locomotives
        performImmediateSearch(q);
    }
    
    // Setup header search form to perform immediate search
    document.getElementById('headerSearchForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const searchQuery = document.getElementById('headerSearchInput').value.trim();
        if (searchQuery) {
            // Update URL with query parameter without reloading the page
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('q', searchQuery);
            window.history.pushState({}, '', newUrl);
            
            // Update search fields and perform search
            document.getElementById('unitSearch').value = searchQuery;
            document.getElementById('photoUnitSearch').value = searchQuery;
            document.getElementById('queryText').textContent = `"${searchQuery}"`;
            document.getElementById('searchQueryDisplay').style.display = 'flex';
            performImmediateSearch(searchQuery);
        }
    });
    
    // Set up event listeners for keyboard shortcuts
    document.getElementById('unitSearch').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    document.getElementById('photoUnitSearch').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
});