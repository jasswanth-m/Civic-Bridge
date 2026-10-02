import os
import logging
from dotenv import load_dotenv

# Load environment variables FIRST
load_dotenv()

from flask import Flask
from flask_cors import CORS
from api.routes import api
from utils.logger import setup_logging

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)

# Enable CORS
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Register blueprints
app.register_blueprint(api)

# Error handlers
@app.errorhandler(404)
def not_found(e):
    return {"error": "Not found"}, 404

@app.errorhandler(500)
def server_error(e):
    logger.error(f"Server error: {str(e)}")
    return {"error": "Internal server error"}, 500

if __name__ == '__main__':
    port = int(os.getenv("CHATBOT_PORT", 5000))
    debug = os.getenv("FLASK_ENV", "development") == "development"
    
    logger.info(f"Starting Civic Bridge Chatbot on port {port}")
    
    app.run(
        host="0.0.0.0",
        port=port,
        debug=debug
    )
