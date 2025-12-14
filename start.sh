#!/bin/bash

echo "=========================================="
echo "   NoirBrew Cafe Finder - Quick Start"
echo "=========================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo ""
    echo "Creating .env file from template..."
    cp .env.example .env
    echo ""
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Edit the .env file and add your Google Maps API key"
    echo ""
    echo "To get an API key:"
    echo "1. Visit: https://console.cloud.google.com/"
    echo "2. Enable Places API, Maps JavaScript API, and Geocoding API"
    echo "3. Create an API key"
    echo "4. Replace 'your_actual_google_maps_api_key_here' in .env file"
    echo ""
    read -p "Press Enter once you've added your API key to .env..."
fi

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
    echo "✅ Virtual environment created"
fi

# Activate virtual environment and install dependencies
echo ""
echo "Installing dependencies..."
source .venv/bin/activate
pip install -q flask flask-cors googlemaps
echo "✅ Dependencies installed"

echo ""
echo "=========================================="
echo "   Starting Flask Backend Server"
echo "=========================================="
echo ""
echo "Server will start at: http://localhost:5000"
echo "Frontend will be at: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the Flask server
python pyscrpt.py
