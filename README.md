# ☕ NoirBrew - Cafe Finder

A beautiful, modern web application to discover the perfect cafes near you. Built with Flask backend and vanilla JavaScript frontend, powered by Google Maps API.

![NoirBrew](https://img.shields.io/badge/NoirBrew-Cafe%20Finder-d88a3b?style=for-the-badge)

## ✨ Features

- 🗺️ **Location-Based Search**: Find cafes near your current location or search any area
- ⭐ **Advanced Filters**: Filter by rating, price, distance, ambience, diet, and experience
- ❤️ **Favorites**: Save your favorite cafes locally
- 📍 **Real-Time Data**: Live cafe information from Google Places API
- 🎨 **Beautiful UI**: Elegant dark-themed interface with smooth animations
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile

## Setup Instructions

### 1. Install Dependencies

```bash
pip3 install googlemaps flask flask-cors
```

### 2. Set up Google Maps API Key

1. Get your API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
3. Create a `.env` file in the project root:

```bash
GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 3. Run the Backend Server

```bash
export GOOGLE_MAPS_API_KEY=your_actual_api_key_here
python3 pyscrpt.py
```

The Flask server will start on `http://localhost:5000`

### 4. Open the Frontend

Open `index.html` in your browser or use a local server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`

## Features

- ✨ Beautiful dark-themed UI with orange accents
- 🔍 Search for cafes by location
- 📍 Find cafes near your current location
- ⭐ View ratings, prices, and opening hours
- 🗺️ Get directions to cafes
- ❤️ Save favorites (coming soon)
- 🌙 Dark mode toggle (coming soon)

## API Endpoints

- `GET /api/cafes?location=<location>&radius=<radius>` - Get cafes by location
- `POST /api/cafes/nearby` - Get cafes near coordinates

## Technologies Used

- Frontend: HTML, CSS, JavaScript
- Backend: Python, Flask
- API: Google Maps Places API
