from pydantic import BaseModel
from typing import Optional

class StudentInfo(BaseModel):
    """Student information extracted from conversation"""
    
    course: Optional[str] = None
    """Course: B.Tech, B.A., B.Sc., B.Com, Diploma, etc."""
    
    year: Optional[int] = None
    """Year of study: 1, 2, 3, 4"""
    
    state: Optional[str] = None
    """State of study: Tamil Nadu, Karnataka, etc."""
    
    category: Optional[str] = None
    """Category: General, OBC, SC, ST, EBC, DNT"""
    
    family_income: Optional[int] = None
    """Annual family income in rupees"""
    
    need: Optional[str] = None
    """Type of need: Scholarship, Fee Assistance, Books, etc."""
    
    has_disability: Optional[bool] = None
    """Whether student has disability"""
    
    def is_complete_for_matching(self) -> bool:
        """Check if we have minimum info to match schemes"""
        required = [self.course, self.year, self.state, self.family_income]
        return all(required)
    
    def get_missing_required_fields(self) -> list:
        """Return list of missing required fields for matching"""
        missing = []
        if not self.course:
            missing.append("course")
        if not self.year:
            missing.append("year")
        if not self.state:
            missing.append("state")
        if not self.family_income:
            missing.append("family_income")
        return missing
    
    def to_dict(self) -> dict:
        """Convert to dictionary for backend API call"""
        return {
            "course": self.course,
            "year": self.year,
            "state": self.state,
            "category": self.category,
            "family_income": self.family_income,
            "need": self.need,
            "has_disability": self.has_disability
        }
