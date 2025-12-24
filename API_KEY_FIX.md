# ⚠️ API Key Configuration Issue

## Problem: API Key Referer Restrictions

Your Google Maps API key (`AIzaSyDGGv54wKDTeYxMezwTmBzpctOw2D8w5SU`) has **referer restrictions** enabled, which prevents it from being used in backend/server-side applications.

### Error Message:
```
REQUEST_DENIED (API keys with referer restrictions cannot be used with this API.)
```

## 🔧 Solution: Update API Key Settings

You have **two options**:

### Option 1: Remove Referer Restrictions (Recommended for Development)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your API key: `AIzaSyDGGv54wKDTeYxMezwTmBzpctOw2D8w5SU`
3. Click on the API key to edit it
4. Under **Application restrictions**, change from "HTTP referrers" to **"None"**
5. Click **Save**
6. Wait 1-2 minutes for changes to propagate

### Option 2: Create a New API Key for Server Use

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Click **Create Credentials** → **API Key**
3. Keep restrictions as **"None"** (or use IP restrictions if deploying to production)
4. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
5. Copy the new API key
6. Update your `.env` file:
   ```
   GOOGLE_MAPS_API_KEY=your_new_api_key_here
   ```
7. Restart the backend server: `./run_backend.sh`

## 📝 Understanding API Restrictions

### HTTP Referrer Restrictions
- ✅ Good for: Frontend/browser-only applications
- ❌ Blocks: Backend/server requests
- Use case: When API calls are made directly from HTML/JavaScript in browser

### No Restrictions
- ✅ Good for: Development, server-side applications
- ⚠️ Warning: Less secure, anyone with the key can use it
- Use case: Backend servers, testing, development

### IP Address Restrictions (Best for Production)
- ✅ Good for: Production servers with static IPs
- ✅ Secure: Only specific servers can use the key
- Use case: Deployed applications on servers with known IPs

## 🚀 Quick Fix (For Development)

The fastest solution for local development:

1. **Open Google Cloud Console**: https://console.cloud.google.com/apis/credentials
2. **Find your key**: Look for `AIzaSyDG...`
3. **Edit** → Change restrictions to **"None"**
4. **Save** and wait 2 minutes
5. **Test**: Refresh your browser and it should work!

## 🔍 After Fixing

Once you've updated the API key settings:

1. **Wait 1-2 minutes** for Google to propagate changes
2. **Restart backend** (it's already running, but restart just in case):
   ```bash
   ./run_backend.sh
   ```
3. **Refresh browser**: Open or refresh `index.html`
4. **You should see cafes loading!** 🎉

## ✅ Verification

Test if it's working:
```bash
curl "http://localhost:5001/api/cafes?location=Sydney&radius=5000"
```

You should see cafe data instead of an error!

---

**Current Status:**
- ✅ Backend server: Running on port 5001
- ✅ Frontend: Ready at index.html
- ⚠️ API Key: Needs restriction update
- ✅ Google Maps integration: Configured

**Next Step:** Update API key restrictions in Google Cloud Console!
