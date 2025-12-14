# 🎯 Demo Instructions

## Quick Test Guide

### Step 1: Set Up Your API Key

1. Open the `.env` file (or create it from `.env.example`)
2. Replace `your_actual_google_maps_api_key_here` with your real Google Maps API key
3. Save the file

**Don't have an API key yet?**
- Go to: https://console.cloud.google.com/
- Create a project and enable: Places API, Geocoding API, Maps JavaScript API
- Create credentials → API Key

### Step 2: Start the Backend

Open a terminal and run:
```bash
./start.sh
```

Or manually:
```bash
source .venv/bin/activate  # If you have a virtual environment
python pyscrpt.py
```

You should see:
```
* Running on http://127.0.0.1:5000
```

### Step 3: Start the Frontend

Open another terminal and run:
```bash
./start-frontend.sh
```

Or manually:
```bash
python3 -m http.server 8000
```

Or simply open `index.html` directly in your browser.

### Step 4: Test Features

#### 🔍 Search for Cafes
1. Type a location in the search bar (e.g., "New York", "London", "Tokyo")
2. Press Enter
3. Watch cafe cards appear with real data from Google Maps!

#### 📍 Find Nearby Cafes
1. Click the "Near me" button
2. Allow location access when prompted
3. See cafes near your current location

#### ⭐ Filter Cafes
1. Click the "Filters" button
2. Select filters:
   - Rating: 3.5+, 4+, 4.5+
   - Price: ₹, ₹₹, ₹₹₹
   - Distance: Adjust the slider
3. Click "Show cafes" to apply

#### ❤️ Add to Favorites
1. Click the heart icon on any cafe card
2. The heart fills in to show it's favorited
3. Click the "Favorites" button in the header
4. See your saved cafes!

#### 🗺️ Get Directions
1. Click "Get directions" on any cafe card
2. Opens Google Maps with directions from your location

#### 📱 Empty Favorites State
1. If you haven't favorited any cafes yet
2. Click "Favorites" button
3. You'll see the beautiful empty state with:
   - Coffee cup icon
   - "No favorites yet" message
   - "Explore cafes" button

#### 🔙 Navigate Back
1. From the Favorites page
2. Click "Back to explore"
3. Returns to the main cafe list

## 🎨 Features Implemented

✅ Real-time cafe data from Google Maps Places API
✅ Location-based search (by address or current location)
✅ Beautiful cafe cards with:
  - High-quality photos
  - Ratings and review counts
  - Price levels (₹₹₹)
  - Distance from your location
  - Open/Closed status
  - Category tags (Veg, Indoor, Casual, etc.)
  - Favorite button
  - Get directions button

✅ Favorites system:
  - Add/remove favorites with heart icon
  - Persistent storage (saved in browser)
  - Dedicated favorites page
  - Empty state when no favorites
  - Full cafe data preserved

✅ Advanced filters:
  - Rating filter
  - Price filter
  - Distance slider
  - Multiple filter options

✅ Interactive UI:
  - Smooth animations
  - Hover effects
  - Loading states
  - Error handling

## 🐛 Troubleshooting

### No cafes showing up?
1. Check console (F12) for errors
2. Verify API key is correct in `.env`
3. Make sure backend is running on port 5000
4. Try a different location (e.g., "Sydney, Australia")

### "Near me" not working?
1. Use HTTPS or localhost
2. Allow location permission in browser
3. Check browser console for geolocation errors

### Directions not opening?
1. Make sure you have internet connection
2. Check if popup blocker is blocking the new tab
3. Allow popups for your site

### Favorites not saving?
1. Check browser console for errors
2. Make sure localStorage is enabled
3. Try in a different browser

## 📝 Default Test Locations

Try these locations to see cafes:
- Sydney, Australia
- New York, USA
- London, UK
- Tokyo, Japan
- Paris, France
- San Francisco, USA
- Melbourne, Australia

## 🎯 Next Steps

Want to enhance the app? Try adding:
- Cafe details modal when clicking a card
- Map view showing all cafes
- User reviews section
- Share favorite cafes
- Export favorites as PDF
- Dark/Light theme toggle
- More filter options
- Sort by distance, rating, etc.

## 💡 Tips

- API requests are limited - use wisely!
- Favorites are stored locally per browser
- Distance calculation uses Haversine formula
- Tags are randomly generated for demo (you can make them data-driven)
- Photos come directly from Google Places API

Enjoy discovering amazing cafes! ☕✨
