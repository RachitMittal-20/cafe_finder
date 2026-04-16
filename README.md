# ☕ NoirBrew - Cafe Finder

NoirBrew is a responsive web app that helps you discover great cafes near any location (or near you) using SerpApi’s Google Maps results. It includes a modern UI, list + map views, favorites, and dark/light mode.

## 🌐 Live Demo (Render)

The project is deployed on Render:

- **Live site:** https://cafe-finder-7dhr.onrender.com

## ✨ Key Features

- 🔍 Search cafes by **location** (e.g., “New York”) or use **current location**
- 🗺️ **List + Map** views with interactive markers
- ⭐ Ratings + review counts
- 🕒 Opening hours / open–closed state (when available)
- 💰 Price level indicators (when available)
- 📍 Directions link to Google Maps
- ❤️ Favorites (saved in browser `localStorage`)
- 🌓 Dark/Light mode
- 📱 Fully responsive layout

## 🧱 Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Python (Flask)
- **Data Source:** SerpApi (Google Maps engine)
- **Deployment:** Render

## 📁 Project Structure

```
cafe_finder/
├── index.html              # Main HTML file
├── main.css                # Styles
├── main.js                 # Frontend JavaScript
├── pyscrpt.py              # Flask backend API
├── .env.example            # Example environment file
├── .gitignore              # Git ignore rules
├── requirements.txt        # Python dependencies
├── SECURITY_DEPLOYMENT.md  # Security & deployment guide
├── MAPS_INTEGRATION.md     # Map view documentation
├── RESPONSIVE_DESIGN.md    # Responsive UI notes
└── TESTING_GUIDE.md        # Manual testing checklist
```

## 🔐 Environment Variables

Create a `.env` file (do **not** commit it) and add your SerpApi key:

```env
SERPAPI_KEY=your_serpapi_key_here
```

You can copy from the example:

```bash
cp .env.example .env
```

## 🚀 Run Locally

### Prerequisites

- Python **3.8+**
- A SerpApi key: https://serpapi.com/

### 1) Clone

```bash
git clone https://github.com/RachitMittal-20/cafe_finder.git
cd cafe_finder
```

### 2) Create a virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate  # macOS/Linux
# .venv\Scripts\activate   # Windows
```

### 3) Install dependencies

```bash
pip install -r requirements.txt
```

### 4) Start the backend (Flask)

```bash
python3 pyscrpt.py
```

The API will be available locally (commonly on `http://localhost:5000` or `http://localhost:5001`, depending on your setup).

### 5) Start the frontend

Open `index.html` in your browser, or use a local static server:

```bash
python3 -m http.server 8000
```

Then visit:

- http://localhost:8000

## 🔌 API Endpoints

- `GET /api/cafes?location=<location>&radius=<radius>`
  - Example: `/api/cafes?location=London&radius=5000`
- `POST /api/cafes/nearby`
  - Body: `{"lat": <lat>, "lng": <lng>, "radius": <radius>}`

## 🛡️ Security Notes

- Never commit `.env` (it’s in `.gitignore`).
- If a key was ever exposed, rotate it immediately.
- Prefer using environment variables on Render for production.

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Make changes + test
4. Open a pull request

## 📄 License

MIT

---

If you find a bug or want to suggest improvements, please open an issue in the repository.