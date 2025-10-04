/**
 * Frontend JavaScript for Railroad API integration
 * This file provides helper functions for interacting with the Railroad API
 */

// Fetch units for a specific railroad
async function fetchRailroadUnits(railroadName) {
  try {
    const response = await fetch(`/api/units?railroad=${encodeURIComponent(railroadName)}`);
    if (!response.ok) {
      throw new Error(`Error fetching units: ${response.status}`);
    }
    
    const data = await response.json();
    return data.units || [];
  } catch (error) {
    console.error(`Failed to fetch railroad units for ${railroadName}:`, error);
    return [];
  }
}

// Fetch statistics for a specific railroad
async function fetchRailroadStats(railroadName) {
  try {
    const response = await fetch(`/api/railroad/${encodeURIComponent(railroadName)}/stats`);
    if (!response.ok) {
      throw new Error(`Error fetching stats: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch railroad stats for ${railroadName}:`, error);
    return {
      railroad: railroadName,
      unit_count: 0,
      photo_count: 0,
      most_photographed: null
    };
  }
}

// Search for railroads by name
async function searchRailroads(searchTerm) {
  try {
    const response = await fetch(`/api/railroads/search?q=${encodeURIComponent(searchTerm)}`);
    if (!response.ok) {
      throw new Error(`Error searching railroads: ${response.status}`);
    }
    
    const data = await response.json();
    return data.railroads || [];
  } catch (error) {
    console.error(`Failed to search railroads with term ${searchTerm}:`, error);
    return [];
  }
}

// Render railroad cards based on search results
function renderRailroadCards(railroads, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = '';
  
  if (railroads.length === 0) {
    container.innerHTML = '<div class="alert alert-info">No railroads found matching your search.</div>';
    return;
  }
  
  railroads.forEach(railroad => {
    // Fetch stats for this railroad
    fetchRailroadStats(railroad.railroad)
      .then(stats => {
        const card = document.createElement('div');
        card.className = 'railroad-card';
        card.innerHTML = `
          <div class="railroad-card-header">
            <h3>${railroad.railroad}</h3>
          </div>
          <div class="railroad-card-body">
            <div class="railroad-stats">
              <div class="stat">
                <span class="stat-value">${stats.unit_count}</span>
                <span class="stat-label">Units</span>
              </div>
              <div class="stat">
                <span class="stat-value">${stats.photo_count}</span>
                <span class="stat-label">Photos</span>
              </div>
            </div>
            ${stats.most_photographed ? `
              <div class="most-photographed">
                <div class="photo-label">Most Photographed:</div>
                <div class="unit-name">${stats.most_photographed.road_name} ${stats.most_photographed.road_number}</div>
                <div class="unit-model">${stats.most_photographed.model}</div>
                <div class="photo-count">${stats.most_photographed.photo_count} photos</div>
              </div>
            ` : ''}
          </div>
          <div class="railroad-card-footer">
            <a href="/railroad/${railroad.railroad}" class="btn btn-primary">View Units</a>
          </div>
        `;
        container.appendChild(card);
      });
  });
}

// Initialize railroad search functionality on a page
function initRailroadSearch(searchInputId, resultsContainerId) {
  const searchInput = document.getElementById(searchInputId);
  if (!searchInput) return;
  
  let debounceTimer;
  
  searchInput.addEventListener('input', event => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const searchTerm = event.target.value.trim();
      
      if (searchTerm.length > 0) {
        searchRailroads(searchTerm)
          .then(results => {
            renderRailroadCards(results, resultsContainerId);
          });
      } else {
        // If search is cleared, show all railroads
        fetch('/api/railroads/search')
          .then(response => response.json())
          .then(data => {
            renderRailroadCards(data.railroads, resultsContainerId);
          });
      }
    }, 300); // Debounce for 300ms
  });
  
  // Initial load - show all railroads
  fetch('/api/railroads/search')
    .then(response => response.json())
    .then(data => {
      renderRailroadCards(data.railroads, resultsContainerId);
    });
}

// Document ready function
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the railroads page and initialize if needed
  if (document.getElementById('railroad-search-input') && document.getElementById('railroad-results')) {
    initRailroadSearch('railroad-search-input', 'railroad-results');
  }
  
  // Check if we're on a specific railroad page and load units
  const railroadNameElement = document.getElementById('railroad-name');
  const unitsContainer = document.getElementById('railroad-units');
  
  if (railroadNameElement && unitsContainer) {
    const railroadName = railroadNameElement.dataset.railroadName;
    if (railroadName) {
      fetchRailroadUnits(railroadName)
        .then(units => {
          // Render units
          if (units.length === 0) {
            unitsContainer.innerHTML = '<div class="alert alert-info">No units found for this railroad.</div>';
            return;
          }
          
          units.forEach(unit => {
            const unitCard = document.createElement('div');
            unitCard.className = 'unit-card';
            unitCard.innerHTML = `
              <div class="unit-header">
                <h3>${unit.road_name} ${unit.road_number}</h3>
              </div>
              <div class="unit-body">
                <div class="unit-info">
                  <div class="unit-model">${unit.model || 'Unknown Model'}</div>
                  <div class="unit-builder">${unit.builder || ''} ${unit.build_date || ''}</div>
                </div>
              </div>
              <div class="unit-footer">
                <a href="/locomotive/${unit.id}" class="btn btn-sm btn-primary">View Details</a>
              </div>
            `;
            unitsContainer.appendChild(unitCard);
          });
        });
    }
  }
});