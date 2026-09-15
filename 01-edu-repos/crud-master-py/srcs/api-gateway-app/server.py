from app import create_app
from waitress import serve

import os

APP_PORT = os.getenv("APP_PORT")

app = create_app()
serve(app, listen=f"*:{APP_PORT}")
