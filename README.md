# Yash Khadagta — Portfolio Website

Full-stack portfolio with a **Flask backend** and a clean HTML/CSS/JS frontend.

---

## 📁 Project Structure

```
portfolio/
├── backend/
│   ├── app.py              ← Flask server (API + serves frontend)
│   ├── requirements.txt    ← Python dependencies
│   ├── .env.example        ← Environment variable template
│   └── portfolio.db        ← SQLite DB (auto-created on first run)
│
└── frontend/
    ├── index.html          ← Main page
    ├── css/
    │   └── styles.css      ← All styles
    ├── js/
    │   └── main.js         ← Frontend logic + API calls
    └── assets/
        └── Yash_Khadagta_Resume.pdf   ← Place your resume here
```

---

## ⚙️ Backend Features

| Endpoint         | Method | Description                        |
|------------------|--------|------------------------------------|
| `/`              | GET    | Serves the frontend                |
| `/api/contact`   | POST   | Receives contact form submissions  |
| `/api/track`     | POST   | Tracks page views                  |
| `/api/health`    | GET    | Health check                       |
| `/api/stats`     | GET    | Admin stats (requires secret key)  |

**Data stored in SQLite:**
- All contact form submissions (name, email, message, timestamp)
- Page view logs (page, IP, timestamp)

---

## 🚀 Local Setup

### 1. Clone / unzip the project

```bash
cd portfolio
```

### 2. Set up Python environment

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

```bash
cp .env.example .env
# Edit .env — add your Gmail App Password to enable email notifications
```

> **Gmail App Password setup:**
> 1. Enable 2-Factor Authentication on your Google account
> 2. Go to https://myaccount.google.com/apppasswords
> 3. Create a new App Password → copy it into `MAIL_PASSWORD` in `.env`

### 5. Add your resume

Place your resume PDF at:
```
frontend/assets/Yash_Khadagta_Resume.pdf
```

### 6. Run the server

```bash
python app.py
```

Visit **http://localhost:5000** — the Flask server serves both the API and the frontend.

---

## 🌐 Deployment Options

### Option A — Render (Free)
1. Push to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set **Root Directory** to `backend`
4. Set **Build Command**: `pip install -r requirements.txt`
5. Set **Start Command**: `gunicorn app:app`
6. Add environment variables from `.env` in the Render dashboard

### Option B — Railway
1. Push to GitHub
2. Connect repo on [railway.app](https://railway.app)
3. Set start command: `cd backend && gunicorn app:app`
4. Add environment variables

### Option C — VPS (Ubuntu)
```bash
# Install dependencies
pip install -r requirements.txt

# Run with gunicorn + nginx
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

---

## 📬 Viewing Contact Messages

### Via the stats API:
```
GET http://localhost:5000/api/stats?secret=YOUR_SECRET_KEY
```

### Via SQLite directly:
```bash
cd backend
sqlite3 portfolio.db
sqlite> SELECT * FROM messages;
sqlite> SELECT COUNT(*) FROM page_views;
```

---

## 🔒 Security Notes

- Never commit your `.env` file to Git (it's in `.gitignore`)
- Change `SECRET_KEY` in `.env` before deploying
- The `/api/stats` endpoint is protected by the secret key

---

## 📄 License

MIT — feel free to use this as a template for your own portfolio.
