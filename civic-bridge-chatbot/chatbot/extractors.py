import re
import logging
from typing import Dict

logger = logging.getLogger(__name__)

class StudentInfoExtractor:
    """Extract student information from natural language messages"""
    
    # Known values
    COURSES = [
        "b.tech", "btech", "engineering",
        "ba", "b.a",
        "bsc", "b.sc", "science",
        "bcom", "b.com", "commerce",
        "diploma",
        "mtech", "m.tech",
        "ma", "m.a",
        "msc", "m.sc"
    ]
    
    YEARS = {
        "first": 1, "1st": 1, "one": 1, "1": 1,
        "second": 2, "2nd": 2, "two": 2, "2": 2,
        "third": 3, "3rd": 3, "three": 3, "3": 3,
        "fourth": 4, "4th": 4, "four": 4, "4": 4,
        "final": 4, "last": 4
    }
    
    STATES = [
        "tamil nadu", "tamil", "tn", "tamilnadu",
        "karnataka", "karnatakka",
        "telangana", "telengana",
        "maharashtra",
        "delhi", "new delhi",
        "uttar pradesh", "up",
        "rajasthan",
        "madhya pradesh",
        "bihar",
        "west bengal",
        "odisha", "orissa",
        "punjab",
        "haryana",
        "himachal pradesh",
        "uttarakhand",
        "goa",
        "kerala",
        "andhra pradesh",
        "assam"
    ]
    
    CATEGORIES = ["general", "obc", "sc", "st", "ebc", "dnt"]
    NEEDS = ["scholarship", "fee", "assistance", "books", "hostel", "stipend"]
    
    @staticmethod
    def extract(message: str, existing_info: Dict = None) -> Dict:
        """
        Extract student information from message
        
        Args:
            message: User message
            existing_info: Already extracted information
        
        Returns:
            dict: New information extracted
        """
        if existing_info is None:
            existing_info = {}
        
        updates = {}
        message_lower = message.lower()
        
        # Extract course
        course = StudentInfoExtractor._extract_course(message_lower)
        if course and "course" not in existing_info:
            updates["course"] = course
        
        # Extract year
        year = StudentInfoExtractor._extract_year(message_lower)
        if year and "year" not in existing_info:
            updates["year"] = year
        
        # Extract state
        state = StudentInfoExtractor._extract_state(message_lower)
        if state and "state" not in existing_info:
            updates["state"] = state
        
        # Extract income
        income = StudentInfoExtractor._extract_income(message)
        if income and "family_income" not in existing_info:
            updates["family_income"] = income
        
        # Extract category
        category = StudentInfoExtractor._extract_category(message_lower)
        if category and "category" not in existing_info:
            updates["category"] = category
        
        # Extract need
        need = StudentInfoExtractor._extract_need(message_lower)
        if need and "need" not in existing_info:
            updates["need"] = need
        
        # Check for disability
        if "disabl" in message_lower and "has_disability" not in existing_info:
            updates["has_disability"] = True
        
        return updates
    
    @staticmethod
    def _extract_course(message_lower: str) -> str:
        """Extract course from message"""
        for course in StudentInfoExtractor.COURSES:
            if course in message_lower:
                return course.replace(".", "").upper()
        return None
    
    @staticmethod
    def _extract_year(message_lower: str) -> int:
        """Extract year from message"""
        for year_text, year_num in StudentInfoExtractor.YEARS.items():
            pattern = rf'\b{re.escape(year_text)}\b'
            if re.search(pattern, message_lower):
                return year_num
        return None
    
    @staticmethod
    def _extract_state(message_lower: str) -> str:
        """Extract state from message"""
        for state in StudentInfoExtractor.STATES:
            if state in message_lower:
                return state.title()
        return None
    
    @staticmethod
    def _extract_income(message: str) -> int:
        """Extract family income from message"""
        message_lower = message.lower()
        
        # Look for "X lakh" or "X lac"
        if "lakh" in message_lower or "lac" in message_lower:
            # Find numbers before lakh
            pattern = r'(\d+\.?\d*)\s*(?:lakh|lac)'
            matches = re.findall(pattern, message_lower)
            
            if matches:
                try:
                    income_value = float(matches[0])
                    # Convert lakhs to rupees
                    return int(income_value * 100000)
                except:
                    pass
        
        return None
    
    @staticmethod
    def _extract_category(message_lower: str) -> str:
        """Extract category from message"""
        for category in StudentInfoExtractor.CATEGORIES:
            if category in message_lower:
                return category.upper()
        return None
    
    @staticmethod
    def _extract_need(message_lower: str) -> str:
        """Extract student's need from message"""
        for need in StudentInfoExtractor.NEEDS:
            if need in message_lower:
                return need.title()
        return None
