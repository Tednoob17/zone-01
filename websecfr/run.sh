#!/bin/bash
# WebSecFr Quick Start Script
# Automatically installs dependencies and starts the server

set -e

echo "╔════════════════════════════════════════╗"
echo "║    WebSecFr - Local Edition Setup      ║"
echo "╚════════════════════════════════════════╝"
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8+"
    exit 1
fi

echo "✓ Python 3 found: $(python3 --version)"
echo ""

# Check/create venv
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing dependencies..."
pip install -q -r requirements.txt

echo ""
echo "╔════════════════════════════════════════╗"
echo "║         Starting WebSecFr Server       ║"
echo "║     http://localhost:5000              ║"
echo "║                                        ║"
echo "║  Press Ctrl+C to stop the server      ║"
echo "╚════════════════════════════════════════╝"
echo ""

python app.py
