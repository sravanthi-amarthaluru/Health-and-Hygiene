import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import './App.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [surveyData, setSurveyData] = useState({});
  const [userSurvey, setUserSurvey] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('sessionToken');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setSessionToken(savedToken);
      setCurrentPage('dashboard');
      fetchUserSurvey(savedToken);
    }

    // Handle auth redirect
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const sessionId = urlParams.get('session_id');
    if (sessionId) {
      handleAuthCallback(sessionId);
    }
  }, []);

  const handleAuthCallback = async (sessionId) => {
    try {
      const response = await fetch(`${backendUrl}/api/auth/profile`, {
        method: 'POST',
        headers: {
          'X-Session-ID': sessionId
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setSessionToken(data.session_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('sessionToken', data.session_token);
        setCurrentPage('dashboard');
        fetchUserSurvey(data.session_token);
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  const fetchUserSurvey = async (token) => {
    try {
      const response = await fetch(`${backendUrl}/api/survey/my-response`, {
        headers: {
          'X-Session-ID': token
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUserSurvey(data.survey);
      }
    } catch (error) {
      console.error('Error fetching survey:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/survey/analytics`, {
        headers: {
          'X-Session-ID': sessionToken
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleLogin = () => {
    const previewUrl = window.location.origin + '/profile';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(previewUrl)}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('sessionToken');
    setUser(null);
    setSessionToken(null);
    setCurrentPage('login');
    setUserSurvey(null);
    setAnalytics(null);
  };

  const handleSurveySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${backendUrl}/api/survey/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionToken
        },
        body: JSON.stringify(surveyData)
      });

      if (response.ok) {
        alert('Survey submitted successfully!');
        fetchUserSurvey(sessionToken);
        setCurrentPage('dashboard');
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('Error submitting survey');
    } finally {
      setLoading(false);
    }
  };

  const generatePDFReport = () => {
    if (!userSurvey || !analytics) return;

    const content = `
COMMUNITY SERVICE PROJECT REPORT
================================

Participant Information:
- Village: ${userSurvey.village_name}
- Student: ${userSurvey.student_name}
- Date: ${userSurvey.date}

Survey Responses Summary:
- Doctor Visits: ${userSurvey.doctor_visits}
- Medicine Availability: ${userSurvey.medicines_available}
- Clean Water Access: ${userSurvey.clean_water_access}
- Healthcare Affordability: ${userSurvey.healthcare_affordability}

Personalized Suggestions:
${analytics.suggestions.map(s => `
${s.category}: ${s.title}
${s.suggestion}
Resources: ${s.resources.join(', ')}
`).join('')}

Generated on: ${new Date().toLocaleDateString()}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'community-service-report.txt';
    a.click();
  };

  const LoginPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Community Health</h1>
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">Service Project</h2>
          <p className="text-gray-500">Help improve health and hygiene in your community</p>
        </div>
        <div className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">What you'll do:</h3>
            <ul className="text-sm text-green-700 text-left space-y-1">
              <li>• Complete health & hygiene survey</li>
              <li>• Get personalized suggestions</li>
              <li>• View community analytics</li>
              <li>• Download your report</li>
            </ul>
          </div>
          <button 
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition duration-300 shadow-lg"
          >
            Get Started - Login with Email
          </button>
        </div>
      </div>
    </div>
  );

  const Dashboard = () => (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-800">Community Health Project</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user?.name}</span>
              <button 
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Status Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">1</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Survey Status</h3>
                  <p className="text-sm text-gray-500">
                    {userSurvey ? '✅ Completed' : '⏳ Pending'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">2</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-500">
                    {userSurvey ? 'Available' : 'Complete survey first'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">3</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Report</h3>
                  <p className="text-sm text-gray-500">
                    {analytics ? 'Ready to download' : 'Complete all steps'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
              <div className="space-y-4">
                <button 
                  onClick={() => setCurrentPage('survey')}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  {userSurvey ? 'Update Survey Response' : 'Complete Health Survey'}
                </button>
                
                {userSurvey && (
                  <button 
                    onClick={() => { setCurrentPage('analytics'); fetchAnalytics(); }}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    View Results & Suggestions
                  </button>
                )}
                
                {analytics && (
                  <button 
                    onClick={generatePDFReport}
                    className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition font-semibold"
                  >
                    Download Report
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Summary Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Your Progress</h3>
              {userSurvey ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Village:</span>
                    <span className="font-medium">{userSurvey.village_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Survey Date:</span>
                    <span className="font-medium">{userSurvey.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Student:</span>
                    <span className="font-medium">{userSurvey.student_name}</span>
                  </div>
                  <hr className="my-3"/>
                  <div className="text-green-600 font-medium">
                    ✅ Survey Complete!
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <p>Complete the survey to see your progress summary</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const SurveyForm = () => (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Community Service Project Survey</h1>
            <p className="text-lg text-gray-600">Health and Hygiene Assessment</p>
            <button 
              onClick={() => setCurrentPage('dashboard')}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              ← Back to Dashboard
            </button>
          </div>

          <form onSubmit={handleSurveySubmit} className="space-y-8">
            
            {/* Basic Information */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-blue-800 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Village Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={surveyData.village_name || ''}
                    onChange={e => setSurveyData({...surveyData, village_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={surveyData.date || ''}
                    onChange={e => setSurveyData({...surveyData, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={surveyData.student_name || ''}
                    onChange={e => setSurveyData({...surveyData, student_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <input 
                    type="tel" 
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={surveyData.contact_number || ''}
                    onChange={e => setSurveyData({...surveyData, contact_number: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Respondent Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={surveyData.respondent_name || ''}
                    onChange={e => setSurveyData({...surveyData, respondent_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Respondent Age</label>
                  <input 
                    type="number" 
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={surveyData.respondent_age || ''}
                    onChange={e => setSurveyData({...surveyData, respondent_age: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Respondent Occupation</label>
                  <input 
                    type="text" 
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={surveyData.respondent_occupation || ''}
                    onChange={e => setSurveyData({...surveyData, respondent_occupation: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Respondent Contact</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={surveyData.respondent_contact || ''}
                    onChange={e => setSurveyData({...surveyData, respondent_contact: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Section 1: General Health Information */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-green-800 mb-4">Section 1: General Health Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How often do you or your family visit a doctor for check-ups?
                  </label>
                  <div className="space-y-2">
                    {['Regularly (once every few months)', 'Occasionally (only when needed)', 'Rarely (once a year or less)', 'Never'].map(option => (
                      <label key={option} className="flex items-center">
                        <input 
                          type="radio" 
                          name="doctor_visits" 
                          value={option}
                          className="mr-2"
                          onChange={e => setSurveyData({...surveyData, doctor_visits: e.target.value})}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What are the most common health issues in your household?
                  </label>
                  <textarea 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    rows="3"
                    value={surveyData.common_health_issues || ''}
                    onChange={e => setSurveyData({...surveyData, common_health_issues: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Are basic medicines available in your area?
                  </label>
                  <div className="space-y-2">
                    {['Yes', 'No'].map(option => (
                      <label key={option} className="flex items-center">
                        <input 
                          type="radio" 
                          name="medicines_available" 
                          value={option}
                          className="mr-2"
                          onChange={e => setSurveyData({...surveyData, medicines_available: e.target.value})}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you or your family members take vaccinations as recommended?
                  </label>
                  <div className="space-y-2">
                    {['Yes, regularly', 'Sometimes', 'Rarely', 'No'].map(option => (
                      <label key={option} className="flex items-center">
                        <input 
                          type="radio" 
                          name="vaccinations" 
                          value={option}
                          className="mr-2"
                          onChange={e => setSurveyData({...surveyData, vaccinations: e.target.value})}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Personal Hygiene Practices */}
            <div className="bg-yellow-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-yellow-800 mb-4">Section 2: Personal Hygiene Practices</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How often do you wash your hands before eating?
                  </label>
                  <div className="space-y-2">
                    {['Always', 'Sometimes', 'Rarely', 'Never'].map(option => (
                      <label key={option} className="flex items-center">
                        <input 
                          type="radio" 
                          name="hand_washing" 
                          value={option}
                          className="mr-2"
                          onChange={e => setSurveyData({...surveyData, hand_washing: e.target.value})}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How often do you brush your teeth?
                  </label>
                  <div className="space-y-2">
                    {['Once a day', 'Twice a day', 'After every meal', 'Only when I remember'].map(option => (
                      <label key={option} className="flex items-center">
                        <input 
                          type="radio" 
                          name="teeth_brushing" 
                          value={option}
                          className="mr-2"
                          onChange={e => setSurveyData({...surveyData, teeth_brushing: e.target.value})}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you carry hygiene items like hand sanitizer or tissues when going out?
                  </label>
                  <div className="space-y-2">
                    {['Yes', 'Sometimes', 'No'].map(option => (
                      <label key={option} className="flex items-center">
                        <input 
                          type="radio" 
                          name="hygiene_items" 
                          value={option}
                          className="mr-2"
                          onChange={e => setSurveyData({...surveyData, hygiene_items: e.target.value})}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How do you maintain hygiene while traveling or in public places?
                  </label>
                  <div className="space-y-2">
                    {[
                      'Avoiding touching surfaces unnecessarily',
                      'Using hand sanitizer regularly', 
                      'Wearing a mask in crowded areas',
                      'Other'
                    ].map(option => (
                      <label key={option} className="flex items-center">
                        <input 
                          type="radio" 
                          name="travel_hygiene" 
                          value={option}
                          className="mr-2"
                          onChange={e => setSurveyData({...surveyData, travel_hygiene: e.target.value})}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Public Hygiene & Sanitation */}
            <div className="bg-purple-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-purple-800 mb-4">Section 3: Public Hygiene & Sanitation</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you have access to clean drinking water?
                  </label>
                  <div className="space-y-2">
                    {[
                      'Yes, always', 
                      'Yes, but occasionally unavailable', 
                      'No, we rely on alternative sources', 
                      'No, access is very limited'
                    ].map(option => (
                      <label key={option} className="flex items-center">
                        <input 
                          type="radio" 
                          name="clean_water_access" 
                          value={option}
                          className="mr-2"
                          onChange={e => setSurveyData({...surveyData, clean_water_access: e.target.value})}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What type of toilet facility do you use at home?
                  </label>
                  <div className="space-y-2">
                    {[
                      'Private toilet with proper sanitation',
                      'Shared toilet in the neighborhood', 
                      'Open defecation',
                      'Other'
                    ].map(option => (
                      <label key={option} className="flex items-center">
                        <input 
                          type="radio" 
                          name="toilet_facility" 
                          value={option}
                          className="mr-2"
                          onChange={e => setSurveyData({...surveyData, toilet_facility: e.target.value})}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Where do you usually dispose of household waste?
                  </label>
                  <div className="space-y-2">
                    {[
                      'Through a formal garbage collection service',
                      'Burning waste', 
                      'Dumping in open spaces',
                      'Other'
                    ].map(option => (
                      <label key={option} className="flex items-center">
                        <input 
                          type="radio" 
                          name="waste_disposal" 
                          value={option}
                          className="mr-2"
                          onChange={e => setSurveyData({...surveyData, waste_disposal: e.target.value})}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Does your community have access to proper waste disposal systems?
                  </label>
                  <div className="space-y-2">
                    {['Yes', 'No'].map(option => (
                      <label key={option} className="flex items-center">
                        <input 
                          type="radio" 
                          name="community_waste_system" 
                          value={option}
                          className="mr-2"
                          onChange={e => setSurveyData({...surveyData, community_waste_system: e.target.value})}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Food Hygiene & Nutrition */}
            <div className="bg-red-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-red-800 mb-4">Section 4: Food Hygiene & Nutrition</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How often do you clean food items like fruits and vegetables before consumption?
                  </label>
                  <div className="space-y-2">
                    {['Always', 'Occasionally', 'Rarely', 'Never'].map(option => (
                      <label key={option} className="flex items-center">
                        <input 
                          type="radio" 
                          name="food_cleaning" 
                          value={option}
                          className="mr-2"
                          onChange={e => setSurveyData({...surveyData, food_cleaning: e.target.value})}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What method do you use to purify drinking water at home?
                  </label>
                  <div className="space-y-2">
                    {['Boiling', 'Filtering', 'Using purification tablets', 'None'].map(option => (
                      <label key={option} className="flex items-center">
                        <input 
                          type="radio" 
                          name="water_purification" 
                          value={option}
                          className="mr-2"
                          onChange={e => setSurveyData({...surveyData, water_purification: e.target.value})}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How do you ensure food hygiene while cooking?
                  </label>
                  <div className="space-y-2">
                    {[
                      'Washing hands before food preparation',
                      'Using clean utensils', 
                      'Storing food properly',
                      'Other'
                    ].map(option => (
                      <label key={option} className="flex items-center">
                        <input 
                          type="radio" 
                          name="cooking_hygiene" 
                          value={option}
                          className="mr-2"
                          onChange={e => setSurveyData({...surveyData, cooking_hygiene: e.target.value})}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Hygiene Challenges & Awareness */}
            <div className="bg-indigo-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-indigo-800 mb-4">Section 5: Hygiene Challenges & Awareness</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What do you think is the biggest hygiene issue in your community?
                  </label>
                  <textarea 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    rows="3"
                    value={surveyData.biggest_hygiene_issue || ''}
                    onChange={e => setSurveyData({...surveyData, biggest_hygiene_issue: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Have you or your family faced health issues due to poor hygiene?
                  </label>
                  <div className="space-y-2">
                    {['Yes', 'No'].map(option => (
                      <label key={option} className="flex items-center">
                        <input 
                          type="radio" 
                          name="health_issues_due_hygiene" 
                          value={option}
                          className="mr-2"
                          onChange={e => setSurveyData({...surveyData, health_issues_due_hygiene: e.target.value})}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How often do you disinfect commonly touched surfaces?
                  </label>
                  <div className="space-y-2">
                    {['Daily', 'Weekly', 'Occasionally', 'Never'].map(option => (
                      <label key={option} className="flex items-center">
                        <input 
                          type="radio" 
                          name="surface_disinfection" 
                          value={option}
                          className="mr-2"
                          onChange={e => setSurveyData({...surveyData, surface_disinfection: e.target.value})}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Are you aware of hygiene education programs in your community or schools?
                  </label>
                  <div className="space-y-2">
                    {['Yes', 'No'].map(option => (
                      <label key={option} className="flex items-center">
                        <input 
                          type="radio" 
                          name="hygiene_programs_awareness" 
                          value={option}
                          className="mr-2"
                          onChange={e => setSurveyData({...surveyData, hygiene_programs_awareness: e.target.value})}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you think healthcare services in your area are affordable?
                  </label>
                  <div className="space-y-2">
                    {['Yes', 'No', 'Sometimes'].map(option => (
                      <label key={option} className="flex items-center">
                        <input 
                          type="radio" 
                          name="healthcare_affordability" 
                          value={option}
                          className="mr-2"
                          onChange={e => setSurveyData({...surveyData, healthcare_affordability: e.target.value})}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Comments
                  </label>
                  <textarea 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    rows="4"
                    placeholder="Please provide any additional comments or information about the problems faced by your village"
                    value={surveyData.additional_comments || ''}
                    onChange={e => setSurveyData({...surveyData, additional_comments: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="text-center">
              <button 
                type="submit" 
                disabled={loading}
                className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-4 px-8 rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition duration-300 shadow-lg disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Survey'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  const AnalyticsPage = () => {
    if (!analytics) return <div>Loading analytics...</div>;

    const healthPracticesData = {
      labels: ['Doctor Visits', 'Hand Washing', 'Teeth Brushing', 'Water Purification', 'Surface Disinfection'],
      datasets: [{
        label: 'Your Practices',
        data: [
          analytics.user_responses.health_practices.doctor_visits === 'Regularly (once every few months)' ? 4 : 
          analytics.user_responses.health_practices.doctor_visits === 'Occasionally (only when needed)' ? 3 :
          analytics.user_responses.health_practices.doctor_visits === 'Rarely (once a year or less)' ? 2 : 1,
          
          analytics.user_responses.health_practices.hand_washing === 'Always' ? 4 : 
          analytics.user_responses.health_practices.hand_washing === 'Sometimes' ? 3 :
          analytics.user_responses.health_practices.hand_washing === 'Rarely' ? 2 : 1,
          
          analytics.user_responses.health_practices.teeth_brushing === 'After every meal' ? 4 : 
          analytics.user_responses.health_practices.teeth_brushing === 'Twice a day' ? 3 :
          analytics.user_responses.health_practices.teeth_brushing === 'Once a day' ? 2 : 1,
          
          analytics.user_responses.health_practices.water_purification === 'Boiling' ? 4 : 
          analytics.user_responses.health_practices.water_purification === 'Filtering' ? 3 :
          analytics.user_responses.health_practices.water_purification === 'Using purification tablets' ? 2 : 1,
          
          analytics.user_responses.health_practices.surface_disinfection === 'Daily' ? 4 : 
          analytics.user_responses.health_practices.surface_disinfection === 'Weekly' ? 3 :
          analytics.user_responses.health_practices.surface_disinfection === 'Occasionally' ? 2 : 1
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2
      }]
    };

    const accessData = {
      labels: ['Medicine Access', 'Clean Water', 'Waste System', 'Healthcare Affordability'],
      datasets: [{
        data: [
          analytics.user_responses.access_issues.medicines_available === 'Yes' ? 1 : 0,
          analytics.user_responses.access_issues.clean_water_access === 'Yes, always' ? 1 : 0,
          analytics.user_responses.access_issues.community_waste_system === 'Yes' ? 1 : 0,
          analytics.user_responses.access_issues.healthcare_affordability === 'Yes' ? 1 : 0,
        ],
        backgroundColor: [
          analytics.user_responses.access_issues.medicines_available === 'Yes' ? '#10B981' : '#EF4444',
          analytics.user_responses.access_issues.clean_water_access === 'Yes, always' ? '#10B981' : '#EF4444',
          analytics.user_responses.access_issues.community_waste_system === 'Yes' ? '#10B981' : '#EF4444',
          analytics.user_responses.access_issues.healthcare_affordability === 'Yes' ? '#10B981' : '#EF4444'
        ]
      }]
    };

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Health & Hygiene Results</h1>
            <button 
              onClick={() => setCurrentPage('dashboard')}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Dashboard
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            {/* Health Practices Chart */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Your Health Practices Score</h2>
              <div className="h-80">
                <Bar data={healthPracticesData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 4,
                      title: {
                        display: true,
                        text: 'Practice Level (1-4)'
                      }
                    }
                  }
                }} />
              </div>
            </div>

            {/* Access Issues Chart */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Basic Access Status</h2>
              <div className="h-80">
                <Pie data={accessData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }} />
              </div>
            </div>
          </div>

          {/* Personalized Suggestions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Personalized Suggestions for Your Community</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analytics.suggestions.map((suggestion, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-4">
                  <div className="mb-2">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">
                      {suggestion.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{suggestion.title}</h3>
                  <p className="text-gray-600 mb-3">{suggestion.suggestion}</p>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Resources:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {suggestion.resources.map((resource, rIndex) => (
                        <li key={rIndex} className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          {resource}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={generatePDFReport}
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-8 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition duration-300 shadow-lg"
            >
              Download Complete Report
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render appropriate page
  if (!user && currentPage === 'login') return <LoginPage />;
  if (user && currentPage === 'dashboard') return <Dashboard />;
  if (user && currentPage === 'survey') return <SurveyForm />;
  if (user && currentPage === 'analytics') return <AnalyticsPage />;
  
  return <LoginPage />;
}

export default App;