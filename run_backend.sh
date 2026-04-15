#!/bin/bash

# NoirBrew Backend Server Runner
# This script keeps the backend running in the background

echo "🚀 Starting NoirBrew Backend Server..."

# Kill any existing process on port 5001 (using 5001 because macOS uses 5000)
lsof -ti:5001 | xargs kill -9 2>/dev/null
# Also kill old process if on port 5000
lsof -ti:5000 | xargs kill -9 2>/dev/null

# Wait a moment
sleep 1

# Start the server in the background
cd /Users/rachitmittal/Cafe_finder
nohup python3 -u pyscrpt.py > server.log 2>&1 &

# Get the process ID
PID=$!
echo $PID > server.pid

# Wait a bit for server to start
sleep 3

# Check if it's running
if ps -p $PID > /dev/null; then
    echo "✅ Backend server is running!"
    echo "📍 Server URL: http://localhost:5001"
    echo "📝 Process ID: $PID"
    echo "📋 Logs: tail -f server.log"
    echo ""
    echo "To stop the server, run: kill $PID"
else
    echo "❌ Failed to start server. Check server.log for errors."
    cat server.log
fi
