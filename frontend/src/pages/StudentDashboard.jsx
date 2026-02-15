import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

// Common Indian names and their Sanskrit/Hindi meanings
const nameMeanings = {
  // Boys names
  'aarav': 'peaceful, wisdom',
  'arjun': 'bright, shining, white',
  'aditya': 'sun, belonging to Aditi',
  'aryan': 'noble, honorable',
  'vivaan': 'full of life, lord Krishna',
  'vihaan': 'dawn, morning',
  'reyansh': 'ray of light, part of lord Vishnu',
  'ayaan': 'gift of God, speed',
  'krishna': 'dark, black, all-attractive',
  'shaurya': 'bravery, courage',
  'atharv': 'knowledge, the first Veda',
  'rudra': 'lord Shiva, the roarer',
  'advait': 'unique, non-duality',
  'arnav': 'ocean, sea',
  'sai': 'divine, saint',
  'dhruv': 'pole star, constant',
  'ishaan': 'sun, lord Shiva',
  'kabir': 'great, powerful',
  'om': 'sacred sound, the beginning',
  'pranav': 'sacred syllable Om',
  'rohan': 'ascending, growing',
  'shivansh': 'part of lord Shiva',
  'yash': 'success, glory, fame',
  
  // Girls names
  'aadhya': 'first power, goddess Durga',
  'ananya': 'unique, incomparable',
  'diya': 'lamp, light',
  'pari': 'fairy, angel',
  'saanvi': 'goddess Lakshmi, knowledge',
  'aaradhya': 'worshipped, blessed',
  'anvi': 'goddess of forest',
  'kavya': 'poetry, poem',
  'kiara': 'dark-haired, little dark one',
  'navya': 'new, young, fresh',
  'prisha': 'beloved, gift of God',
  'riya': 'singer, graceful',
  'sara': 'princess, noble lady',
  'shanaya': 'first ray of sun',
  'tara': 'star, goddess',
  'anika': 'grace, favor',
  'ishita': 'desired, superior',
  'myra': 'sweet, beloved',
  'nisha': 'night, dream',
  'pooja': 'worship, prayer',
  'priya': 'beloved, dear one',
  'shreya': 'auspicious, beautiful',
  'tanvi': 'delicate, beautiful',
  'vanya': 'gracious gift of God',
  'zara': 'princess, flower',
  
  // Common names
  'raj': 'king, ruler',
  'dev': 'god, divine',
  'maya': 'illusion, magic',
  'kiran': 'ray of light',
  'amit': 'infinite, boundless',
  'anjali': 'offering, tribute',
  'deepak': 'lamp, light',
  'neha': 'love, affection',
  'rahul': 'conqueror of miseries',
  'rohit': 'red, the first rays of sun',
  'sanjay': 'victorious, triumphant',
  'vijay': 'victory, conquest',
  'padma': 'lotus flower',
  'lakshmi': 'goddess of wealth',
  'ganesh': 'lord of multitudes',
  'shiva': 'auspicious one',
  'vishnu': 'all-pervading',
  'rama': 'pleasing, charming',
  'sita': 'furrow, goddess',
  'radha': 'success, prosperity',
};

// Function to get name meaning
const getNameMeaning = (fullName) => {
  if (!fullName) return null;
  
  // Extract first name and convert to lowercase
  const firstName = fullName.trim().split(' ')[0].toLowerCase();
  
  // Check if we have a meaning for this name
  if (nameMeanings[firstName]) {
    return `"${firstName.charAt(0).toUpperCase() + firstName.slice(1)}" means "${nameMeanings[firstName]}" in Sanskrit/Hindi`;
  }
  
  // Check for partial matches (e.g., "Aarav Kumar" -> "aarav")
  for (const [name, meaning] of Object.entries(nameMeanings)) {
    if (firstName.includes(name) || name.includes(firstName)) {
      return `Your name is related to "${name.charAt(0).toUpperCase() + name.slice(1)}" which means "${meaning}" in Sanskrit/Hindi`;
    }
  }
  
  return null;
};

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [studentProfile, setStudentProfile] = useState(null);
  const [classroom, setClassroom] = useState(null);
  const [nameMeaning, setNameMeaning] = useState(null);

  useEffect(() => {
    fetchStudentData();
  }, []);

  useEffect(() => {
    // Get name meaning when student profile is loaded
    if (studentProfile?.fullName) {
      const meaning = getNameMeaning(studentProfile.fullName);
      setNameMeaning(meaning);
    }
  }, [studentProfile]);

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
          <h1 className="text-lg md:text-2xl font-bold">Student Dashboard</h1>
          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-xs md:text-sm hidden sm:inline">{user?.email}</span>
            <span className="text-xs md:text-sm sm:hidden">{user?.role}</span>
            <button
              onClick={logout}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1.5 md:px-4 md:py-2 rounded transition backdrop-blur-sm text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white py-6 md:py-8 shadow-lg">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl md:text-4xl font-bold mb-2">
                Welcome, {user?.fullName || studentProfile?.fullName || 'Student'}! 🎓
              </h2>
              <p className="text-sm md:text-lg opacity-90 mb-1">
                {studentProfile ? `Class ${studentProfile.classGrade} - Mathematics` : 'Ready to learn today?'}
              </p>
              {nameMeaning && (
                <p className="text-xs md:text-sm opacity-80 italic mt-2 bg-white bg-opacity-10 backdrop-blur-sm rounded px-3 py-1.5 inline-block">
                  ✨ {nameMeaning}
                </p>
              )}
            </div>
            {studentProfile && (
              <>
                {/* Mobile: Show class badge inline */}
                <div className="md:hidden bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
                  <span className="text-2xl font-bold">Class {studentProfile.classGrade}</span>
                </div>
                {/* Desktop: Show larger badge */}
                <div className="hidden md:block bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center">
                  <p className="text-5xl font-bold">{studentProfile.classGrade}</p>
                  <p className="text-sm opacity-90">Your Class</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 md:p-6">
        {/* Virtual Classroom Card */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                Virtual Classroom
              </h2>
              {studentProfile && (
                <p className="text-sm md:text-base text-gray-600">
                  Class {studentProfile.classGrade} - Mathematics
                </p>
              )}
            </div>
            <button
              onClick={joinClassroom}
              disabled={!classroom?.hasLink}
              className={`px-4 py-3 md:px-6 md:py-3 rounded-lg font-semibold text-sm md:text-lg transition flex items-center justify-center gap-2 min-h-[44px] ${
                classroom?.hasLink
                  ? 'bg-green-500 hover:bg-green-600 text-white cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">{classroom?.hasLink ? 'Join Virtual Classroom' : 'No Meeting Link Available'}</span>
              <span className="sm:hidden">{classroom?.hasLink ? 'Join Class' : 'No Link'}</span>
            </button>
          </div>
          <div className="mt-4 p-3 md:p-4 bg-blue-50 rounded border border-blue-200">
            <p className="text-xs md:text-sm text-blue-800">
              {classroom?.hasLink 
                ? 'Click the button above to join your class meeting. The link will open in a new tab.' 
                : 'Your teacher has not set up the meeting link yet. Please check back later or contact your teacher.'}
            </p>
          </div>
        </div>

        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 lg:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Welcome to Padma's Math Centre!
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mt-4 md:mt-6">
            <button
              onClick={() => navigate('/assignments')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 md:p-6 rounded-lg transition text-left min-h-[120px] md:min-h-[140px]"
            >
              <div className="text-2xl md:text-3xl mb-2">📝</div>
              <h3 className="text-lg md:text-xl font-semibold mb-1">Assignments</h3>
              <p className="text-xs md:text-sm text-indigo-100">View and submit your assignments</p>
            </button>
            <button
              onClick={() => navigate('/student/materials')}
              className="bg-teal-600 hover:bg-teal-700 text-white p-4 md:p-6 rounded-lg transition text-left min-h-[120px] md:min-h-[140px]"
            >
              <div className="text-2xl md:text-3xl mb-2">📚</div>
              <h3 className="text-lg md:text-xl font-semibold mb-1">Learning Materials</h3>
              <p className="text-xs md:text-sm text-teal-100">Access study materials and resources</p>
            </button>
            <button
              onClick={() => navigate('/queries')}
              className="bg-purple-600 hover:bg-purple-700 text-white p-4 md:p-6 rounded-lg transition text-left min-h-[120px] md:min-h-[140px]"
            >
              <div className="text-2xl md:text-3xl mb-2">💬</div>
              <h3 className="text-lg md:text-xl font-semibold mb-1">Queries & Discussions</h3>
              <p className="text-xs md:text-sm text-purple-100">Ask questions and discuss with classmates</p>
            </button>
            <button
              onClick={() => navigate('/timetable')}
              className="bg-green-600 hover:bg-green-700 text-white p-4 md:p-6 rounded-lg transition text-left min-h-[120px] md:min-h-[140px]"
            >
              <div className="text-2xl md:text-3xl mb-2">📅</div>
              <h3 className="text-lg md:text-xl font-semibold mb-1">Class Timetable</h3>
              <p className="text-xs md:text-sm text-green-100">View your weekly class schedule</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
