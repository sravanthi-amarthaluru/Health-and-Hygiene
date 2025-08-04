import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import './App.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function MockApp() {
  // Mock data for demonstration
  const mockUser = { name: "Demo User", email: "demo@example.com" };
  
  const mockSurvey = {
    village_name: "Demo Village",
    date: "2025-01-15",
    student_name: "Demo Student",
    doctor_visits: "Regularly (once every few months)",
    hand_washing: "Always",
    clean_water_access: "Yes, always",
    medicines_available: "Yes"
  };

  const healthPracticesData = {
    labels: ['Doctor Visits', 'Hand Washing', 'Teeth Brushing', 'Water Purification', 'Surface Disinfection'],
    datasets: [{
      label: 'Your Practices',
      data: [4, 4, 3, 4, 3],
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2
    }]
  };

  const accessData = {
    labels: ['Medicine Access', 'Clean Water', 'Waste System', 'Healthcare Affordability'],
    datasets: [{
      data: [1, 1, 1, 0],
      backgroundColor: ['#10B981', '#10B981', '#10B981', '#EF4444']
    }]
  };

  const mockSuggestions = [
    {
      category: "Healthcare Access",
      title: "Affordable Healthcare",
      suggestion: "Explore government health schemes like Ayushman Bharat, PMJAY, or state-specific health insurance programs.",
      resources: [
        "Ayushman Bharat scheme enrollment",
        "Local government hospital services",
        "Health insurance schemes"
      ]
    },
    {
      category: "Health Promotion", 
      title: "Maintain Good Practices",
      suggestion: "Continue your good health and hygiene practices. Consider becoming a health advocate in your community.",
      resources: [
        "Community health volunteer programs",
        "Health awareness campaigns",
        "Peer education opportunities"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-800">Community Health Project - DEMO</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {mockUser.name}</span>
              <div className="bg-red-500 text-white px-3 py-1 rounded text-sm">DEMO MODE</div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Dashboard Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
          
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">✓</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Survey Status</h3>
                  <p className="text-sm text-green-600 font-medium">✅ Completed</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">📊</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
                  <p className="text-sm text-blue-600 font-medium">Ready to View</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">📄</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Report</h3>
                  <p className="text-sm text-purple-600 font-medium">Download Available</p>
                </div>
              </div>
            </div>
          </div>

          {/* Survey Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Your Survey Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Village:</span>
                <p className="font-medium">{mockSurvey.village_name}</p>
              </div>
              <div>
                <span className="text-gray-500">Date:</span>
                <p className="font-medium">{mockSurvey.date}</p>
              </div>
              <div>
                <span className="text-gray-500">Student:</span>
                <p className="font-medium">{mockSurvey.student_name}</p>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <p className="font-medium text-green-600">Complete</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Health & Hygiene Results</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            {/* Health Practices Chart */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Your Health Practices Score</h3>
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
              <h3 className="text-xl font-bold text-gray-800 mb-4">Basic Access Status</h3>
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
        </div>

        {/* Personalized Suggestions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Personalized Suggestions for Your Community</h2>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockSuggestions.map((suggestion, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-4">
                  <div className="mb-2">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">
                      {suggestion.category}
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">{suggestion.title}</h4>
                  <p className="text-gray-600 mb-3">{suggestion.suggestion}</p>
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Resources:</h5>
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
        </div>

        {/* Sample Survey Form Preview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Survey Form Preview</h2>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6 text-center">
              <h3 className="text-xl font-bold text-gray-800">Community Service Project Survey</h3>
              <p className="text-gray-600">Health and Hygiene Assessment</p>
            </div>

            {/* Sample form sections with different colors */}
            <div className="space-y-6">
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-bold text-blue-800 mb-3">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Village Name</label>
                    <input type="text" className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50" value="Sample Village" readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input type="date" className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50" value="2025-01-15" readOnly />
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-lg font-bold text-green-800 mb-3">Section 1: General Health Information</h4>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">How often do you visit a doctor?</p>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="radio" name="demo1" className="mr-2" checked readOnly />
                      Regularly (once every few months)
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="demo1" className="mr-2" readOnly />
                      Occasionally (only when needed)
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="text-lg font-bold text-yellow-800 mb-3">Section 2: Personal Hygiene Practices</h4>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Hand washing frequency</p>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="radio" name="demo2" className="mr-2" checked readOnly />
                      Always before eating
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="demo2" className="mr-2" readOnly />
                      Sometimes
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="text-lg font-bold text-purple-800 mb-3">Section 3: Public Hygiene & Sanitation</h4>
                <p className="text-sm text-gray-600">Questions about water access, sanitation facilities, and waste management...</p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="text-lg font-bold text-red-800 mb-3">Section 4: Food Hygiene & Nutrition</h4>
                <p className="text-sm text-gray-600">Questions about food safety, water purification, and cooking hygiene...</p>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="text-lg font-bold text-indigo-800 mb-3">Section 5: Challenges & Awareness</h4>
                <p className="text-sm text-gray-600">Questions about community challenges and health program awareness...</p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-8 rounded-lg font-semibold inline-block">
                Complete Survey (Interactive in Real App)
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-500 py-4">
          <p className="text-lg">🎉 This is a preview of your Community Service Project Application!</p>
          <p>Click the link above to access the real interactive version with authentication.</p>
        </div>
      </div>
    </div>
  );
}

export default MockApp;