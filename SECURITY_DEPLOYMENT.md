# 🔒 SECURITY & DEPLOYMENT GUIDE

## ⚠️ CRITICAL: Your API Key Was Exposed!

### Immediate Actions Required:

1. **Regenerate Your Google Maps API Key RIGHT NOW:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Find your current API key
   - Click "Regenerate Key" or create a new one
   - Delete the old key to prevent abuse

2. **Update Your .env File:**
   ```bash
   # Replace with your NEW API key
   GOOGLE_MAPS_API_KEY=your_new_api_key_here
   ```

3. **Remove Sensitive Data from Git History:**
   ```bash
   # Install BFG Repo-Cleaner (if not already installed)
   brew install bfg
   
   # Or use git-filter-repo (recommended)
   brew install git-filter-repo
   
   # Remove .env file from git history
   git filter-repo --path .env --invert-paths --force
   
   # Force push to GitHub (WARNING: This rewrites history!)
   git push origin --force --all
   ```

## 🛡️ Security Improvements Made

### ✅ What We Fixed:

1. **Created `.gitignore`** - Prevents sensitive files from being committed
2. **Removed hardcoded API key** from `index.html`
3. **Added secure API endpoint** (`/api/config`) to provide API key only to authorized requests
4. **Dynamic API loading** - Google Maps API now loads from backend

### ⚠️ Important Notes:

- The `.env` file is NOW protected (won't be pushed to GitHub)
- However, if it was already pushed, you MUST clean git history (see above)
- The API key in your frontend code is STILL visible to users who open DevTools
- For production, consider additional security measures (see below)

## 🚀 Deployment Options

### Option 1: GitHub Pages (Frontend Only - Limited)
**Limitation:** Cannot run Python backend, so API features won't work

```bash
# 1. Create a static version (if you only want display)
# 2. Push to GitHub
git add .
git commit -m "Add static site"
git push origin main

# 3. Go to GitHub → Settings → Pages → Select branch "main" → Save
```

### Option 2: Render.com (RECOMMENDED - Full Stack)
**Best for:** Full application with backend

1. **Backend Setup:**
   - Go to: https://render.com/
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Settings:
     - Name: `cafe-finder-backend`
     - Environment: `Python 3`
     - Build Command: `pip install -r requirements.txt`
     - Start Command: `python pyscrpt.py`
     - Add Environment Variable: `GOOGLE_MAPS_API_KEY=your_key`

2. **Frontend Setup:**
   - Click "New +" → "Static Site"
   - Connect same repo
   - Settings:
     - Name: `cafe-finder-frontend`
     - Build Command: (leave empty)
     - Publish Directory: `.`

3. **Update API URLs:**
   In `main.js`, change:
   ```javascript
   const API_BASE_URL = 'https://your-backend-url.onrender.com/api';
   ```

### Option 3: Vercel (Frontend) + Render (Backend)

1. **Deploy Backend to Render** (see Option 2)

2. **Deploy Frontend to Vercel:**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

3. **Update API URLs** in `main.js`

### Option 4: Railway.app (Full Stack)
**Easiest:** Automatic deployment

1. Go to: https://railway.app/
2. Connect GitHub repo
3. Add environment variables
4. Deploy automatically

## 🔐 Additional Security for Production

### 1. API Key Restrictions (Google Cloud Console)

Set up API restrictions:
- **HTTP Referrers:** Add your domain (e.g., `https://yourdomain.com/*`)
- **API Restrictions:** Enable only required APIs:
  - Maps JavaScript API
  - Places API
  - Geocoding API

### 2. Rate Limiting

Add to `pyscrpt.py`:
```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["100 per hour"]
)
```

### 3. CORS Configuration

Update CORS in production:
```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://yourdomain.com"]
    }
})
```

## 📋 Checklist Before Going Live

- [ ] Regenerated API key
- [ ] Cleaned git history of old API key
- [ ] Set up API restrictions in Google Cloud Console
- [ ] Updated `.env` with new key
- [ ] Tested locally with new key
- [ ] Set up monitoring for API usage
- [ ] Added rate limiting
- [ ] Configured CORS properly
- [ ] Set up HTTPS for production
- [ ] Created `requirements.txt` for deployment

## 📝 Create requirements.txt

```bash
# Generate requirements file
pip freeze > requirements.txt
```

Or create manually:
```
googlemaps==4.10.0
Flask==3.0.0
flask-cors==4.0.0
python-dotenv==1.0.0
```

## 🆘 If Someone Already Used Your API Key

1. **Check Google Cloud Console** for unusual activity
2. **Set up billing alerts** to prevent surprise charges
3. **Enable detailed logging** to see who's using your key
4. **Consider setting daily quotas** to limit potential damage

## 📞 Support

- Google Cloud Support: https://cloud.google.com/support
- Render Support: https://render.com/docs
- GitHub Pages: https://docs.github.com/pages

---

**Remember:** Security is an ongoing process. Regularly review your API usage and update your keys periodically!
