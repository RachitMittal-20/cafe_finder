import googlemaps
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from pathlib import Path

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Load environment variables from .env file if it exists
env_path = Path('.') / '.env'
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            if line.strip() and not line.startswith('#'):
                key, value = line.strip().split('=', 1)
                os.environ[key] = value

# Initialize Google Maps client
API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')
if not API_KEY or API_KEY == 'your_actual_google_maps_api_key_here':
    print("\n" + "="*60)
    print("⚠️  GOOGLE MAPS API KEY NOT SET!")
    print("="*60)
    print("\nPlease follow these steps:")
    print("1. Get your API key from: https://console.cloud.google.com/")
    print("2. Create a .env file in this directory")
    print("3. Add: GOOGLE_MAPS_API_KEY=your_actual_key_here")
    print("\nSee SETUP_GUIDE.md for detailed instructions")
    print("="*60 + "\n")
    exit(1)

gmaps = googlemaps.Client(key=API_KEY)

# Find cafes near a location (lat, lng) or query
def find_cafes(location, radius=5000, cafe_type='cafe'):
    try:
        results = gmaps.places_nearby(location=location, radius=radius, type=cafe_type)
        cafes = []
        
        for place in results.get('results', [])[:8]:  # Limit to 8 results
            place_id = place['place_id']
            
            # Get photo URL if available (from nearby search results)
            photo_url = None
            if 'photos' in place and len(place['photos']) > 0:
                photo_reference = place['photos'][0]['photo_reference']
                photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={photo_reference}&key={os.getenv('GOOGLE_MAPS_API_KEY')}"
            
            details = gmaps.place(
                place_id=place_id, 
                fields=['name', 'formatted_address', 'rating', 'geometry', 'opening_hours', 
                        'price_level', 'user_ratings_total']
            )
            
            result = details.get('result', {})
            
            # Get opening hours
            is_open = None
            hours = None
            if 'opening_hours' in result:
                is_open = result['opening_hours'].get('open_now')
                if 'weekday_text' in result['opening_hours']:
                    hours = result['opening_hours']['weekday_text']
            
            cafe_data = {
                'name': result.get('name', 'Unknown'),
                'address': result.get('formatted_address', 'Address not available'),
                'rating': result.get('rating'),
                'user_ratings_total': result.get('user_ratings_total'),
                'price_level': result.get('price_level'),
                'is_open': is_open,
                'hours': hours,
                'photo_url': photo_url,
                'lat': result['geometry']['location']['lat'],
                'lng': result['geometry']['location']['lng'],
                'place_id': place_id
            }
            cafes.append(cafe_data)
        
        return cafes
    except Exception as e:
        error_msg = str(e)
        print(f"Error fetching cafes: {error_msg}")
        
        # Check if it's an API restriction error
        if "REQUEST_DENIED" in error_msg or "referer" in error_msg.lower():
            raise Exception("API key has referer restrictions. Please update API key settings in Google Cloud Console to allow server-side requests.")
        
        return []

@app.route('/api/cafes', methods=['GET'])
def get_cafes():
    # Get parameters from query string
    location = request.args.get('location', 'Sydney, Australia')
    radius = int(request.args.get('radius', 5000))
    
    try:
        # Geocode the location
        geocode = gmaps.geocode(location)
        if not geocode:
            return jsonify({'error': 'Location not found'}), 404
        
        user_location = geocode[0]['geometry']['location']
        cafes = find_cafes(user_location, radius=radius)
        
        return jsonify({
            'cafes': cafes,
            'location': location,
            'coordinates': user_location
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cafes/nearby', methods=['POST'])
def get_nearby_cafes():
    # Get user's coordinates from request
    data = request.get_json()
    lat = data.get('lat')
    lng = data.get('lng')
    radius = data.get('radius', 5000)
    
    if not lat or not lng:
        return jsonify({'error': 'Latitude and longitude required'}), 400
    
    try:
        location = {'lat': lat, 'lng': lng}
        cafes = find_cafes(location, radius=radius)
        
        return jsonify({
            'cafes': cafes,
            'coordinates': location
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/config', methods=['GET'])
def get_config():
    """Securely provide Google Maps API key to frontend"""
    return jsonify({
        'googleMapsApiKey': API_KEY
    })

if __name__ == '__main__':
    # Make sure to set GOOGLE_MAPS_API_KEY environment variable
    if not os.getenv('GOOGLE_MAPS_API_KEY'):
        print("WARNING: GOOGLE_MAPS_API_KEY not set!")
    
    print("\n" + "="*60)
    print("🚀 NoirBrew Backend Server Starting...")
    print("="*60)
    print(f"📍 Server URL: http://127.0.0.1:5001")
    print(f"🗺️  Google Maps API: {'✅ Configured' if os.getenv('GOOGLE_MAPS_API_KEY') else '❌ Not Set'}")
    print("="*60 + "\n")
    
    # Run with use_reloader=False to avoid issues with background processes
    # Using port 5001 because macOS AirPlay uses port 5000
    app.run(debug=True, port=5001, use_reloader=False)

