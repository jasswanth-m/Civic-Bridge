import os
import requests
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class BackendClient:
    """Client for calling the team backend API"""
    
    def __init__(self):
        """Initialize backend client with base URL and API key"""
        self.base_url = os.getenv("BACKEND_URL", "http://localhost:3000")
        self.api_key = os.getenv("BACKEND_API_KEY")
        self.timeout = int(os.getenv("BACKEND_TIMEOUT", "10"))
        
        self.headers = {
            "Content-Type": "application/json"
        }
        
        if self.api_key:
            self.headers["Authorization"] = f"Bearer {self.api_key}"
    
    def match_schemes(self, student_info: Dict) -> Dict:
        """
        Call backend to match schemes for student
        
        Args:
            student_info: Dict with course, year, state, income, etc.
        
        Returns:
            dict: Matched schemes from backend
        """
        url = f"{self.base_url}/api/eligibility/check-match"
        
        try:
            logger.info(f"Calling backend: {url} with student info")
            
            response = requests.post(
                url,
                json=student_info,
                headers=self.headers,
                timeout=self.timeout
            )
            
            response.raise_for_status()  # Raise exception for non-200 status
            
            result = response.json()
            # Handle the specific backend response structure
            matched_schemes = result.get('matched_schemes', [])
            not_matched_schemes = result.get('not_matched_schemes', [])
            logger.info(f"Backend returned {len(matched_schemes)} matches")
            return {"success": True, "matches": matched_schemes}
        
        except requests.exceptions.Timeout:
            logger.error("Backend request timed out")
            raise Exception("Backend is taking too long to respond")
        except requests.exceptions.ConnectionError:
            logger.error("Failed to connect to backend")
            raise Exception("Cannot connect to backend server")
        except Exception as e:
            logger.error(f"Backend API error: {str(e)}")
            raise Exception(f"Backend error: {str(e)}")
    
    def get_scheme_details(self, scheme_id: str) -> Dict:
        """Get details of a specific scheme"""
        url = f"{self.base_url}/api/schemes/{scheme_id}"
        
        try:
            logger.info(f"Getting scheme details: {scheme_id}")
            response = requests.get(url, headers=self.headers, timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error getting scheme details: {str(e)}")
            raise Exception(f"Could not fetch scheme details: {str(e)}")
