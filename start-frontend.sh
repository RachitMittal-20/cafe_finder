#!/bin/bash

echo "=========================================="
echo "   Starting Frontend Server"
echo "=========================================="
echo ""
echo "Frontend will be available at:"
echo "http://localhost:8000"
echo ""
echo "Make sure the backend is running on port 5000"
echo "Press Ctrl+C to stop the server"
echo ""

# Start simple HTTP server
python3 -m http.server 8000
