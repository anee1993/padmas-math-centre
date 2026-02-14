import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [studentProfile, setStudentProfile] = useState(null);
  const [classroom, setClassroom] = useState(null);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const profileResponse = await axios.get('/student/profile');
      setStudentProfile(profileResponse.data);
      
      if (profileResponse.data.classGrade) {
        const classroomResponse = await axios.get(
          `/virtual-classroom/my-classroom/${profileResponse.data.classGrade}`
        );
        setClassroom(classroomResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch student data', error);
    }
  };

  const joinClassroom = () => {
    if (classroom?.meetingLink) {
      window.open(classroom.meetingLink, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <nav className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">{user?.email} ({user?.role})</span>
            <button
              onClick={logout}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded transition backdrop-blur-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white py-8 shadow-lg">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold mb-2">
                Welcome, {user?.fullName || studentProfile?.fullName || 'Student'}! 🎓
              </h2>
              <p className="text-lg opacity-90">
                {studentProfile ? `Class ${studentProfile.classGrade} - Mathematics` : 'Ready to learn today?'}
              </p>
            </div>
            {studentProfile && (
              <div className="hidden md:block bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center">
                <p className="text-5xl font-bold">{studentProfile.classGrade}</p>
                <p className="text-sm opacity-90">Your Class</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Virtual Classroom Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Virtual Classroom
              </h2>
              {studentProfile && (
                <p className="text-gray-600">
                  Class {studentProfile.classGrade} - Mathematics
                </p>
              )}
            </div>
            <button
              onClick={joinClassroom}
              disabled={!classroom?.hasLink}
              className={`px-6 py-3 rounded-lg font-semibold text-lg transition flex items-center gap-2 ${
                classroom?.hasLink
                  ? 'bg-green-500 hover:bg-green-600 text-white cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {classroom?.hasLink ? 'Join Virtual Classroom' : 'No Meeting Link Available'}
            </button>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-blue-800">
              {classroom?.hasLink 
                ? 'Click the button above to join your class meeting. The link will open in a new tab.' 
                : 'Your teacher has not set up the meeting link yet. Please check back later or contact your teacher.'}
            </p>
          </div>
        </div>

        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome to Padma's Math Centre!
          </h2>
          <div className="grid grid-cols-1 gap-4 mt-6">
            <button
              onClick={() => navigate('/assignments')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-lg transition text-left"
            >
              <div className="text-2xl mb-2">📝</div>
              <h3 className="text-xl font-semibold mb-1">Assignments</h3>
              <p className="text-sm text-indigo-100">View and submit your assignments</p>
            </button>
            <button
              onClick={() => navigate('/student/materials')}
              className="bg-teal-600 hover:bg-teal-700 text-white p-6 rounded-lg transition text-left"
            >
              <div className="text-2xl mb-2">📚</div>
              <h3 className="text-xl font-semibold mb-1">Learning Materials</h3>
              <p className="text-sm text-teal-100">Access study materials and resources</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
