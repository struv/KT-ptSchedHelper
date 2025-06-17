// Cache for geocoded addresses
const addressCache = {
    get: (address) => {
        const cached = localStorage.getItem(`addr_${address}`);
        return cached ? JSON.parse(cached) : null;
    },
    set: (address, coords) => {
        localStorage.setItem(`addr_${address}`, JSON.stringify(coords));
    }
};

// Basic location validation
function validateLocation(location) {
    location = location.trim();
    if (location.length === 0) {
        return { valid: false, message: "Please enter a ZIP code or city name" };
    }
    
    // Check if input is numeric (ZIP code)
    if (/^\d+$/.test(location)) {
        if (location.length !== 5) {
            return { valid: false, message: "Please enter a valid 5-digit ZIP code" };
        }
        return { valid: true, location: location, type: 'zip' };
    }
    
    // Input is alphabetic (city name)
    if (!/^[a-zA-Z\s]+$/.test(location)) {
        return { valid: false, message: "City name should only contain letters and spaces" };
    }
    return { valid: true, location: location, type: 'city' };
}

// Geocode location using Nominatim
async function geocodeLocation(location, type) {
    // Check cache first
    const cached = addressCache.get(location);
    if (cached) {
        return cached;
    }

    try {
        let url;
        if (type === 'zip') {
            url = `https://nominatim.openstreetmap.org/search?format=json&postalcode=${location}&countrycodes=us&limit=1`;
        } else {
            url = `https://nominatim.openstreetmap.org/search?format=json&city=${location}&countrycodes=us&limit=1`;
        }

        const response = await fetch(url);
        const data = await response.json();
        
        if (data.length === 0) {
            throw new Error(type === 'zip' ? "ZIP code not found" : "City not found");
        }

        const coords = {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
        };
        
        // Cache the result
        addressCache.set(location, coords);
        return coords;
    } catch (error) {
        throw new Error(`Unable to find ${type === 'zip' ? 'ZIP code' : 'city'} location`);
    }
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
             Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
             Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Display results
function displayResults(userCoords) {
    const officesWithDistance = offices.map(office => ({
        ...office,
        distance: calculateDistance(userCoords.lat, userCoords.lng, office.lat, office.lng)
    }));

    // Sort by distance
    officesWithDistance.sort((a, b) => a.distance - b.distance);

    const officeList = document.getElementById('office-list');
    officeList.innerHTML = officesWithDistance.map(office => {
        const searchQuery = `Kids & Teens Medical Group ${office.address}`;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
        return `
            <div class="office-card">
                <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer">
                    <div class="office-name">${office.name}</div>
                    <div class="office-address">${office.address}</div>
                    <div class="office-distance">${office.distance.toFixed(1)} miles away</div>
                </a>
            </div>
        `;
    }).join('');

    document.getElementById('results').style.display = 'block';
}

// Show error message
function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Hide error message
function hideError() {
    document.getElementById('error-message').style.display = 'none';
}

// Main search function
async function searchOffices() {
    const locationInput = document.getElementById('zipcode');
    const searchButton = document.getElementById('search-button');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const location = locationInput.value;
    
    // Reset UI
    hideError();
    results.style.display = 'none';
    
    // Validate location
    const validation = validateLocation(location);
    if (!validation.valid) {
        showError(validation.message);
        return;
    }
    
    // Show loading state
    searchButton.disabled = true;
    searchButton.textContent = 'Searching...';
    loading.style.display = 'block';
    
    try {
        // Geocode user location
        const userCoords = await geocodeLocation(validation.location, validation.type);
        // Display results
        displayResults(userCoords);
    } catch (error) {
        showError(error.message);
    } finally {
        // Reset button state
        searchButton.disabled = false;
        searchButton.textContent = 'Find Nearest Offices';
        loading.style.display = 'none';
    }
}

// Simple client-side router for navbar
function showPage(page) {
    const container = document.querySelector('.container');
    const providers = document.getElementById('providers-page');
    const navPatients = document.getElementById('nav-patients');
    const navProviders = document.getElementById('nav-providers');
    if (page === 'providers') {
        container.style.display = 'none';
        providers.style.display = 'block';
        navPatients.classList.remove('active');
        navProviders.classList.add('active');
    } else {
        container.style.display = 'block';
        providers.style.display = 'none';
        navPatients.classList.add('active');
        navProviders.classList.remove('active');
    }
}

function handleHashChange() {
    if (window.location.hash === '#providers') {
        showPage('providers');
    } else {
        showPage('patients');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('search-button').addEventListener('click', searchOffices);
    document.getElementById('zipcode').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchOffices();
        }
    });
    document.getElementById('zipcode').addEventListener('input', hideError);
    
    document.getElementById('nav-patients').addEventListener('click', function(e) {
        e.preventDefault();
        window.location.hash = '#patients';
    });
    document.getElementById('nav-providers').addEventListener('click', function(e) {
        e.preventDefault();
        window.location.hash = '#providers';
    });
    
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
}); 