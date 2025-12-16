// API configuration
// Automatically use the correct API URL based on environment
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5001/api'  // Development
    : `${window.location.origin}/api`;  // Production

// Google Maps API key (loaded from backend)
let GOOGLE_MAPS_API_KEY = null;
let googleMapsLoaded = false;

// Get the input field
const searchInput = document.getElementById('searchInput');
const cafeGrid = document.getElementById('cafeGrid');
const resultsCount = document.getElementById('resultsCount');

// Filter modal elements
const filterModal = document.getElementById('filterModal');
const filterToggleBtn = document.getElementById('filterToggleBtn');
const closeFilterBtn = document.getElementById('closeFilterBtn');
const applyFiltersBtn = document.getElementById('applyFiltersBtn');
const distanceSlider = document.getElementById('distanceSlider');
const distanceValue = document.getElementById('distanceValue');

// Filter state
let currentFilters = {
    rating: 'any',
    price: [],
    distance: 10,
    ambience: [],
    diet: [],
    experience: []
};

let allCafes = []; // Store all cafes for filtering
let userLocation = null; // Store user's current location for distance calculation
let favoriteCafes = JSON.parse(localStorage.getItem('favoriteCafes') || '[]'); // Store favorite cafe IDs

// Google Maps variables
let map = null;
let markers = [];
let infoWindow = null;
let directionsService = null;
let directionsRenderer = null;
let currentRoute = null;

// Fetch cafes from the API
async function fetchCafes(location = 'Sydney, Australia') {
    // Show loading state
    cafeGrid.innerHTML = '<div class="error-message">Loading cafes...</div>';
    resultsCount.textContent = 'Searching...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/cafes?location=${encodeURIComponent(location)}&radius=5000`);
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Store user location for distance calculation
        if (data.coordinates) {
            userLocation = data.coordinates;
        }
        
        allCafes = data.cafes; // Store all cafes for filtering
        displayCafes(data.cafes);
        initializeMap(data.cafes);
    } catch (error) {
        console.error('Error fetching cafes:', error);
        cafeGrid.innerHTML = `
            <div class="error-message">
                Failed to load cafes. 
                <br><br>
                <strong>Possible issues:</strong>
                <br>• Backend server not running (start with: python pyscrpt.py)
                <br>• Google Maps API key not configured
                <br>• Network connection issue
                <br><br>
                Error: ${error.message}
            </div>
        `;
        resultsCount.textContent = 'Error loading cafes';
    }
}

// Fetch cafes using user's geolocation
async function fetchNearbyCafes() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }
    
    // Show loading state
    cafeGrid.innerHTML = '<div class="error-message">Getting your location...</div>';
    resultsCount.textContent = 'Locating...';
    
    navigator.geolocation.getCurrentPosition(async (position) => {
        try {
            cafeGrid.innerHTML = '<div class="error-message">Finding nearby cafes...</div>';
            
            const response = await fetch(`${API_BASE_URL}/cafes/nearby`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    radius: 5000
                })
            });
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Store user location for distance calculation
            if (data.coordinates) {
                userLocation = data.coordinates;
            }
            
            allCafes = data.cafes; // Store all cafes for filtering
            displayCafes(data.cafes);
        } catch (error) {
            console.error('Error fetching nearby cafes:', error);
            cafeGrid.innerHTML = `
                <div class="error-message">
                    Failed to load nearby cafes.
                    <br><br>
                    Error: ${error.message}
                </div>
            `;
            resultsCount.textContent = 'Error';
        }
    }, (error) => {
        console.error('Geolocation error:', error);
        cafeGrid.innerHTML = '<div class="error-message">Unable to get your location. Please search manually.</div>';
        resultsCount.textContent = 'Location error';
    });
}

// Display cafes in the grid
function displayCafes(cafes) {
    if (!cafes || cafes.length === 0) {
        cafeGrid.innerHTML = '<div class="no-results">No cafes found. Try a different location.</div>';
        resultsCount.textContent = '0 spots found';
        return;
    }
    
    cafeGrid.innerHTML = cafes.map(cafe => createCafeCard(cafe)).join('');
    resultsCount.textContent = `${cafes.length} spot${cafes.length !== 1 ? 's' : ''} found`;
}

// Create a single cafe card HTML
function createCafeCard(cafe) {
    const rating = cafe.rating ? cafe.rating.toFixed(1) : 'N/A';
    const ratingsCount = cafe.user_ratings_total ? `(${cafe.user_ratings_total})` : '';
    const priceLevel = '₹'.repeat(cafe.price_level || 2);
    const distance = calculateDistance(cafe.lat, cafe.lng);
    const photoUrl = cafe.photo_url || 'https://via.placeholder.com/400x250?text=No+Image';
    const openStatus = cafe.is_open !== null ? (cafe.is_open ? 'Open' : 'Closed') : '';
    const openClass = cafe.is_open ? 'open' : 'closed';
    const isFavorite = favoriteCafes.includes(cafe.place_id);
    const heartFill = isFavorite ? 'currentColor' : 'none';
    
    // Generate random tags for demo (in production, these would come from the API or be based on real data)
    const possibleTags = generateCafeTags(cafe);
    const tagsHtml = possibleTags.length > 0 ? `
        <div class="cafe-tags">
            ${possibleTags.map(tag => `<span class="cafe-tag ${tag.class}">${tag.label}</span>`).join('')}
        </div>
    ` : '';
    
    return `
        <div class="cafe-card" data-place-id="${cafe.place_id}">
            <div class="cafe-image" style="background-image: url('${photoUrl}');">
                <button class="favorite-btn ${isFavorite ? 'is-favorite' : ''}" onclick="toggleFavorite('${cafe.place_id}', event)">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="${heartFill}" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>
                <div class="cafe-rating">
                    <span class="star">⭐</span> ${rating} ${ratingsCount}
                </div>
                <div class="cafe-price">${priceLevel}</div>
            </div>
            <div class="cafe-info">
                <div class="cafe-header">
                    <h3 class="cafe-name">${cafe.name}</h3>
                    ${distance ? `<span class="cafe-distance">📍 ${distance}</span>` : ''}
                </div>
                <p class="cafe-address">${cafe.address}</p>
                ${openStatus ? `<p class="cafe-status ${openClass}">
                    <span class="status-dot"></span> ${openStatus}
                </p>` : ''}
                ${tagsHtml}
                <button class="directions-btn" onclick="openDirections(${cafe.lat}, ${cafe.lng}, '${cafe.name.replace(/'/g, "\\'")}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                    Get directions
                </button>
            </div>
        </div>
    `;
}

// Generate cafe tags based on cafe data
function generateCafeTags(cafe) {
    const tags = [];
    
    // Add tags based on rating
    if (cafe.rating >= 4.5) {
        tags.push({ label: 'Fine Dining', class: 'fine-dining' });
    } else if (cafe.rating >= 3.5) {
        tags.push({ label: 'Casual', class: 'casual' });
    }
    
    // Add random ambience tags for variety (in production, this would come from API)
    const ambienceTags = ['Indoor', 'Outdoor', 'Open Air'];
    const randomAmbience = ambienceTags[Math.floor(Math.random() * ambienceTags.length)];
    tags.push({ label: randomAmbience, class: randomAmbience.toLowerCase().replace(' ', '-') });
    
    // Add diet tags
    const dietTags = ['Veg', 'Non-Veg', 'Vegan'];
    const randomDiet = dietTags[Math.floor(Math.random() * dietTags.length)];
    tags.push({ label: randomDiet, class: randomDiet.toLowerCase().replace('-', '-') });
    
    // Limit to 3-4 tags
    return tags.slice(0, 4);
}

// Toggle favorite status
function toggleFavorite(placeId, event) {
    event.stopPropagation();
    
    const cafe = allCafes.find(c => c.place_id === placeId);
    
    const index = favoriteCafes.indexOf(placeId);
    if (index > -1) {
        // Remove from favorites
        favoriteCafes.splice(index, 1);
        
        // Also remove from stored cafe data
        const storedCafes = JSON.parse(localStorage.getItem('favoriteCafesData') || '[]');
        const updatedStoredCafes = storedCafes.filter(c => c.place_id !== placeId);
        localStorage.setItem('favoriteCafesData', JSON.stringify(updatedStoredCafes));
    } else {
        // Add to favorites
        favoriteCafes.push(placeId);
        
        // Store the full cafe data for the favorites page
        if (cafe) {
            const storedCafes = JSON.parse(localStorage.getItem('favoriteCafesData') || '[]');
            storedCafes.push(cafe);
            localStorage.setItem('favoriteCafesData', JSON.stringify(storedCafes));
        }
    }
    
    localStorage.setItem('favoriteCafes', JSON.stringify(favoriteCafes));
    
    // Update the button appearance
    const btn = event.currentTarget;
    const svg = btn.querySelector('svg');
    if (favoriteCafes.includes(placeId)) {
        btn.classList.add('is-favorite');
        svg.setAttribute('fill', 'currentColor');
    } else {
        btn.classList.remove('is-favorite');
        svg.setAttribute('fill', 'none');
    }
    
    // Update favorites count if on favorites page
    updateFavoritesCount();
}

// Calculate distance using Haversine formula
function calculateDistance(lat, lng) {
    if (!userLocation) {
        return null; // Return null if user location is not available
    }
    
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat - userLocation.lat);
    const dLng = toRad(lng - userLocation.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(userLocation.lat)) * Math.cos(toRad(lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance < 1 ? `${(distance * 1000).toFixed(0)} m` : `${distance.toFixed(1)} km`;
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

// Open directions in Google Maps - with in-app route display option
function openDirections(lat, lng, cafeName) {
    // Switch to map view if not already there
    const mapContainer = document.getElementById('mapContainer');
    const cafeGrid = document.getElementById('cafeGrid');
    
    if (mapContainer && mapContainer.classList.contains('hidden')) {
        cafeGrid.classList.add('hidden');
        mapContainer.classList.remove('hidden');
        
        // Update toggle buttons
        document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        const mapBtn = document.querySelector('.toggle-btn[data-view="map"]');
        if (mapBtn) mapBtn.classList.add('active');
    }
    
    // If user location is available, show route on map
    if (userLocation && map && googleMapsLoaded) {
        showDirectionsOnMap(userLocation, {lat: lat, lng: lng}, cafeName);
    } else if (userLocation) {
        // Fallback: Open in Google Maps app/website
        window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${lat},${lng}&travelmode=driving`, '_blank');
    } else {
        // No user location, just open destination
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    }
}

// Show directions on the map
function showDirectionsOnMap(origin, destination, cafeName) {
    if (!directionsService) {
        directionsService = new google.maps.DirectionsService();
    }
    
    if (!directionsRenderer) {
        directionsRenderer = new google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: false,
            polylineOptions: {
                strokeColor: '#d88a3b',
                strokeWeight: 5,
                strokeOpacity: 0.8
            }
        });
    }
    
    const request = {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING
    };
    
    directionsService.route(request, (result, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
            currentRoute = result;
            
            // Show route info panel
            const route = result.routes[0].legs[0];
            showRouteInfo(cafeName, route.distance.text, route.duration.text, destination);
        } else {
            console.error('Directions request failed:', status);
            alert('Could not calculate route. Opening in Google Maps...');
            window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}`, '_blank');
        }
    });
}

// Show route information panel
function showRouteInfo(cafeName, distance, duration, destination) {
    // Remove existing route info if present
    let routeInfo = document.getElementById('routeInfoPanel');
    if (!routeInfo) {
        routeInfo = document.createElement('div');
        routeInfo.id = 'routeInfoPanel';
        routeInfo.className = 'route-info-panel';
        document.getElementById('mapContainer').appendChild(routeInfo);
    }
    
    routeInfo.innerHTML = `
        <div class="route-info-header">
            <h3>🚗 Directions to ${cafeName}</h3>
            <button class="close-route-btn" onclick="clearDirections()">✕</button>
        </div>
        <div class="route-info-details">
            <div class="route-stat">
                <span class="route-icon">📍</span>
                <div>
                    <div class="route-label">Distance</div>
                    <div class="route-value">${distance}</div>
                </div>
            </div>
            <div class="route-stat">
                <span class="route-icon">⏱️</span>
                <div>
                    <div class="route-label">Duration</div>
                    <div class="route-value">${duration}</div>
                </div>
            </div>
        </div>
        <div class="route-actions">
            <button class="route-action-btn primary" onclick="window.open('https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving', '_blank')">
                Open in Google Maps
            </button>
            <button class="route-action-btn" onclick="clearDirections()">
                Clear Route
            </button>
        </div>
    `;
    
    routeInfo.style.display = 'block';
}

// Clear directions from map
function clearDirections() {
    if (directionsRenderer) {
        directionsRenderer.setDirections({routes: []});
    }
    
    const routeInfo = document.getElementById('routeInfoPanel');
    if (routeInfo) {
        routeInfo.style.display = 'none';
    }
    
    currentRoute = null;
}

// Search functionality
searchInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const searchQuery = searchInput.value.trim();
        if (searchQuery) {
            fetchCafes(searchQuery);
        }
    }
});

// Filter button handlers
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const buttonText = this.textContent.trim();
        if (buttonText === 'Near me') {
            fetchNearbyCafes();
        } else if (buttonText === 'Top rated') {
            // Filter cafes by rating
            const sortedCafes = [...allCafes].sort((a, b) => (b.rating || 0) - (a.rating || 0));
            displayCafes(sortedCafes);
            if (map && markers.length > 0) {
                addCafeMarkers(sortedCafes);
            }
        } else if (buttonText === 'Map view') {
            // Switch to map view
            switchToMapView();
        }
    });
});

// Filter Modal Functions
function openFilterModal() {
    filterModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeFilterModal() {
    filterModal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

// Distance slider update
distanceSlider.addEventListener('input', function() {
    const value = this.value;
    distanceValue.textContent = `${value} km`;
    currentFilters.distance = parseInt(value);
});

// Filter option click handlers
document.querySelectorAll('.filter-option').forEach(option => {
    option.addEventListener('click', function() {
        const filterType = this.getAttribute('data-filter');
        const filterValue = this.getAttribute('data-value');
        
        if (filterType === 'rating') {
            // Rating is single-select
            document.querySelectorAll('[data-filter="rating"]').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            currentFilters.rating = filterValue;
        } else {
            // Price, ambience, diet, experience are multi-select
            this.classList.toggle('active');
            
            if (this.classList.contains('active')) {
                if (!currentFilters[filterType].includes(filterValue)) {
                    currentFilters[filterType].push(filterValue);
                }
            } else {
                currentFilters[filterType] = currentFilters[filterType].filter(v => v !== filterValue);
            }
        }
    });
});

// Apply filters
function applyFilters() {
    let filteredCafes = [...allCafes];
    
    // Filter by rating
    if (currentFilters.rating !== 'any') {
        const minRating = parseFloat(currentFilters.rating);
        filteredCafes = filteredCafes.filter(cafe => cafe.rating >= minRating);
    }
    
    // Filter by price
    if (currentFilters.price.length > 0) {
        filteredCafes = filteredCafes.filter(cafe => {
            const priceLevel = cafe.price_level || 2;
            return currentFilters.price.includes(priceLevel.toString());
        });
    }
    
    // Filter by distance (placeholder - needs actual implementation with user location)
    // This would require calculating distance from user's current location
    
    // Display filtered cafes
    displayCafes(filteredCafes);
    
    // Update map markers
    if (map && markers.length > 0) {
        addCafeMarkers(filteredCafes);
    }
    
    // Update button text
    const count = filteredCafes.length;
    document.getElementById('applyBtnText').textContent = `Show ${count} cafe${count !== 1 ? 's' : ''}`;
    
    // Close modal
    closeFilterModal();
}

// Reset filters
function resetFilters() {
    currentFilters = {
        rating: 'any',
        price: [],
        distance: 10,
        ambience: [],
        diet: [],
        experience: []
    };
    
    // Reset UI
    document.querySelectorAll('.filter-option').forEach(option => {
        option.classList.remove('active');
    });
    document.querySelector('[data-filter="rating"][data-value="any"]').classList.add('active');
    distanceSlider.value = 10;
    distanceValue.textContent = '10 km';
    
    // Show all cafes
    displayCafes(allCafes);
    
    // Update map markers
    if (map && markers.length > 0) {
        addCafeMarkers(allCafes);
    }
}

// Event listeners for filter modal
filterToggleBtn.addEventListener('click', openFilterModal);
closeFilterBtn.addEventListener('click', closeFilterModal);
applyFiltersBtn.addEventListener('click', applyFilters);

// Close modal when clicking outside
filterModal.addEventListener('click', function(e) {
    if (e.target === filterModal) {
        closeFilterModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && filterModal.classList.contains('active')) {
        closeFilterModal();
    }
});

// Show favorites page
function showFavoritesPage() {
    const resultsSection = document.getElementById('resultsSection');
    const favoritesSection = document.getElementById('favoritesSection');
    const emptyFavorites = document.getElementById('emptyFavorites');
    const favoritesGrid = document.getElementById('favoritesGrid');
    
    // Hide results, show favorites
    resultsSection.classList.add('hidden');
    favoritesSection.classList.remove('hidden');
    
    // Load favorite cafes from localStorage
    const storedCafes = JSON.parse(localStorage.getItem('favoriteCafesData') || '[]');
    
    // Update count
    updateFavoritesCount();
    
    if (storedCafes.length === 0) {
        // Show empty state
        emptyFavorites.classList.remove('hidden');
        favoritesGrid.classList.add('hidden');
    } else {
        // Show favorites
        emptyFavorites.classList.add('hidden');
        favoritesGrid.classList.remove('hidden');
        
        // Display favorite cafes
        favoritesGrid.innerHTML = storedCafes.map(cafe => createCafeCard(cafe)).join('');
    }
}

// Show main explore page
function showExplorePage() {
    const resultsSection = document.getElementById('resultsSection');
    const favoritesSection = document.getElementById('favoritesSection');
    
    favoritesSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');
}

// Update favorites count
function updateFavoritesCount() {
    const favoritesCountEl = document.getElementById('favoritesCount');
    const count = favoriteCafes.length;
    if (favoritesCountEl) {
        favoritesCountEl.textContent = `${count} saved spot${count !== 1 ? 's' : ''}`;
    }
}

// Favorites button click
const favoritesBtn = document.getElementById('favoritesBtn');
favoritesBtn.addEventListener('click', showFavoritesPage);

// Back button click
const backBtn = document.getElementById('backBtn');
backBtn.addEventListener('click', showExplorePage);

// Explore cafes button (from empty state)
const exploreCafesBtn = document.getElementById('exploreCafesBtn');
exploreCafesBtn.addEventListener('click', showExplorePage);

// Dark mode toggle functionality
const darkModeBtn = document.getElementById('darkModeBtn');

// Check for saved theme preference or default to dark mode
const currentTheme = localStorage.getItem('theme') || 'dark';
if (currentTheme === 'light') {
    document.body.classList.add('light-mode');
}

// Update the dark mode button icon based on current theme
function updateDarkModeIcon() {
    const isDarkMode = !document.body.classList.contains('light-mode');
    const iconPath = darkModeBtn.querySelector('svg path');
    
    if (isDarkMode) {
        // Moon icon (current dark mode)
        iconPath.setAttribute('d', 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z');
    } else {
        // Sun icon (light mode active)
        iconPath.setAttribute('d', 'M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41');
    }
}

// Initialize icon on page load
updateDarkModeIcon();

darkModeBtn.addEventListener('click', function() {
    // Toggle light mode class
    document.body.classList.toggle('light-mode');
    
    // Save preference to localStorage
    const theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
    localStorage.setItem('theme', theme);
    
    // Update the icon
    updateDarkModeIcon();
});

// Initialize Google Map
function initializeMap(cafes) {
    if (!cafes || cafes.length === 0) return;
    
    // Get the center point (first cafe or user location)
    const center = userLocation || { lat: cafes[0].lat, lng: cafes[0].lng };
    
    // Create map
    map = new google.maps.Map(document.getElementById('map'), {
        center: center,
        zoom: 13,
        styles: getMapStyles(),
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true
    });
    
    // Create info window
    infoWindow = new google.maps.InfoWindow();
    
    // Add user location marker if available
    if (userLocation) {
        new google.maps.Marker({
            position: userLocation,
            map: map,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2
            },
            title: 'Your Location'
        });
    }
    
    // Add markers for cafes
    addCafeMarkers(cafes);
}

// Add markers for cafes
function addCafeMarkers(cafes) {
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    
    cafes.forEach((cafe, index) => {
        const marker = new google.maps.Marker({
            position: { lat: cafe.lat, lng: cafe.lng },
            map: map,
            title: cafe.name,
            animation: google.maps.Animation.DROP,
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 0C9.373 0 4 5.373 4 12c0 9 12 30 12 30s12-21 12-30c0-6.627-5.373-12-12-12z" fill="#d88a3b"/>
                        <circle cx="16" cy="12" r="6" fill="#050404"/>
                        <text x="16" y="16" font-size="10" fill="#d88a3b" text-anchor="middle" font-weight="bold">☕</text>
                    </svg>
                `),
                scaledSize: new google.maps.Size(32, 42),
                anchor: new google.maps.Point(16, 42)
            }
        });
        
        // Add click listener to show info window
        marker.addListener('click', () => {
            const content = createInfoWindowContent(cafe);
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
        });
        
        markers.push(marker);
    });
    
    // Fit map to show all markers
    if (markers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        if (userLocation) {
            bounds.extend(userLocation);
        }
        markers.forEach(marker => bounds.extend(marker.getPosition()));
        map.fitBounds(bounds);
    }
}

// Create info window content
function createInfoWindowContent(cafe) {
    const rating = cafe.rating ? cafe.rating.toFixed(1) : 'N/A';
    const ratingsCount = cafe.user_ratings_total ? `(${cafe.user_ratings_total})` : '';
    const openStatus = cafe.is_open !== null ? (cafe.is_open ? '🟢 Open' : '🔴 Closed') : '';
    
    return `
        <div class="map-info-window">
            <h3 class="cafe-name">${cafe.name}</h3>
            <div class="cafe-rating">
                <span>⭐ ${rating}</span> ${ratingsCount}
            </div>
            ${openStatus ? `<div style="font-size: 13px; margin: 5px 0;">${openStatus}</div>` : ''}
            <p class="cafe-address">${cafe.address}</p>
            <button class="directions-btn" onclick="openDirections(${cafe.lat}, ${cafe.lng}, '${cafe.name.replace(/'/g, "\\'")}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
                Get directions
            </button>
        </div>
    `;
}

// Map styles for dark/light mode
function getMapStyles() {
    const isDarkMode = !document.body.classList.contains('light-mode');
    
    if (isDarkMode) {
        return [
            { elementType: "geometry", stylers: [{ color: "#1a1512" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#1a1512" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#9e8c7b" }] },
            {
                featureType: "administrative.locality",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d88a3b" }]
            },
            {
                featureType: "poi",
                elementType: "labels.text.fill",
                stylers: [{ color: "#9e8c7b" }]
            },
            {
                featureType: "poi.park",
                elementType: "geometry",
                stylers: [{ color: "#263c3f" }]
            },
            {
                featureType: "poi.park",
                elementType: "labels.text.fill",
                stylers: [{ color: "#6b9a76" }]
            },
            {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#2d2520" }]
            },
            {
                featureType: "road",
                elementType: "geometry.stroke",
                stylers: [{ color: "#212a37" }]
            },
            {
                featureType: "road",
                elementType: "labels.text.fill",
                stylers: [{ color: "#9ca5b3" }]
            },
            {
                featureType: "road.highway",
                elementType: "geometry",
                stylers: [{ color: "#3d3026" }]
            },
            {
                featureType: "road.highway",
                elementType: "geometry.stroke",
                stylers: [{ color: "#1f2835" }]
            },
            {
                featureType: "road.highway",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d88a3b" }]
            },
            {
                featureType: "transit",
                elementType: "geometry",
                stylers: [{ color: "#2f3948" }]
            },
            {
                featureType: "transit.station",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d88a3b" }]
            },
            {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#17263c" }]
            },
            {
                featureType: "water",
                elementType: "labels.text.fill",
                stylers: [{ color: "#515c6d" }]
            },
            {
                featureType: "water",
                elementType: "labels.text.stroke",
                stylers: [{ color: "#17263c" }]
            }
        ];
    } else {
        return [
            {
                featureType: "poi.business",
                stylers: [{ visibility: "off" }]
            },
            {
                featureType: "poi.park",
                elementType: "labels.text.fill",
                stylers: [{ color: "#447530" }]
            }
        ];
    }
}

// Switch to map view function
function switchToMapView() {
    const resultsSection = document.getElementById('resultsSection');
    const mapContainer = document.getElementById('mapContainer');
    const cafeGrid = document.getElementById('cafeGrid');
    
    // Scroll to results section
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Show map, hide grid
    setTimeout(() => {
        cafeGrid.classList.add('hidden');
        mapContainer.classList.remove('hidden');
        
        // Update toggle buttons
        document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.toggle-btn[data-view="map"]').classList.add('active');
        
        // Trigger map resize and fit bounds
        if (map) {
            google.maps.event.trigger(map, 'resize');
            if (markers.length > 0) {
                const bounds = new google.maps.LatLngBounds();
                if (userLocation) bounds.extend(userLocation);
                markers.forEach(marker => bounds.extend(marker.getPosition()));
                map.fitBounds(bounds);
            }
        }
    }, 500);
}

// View toggle functionality
const viewToggle = document.getElementById('viewToggle');
const mapContainer = document.getElementById('mapContainer');

viewToggle.addEventListener('click', (e) => {
    const btn = e.target.closest('.toggle-btn');
    if (!btn) return;
    
    const view = btn.getAttribute('data-view');
    
    // Update active button
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Toggle views
    if (view === 'map') {
        cafeGrid.classList.add('hidden');
        mapContainer.classList.remove('hidden');
        // Trigger map resize to ensure proper rendering
        if (map) {
            google.maps.event.trigger(map, 'resize');
            if (markers.length > 0) {
                const bounds = new google.maps.LatLngBounds();
                if (userLocation) bounds.extend(userLocation);
                markers.forEach(marker => bounds.extend(marker.getPosition()));
                map.fitBounds(bounds);
            }
        }
    } else {
        cafeGrid.classList.remove('hidden');
        mapContainer.classList.add('hidden');
    }
});

// Back to list button handler
const backToListBtn = document.getElementById('backToListBtn');
if (backToListBtn) {
    backToListBtn.addEventListener('click', () => {
        cafeGrid.classList.remove('hidden');
        mapContainer.classList.add('hidden');
        
        // Update toggle buttons
        document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.toggle-btn[data-view="list"]').classList.add('active');
    });
}

// Update map styles when theme changes
const originalDarkModeToggle = darkModeBtn.onclick;
darkModeBtn.addEventListener('click', function() {
    // Update map styles if map exists
    if (map) {
        setTimeout(() => {
            map.setOptions({ styles: getMapStyles() });
        }, 100);
    }
});

// Load Google Maps API dynamically
async function loadGoogleMapsAPI() {
    try {
        // Fetch API key from backend
        const response = await fetch(`${API_BASE_URL}/config`);
        if (!response.ok) {
            throw new Error('Failed to load configuration');
        }
        
        const config = await response.json();
        GOOGLE_MAPS_API_KEY = config.googleMapsApiKey;
        
        // Load Google Maps script dynamically
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        
        return new Promise((resolve, reject) => {
            script.onload = () => {
                googleMapsLoaded = true;
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    } catch (error) {
        console.error('Error loading Google Maps API:', error);
        throw error;
    }
}

// Initialize app
async function initializeApp() {
    try {
        // Load Google Maps API first
        await loadGoogleMapsAPI();
        
        // Then fetch default cafes
        fetchCafes('Sydney, Australia'); // Change default location as needed
    } catch (error) {
        console.error('Error initializing app:', error);
        cafeGrid.innerHTML = `
            <div class="error-message">
                Failed to initialize the application.
                <br><br>
                Please make sure the backend server is running.
                <br><br>
                Error: ${error.message}
            </div>
        `;
    }
}

// Load app on page load
window.addEventListener('DOMContentLoaded', initializeApp);