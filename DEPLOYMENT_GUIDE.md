# 🚀 Deploy NoirBrew Café Finder - Make It Live!

## 🌐 Make Your App Accessible Anywhere, Anytime

Your app will work on any device (desktop, tablet, mobile) with just a link - no backend setup needed!

---

## ⚡ RECOMMENDED: Render.com (100% Free Forever)

**Why Render?**
- ✅ Free tier available
- ✅ Auto-deployment from GitHub
- ✅ 24/7 uptime
- ✅ Automatic HTTPS
- ✅ No credit card required
- ✅ Perfect for Flask apps

### 🎯 Step-by-Step Deployment:

#### 1️⃣ **Prepare Your Repository**

First, let's create a `Procfile` for Render:

```bash
cd /Users/rachitmittal/Cafe_finder
```

Create a file named `Procfile` (no extension) with this content:
```
web: python pyscrpt.py
```

#### 2️⃣ **Update Python Script for Production**

Your `pyscrpt.py` needs to use `PORT` from environment variable:

Change the last line from:
```python
app.run(debug=True, port=5001, use_reloader=False)
```

To:
```python
port = int(os.getenv('PORT', 5001))
app.run(host='0.0.0.0', port=port, debug=False)
```

#### 3️⃣ **Deploy to Render**

1. **Go to Render.com**
   - Visit: https://render.com/
   - Click "Get Started" → Sign in with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select repository: `cafe_finder`

3. **Configure Settings**
   ```
   Name: noirbrew-cafe-finder
   Region: Choose closest to you
   Branch: main
   Root Directory: (leave blank)
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: python pyscrpt.py
   ```

4. **Add Environment Variable**
   - Click "Environment"
   - Add variable:
     ```
     Key: GOOGLE_MAPS_API_KEY
     Value: AIzaSyApyrKd0Jr8UvOEeowXm8Rys93zwp1rBcQ
     ```

5. **Select Free Plan**
   - Plan: Free
   - Click "Create Web Service"

6. **Wait for Deployment** (2-5 minutes)
   - Render will automatically build and deploy
   - You'll get a URL like: `https://noirbrew-cafe-finder.onrender.com`

#### 4️⃣ **Update Frontend to Use Production URL**

In `main.js`, change:
```javascript
const API_BASE_URL = 'http://localhost:5001/api';
```

To:
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5001/api'
    : 'https://your-app-name.onrender.com/api';
```

#### 5️⃣ **Deploy Frontend to GitHub Pages**

```bash
# Commit the changes
git add .
git commit -m "🚀 Production deployment ready"
git push origin main

# Enable GitHub Pages
# Go to: https://github.com/RachitMittal-20/cafe_finder/settings/pages
# Source: Deploy from branch "main"
# Folder: / (root)
# Save
```

Your frontend will be live at:
`https://rachitmittal-20.github.io/cafe_finder/`

---

## 🎉 Alternative: All-in-One Deployment Options

### Option 1: Vercel (Frontend) + Render (Backend)

**Frontend on Vercel:**
```bash
npm install -g vercel
cd /Users/rachitmittal/Cafe_finder
vercel login
vercel
```

**Backend on Render:** (Same as above)

### Option 2: Railway.app (Easiest - One Platform)

1. Visit: https://railway.app/
2. "Start a New Project"
3. "Deploy from GitHub repo"
4. Select `cafe_finder`
5. Add environment variable: `GOOGLE_MAPS_API_KEY`
6. Railway automatically detects Python and deploys!

You get ONE URL for everything!

### Option 3: PythonAnywhere (Simple)

1. Visit: https://www.pythonanywhere.com/
2. Create free account
3. Upload your code
4. Set up web app with Flask
5. Add API key to environment
6. Done!

---

## 🔧 Quick Setup Commands

Run these commands to prepare for deployment:

```bash
# 1. Create Procfile
echo "web: python pyscrpt.py" > Procfile

# 2. Make sure requirements.txt is complete
cat > requirements.txt << EOF
googlemaps==4.10.0
Flask==3.0.0
flask-cors==4.0.0
python-dotenv==1.0.0
gunicorn==21.2.0
EOF

# 3. Commit everything
git add Procfile requirements.txt pyscrpt.py main.js
git commit -m "🚀 Ready for production deployment"
git push origin main
```

---

## 📱 After Deployment - Update Google Maps API

**Important:** Update your API restrictions:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Select your API key
3. Under "Application restrictions":
   - Select "HTTP referrers"
   - Add these referrers:
     ```
     https://your-app-name.onrender.com/*
     https://rachitmittal-20.github.io/*
     localhost/*
     ```

---

## ✅ What You'll Get

After deployment:
- 🌐 **One Link**: Share it with anyone
- 📱 **Works on Mobile**: iOS, Android, everything
- 💻 **Works on Desktop**: All browsers
- ⚡ **Always On**: 24/7 availability
- 🔒 **Secure**: HTTPS enabled
- 🆓 **Free**: No cost!

Example links:
- Frontend: `https://rachitmittal-20.github.io/cafe_finder/`
- API: `https://noirbrew-cafe-finder.onrender.com/api/cafes`

---

## 🆘 Troubleshooting

**Backend takes time to start?**
- Free tier on Render goes to sleep after 15 minutes
- First request takes 30-60 seconds to wake up
- Upgrade to paid ($7/month) for always-on

**CORS errors?**
- Make sure CORS is properly configured in backend
- Check API restrictions in Google Cloud Console

**API key not working?**
- Verify environment variable is set correctly
- Check API restrictions allow your domain

---

## 🎯 Next Steps

1. Run the setup commands above
2. Deploy to Render (5 minutes)
3. Enable GitHub Pages (2 minutes)
4. Update API restrictions (1 minute)
5. Share your link! 🎉

**Total time: ~10 minutes to go live!**

---

Need help? The deployment is straightforward - just follow the steps above!
