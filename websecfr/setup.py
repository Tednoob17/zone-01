#!/usr/bin/env python3
"""
WebSecFr Setup Script - Converts HTML source viewers to working PHP challenges
Generates directory structure and support files for offline operation
"""
import os
import re
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).parent / 'websec.fr'
CHALLENGES = {
    'level01': {'db': 'database.db', 'type': 'sql_injection'},
    'level02': {'db': 'leveltwo.db', 'type': 'sql_injection'},
    'level03': {'db': 'levelthree.db', 'type': 'sql_injection'},
}

def create_database(db_path, users=None):
    """Create SQLite database with sample users"""
    if users is None:
        users = [
            (1, 'admin'),
            (2, 'user'),
            (3, 'test'),
        ]
    
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT)')
    c.executemany('INSERT OR IGNORE INTO users VALUES (?, ?)', users)
    conn.commit()
    conn.close()
    print(f"✓ Created {db_path}")

def create_anti_csrf_php():
    """Create anti-CSRF token handler"""
    code = '''<?php
function init_token() {
    if (!isset($_SESSION['token'])) {
        $_SESSION['token'] = bin2hex(random_bytes(16));
    }
}

function check_and_refresh_token() {
    if (!isset($_POST['token']) || $_POST['token'] !== $_SESSION['token']) {
        die('CSRF token mismatch');
    }
    init_token();
}
?>'''
    
    path = BASE_DIR / 'anti_csrf.php'
    path.write_text(code)
    print(f"✓ Created anti_csrf.php")

def create_index_php():
    """Create main challenge list and submission handler"""
    code = '''<?php
session_start();

// List of all challenges
$challenges = [
    'level01' => ['name' => 'SQL Injection Basics', 'flag' => '1'],
    'level02' => ['name' => 'SQL Injection - Filtering', 'flag' => '1'],
    'level03' => ['name' => 'SQL Injection Advanced', 'flag' => '1'],
];

// Persistent storage (replace with DB in production)
$solved_dir = __DIR__ . '/solved';
@mkdir($solved_dir);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['chall_id']) && isset($_POST['flag'])) {
    $chall_id = preg_replace('/[^a-z0-9]/', '', $_POST['chall_id']);
    $flag = trim($_POST['flag']);
    
    // Simple flag check
    if (isset($challenges[$chall_id]) && $flag === $challenges[$chall_id]['flag']) {
        file_put_contents($solved_dir . '/' . $chall_id, time());
        $success = "Flag correct!";
    } else {
        $error = "Invalid flag";
    }
}
?><!DOCTYPE html>
<html>
<head>
    <title>WebSecFr - Challenges</title>
    <link rel="stylesheet" href="static/bootstrap.min.css"/>
    <link rel="stylesheet" href="static/websec.css"/>
</head>
<body>
<header>
    <pre id="banner">
                    '||
... ... ...   ....   || ...   ....    ....    ....
 ||  ||  |  .|...||  ||'  || ||. '  .|...|| .|   ''
  ||| |||   ||       ||    | . '|.. ||      ||		-- local version
   |   |     '|...'  '|...'  |'..|'  '|...'  '|...'
    </pre>
</header>

<nav class="navbar navbar-default">
  <div class="container-fluid">
    <div class="navbar-header">
      <a class="navbar-brand" href="index.php">websec</a>
    </div>
    <div class="collapse navbar-collapse">
      <ul class="nav navbar-nav navbar-right">
        <li><a href="faq.html">faq</a></li>
      </ul>
    </div>
  </div>
</nav>

<main>
<div class="container">
    <?php if (isset($success)): ?>
    <div class="alert alert-success" role="alert"><?php echo htmlspecialchars($success); ?></div>
    <?php endif; ?>
    
    <?php if (isset($error)): ?>
    <div class="alert alert-danger" role="alert"><?php echo htmlspecialchars($error); ?></div>
    <?php endif; ?>
    
    <h1>Web Security Challenges</h1>
    <p class="lead">Solve challenges and capture the flag!</p>
    
    <div class="row">
    <?php foreach ($challenges as $id => $info): 
        $solved = file_exists($solved_dir . '/' . $id) ? '✓ ' : '';
    ?>
        <div class="col-md-4">
            <div class="panel panel-default">
                <div class="panel-heading"><?php echo $solved . htmlspecialchars($info['name']); ?></div>
                <div class="panel-body">
                    <a href="<?php echo $id; ?>/index.html" class="btn btn-primary btn-sm">Start Challenge</a>
                </div>
            </div>
        </div>
    <?php endforeach; ?>
    </div>
</div>
</main>

<script src="static/jquery.js"></script>
<script src="static/bootstrap.min.js"></script>
</body>
</html>
'''
    
    path = BASE_DIR / 'index.php'
    path.write_text(code)
    print(f"✓ Created main index.php")

def setup():
    """Main setup function"""
    print("\n[WebSecFr Setup]\n")
    
    # Create databases
    for level, config in CHALLENGES.items():
        db_path = BASE_DIR / level / config['db']
        db_path.parent.mkdir(parents=True, exist_ok=True)
        create_database(str(db_path))
    
    # Create support files
    create_anti_csrf_php()
    create_index_php()
    
    print("\n✓ Setup complete!")
    print("\nTo run the server:")
    print("  cd websec.fr")
    print("  php -S localhost:8000")
    print("\nThen open: http://localhost:8000")

if __name__ == '__main__':
    setup()
