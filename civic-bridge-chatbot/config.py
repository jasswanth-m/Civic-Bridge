import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    FLASK_APP = os.getenv('FLASK_APP', 'main.py')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = os.getenv('DEBUG', 'False') == 'True'
    CHATBOT_PORT = int(os.getenv('CHATBOT_PORT', 5000))
    
    # LLM Configuration
    LLM_PROVIDER = os.getenv('LLM_PROVIDER', 'openai')
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    LLM_MODEL = os.getenv('LLM_MODEL', 'gpt-4')
    LLM_TEMPERATURE = float(os.getenv('LLM_TEMPERATURE', '0.7'))
    LLM_MAX_TOKENS = int(os.getenv('LLM_MAX_TOKENS', '1000'))
    
    # Backend Configuration
    BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:3000')
    BACKEND_API_KEY = os.getenv('BACKEND_API_KEY', '')
    BACKEND_TIMEOUT = int(os.getenv('BACKEND_TIMEOUT', '10'))
    
    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    
    # Session
    SESSION_TIMEOUT_MINUTES = int(os.getenv('SESSION_TIMEOUT_MINUTES', '30'))
