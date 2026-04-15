import json
import os
import ssl
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app)

env_path = Path(".") / ".env"
if env_path.exists():
    with open(env_path) as env_file:
        for line in env_file:
            if line.strip() and not line.startswith("#"):
                key, value = line.strip().split("=", 1)
                os.environ[key] = value

SERPAPI_KEY = os.getenv("SERPAPI_KEY")
SERPAPI_ENDPOINT = "https://serpapi.com/search.json"

if not SERPAPI_KEY or SERPAPI_KEY == "your_serpapi_key_here":
    print("\n" + "=" * 60)
    print("SERPAPI KEY NOT SET!")
    print("=" * 60)
    print("\nCreate a .env file and add:")
    print("SERPAPI_KEY=your_actual_serpapi_key")
    print("=" * 60 + "\n")
    raise SystemExit(1)


def serpapi_search(params):
    search_params = {
        "engine": "google_maps",
        "hl": "en",
        "api_key": SERPAPI_KEY,
        **params,
    }
    query_string = urlencode(search_params)
    ssl_context = ssl._create_unverified_context()
    with urlopen(f"{SERPAPI_ENDPOINT}?{query_string}", context=ssl_context) as response:
        return json.loads(response.read().decode("utf-8"))


def parse_price_level(price_text):
    if not price_text:
        return None

    repeated_symbol_count = price_text.count("$")
    if repeated_symbol_count > 0:
        return repeated_symbol_count

    if price_text.startswith("₹"):
        return min(price_text.count("₹"), 4)

    return None


def normalize_hours(operating_hours):
    if not operating_hours:
        return None

    ordered_days = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
    ]
    formatted = []
    for day in ordered_days:
        if day in operating_hours:
            formatted.append(f"{day.title()}: {operating_hours[day]}")
    return formatted or None


def normalize_cafe_result(place):
    coordinates = place.get("gps_coordinates") or {}
    title = place.get("title") or "Unknown"
    place_id = place.get("place_id") or place.get("data_id") or title
    rating = place.get("rating")
    reviews = place.get("reviews")
    hours = place.get("hours")
    operating_hours = place.get("operating_hours")
    open_state = place.get("open_state") or hours or ""
    open_state_lower = open_state.lower()

    is_open = None
    if "open" in open_state_lower:
        is_open = True
    elif "closed" in open_state_lower:
        is_open = False

    photo_url = place.get("thumbnail") or place.get("serpapi_thumbnail")
    if photo_url and photo_url.startswith("//"):
        photo_url = f"https:{photo_url}"

    return {
        "name": title,
        "address": place.get("address", "Address not available"),
        "rating": rating,
        "user_ratings_total": reviews,
        "price_level": parse_price_level(place.get("price")),
        "is_open": is_open,
        "hours": normalize_hours(operating_hours),
        "photo_url": photo_url,
        "lat": coordinates.get("latitude"),
        "lng": coordinates.get("longitude"),
        "place_id": str(place_id),
    }


def extract_results(data, limit=8):
    local_results = data.get("local_results") or []
    normalized = []

    for place in local_results:
        cafe = normalize_cafe_result(place)
        if cafe["lat"] is None or cafe["lng"] is None:
            continue
        normalized.append(cafe)
        if len(normalized) >= limit:
            break

    return normalized


def infer_center_coordinates(cafes):
    if not cafes:
        return None
    return {"lat": cafes[0]["lat"], "lng": cafes[0]["lng"]}


def find_cafes_for_location(location, radius=5000):
    # SerpApi Google Maps supports text queries directly. We bias the search toward cafes.
    data = serpapi_search({
        "type": "search",
        "q": f"cafes in {location}",
    })
    cafes = extract_results(data)
    return cafes, infer_center_coordinates(cafes)


def find_cafes_near_coordinates(lat, lng, radius=5000):
    # Google Maps engine commonly uses ll in pagination/search URLs for map-centered searches.
    zoom = 14
    data = serpapi_search({
        "type": "search",
        "q": "cafe",
        "ll": f"@{lat},{lng},{zoom}z",
    })
    cafes = extract_results(data)
    return cafes, {"lat": lat, "lng": lng}


@app.route("/api/cafes", methods=["GET"])
def get_cafes():
    location = request.args.get("location", "Mumbai, India")
    radius = int(request.args.get("radius", 5000))

    try:
        cafes, coordinates = find_cafes_for_location(location, radius=radius)
        if not cafes:
            return jsonify({"error": "No cafes found for this location"}), 404

        return jsonify({
            "cafes": cafes,
            "location": location,
            "coordinates": coordinates,
        })
    except Exception as error:
        return jsonify({"error": str(error)}), 500


@app.route("/api/cafes/nearby", methods=["POST"])
def get_nearby_cafes():
    data = request.get_json() or {}
    lat = data.get("lat")
    lng = data.get("lng")
    radius = data.get("radius", 5000)

    if lat is None or lng is None:
        return jsonify({"error": "Latitude and longitude required"}), 400

    try:
        cafes, coordinates = find_cafes_near_coordinates(lat, lng, radius=radius)
        return jsonify({
            "cafes": cafes,
            "coordinates": coordinates,
        })
    except Exception as error:
        return jsonify({"error": str(error)}), 500


@app.route("/")
def index():
    return send_from_directory(".", "index.html")


@app.route("/<path:path>")
def serve_static(path):
    if os.path.exists(path):
        return send_from_directory(".", path)
    return send_from_directory(".", "index.html")


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    is_production = os.getenv("PORT") is not None

    print("\n" + "=" * 60)
    print("NoirBrew Backend Server Starting...")
    print("=" * 60)
    print(f"Environment: {'Production' if is_production else 'Development'}")
    print(f"Server Port: {port}")
    print(f"SerpApi Search: {'Configured' if SERPAPI_KEY else 'Not Set'}")
    print("=" * 60 + "\n")

    if is_production:
        app.run(host="0.0.0.0", port=port, debug=False)
    else:
        app.run(host="127.0.0.1", port=port, debug=True, use_reloader=False)
