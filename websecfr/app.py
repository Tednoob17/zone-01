#!/usr/bin/env python3
"""
WebSecFr Local Platform
A self-contained Flask app that recreates the websec.fr challenges locally
Perfect for offline learning and practice
"""
import os
import sqlite3
import json
import hashlib
from flask import Flask, render_string, request, session, redirect, url_for, jsonify
from functools import wraps
from pathlib import Path

app = Flask(__name__)
app.secret_key = os.urandom(32)

# Database and challenge data
BASE_DIR = Path(__file__).parent / 'websec.fr'
CHALLENGES = {
    'level01': {
        'name': 'SQL Injection - Basic',
        'description': 'Extract user data via SQL injection',
        'difficulty': 'Beginner',
        'db': 'level01.db',
        'type': 'sql_injection',
    },
    'level02': {
        'name': 'SQL Injection - Filtering',
        'description': 'Bypass keyword filtering to exploit SQL injection',
        'difficulty': 'Intermediate',
        'db': 'level02.db',
        'type': 'sql_injection',
    },
    'level03': {
        'name': 'SQL Injection - Advanced',
        'description': 'Complex SQL injection with multiple bypasses',
        'difficulty': 'Hard',
        'db': 'level03.db',
        'type': 'sql_injection',
    },
}

def init_db():
    """Initialize all challenge databases"""
    for level, config in CHALLENGES.items():
        db_path = BASE_DIR / level / config['db']
        db_path.parent.mkdir(parents=True, exist_ok=True)
        
        if not db_path.exists():
            conn = sqlite3.connect(db_path)
            c = conn.cursor()
            c.execute('CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT)')
            c.executemany('INSERT INTO users VALUES (?, ?)', [
                (1, 'admin'),
                (2, 'user'),
                (3, 'guest'),
            ])
            conn.commit()
            conn.close()

@app.route('/')
def index():
    """Homepage with challenge list"""
    html = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebSecFr - Local Edition</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: system-ui, sans-serif; background: #0f1115; color: #e1e4e8; min-height: 100vh; }
        header { padding: 24px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        header h1 { color: #3fb950; font-size: 28px; }
        .container { max-width: 900px; margin: 0 auto; padding: 20px; }
        .challenge-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-top: 20px; }
        .challenge-card { background: #1a1d23; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 16px; transition: all 0.2s; }
        .challenge-card:hover { border-color: #3fb950; box-shadow: 0 0 12px rgba(63,185,80,0.1); }
        .challenge-name { font-weight: 600; margin-bottom: 8px; color: #fff; }
        .challenge-desc { font-size: 13px; color: #8b949e; margin-bottom: 12px; }
        .challenge-diff { display: inline-block; font-size: 11px; padding: 3px 8px; border-radius: 4px; margin-bottom: 12px; }
        .diff-easy { background: rgba(63,185,80,0.2); color: #3fb950; }
        .diff-med { background: rgba(56,139,253,0.2); color: #388bfd; }
        .diff-hard { background: rgba(210,153,34,0.2); color: #d29922; }
        .btn { display: inline-block; padding: 8px 16px; background: #3fb950; color: #0f1115; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; text-decoration: none; }
        .btn:hover { opacity: 0.9; }
        .badge { display: inline-block; background: #3fb950; color: #0f1115; padding: 2px 6px; border-radius: 3px; font-size: 11px; margin-left: 8px; }
    </style>
</head>
<body>
<header>
    <h1>🔗 WebSecFr - Local Edition</h1>
    <p>Web Security Challenges for Learning</p>
</header>

<div class="container">
    <h2>Available Challenges</h2>
    <div class="challenge-grid">
'''
    
    for level_id, info in CHALLENGES.items():
        diff_map = {'Beginner': 'easy', 'Intermediate': 'med', 'Hard': 'hard'}
        diff_class = f"diff-{diff_map.get(info['difficulty'], 'med')}"
        solved = '✓' if session.get(f'solved_{level_id}') else ''
        
        html += f'''
        <div class="challenge-card">
            <div class="challenge-name">
                {info['name']}
                {f'<span class="badge">SOLVED</span>' if solved else ''}
            </div>
            <div class="challenge-desc">{info['description']}</div>
            <span class="challenge-diff {diff_class}">{info['difficulty']}</span>
            <br><br>
            <a href="/challenge/{level_id}" class="btn">Start Challenge</a>
        </div>
'''
    
    html += '''
    </div>
</div>

<footer style="padding: 20px; margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center; color: #8b949e; font-size: 12px;">
    Self-contained WebSecFr clone for offline learning • Powered by Flask
</footer>
</body>
</html>
'''
    return html

@app.route('/challenge/<level_id>')
def challenge(level_id):
    """Serve challenge page"""
    if level_id not in CHALLENGES:
        return "Challenge not found", 404
    
    info = CHALLENGES[level_id]
    challenge_path = BASE_DIR / level_id / 'index.html'
    
    if challenge_path.exists():
        html = challenge_path.read_text()
        # Inject CSRF token
        token = hashlib.md5(os.urandom(16)).hexdigest()
        session[f'csrf_{level_id}'] = token
        html = html.replace('<input type="hidden" id="token"', 
                           f'<input type="hidden" value="{token}"" type="hidden" id="token"')
        return html
    
    return f"Challenge {level_id} not yet available", 404

@app.route('/api/verify/<level_id>', methods=['POST'])
def verify_flag(level_id):
    """API endpoint to verify flag submission"""
    if level_id not in CHALLENGES:
        return jsonify({'error': 'Invalid challenge'}), 404
    
    data = request.get_json()
    flag = data.get('flag', '').strip()
    
    # Simple flag check (can be customized per level)
    correct_flags = {
        'level01': '1',
        'level02': '1 or 1=1',
        'level03': 'admin',
    }
    
    if flag.lower() == correct_flags.get(level_id, '').lower():
        session[f'solved_{level_id}'] = True
        return jsonify({'success': True, 'message': 'Flag correct! Well done.'})
    
    return jsonify({'success': False, 'message': 'Incorrect flag. Try again.'}), 403

if __name__ == '__main__':
    print("\n[WebSecFr Local Setup]\n")
    init_db()
    print("✓ Databases initialized")
    print("\nStarting server on http://localhost:5000")
    print("Press Ctrl+C to stop\n")
    app.run(debug=True, host='localhost', port=5000)
