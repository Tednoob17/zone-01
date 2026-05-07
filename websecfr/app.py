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
from flask import Flask, render_template_string, request, session, redirect, url_for, jsonify
from functools import wraps
from pathlib import Path
from datetime import datetime

app = Flask(__name__)
app.secret_key = os.urandom(32)

# Database and challenge data
BASE_DIR = Path(__file__).parent / 'websec.fr'
FLAGS_FILE = Path(__file__).parent / 'flags.json'
STATS_DIR = Path(__file__).parent / '.stats'

# Create stats directory
STATS_DIR.mkdir(exist_ok=True)

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

# Load flags from JSON file
def load_flags():
    """Load flags from flags.json"""
    if FLAGS_FILE.exists():
        return json.loads(FLAGS_FILE.read_text())
    return {}

FLAGS = load_flags()

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
    """Serve challenge page with flag submission form"""
    if level_id not in CHALLENGES:
        return "Challenge not found", 404
    
    info = CHALLENGES[level_id]
    challenge_path = BASE_DIR / level_id / 'index.html'
    
    if challenge_path.exists():
        html = challenge_path.read_text()
        # Inject CSRF token
        token = hashlib.md5(os.urandom(16)).hexdigest()
        session[f'csrf_{level_id}'] = token
        
        # Inject flag submission form at the end
        form_html = f'''
<style>
    .flag-submission-panel {{
        margin-top: 30px;
        padding: 20px;
        background: rgba(63, 185, 80, 0.1);
        border: 1px solid #3fb950;
        border-radius: 8px;
        font-family: system-ui, sans-serif;
    }}
    .flag-submission-panel h3 {{
        color: #3fb950;
        margin-bottom: 12px;
        font-size: 16px;
    }}
    .flag-input-group {{
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
    }}
    .flag-input-group input {{
        flex: 1;
        padding: 8px 12px;
        background: rgba(0,0,0,0.3);
        border: 1px solid #3fb950;
        border-radius: 4px;
        color: #e1e4e8;
        font-family: monospace;
    }}
    .flag-input-group input::placeholder {{
        color: #8b949e;
    }}
    .flag-input-group button {{
        padding: 8px 16px;
        background: #3fb950;
        color: #0f1115;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
    }}
    .flag-input-group button:hover {{
        opacity: 0.9;
    }}
    .hint-btn {{
        background: #388bfd;
        padding: 6px 12px;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        margin-right: 8px;
    }}
    .hint-btn:hover {{
        opacity: 0.9;
    }}
    .dashboard-btn {{
        background: #6e40aa;
        padding: 6px 12px;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
    }}
    .dashboard-btn:hover {{
        opacity: 0.9;
    }}
    #message {{
        margin-top: 12px;
        padding: 8px;
        border-radius: 4px;
        font-size: 14px;
        display: none;
    }}
    .success {{
        background: rgba(63, 185, 80, 0.2);
        color: #3fb950;
    }}
    .error {{
        background: rgba(207, 34, 46, 0.2);
        color: #f85149;
    }}
    .info {{
        background: rgba(56, 139, 253, 0.2);
        color: #388bfd;
    }}
</style>

<hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 30px 0;">

<div class="flag-submission-panel">
    <h3>🚩 Submit Flag</h3>
    <div class="flag-input-group">
        <input type="text" id="flagInput" placeholder="Enter the flag here..." />
        <button onclick="submitFlag('{level_id}')">Submit Flag</button>
    </div>
    <div style="display: flex; gap: 8px;">
        <button class="hint-btn" onclick="getHint('{level_id}')">💡 Get Hint</button>
        <a href="/dashboard" class="dashboard-btn">📊 View Progress</a>
    </div>
    <div id="message"></div>
</div>

<script>
async function submitFlag(levelId) {{
    const flagInput = document.getElementById('flagInput');
    const message = document.getElementById('message');
    const flag = flagInput.value.trim();
    
    if (!flag) {{
        showMessage('Please enter a flag', 'error');
        return;
    }}
    
    try {{
        const response = await fetch(`/api/verify/${{levelId}}`, {{
            method: 'POST',
            headers: {{'Content-Type': 'application/json'}},
            body: JSON.stringify({{flag}})
        }});
        
        const data = await response.json();
        showMessage(data.message, response.ok ? 'success' : 'error');
        
        if (response.ok) {{
            flagInput.value = '';
            setTimeout(() => {{
                window.location.reload();
            }}, 1500);
        }}
    }} catch (error) {{
        showMessage('Error submitting flag', 'error');
        console.error('Error:', error);
    }}
}}

async function getHint(levelId) {{
    const message = document.getElementById('message');
    
    try {{
        const response = await fetch(`/api/hint/${{levelId}}`);
        const data = await response.json();
        showMessage(`💡 Hint: ${{data.hint}} ({{hint_number}}/{{'total_hints'}}))`, 'info');
    }} catch (error) {{
        showMessage('Error fetching hint', 'error');
        console.error('Error:', error);
    }}
}}

function showMessage(text, type) {{
    const message = document.getElementById('message');
    message.textContent = text;
    message.className = type;
    message.style.display = 'block';
    setTimeout(() => {{
        message.style.display = 'none';
    }}, 4000);
}}

// Allow Enter key submission
document.getElementById('flagInput')?.addEventListener('keypress', (e) => {{
    if (e.key === 'Enter') {{
        submitFlag('{level_id}');
    }}
}});
</script>
'''
        
        # Inject before closing body tag
        html = html.replace('</body>', form_html + '</body>')
        return html
    
    return f"Challenge {level_id} not yet available", 404

def get_flag_info(level_id):
    """Get flag info from flags.json"""
    if level_id in FLAGS:
        return FLAGS[level_id]
    return None

def track_attempt(level_id, flag, success):
    """Track flag submission attempts"""
    stats_file = STATS_DIR / f'{level_id}_attempts.log'
    entry = f"{datetime.now().isoformat()} | {'SUCCESS' if success else 'FAIL'} | {flag[:20]}...\n"
    stats_file.write_text(stats_file.read_text() + entry if stats_file.exists() else entry)

def normalize_flag(flag):
    """
    Normalize flag for comparison.
    Handles WEBSEC{...} format and plain format.
    Returns normalized flag string for comparison.
    """
    flag = flag.strip().upper()
    
    # Extract content from WEBSEC{...} format if present
    if flag.startswith('WEBSEC{') and flag.endswith('}'):
        flag = flag[7:-1]  # Remove WEBSEC{ and }
    
    return flag

def compare_flags(submitted, correct):
    """
    Compare two flags with flexible matching.
    Accepts both WEBSEC{...} and plain formats.
    """
    submitted_norm = normalize_flag(submitted)
    correct_norm = normalize_flag(correct)
    return submitted_norm == correct_norm

@app.route('/api/verify/<level_id>', methods=['POST'])
def verify_flag(level_id):
    """API endpoint to verify flag submission"""
    if level_id not in CHALLENGES:
        return jsonify({'error': 'Invalid challenge'}), 404
    
    flag_info = get_flag_info(level_id)
    if not flag_info:
        return jsonify({'error': 'Flag not configured for this level'}), 500
    
    data = request.get_json()
    submitted_flag = data.get('flag', '').strip()
    correct_flag = flag_info.get('flag', '')
    
    # Flexible flag comparison (supports WEBSEC{...} and plain format)
    is_correct = compare_flags(submitted_flag, correct_flag)
    
    # Track the attempt
    track_attempt(level_id, submitted_flag, is_correct)
    
    if is_correct:
        session[f'solved_{level_id}'] = True
        session[f'solved_time_{level_id}'] = datetime.now().isoformat()
        return jsonify({
            'success': True,
            'message': '✓ Flag correct! Excellent exploit!',
            'points': 10 + (20 if 'Hard' in CHALLENGES[level_id]['difficulty'] else 0)
        })
    
    return jsonify({
        'success': False,
        'message': f'✗ Incorrect flag. Try again!',
        'attempts': len(STATS_DIR.glob(f'{level_id}_*')) if (STATS_DIR / f'{level_id}_attempts.log').exists() else 0
    }), 403

@app.route('/api/hint/<level_id>')
def get_hint(level_id):
    """Get a hint for a challenge"""
    if level_id not in CHALLENGES:
        return jsonify({'error': 'Invalid challenge'}), 404
    
    flag_info = get_flag_info(level_id)
    if not flag_info or 'hints' not in flag_info:
        return jsonify({'hint': 'No hints available'}), 200
    
    hints = flag_info['hints']
    hint_index = session.get(f'hint_index_{level_id}', 0)
    
    if hint_index >= len(hints):
        return jsonify({'hint': 'No more hints available. Check the source code!'}), 200
    
    hint = hints[hint_index]
    session[f'hint_index_{level_id}'] = hint_index + 1
    
    return jsonify({
        'hint': hint,
        'hint_number': hint_index + 1,
        'total_hints': len(hints)
    }), 200

def get_user_stats():
    """Calculate current user's stats from session"""
    solved_challenges = [k.replace('solved_', '') for k in session.keys() if k.startswith('solved_')]
    
    total_points = 0
    for level_id in solved_challenges:
        flag_info = get_flag_info(level_id)
        if flag_info:
            difficulty = flag_info.get('difficulty', 1)
            base_points = 10 + (20 if difficulty == 'Hard' else 10 if difficulty == 'Intermediate' else 0)
            total_points += base_points
    
    return {
        'solved': len(solved_challenges),
        'total': len(CHALLENGES),
        'points': total_points,
        'progress_percent': int((len(solved_challenges) / len(CHALLENGES)) * 100) if CHALLENGES else 0
    }

@app.route('/dashboard')
def dashboard():
    """Stats dashboard avec progression et statistiques"""
    stats_data = get_user_stats()
    
    # Prepare challenge list with attempt counts
    challenges_stats = []
    for level_id, info in CHALLENGES.items():
        log_file = STATS_DIR / f'{level_id}_attempts.log'
        attempts = 0
        if log_file.exists():
            attempts = len(log_file.read_text().strip().split('\n'))
        
        challenges_stats.append({
            'id': level_id,
            'name': info['name'],
            'solved': level_id in [k.replace('solved_', '') for k in session.keys() if k.startswith('solved_')],
            'attempts': attempts,
            'difficulty': info['difficulty']
        })
    
    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - WebSecFr</title>
    <style>
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{ font-family: system-ui, sans-serif; background: #0f1115; color: #e1e4e8; min-height: 100vh; }}
        header {{ padding: 24px; border-bottom: 1px solid rgba(255,255,255,0.06); }}
        header h1 {{ color: #3fb950; font-size: 28px; margin-bottom: 8px; }}
        .container {{ max-width: 1000px; margin: 0 auto; padding: 20px; }}
        .stats-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 30px; }}
        .stat-card {{ background: #1a1d23; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 16px; text-align: center; }}
        .stat-value {{ font-size: 32px; color: #3fb950; font-weight: bold; margin-bottom: 4px; }}
        .stat-label {{ font-size: 13px; color: #8b949e; }}
        .progress-bar {{ background: rgba(255,255,255,0.06); height: 8px; border-radius: 4px; margin-top: 8px; overflow: hidden; }}
        .progress-fill {{ background: #3fb950; height: 100%; width: {stats_data['progress_percent']}%; transition: width 0.3s; }}
        .challenges-table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
        .challenges-table th {{ text-align: left; padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); font-weight: 600; color: #8b949e; font-size: 12px; text-transform: uppercase; }}
        .challenges-table td {{ padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); }}
        .challenges-table tr:hover {{ background: rgba(63,185,80,0.05); }}
        .status-badge {{ display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }}
        .solved {{ background: rgba(63,185,80,0.2); color: #3fb950; }}
        .unsolved {{ background: rgba(255,255,255,0.06); color: #8b949e; }}
        .diff-easy {{ color: #3fb950; }}
        .diff-med {{ color: #388bfd; }}
        .diff-hard {{ color: #d29922; }}
        a {{ color: #388bfd; text-decoration: none; }}
        a:hover {{ text-decoration: underline; }}
    </style>
</head>
<body>
<header>
    <h1>📊 Dashboard</h1>
    <p>Your Progress on WebSecFr Challenges</p>
</header>

<div class="container">
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-value">{stats_data['solved']}/{stats_data['total']}</div>
            <div class="stat-label">Challenges Solved</div>
            <div class="progress-bar"><div class="progress-fill"></div></div>
        </div>
        
        <div class="stat-card">
            <div class="stat-value">{stats_data['points']}</div>
            <div class="stat-label">Total Points</div>
        </div>
        
        <div class="stat-card">
            <div class="stat-value">{stats_data['progress_percent']}%</div>
            <div class="stat-label">Progress</div>
        </div>
    </div>

    <h2 style="margin-top: 30px; margin-bottom: 16px;">Challenge Summary</h2>
    <table class="challenges-table">
        <thead>
            <tr>
                <th>Challenge</th>
                <th>Status</th>
                <th>Difficulty</th>
                <th>Attempts</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
'''
    
    for challenge in challenges_stats:
        status = f'<span class="status-badge solved">✓ SOLVED</span>' if challenge['solved'] else '<span class="status-badge unsolved">Not Started</span>'
        diff_class = f"diff-{{'Beginner': 'easy', 'Intermediate': 'med', 'Hard': 'hard'}.get(challenge['difficulty'], 'med')}"
        
        html += f'''
            <tr>
                <td><strong>{challenge['name']}</strong></td>
                <td>{status}</td>
                <td><span class="{diff_class}">{challenge['difficulty']}</span></td>
                <td>{challenge['attempts']}</td>
                <td><a href="/challenge/{challenge['id']}">Go to Challenge</a></td>
            </tr>
'''
    
    html += '''
        </tbody>
    </table>
    
    <div style="margin-top: 30px; padding: 16px; background: rgba(63,185,80,0.1); border-left: 3px solid #3fb950; border-radius: 4px;">
        <strong>💡 Tip:</strong> Each challenge teaches a different web security concept. Use hints wisely to learn the exploitation technique!
    </div>
</div>

<footer style="padding: 20px; margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center; color: #8b949e; font-size: 12px;">
    <a href="/" style="margin-right: 16px;">← Back to Challenges</a> | 
    WebSecFr Self-Hosted Edition
</footer>
</body>
</html>
'''
    return html

if __name__ == '__main__':
    print("\n[WebSecFr Local Setup]\n")
    init_db()
    print("✓ Databases initialized")
    print(f"✓ Flags loaded from flags.json: {len(FLAGS)} challenges")
    print("\nStarting server on http://localhost:5000")
    print("Press Ctrl+C to stop\n")
    app.run(debug=True, host='localhost', port=5000)
