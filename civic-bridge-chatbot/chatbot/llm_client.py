import os
from openai import OpenAI
import logging

logger = logging.getLogger(__name__)

class LLMClient:
    """Client for OpenAI LLM API"""
    
    def __init__(self):
        """Initialize OpenAI client with API key from config"""
        api_key = os.getenv("OPENAI_API_KEY")
        base_url = os.getenv("OPENAI_BASE_URL")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not set in environment")
        
        self.client = OpenAI(
            api_key=api_key,
            base_url=base_url if base_url else None
        )
        self.model = os.getenv("LLM_MODEL", "gpt-4")
        self.temperature = float(os.getenv("LLM_TEMPERATURE", "0.7"))
        self.max_tokens = int(os.getenv("LLM_MAX_TOKENS", "1000"))
    
    def get_response(self, system_prompt: str, messages: list) -> str:
        """
        Call OpenAI API to get LLM response
        
        Args:
            system_prompt: System instruction prompt for the LLM
            messages: List of message dicts with 'role' and 'content'
        
        Returns:
            str: LLM response text
        
        Raises:
            Exception: If API call fails
        """
        try:
            logger.info(f"Calling LLM with {len(messages)} messages")
            
            # Construct messages array with system prompt first
            full_messages = [{"role": "system", "content": system_prompt}] + messages
            
            response = self.client.chat.completions.create(
                model=self.model,
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                messages=full_messages
            )
            
            result = response.choices[0].message.content
            logger.info("LLM response received successfully")
            return result
        
        except Exception as e:
            logger.error(f"LLM API error: {str(e)}")
            raise Exception(f"Failed to get LLM response: {str(e)}")
