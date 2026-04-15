# Google Maps JavaScript API Integration

## Overview
This document explains the Google Maps integration in the NoirBrew Cafe Finder application.

## Features Implemented

### 1. **Interactive Map View**
- Toggle between List and Map views using the view toggle buttons
- Click the "Map view" button in the filter buttons area to quickly jump to map view
- Custom styled map that adapts to dark/light theme

### 2. **Custom Cafe Markers**
- Each cafe is represented by a custom coffee cup marker on the map
- Markers include an animated drop effect when loaded
- Click on any marker to see cafe details in an info window

### 3. **Info Windows**
- Display cafe name, rating, open/closed status, and address
- "Get directions" button opens Google Maps with turn-by-turn navigation
- Styled to match the application theme (dark/light mode)

### 4. **User Location**
- Blue circle marker shows your current location (when geolocation is enabled)
- Map automatically centers and zooms to show all cafes and your location
- Distance calculations from your location to each cafe

### 5. **Filter Integration**
- Map updates automatically when filters are applied
- Only filtered cafes are shown on the map
- Top rated filter sorts cafes by rating

### 6. **Theme Support**
- Dark mode: Custom styled map with dark colors matching the app theme
- Light mode: Standard Google Maps styling with subtle customizations
- Map styles update automatically when theme is toggled

## How to Use

### Viewing the Map
1. **Option 1**: Click the "Map view" button in the main filter buttons area
2. **Option 2**: Scroll down to the results section and click the "Map" toggle button
3. **Return to List**: Click "Back to List View" button in the map, or click "List" toggle

### Interacting with Map
- **Click markers** to see cafe details
- **Get Directions**: Click "Get directions" in the info window to open Google Maps
- **Pan and Zoom**: Use mouse/trackpad to navigate the map
- **Filter results**: Use the filters panel - map updates automatically

### Get Directions
The "Get directions" button in cafe cards and map info windows opens Google Maps with:
- Your current location as the starting point (if available)
- The selected cafe as the destination
- Default travel mode: driving (can be changed in Google Maps)

## Technical Details

### API Key
- API Key: `AIzaSyDGGv54wKDTeYxMezwTmBzpctOw2D8w5SU`
- Libraries loaded: `places` (for additional place details if needed)
- Configured in: `index.html` (script tag in `<head>`)

### Files Modified

#### 1. `index.html`
- Added Google Maps JavaScript API script
- Added map container div
- Added view toggle buttons
- Added "Map view" button in filter buttons
- Added "Back to List View" button in map controls

#### 2. `main.js`
- **New functions**:
  - `initializeMap(cafes)` - Initializes the map with given cafes
  - `addCafeMarkers(cafes)` - Adds/updates markers on the map
  - `createInfoWindowContent(cafe)` - Creates HTML for info windows
  - `getMapStyles()` - Returns map styles based on current theme
  - `switchToMapView()` - Smoothly switches to map view
  
- **Updated functions**:
  - `fetchCafes()` - Calls `initializeMap()` after loading cafes
  - `applyFilters()` - Updates map markers when filters are applied
  - `resetFilters()` - Resets map markers when filters are reset

#### 3. `main.css`
- **New styles**:
  - `.view-toggle` - Toggle buttons container
  - `.toggle-btn` - Individual toggle button styles
  - `.map-container` - Map container with border and shadow
  - `.map-controls` - Overlay controls on map
  - `.back-to-list-btn` - Back to list button styling
  - `.map-info-window` - Custom info window content styling

### Map Customization

#### Dark Mode Colors
- Background: `#1a1512`
- Text: `#9e8c7b`
- Accent: `#d88a3b`
- Roads: `#2d2520`
- Water: `#17263c`

#### Custom Marker
- SVG-based coffee cup icon
- Colors: Orange (`#d88a3b`) with dark center
- Size: 32x42 pixels
- Anchor point: Bottom center

### Browser Compatibility
- Modern browsers with JavaScript enabled
- Geolocation API support (optional, for "Near me" feature)
- Recommended: Chrome, Firefox, Safari, Edge (latest versions)

## Future Enhancements

Possible improvements for the future:
1. **Street View Integration** - Add street view for cafes
2. **Directions Panel** - Show turn-by-turn directions in the app
3. **Distance Filter** - Filter cafes by distance radius on map
4. **Clustering** - Group nearby markers when zoomed out
5. **Heat Map** - Show popular areas with many cafes
6. **Custom Routes** - Plan multi-stop cafe tours
7. **Traffic Layer** - Show real-time traffic conditions

## Troubleshooting

### Map not loading?
- Check browser console for errors
- Verify API key is correct
- Ensure internet connection is active
- Check if JavaScript is enabled

### Markers not appearing?
- Verify backend server is running (`python3 pyscrpt.py`)
- Check if cafes data is loaded in console
- Try refreshing the page

### Info window styling issues?
- Clear browser cache
- Check if `main.css` is loaded properly
- Verify theme (dark/light) is applied correctly

## API Usage & Limits

Google Maps JavaScript API has usage limits:
- Free tier: 28,000 map loads per month
- Additional usage: Charged per 1,000 requests

Current implementation:
- One map load per page visit
- One Places API call per search
- Efficient marker reuse when filtering

---

**Last Updated**: December 16, 2025
**Version**: 1.0
