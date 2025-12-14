# 🗺️ App Architecture & Data Flow

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                        │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │           index.html (UI)                       │    │
│  │  - Search bar                                   │    │
│  │  - Filter buttons                               │    │
│  │  - Cafe grid                                    │    │
│  │  - Favorites page                               │    │
│  └────────────────────────────────────────────────┘    │
│                       ↕                                  │
│  ┌────────────────────────────────────────────────┐    │
│  │           main.js (Logic)                       │    │
│  │  - API calls                                    │    │
│  │  - Favorites management                         │    │
│  │  - Distance calculation                         │    │
│  │  - UI updates                                   │    │
│  └────────────────────────────────────────────────┘    │
│                       ↕                                  │
│  ┌────────────────────────────────────────────────┐    │
│  │           main.css (Styling)                    │    │
│  │  - Dark theme                                   │    │
│  │  - Animations                                   │    │
│  │  - Responsive layout                            │    │
│  └────────────────────────────────────────────────┘    │
│                       ↕                                  │
│  ┌────────────────────────────────────────────────┐    │
│  │        localStorage (Storage)                   │    │
│  │  - favoriteCafes: ["id1", "id2"]              │    │
│  │  - favoriteCafesData: [{cafe1}, {cafe2}]      │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                       ↕
              HTTP Requests
                       ↕
┌─────────────────────────────────────────────────────────┐
│              Flask Backend (localhost:5000)              │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │           pyscrpt.py                            │    │
│  │  - Route: /api/cafes                           │    │
│  │  - Route: /api/cafes/nearby                    │    │
│  │  - Geocoding logic                              │    │
│  │  - API key management                           │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                       ↕
              API Requests
                       ↕
┌─────────────────────────────────────────────────────────┐
│           Google Maps APIs                               │
│                                                          │
│  - Places API (find cafes)                              │
│  - Geocoding API (address → coordinates)                │
│  - Place Details API (get full info)                    │
│  - Photos API (cafe images)                             │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Examples

### 1. Search for Cafes by Location

```
User types "Sydney" → Press Enter
         ↓
main.js: fetchCafes("Sydney")
         ↓
HTTP GET to /api/cafes?location=Sydney&radius=5000
         ↓
pyscrpt.py: Geocode "Sydney" → (-33.8688, 151.2093)
         ↓
Google Places API: Find cafes near coordinates
         ↓
Google Place Details API: Get full info for each cafe
         ↓
Python returns JSON: {cafes: [...], coordinates: {...}}
         ↓
main.js: Store cafes, update userLocation
         ↓
displayCafes(cafes) → Create HTML cards
         ↓
User sees 8 cafe cards on screen
```

### 2. Find Cafes Near Me

```
User clicks "Near me" button
         ↓
Browser Geolocation API: Get user's coordinates
         ↓
main.js: fetchNearbyCafes()
         ↓
HTTP POST to /api/cafes/nearby
Body: {lat: 37.7749, lng: -122.4194, radius: 5000}
         ↓
pyscrpt.py: Use coordinates directly
         ↓
Google Places API: Find cafes near coordinates
         ↓
Returns cafe data
         ↓
main.js: Display results with distances calculated
```

### 3. Add to Favorites

```
User clicks ❤️ on "The Roasted Bean" card
         ↓
main.js: toggleFavorite(place_id, event)
         ↓
Check if already favorite:
  - If yes: Remove from array
  - If no: Add to array + store full cafe data
         ↓
localStorage.setItem('favoriteCafes', JSON)
localStorage.setItem('favoriteCafesData', JSON)
         ↓
Update UI: Fill heart icon
```

### 4. View Favorites

```
User clicks "Favorites" button in header
         ↓
main.js: showFavoritesPage()
         ↓
Load from localStorage:
  - favoriteCafes (IDs)
  - favoriteCafesData (full data)
         ↓
Check if empty:
  - If empty: Show empty state with coffee cup
  - If not empty: Display favorite cafe cards
         ↓
User sees favorites or empty state
```

### 5. Get Directions

```
User clicks "Get directions" on cafe card
         ↓
main.js: openDirections(cafe_lat, cafe_lng)
         ↓
Check if userLocation exists:
  - If yes: Include as origin
  - If no: Just use destination
         ↓
Build Google Maps URL with parameters
         ↓
window.open() → New tab
         ↓
Google Maps opens with route
```

---

## 📊 Data Structures

### Cafe Object (from API)
```javascript
{
  name: "The Roasted Bean",
  address: "123 Coffee Lane, Downtown",
  rating: 4.7,
  user_ratings_total: 342,
  price_level: 2,  // 1-3 (₹, ₹₹, ₹₹₹)
  is_open: true,
  hours: ["Monday: 07:00 - 22:00", ...],
  photo_url: "https://maps.googleapis.com/...",
  lat: -33.8688,
  lng: 151.2093,
  place_id: "ChIJ..."
}
```

### localStorage Structure
```javascript
// Array of place IDs
favoriteCafes: ["ChIJ123", "ChIJ456", "ChIJ789"]

// Array of full cafe objects
favoriteCafesData: [
  {name: "Cafe 1", address: "...", ...},
  {name: "Cafe 2", address: "...", ...},
  ...
]
```

### User Location
```javascript
userLocation: {
  lat: 37.7749,
  lng: -122.4194
}
```

---

## 🎯 Key Functions Map

### main.js Functions

| Function | Purpose | Called By |
|----------|---------|-----------|
| `fetchCafes(location)` | Search by address | Search bar Enter key |
| `fetchNearbyCafes()` | Use geolocation | "Near me" button |
| `displayCafes(cafes)` | Render cafe cards | After fetching cafes |
| `createCafeCard(cafe)` | Generate HTML for one card | displayCafes() |
| `toggleFavorite(id, event)` | Add/remove favorite | Heart button click |
| `showFavoritesPage()` | Navigate to favorites | "Favorites" button |
| `showExplorePage()` | Back to main view | "Back" button |
| `openDirections(lat, lng)` | Open Google Maps | "Get directions" button |
| `calculateDistance(lat, lng)` | Haversine formula | createCafeCard() |
| `applyFilters()` | Filter cafe results | "Apply" button in modal |
| `generateCafeTags(cafe)` | Create category tags | createCafeCard() |

### pyscrpt.py Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/cafes` | GET | Search by location name |
| `/api/cafes/nearby` | POST | Search by coordinates |

---

## 🔐 Security & Storage

### Environment Variables
```bash
# .env file
GOOGLE_MAPS_API_KEY=AIza...
```

### Browser Storage
- **localStorage**: Persistent favorites (survives browser close)
- **sessionStorage**: Not used (could be used for temporary filters)
- **Cookies**: Not used

---

## 🌐 API Endpoints Used

### Google Maps APIs

1. **Geocoding API**
   ```
   Input: "Sydney, Australia"
   Output: {lat: -33.8688, lng: 151.2093}
   ```

2. **Places Nearby Search**
   ```
   Input: location={lat,lng}, radius=5000, type=cafe
   Output: Array of basic cafe info
   ```

3. **Place Details**
   ```
   Input: place_id
   Output: Full cafe details (rating, hours, photos, etc.)
   ```

4. **Place Photos**
   ```
   Input: photo_reference
   Output: Image URL
   ```

---

## 📱 User Interactions

```
┌─────────────────────────────────────┐
│        User Actions                  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  1. Type location → Search          │
│  2. Click "Near me" → Geolocation   │
│  3. Click ❤️ → Add to favorites     │
│  4. Click "Favorites" → View saved  │
│  5. Click "Filters" → Open modal    │
│  6. Click "Get directions" → Maps   │
│  7. Click "Back" → Return to list   │
└─────────────────────────────────────┘
```

---

## 🎨 UI State Management

### Main View States
- **Loading**: "Loading cafes..."
- **Success**: Grid of cafe cards
- **Error**: Error message with troubleshooting
- **Empty**: "No cafes found"

### Favorites View States
- **Empty**: Coffee cup icon + "No favorites yet"
- **Has Favorites**: Grid of favorite cafe cards

### Filter Modal States
- **Closed**: Hidden
- **Open**: Visible with current selections
- **Applying**: Brief loading state

---

## 🚀 Performance Optimizations

1. **Limit Results**: Only fetch 8 cafes per search
2. **Cache User Location**: Store for distance calculations
3. **localStorage**: No server calls for favorites
4. **Lazy Photo Loading**: Photos load as needed
5. **Debouncing**: Could add for search (not implemented)

---

## 🔄 Future Enhancements

Ideas for expansion:
- Add map view with markers
- Implement cafe details modal
- Add user reviews section
- Social sharing features
- Route planning with multiple stops
- Real dark mode toggle
- Cafe comparison feature
- Export favorites as PDF
- Search history
- Advanced sorting options

---

This architecture provides a solid foundation for a production-ready cafe finder application! 🎉
