from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
from pymongo import MongoClient
import uuid
from datetime import datetime, timedelta
import requests
import json

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB setup
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Collections
users_collection = db['users']
sessions_collection = db['sessions']
surveys_collection = db['surveys']

# Pydantic models
class User(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None

class Session(BaseModel):
    session_token: str
    user_id: str
    expires_at: datetime

class SurveyResponse(BaseModel):
    village_name: str
    date: str
    student_name: str
    contact_number: str
    respondent_name: str
    respondent_age: int
    respondent_occupation: str
    respondent_contact: str
    
    # Section 1: General Health Information
    doctor_visits: str
    common_health_issues: str
    medicines_available: str
    vaccinations: str
    
    # Section 2: Personal Hygiene Practices
    hand_washing: str
    teeth_brushing: str
    hygiene_items: str
    travel_hygiene: str
    
    # Section 3: Public Hygiene & Sanitation
    clean_water_access: str
    toilet_facility: str
    waste_disposal: str
    community_waste_system: str
    
    # Section 4: Food Hygiene & Nutrition
    food_cleaning: str
    water_purification: str
    cooking_hygiene: str
    
    # Section 5: Hygiene Challenges & Awareness
    biggest_hygiene_issue: str
    health_issues_due_hygiene: str
    surface_disinfection: str
    hygiene_programs_awareness: str
    healthcare_affordability: str
    additional_comments: str

def get_current_user(x_session_id: str = Header(alias="X-Session-ID")):
    """Get current user from session token"""
    if not x_session_id:
        raise HTTPException(status_code=401, detail="No session ID provided")
    
    session = sessions_collection.find_one({"session_token": x_session_id})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    if datetime.now() > session['expires_at']:
        sessions_collection.delete_one({"session_token": x_session_id})
        raise HTTPException(status_code=401, detail="Session expired")
    
    user = users_collection.find_one({"id": session['user_id']})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

@app.get("/api/")
async def root():
    return {"message": "Community Service Project API"}

@app.post("/api/auth/profile")
async def auth_profile(x_session_id: str = Header(alias="X-Session-ID")):
    """Authenticate user with Emergent Auth"""
    try:
        # Call Emergent Auth API
        headers = {"X-Session-ID": x_session_id}
        response = requests.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers=headers
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        user_data = response.json()
        user_id = user_data.get('id')
        
        # Check if user exists
        existing_user = users_collection.find_one({"email": user_data.get('email')})
        if not existing_user:
            # Create new user
            user_doc = {
                "id": user_id,
                "email": user_data.get('email'),
                "name": user_data.get('name'),
                "picture": user_data.get('picture')
            }
            users_collection.insert_one(user_doc)
        
        # Create session
        session_token = str(uuid.uuid4())
        session_doc = {
            "session_token": session_token,
            "user_id": user_id,
            "expires_at": datetime.now() + timedelta(days=7)
        }
        sessions_collection.insert_one(session_doc)
        
        return {
            "user": {
                "id": user_id,
                "email": user_data.get('email'),
                "name": user_data.get('name'),
                "picture": user_data.get('picture')
            },
            "session_token": session_token
        }
    
    except requests.RequestException:
        raise HTTPException(status_code=401, detail="Authentication failed")

@app.post("/api/survey/submit")
async def submit_survey(survey: SurveyResponse, current_user: dict = Depends(get_current_user)):
    """Submit survey response"""
    survey_doc = {
        "id": str(uuid.uuid4()),
        "user_id": current_user['id'],
        "submitted_at": datetime.now(),
        **survey.dict()
    }
    
    # Update existing survey or create new one
    surveys_collection.replace_one(
        {"user_id": current_user['id']}, 
        survey_doc, 
        upsert=True
    )
    
    return {"message": "Survey submitted successfully", "survey_id": survey_doc['id']}

@app.get("/api/survey/my-response")
async def get_my_survey(current_user: dict = Depends(get_current_user)):
    """Get user's survey response"""
    survey = surveys_collection.find_one({"user_id": current_user['id']})
    if not survey:
        return {"survey": None}
    
    # Remove MongoDB _id field
    survey.pop('_id', None)
    return {"survey": survey}

@app.get("/api/survey/analytics")
async def get_analytics(current_user: dict = Depends(get_current_user)):
    """Get survey analytics and suggestions"""
    user_survey = surveys_collection.find_one({"user_id": current_user['id']})
    if not user_survey:
        raise HTTPException(status_code=404, detail="No survey found")
    
    # Get community aggregates
    all_surveys = list(surveys_collection.find({}))
    
    # Calculate analytics
    analytics = calculate_analytics(user_survey, all_surveys)
    suggestions = generate_suggestions(user_survey)
    
    return {
        "user_responses": analytics["user_responses"],
        "community_stats": analytics["community_stats"],
        "suggestions": suggestions
    }

def calculate_analytics(user_survey, all_surveys):
    """Calculate analytics data for charts"""
    
    # User responses for charts
    user_responses = {
        "health_practices": {
            "doctor_visits": user_survey.get("doctor_visits", ""),
            "hand_washing": user_survey.get("hand_washing", ""),
            "teeth_brushing": user_survey.get("teeth_brushing", ""),
            "water_purification": user_survey.get("water_purification", ""),
            "surface_disinfection": user_survey.get("surface_disinfection", "")
        },
        "access_issues": {
            "medicines_available": user_survey.get("medicines_available", ""),
            "clean_water_access": user_survey.get("clean_water_access", ""),
            "community_waste_system": user_survey.get("community_waste_system", ""),
            "healthcare_affordability": user_survey.get("healthcare_affordability", "")
        }
    }
    
    # Community statistics
    total_responses = len(all_surveys)
    
    community_stats = {}
    if total_responses > 0:
        # Calculate percentages for key metrics
        fields = [
            "doctor_visits", "hand_washing", "medicines_available", 
            "clean_water_access", "healthcare_affordability"
        ]
        
        for field in fields:
            field_stats = {}
            for survey in all_surveys:
                value = survey.get(field, "Unknown")
                field_stats[value] = field_stats.get(value, 0) + 1
            
            # Convert to percentages
            for key in field_stats:
                field_stats[key] = round((field_stats[key] / total_responses) * 100, 1)
            
            community_stats[field] = field_stats
    
    return {
        "user_responses": user_responses,
        "community_stats": community_stats
    }

def generate_suggestions(survey):
    """Generate personalized suggestions based on survey responses"""
    suggestions = []
    
    # Health access suggestions
    if survey.get("medicines_available") == "No":
        suggestions.append({
            "category": "Healthcare Access",
            "title": "Medicine Availability",
            "suggestion": "Contact local Primary Health Center (PHC) or Community Health Center (CHC). Consider setting up a community pharmacy or medical kit.",
            "resources": [
                "National Health Mission helpline: 104",
                "Jan Aushadhi stores for affordable medicines",
                "Local ASHA worker contact"
            ]
        })
    
    if survey.get("healthcare_affordability") == "No":
        suggestions.append({
            "category": "Healthcare Access",
            "title": "Affordable Healthcare",
            "suggestion": "Explore government health schemes like Ayushman Bharat, PMJAY, or state-specific health insurance programs.",
            "resources": [
                "Ayushman Bharat scheme enrollment",
                "Local government hospital services",
                "Health insurance schemes"
            ]
        })
    
    # Water and sanitation suggestions
    if survey.get("clean_water_access") in ["No, we rely on alternative sources", "No, access is very limited"]:
        suggestions.append({
            "category": "Water & Sanitation",
            "title": "Clean Water Access",
            "suggestion": "Contact local water department or panchayat. Consider water purification methods like boiling, filtering, or water purification tablets.",
            "resources": [
                "Jal Jeevan Mission for piped water",
                "Water quality testing kits",
                "Community water purification systems"
            ]
        })
    
    if survey.get("toilet_facility") == "Open defecation":
        suggestions.append({
            "category": "Sanitation",
            "title": "Toilet Facility",
            "suggestion": "Apply for Swachh Bharat Mission toilet construction. Contact local gram panchayat for subsidies and support.",
            "resources": [
                "Swachh Bharat Mission portal",
                "Local panchayat office",
                "Toilet construction subsidies"
            ]
        })
    
    # Hygiene practice suggestions
    if survey.get("hand_washing") in ["Rarely", "Never"]:
        suggestions.append({
            "category": "Personal Hygiene",
            "title": "Hand Washing",
            "suggestion": "Develop a habit of washing hands before eating and after using toilet. Use soap and clean water for at least 20 seconds.",
            "resources": [
                "WHO hand hygiene guidelines",
                "Local health worker training",
                "Community hygiene awareness programs"
            ]
        })
    
    # Waste management suggestions
    if survey.get("community_waste_system") == "No":
        suggestions.append({
            "category": "Waste Management",
            "title": "Community Waste System",
            "suggestion": "Organize community meetings to establish waste collection system. Contact local municipal corporation or panchayat.",
            "resources": [
                "Swachh Bharat Mission waste management",
                "Community waste segregation training",
                "Local waste collection services"
            ]
        })
    
    # Add general health awareness if no specific issues
    if len(suggestions) == 0:
        suggestions.append({
            "category": "Health Promotion",
            "title": "Maintain Good Practices",
            "suggestion": "Continue your good health and hygiene practices. Consider becoming a health advocate in your community.",
            "resources": [
                "Community health volunteer programs",
                "Health awareness campaigns",
                "Peer education opportunities"
            ]
        })
    
    return suggestions

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)