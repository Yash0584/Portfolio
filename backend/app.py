"""
Yash Khadagta Portfolio — Flask Backend
Run: python app.py
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_mail import Mail, Message
from dotenv import load_dotenv
import os
import json
import sqlite3
from datetime import datetime

load_dotenv()

app = Flask(
    __name__,
    static_folder=os.path.join(os.path.dirname(__file__), '..', 'frontend'),
    static_url_path=''
)

# ── CORS ─────────────────────────────────────────────────────────
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ── MAIL CONFIG ───────────────────────────────────────────────────
app.config['MAIL_SERVER']   = os.getenv('MAIL_SERVER',   'smtp.gmail.com')
app.config['MAIL_PORT']     = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS']  = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME', 'khadagtayash@gmail.com')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD', '')  # set in .env
app.config['SECRET_KEY']    = os.getenv('SECRET_KEY',    'yash-portfolio-secret-2025')
mail = Mail(app)

DB_PATH = os.path.join(os.path.dirname(__file__), 'portfolio.db')


# ── DATABASE SETUP ────────────────────────────────────────────────
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            name      TEXT    NOT NULL,
            email     TEXT    NOT NULL,
            message   TEXT    NOT NULL,
            timestamp TEXT    NOT NULL,
            read      INTEGER DEFAULT 0
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS page_views (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            page      TEXT NOT NULL,
            ip        TEXT,
            timestamp TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# ── SERVE FRONTEND ────────────────────────────────────────────────
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/<path:path>')
def serve_static(path):
    full = os.path.join(app.static_folder, path)
    if os.path.isfile(full):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')


# ── API: CONTACT FORM ─────────────────────────────────────────────
@app.route('/api/contact', methods=['POST'])
def contact():
    data = request.get_json(silent=True) or {}
    name    = (data.get('name')    or '').strip()
    email   = (data.get('email')   or '').strip()
    message = (data.get('message') or '').strip()

    # Validation
    errors = {}
    if not name:             errors['name']    = 'Name is required.'
    if not email:            errors['email']   = 'Email is required.'
    elif '@' not in email:   errors['email']   = 'Please enter a valid email.'
    if not message:          errors['message'] = 'Message is required.'
    if len(message) > 2000:  errors['message'] = 'Message must be under 2000 characters.'

    if errors:
        return jsonify({'success': False, 'errors': errors}), 400

    timestamp = datetime.utcnow().isoformat()

    # Save to DB
    try:
        conn = get_db()
        conn.execute(
            'INSERT INTO messages (name, email, message, timestamp) VALUES (?, ?, ?, ?)',
            (name, email, message, timestamp)
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f'DB error: {e}')

    # Send email (if MAIL_PASSWORD is configured)
    if app.config.get('MAIL_PASSWORD'):
        try:
            msg = Message(
                subject=f'Portfolio Contact: {name}',
                sender=app.config['MAIL_USERNAME'],
                recipients=['khadagtayash@gmail.com'],
                body=f"""
New contact form submission
===========================
Name:    {name}
Email:   {email}
Time:    {timestamp}

Message:
{message}
                """.strip(),
                reply_to=email
            )
            mail.send(msg)
        except Exception as e:
            print(f'Mail error: {e}')
            # Don't fail the request if mail fails

    return jsonify({
        'success': True,
        'message': 'Thanks! Your message has been received. I\'ll get back to you soon.'
    }), 200


# ── API: PAGE VIEW TRACKER ────────────────────────────────────────
@app.route('/api/track', methods=['POST'])
def track():
    data  = request.get_json(silent=True) or {}
    page  = (data.get('page') or 'home').strip()[:100]
    ip    = request.remote_addr
    ts    = datetime.utcnow().isoformat()
    try:
        conn = get_db()
        conn.execute('INSERT INTO page_views (page, ip, timestamp) VALUES (?,?,?)', (page, ip, ts))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f'Track error: {e}')
    return jsonify({'ok': True})


# ── API: STATS (admin) ────────────────────────────────────────────
@app.route('/api/stats', methods=['GET'])
def stats():
    """Simple read-only stats endpoint."""
    secret = request.args.get('secret', '')
    if secret != app.config.get('SECRET_KEY', ''):
        return jsonify({'error': 'Unauthorized'}), 401
    try:
        conn = get_db()
        msg_count  = conn.execute('SELECT COUNT(*) FROM messages').fetchone()[0]
        view_count = conn.execute('SELECT COUNT(*) FROM page_views').fetchone()[0]
        recent     = conn.execute(
            'SELECT name, email, timestamp FROM messages ORDER BY id DESC LIMIT 5'
        ).fetchall()
        conn.close()
        return jsonify({
            'total_messages':  msg_count,
            'total_views':     view_count,
            'recent_messages': [dict(r) for r in recent]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ── API: HEALTH CHECK ─────────────────────────────────────────────
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'timestamp': datetime.utcnow().isoformat()})


# ── RUN ───────────────────────────────────────────────────────────
if __name__ == '__main__':
    init_db()
    print('\n  ✅  Portfolio backend running at http://localhost:5000\n')
    app.run(debug=True, host='0.0.0.0', port=5000)
