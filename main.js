// API configuration
const API_BASE_URL = 'http://localhost:5000/api';

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
                <button class="directions-btn" onclick="openDirections(${cafe.lat}, ${cafe.lng})">
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

// Open directions in Google Maps
function openDirections(lat, lng) {
    // If user location is available, include it as origin
    if (userLocation) {
        window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${lat},${lng}&travelmode=driving`, '_blank');
    } else {
        // Just open the destination
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    }
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
            // Implement top rated filtering
            alert('Top rated filter - Coming soon!');
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

// Dark mode toggle (placeholder - can be implemented later)
const darkModeBtn = document.getElementById('darkModeBtn');
darkModeBtn.addEventListener('click', function() {
    alert('Dark mode coming soon! The current theme already has a dark aesthetic.');
});

// Load default cafes on page load
window.addEventListener('DOMContentLoaded', () => {
    fetchCafes('Sydney, Australia'); // Change default location as needed
});