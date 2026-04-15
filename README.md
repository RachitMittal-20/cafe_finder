# ☕ NoirBrew - Cafe Finder

A beautiful web application to discover cafes near you using SerpApi Google Maps search results.

## 🛡️ Security

This version includes:
- ✅ SerpApi key stored in `.env`
- ✅ `.gitignore` to prevent sensitive files from being pushed
- ✅ No API keys in frontend code

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- SerpApi key ([Get one here](https://serpapi.com/))

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/RachitMittal-20/cafe_finder.git
   cd cafe_finder
   ```

2. **Create and activate virtual environment:**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate  # On macOS/Linux
   # .venv\Scripts\activate   # On Windows
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure API key:**
   ```bash
   cp .env.example .env
# Edit .env and add your SerpApi key
   ```

5. **Start the backend server:**
   ```bash
   python3 pyscrpt.py
   ```

6. **Open in browser:**
   - Open `index.html` in your browser, or
   - Use VS Code Live Server extension, or
   - Run: `python3 -m http.server 8000` and visit `http://localhost:8000`

## 📁 Project Structure

```
cafe_finder/
├── index.html              # Main HTML file
├── main.css               # Styles
├── main.js                # Frontend JavaScript
├── pyscrpt.py             # Flask backend API
├── .env                   # API keys (DO NOT COMMIT!)
├── .env.example           # Example environment file
├── .gitignore             # Git ignore rules
├── requirements.txt       # Python dependencies
└── SECURITY_DEPLOYMENT.md # Security & deployment guide
```

## 🔑 API Endpoints

- `GET /api/cafes?location=<location>&radius=<radius>` - Search cafes by location
- `POST /api/cafes/nearby` - Search cafes by coordinates

## 🌐 Deployment

**Note:** Your app currently runs on localhost only. To make it accessible to others:

See `SECURITY_DEPLOYMENT.md` for detailed deployment options including:
- Render.com (Recommended)
- Vercel + Render
- Railway.app
- GitHub Pages (static only)

## 🔒 Important Security Notes

1. **Never commit `.env` file** - It's now in `.gitignore`
2. **Regenerate your API key** if it was previously exposed
3. **Set up API restrictions** in Google Cloud Console:
   - Restrict by HTTP referrer for your domain
   - Enable only required APIs (Maps, Places, Geocoding)
4. **Monitor API usage** in Google Cloud Console
5. **Set up billing alerts** to prevent surprise charges

## 🛠️ Features

- 🔍 Search cafes by location or use current location
- 🗺️ Interactive map view with markers
- ⭐ Ratings and reviews
- 📍 Distance and directions
- 💰 Price level indicators
- 🕒 Opening hours
- ❤️ Save favorites (localStorage)
- 🌓 Dark/Light mode
- 📱 Responsive design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - Feel free to use this project for learning and personal use.

## 🆘 Troubleshooting

### Backend won't start
- Check that `.env` file exists and contains a valid `SERPAPI_KEY`
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Port 5001 might be in use: `lsof -ti:5001 | xargs kill -9`

### No cafes showing
- Make sure backend is running: `python3 pyscrpt.py`
- Check browser console for errors (F12)
- Verify your SerpApi key is active

### API key errors
- Verify `SERPAPI_KEY` is set in `.env`

## 📞 Support

- Report issues: [GitHub Issues](https://github.com/RachitMittal-20/cafe_finder/issues)
- Security concerns: See `SECURITY_DEPLOYMENT.md`

---

**⚠️ Remember:** Never share your API keys publicly! Always keep `.env` file private and secure.
