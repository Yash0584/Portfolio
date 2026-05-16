# Yash Khadagta — Full Stack Portfolio Website

A modern full-stack portfolio website built using Flask, HTML, CSS, and JavaScript.  
The project includes a responsive frontend, backend APIs, contact form handling, visitor tracking, and secure deployment support.

---

## 🌟 Features

- Responsive modern UI
- Flask backend integration
- Contact form with database storage
- Visitor analytics tracking
- REST API endpoints
- SQLite database support
- Secure environment variable handling
- Deployment ready

---

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Python
- Flask
- SQLite

### Deployment
- Gunicorn
- Render / Railway / VPS

---

## 📁 Project Structure

```bash
portfolio/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── portfolio.db
│
└── frontend/
    ├── index.html
    ├── css/
    ├── js/
    └── assets/
```

---

## ⚙️ API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | Serves frontend |
| `/api/contact` | POST | Handles contact form |
| `/api/track` | POST | Tracks page visits |
| `/api/health` | GET | Health check |
| `/api/stats` | GET | Admin statistics |

---

## 🚀 Quick Start

```bash
git clone <repository-url>
cd portfolio/backend

pip install -r requirements.txt
python app.py
```

Application runs on:

```bash
http://localhost:5000
```

---

## 🌐 Deployment

The application can be deployed on:

- Render
- Railway
- VPS (Ubuntu)
- Any Flask-supported hosting platform

---

## 🔒 Security

- Environment variables support
- Secret key protection
- Protected admin API routes
- Secure deployment configuration

---

## 🚧 Future Improvements

- Admin dashboard
- PostgreSQL integration
- Docker support
- Blog section
- Dark mode
- Advanced analytics

---

## 👨‍💻 Author

**Yash Khadagta**

---

## 📄 License

MIT License
