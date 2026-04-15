#!/bin/bash

# Start the Flask backend server for NoirBrew Cafe Finder

echo "Starting NoirBrew Backend Server..."
echo "=================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your Google Maps API key"
    exit 1
fi

# Kill any existing Flask processes on port 5000
echo "Checking for existing processes on port 5000..."
lsof -ti:5000 | xargs kill -9 2>/dev/null
sleep 1

# Start the server
echo "Starting Flask server..."
python3 pyscrpt.py

echo "Server stopped."
