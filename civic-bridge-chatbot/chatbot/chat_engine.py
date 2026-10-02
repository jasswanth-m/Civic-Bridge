import json
import logging
from chatbot.llm_client import LLMClient
from chatbot.backend_client import BackendClient
from chatbot.session_manager import SessionManager
from chatbot.extractors import StudentInfoExtractor
from prompts.system_prompt import MASTER_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

class ChatEngine:
    """Main chat processing engine"""
    
    def __init__(self):
        """Initialize chat engine components"""
        self.llm = LLMClient()
        self.backend = BackendClient()
        self.sessions = SessionManager()
        self.extractor = StudentInfoExtractor()
    
    def process_message(self, session_id: str, user_message: str) -> str:
        """
        Process user message and return chatbot response
        
        Args:
            session_id: Unique session identifier
            user_message: The user's message
        
        Returns:
            str: Chatbot response
        """
        try:
            # Add user message to conversation history
            self.sessions.add_message(session_id, "user", user_message)
            logger.info(f"Processing message for session {session_id}")
            
            # Get current student info
            student_info = self.sessions.get_student_info(session_id)
            
            # Extract new information from message
            extracted = self.extractor.extract(user_message, student_info)
            if extracted:
                self.sessions.update_student_info(session_id, extracted)
                logger.info(f"Extracted info: {extracted}")
            
            # Get updated student info
            student_info = self.sessions.get_student_info(session_id)
            
            # Check if all required info is already present
            required = ["course", "year", "state", "family_income"]
            has_all = all(student_info.get(field) for field in required)
            matched_schemes = self.sessions.get_matched_schemes(session_id)
            
            if has_all and not matched_schemes:
                logger.info(f"All required information gathered for session {session_id}. Triggering backend matching directly.")
                llm_response = self._integrate_backend_results(session_id, student_info, "")
                self.sessions.add_message(session_id, "assistant", llm_response)
                return llm_response

            # Construct dynamic prompt highlighting already known attributes
            known_items = [f"- {k.replace('_', ' ').title()}: {v}" for k, v in student_info.items() if v is not None]
            if known_items:
                dynamic_prompt = f"{MASTER_SYSTEM_PROMPT}\n\n[CURRENTLY COLLECTED STUDENT PROFILE - DO NOT ASK FOR THESE AGAIN]:\n" + "\n".join(known_items) + "\n\nOnly ask ONE concise question for whatever essential information (Course, Year, State, Income) is still missing."
            else:
                dynamic_prompt = MASTER_SYSTEM_PROMPT

            # Get conversation history for LLM
            messages = self.sessions.get_messages(session_id)
            
            # Call LLM to get response
            logger.info("Calling LLM for response")
            llm_response = self.llm.get_response(dynamic_prompt, messages)
            
            # Check if we should match schemes
            if self._should_match_schemes(session_id, student_info, llm_response):
                logger.info("Conditions met to search for schemes")
                llm_response = self._integrate_backend_results(
                    session_id, student_info, llm_response
                )
            
            # Add assistant response to history
            self.sessions.add_message(session_id, "assistant", llm_response)
            
            return llm_response
        
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            return f"Sorry, I encountered an error: {str(e)}. Please try again."
    
    def _should_match_schemes(self, session_id: str, student_info: dict, llm_response: str) -> bool:
        """
        Decide if we should call backend to match schemes
        """
        matched_schemes = self.sessions.get_matched_schemes(session_id)
        if matched_schemes:
            return False
            
        required = ["course", "year", "state", "family_income"]
        has_all = all(student_info.get(field) for field in required)
        return has_all
    
    def _integrate_backend_results(
        self, 
        session_id: str, 
        student_info: dict, 
        llm_response: str
    ) -> str:
        """
        Call backend and integrate results into response
        """
        try:
            # Call backend matching endpoint
            backend_response = self.backend.match_schemes(
                {k: v for k, v in student_info.items() if v is not None}
            )
            
            if not backend_response.get("success"):
                return "I couldn't search for schemes right now. Please try again."
            
            matches = backend_response.get("matches", [])
            
            # Store matches in session for follow-up questions
            self.sessions.set_matched_schemes(session_id, matches)
            
            # If no matches
            if not matches:
                no_match_msg = """Based on your information, I didn't find exact matches 
in the current system. However, your situation may still qualify for schemes not yet 
in our database. Please check official government portals or contact the education 
ministry for additional opportunities."""
                return no_match_msg
            
            # Format and return matched schemes
            formatted_response = self._format_matched_schemes(matches)
            return formatted_response
        
        except Exception as e:
            logger.error(f"Error integrating backend results: {str(e)}")
            return f"I couldn't search for schemes due to an error: {str(e)}"
    
    def _format_matched_schemes(self, matches: list) -> str:
        """Format matched schemes for display"""
        response = "Great news! Based on your information, you may be eligible for these government schemes:\n\n"
        
        for i, match in enumerate(matches, 1):
            scheme_name = match.get('scheme_name', 'Unknown Scheme')
            eligibility_reason = match.get('eligibility_reason', '')
            match_score = match.get('match_score', 'N/A')
            
            response += f"{i}. {scheme_name}\n"
            response += f"   Match Score: {match_score}/100\n"
            response += f"   Why you may be eligible:\n"
            response += f"   • {eligibility_reason}\n\n"
        
        response += "Would you like more details about any of these schemes? "
        response += "I can help you understand the documents needed and how to apply."
        
        return response
