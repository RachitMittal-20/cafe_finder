# ✅ Backend Server Status

## Server is Running!

Your NoirBrew backend server is now running in the background.

### Server Details:
- **Status**: ✅ Running
- **URL**: http://localhost:5000
- **Process ID**: Check `server.pid` file
- **Logs**: `server.log` file

### How to Check Status:
```bash
# Check if server is running
ps aux | grep pyscrpt.py | grep -v grep

# View live logs
tail -f server.log

# Check what's using port 5000
lsof -i:5000
```

### How to Stop the Server:
```bash
# Method 1: Kill the process
kill $(cat server.pid)

# Method 2: Kill by port
lsof -ti:5000 | xargs kill -9
```

### How to Restart the Server:
```bash
# Just run the script again
./run_backend.sh
```

### API Endpoints Available:
1. **Get Cafes by Location**
   - URL: `http://localhost:5000/api/cafes?location=LOCATION&radius=RADIUS`
   - Example: `http://localhost:5000/api/cafes?location=Sydney&radius=5000`

2. **Get Nearby Cafes (using coordinates)**
   - URL: `http://localhost:5000/api/cafes/nearby`
   - Method: POST
   - Body: `{"lat": LATITUDE, "lng": LONGITUDE, "radius": RADIUS}`

### Testing the API:
```bash
# Test from command line
curl "http://localhost:5000/api/cafes?location=Sydney&radius=5000"
```

### Frontend Integration:
Your `index.html` is already configured to connect to `http://localhost:5000/api`

Just open `index.html` in your browser and it will automatically connect to the backend!

### Files Created:
- ✅ `run_backend.sh` - Script to start the server
- ✅ `start_server.sh` - Alternative startup script  
- ✅ `server.log` - Server logs
- ✅ `server.pid` - Process ID file
- ✅ `.env` - Environment variables (API key)

---

**Your backend is ready! Open index.html in your browser to use the cafe finder. 🎉**
