from flask import Blueprint, request, jsonify
from chatbot.chat_engine import ChatEngine
import uuid
import logging

logger = logging.getLogger(__name__)

# Create Blueprint
api = Blueprint('api', __name__, url_prefix='/api')

# Initialize chat engine
chat_engine = ChatEngine()

@api.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Civic Bridge Chatbot",
        "version": "1.0.0"
    }), 200

@api.route('/chat', methods=['POST'])
def chat():
    """
    Chat endpoint
    
    Request:
    {
        "message": "Your message here",
        "session_id": "optional-uuid" (if not provided, new one created)
    }
    
    Response:
    {
        "success": true,
        "session_id": "uuid",
        "response": "Chatbot response",
        "status_code": 200
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "Request body is empty"
            }), 400
        
        message = data.get("message", "").strip()
        session_id = data.get("session_id", str(uuid.uuid4()))
        
        if not message:
            return jsonify({
                "success": False,
                "error": "Message cannot be empty"
            }), 400
        
        logger.info(f"Chat request: session={session_id}, message_len={len(message)}")
        
        # Process the message
        response = chat_engine.process_message(session_id, message)
        
        return jsonify({
            "success": True,
            "session_id": session_id,
            "response": response
        }), 200
    
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@api.errorhandler(404)
def not_found(e):
    """404 error handler"""
    return jsonify({"error": "Endpoint not found"}), 404

@api.errorhandler(500)
def server_error(e):
    """500 error handler"""
    return jsonify({"error": "Internal server error"}), 500
