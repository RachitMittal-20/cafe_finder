# Cafe Finder Setup Guide

## Getting Your Google Maps API Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a new project or select existing one**
   - Click on the project dropdown at the top
   - Click "New Project"
   - Name it "Cafe Finder" or similar

3. **Enable Required APIs**
   - Go to "APIs & Services" > "Library"
   - Search for and enable these APIs:
     - **Places API**
     - **Maps JavaScript API**
     - **Geocoding API**

4. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "+ CREATE CREDENTIALS" > "API Key"
   - Copy your new API key

5. **Secure Your API Key (Recommended)**
   - Click on the API key to edit it
   - Under "Application restrictions", choose "HTTP referrers"
   - Add: `http://localhost:*` and `http://127.0.0.1:*`
   - Under "API restrictions", choose "Restrict key"
   - Select: Places API, Geocoding API, Maps JavaScript API
   - Click Save

## Setting Up Your Environment

### Option 1: Using .env file (Recommended)

1. Create a `.env` file in the project root:
```bash
echo "GOOGLE_MAPS_API_KEY=your_actual_api_key_here" > .env
```

2. The app will automatically load it

### Option 2: Export in terminal (Temporary)

```bash
export GOOGLE_MAPS_API_KEY="your_actual_api_key_here"
```

Note: This only works for the current terminal session

### Option 3: Add to your shell profile (Permanent)

```bash
echo 'export GOOGLE_MAPS_API_KEY="your_actual_api_key_here"' >> ~/.zshrc
source ~/.zshrc
```

## Running the Application

1. **Start the Flask backend:**
```bash
python pyscrpt.py
```

2. **Open the frontend:**
   - Simply open `index.html` in your browser, or
   - Use a local server:
```bash
python -m http.server 8000
```
   - Then visit: http://localhost:8000

## Testing the API

Once the server is running, test these endpoints:

1. **Get cafes by location:**
```
http://localhost:5000/api/cafes?location=Sydney,Australia&radius=5000
```

2. **Get nearby cafes (requires POST with lat/lng):**
```
POST http://localhost:5000/api/cafes/nearby
Body: {"lat": -33.8688, "lng": 151.2093, "radius": 5000}
```

## Troubleshooting

- **API Key not working:** Make sure you've enabled all required APIs
- **CORS errors:** The Flask app already has CORS enabled
- **No cafes found:** Try a different location or increase radius
- **Geolocation not working:** Make sure you're using HTTPS or localhost
