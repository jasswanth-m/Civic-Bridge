from datetime import datetime
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class SessionManager:
    """Manages conversation sessions and student information"""
    
    def __init__(self):
        """Initialize session storage (in-memory for MVP)"""
        # In production, use Redis or database
        self.sessions: Dict = {}
    
    def create_session(self, session_id: str):
        """Create a new conversation session"""
        self.sessions[session_id] = {
            "created_at": datetime.now().isoformat(),
            "messages": [],
            "student_info": {},
            "matched_schemes": [],
            "current_scheme": None
        }
        logger.info(f"Session created: {session_id}")
    
    def add_message(self, session_id: str, role: str, content: str):
        """Add message to conversation history"""
        if session_id not in self.sessions:
            self.create_session(session_id)
        
        self.sessions[session_id]["messages"].append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })
        logger.debug(f"Message added to session {session_id}")
    
    def get_messages(self, session_id: str) -> List[Dict]:
        """Get all messages in format for LLM"""
        if session_id not in self.sessions:
            return []
        
        # Return only role and content (LLM format)
        return [
            {
                "role": msg["role"],
                "content": msg["content"]
            } 
            for msg in self.sessions[session_id]["messages"]
        ]
    
    def update_student_info(self, session_id: str, info_dict: Dict):
        """Update collected student information"""
        if session_id not in self.sessions:
            self.create_session(session_id)
        
        self.sessions[session_id]["student_info"].update(info_dict)
        logger.debug(f"Student info updated for session {session_id}")
    
    def get_student_info(self, session_id: str) -> Dict:
        """Get collected student information"""
        if session_id not in self.sessions:
            return {}
        return self.sessions[session_id]["student_info"]
    
    def set_matched_schemes(self, session_id: str, schemes: List):
        """Store matched schemes from backend"""
        if session_id not in self.sessions:
            self.create_session(session_id)
        
        self.sessions[session_id]["matched_schemes"] = schemes
        logger.info(f"Stored {len(schemes)} matched schemes for session {session_id}")
    
    def get_matched_schemes(self, session_id: str) -> List:
        """Get schemes matched in this session"""
        if session_id not in self.sessions:
            return []
        return self.sessions[session_id]["matched_schemes"]
    
    def set_current_scheme(self, session_id: str, scheme_id: str):
        """Set which scheme student is currently discussing"""
        if session_id not in self.sessions:
            self.create_session(session_id)
        
        self.sessions[session_id]["current_scheme"] = scheme_id
        logger.debug(f"Current scheme set to {scheme_id} for session {session_id}")
    
    def get_current_scheme(self, session_id: str) -> str:
        """Get current scheme being discussed"""
        if session_id not in self.sessions:
            return None
        return self.sessions[session_id]["current_scheme"]
