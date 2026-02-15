import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

const Assignments = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (user.role === 'STUDENT') {
        const profileRes = await axios.get('/student/profile');
        setStudentProfile(profileRes.data);
        
        const assignmentsRes = await axios.get(`/assignments/class/${profileRes.data.classGrade}`);
        setAssignments(assignmentsRes.data);
      } else {
        const assignmentsRes = await axios.get('/assignments');
        setAssignments(assignmentsRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch assignments', error);
    } finally {
      setLoading(false);
    }
  };

  const viewAssignment = (id) => {
    navigate(`/assignments/${id}`);
  };

  const createAssignment = () => {
    navigate('/assignments/create');
  };

  const getStatusBadge = (assignment) => {
    if (assignment.hasSubmitted) {
      // Check if graded
      if (assignment.isGraded) {
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-semibold">Graded</span>;
      }
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Being Evaluated</span>;
    }
    if (assignment.isOverdue) {
      return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Overdue</span>;
    }
    return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">Pending</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-white hover:text-gray-200"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold">Assignments</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{user?.email}</span>
            <button onClick={logout} className="bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded transition">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {user.role === 'TEACHER' ? 'All Assignments' : 'My Assignments'}
            </h2>
            {user.role === 'TEACHER' && (
              <button
                onClick={createAssignment}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
              >
                + Create Assignment
              </button>
            )}
          </div>

          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : assignments.length === 0 ? (
            <p className="text-gray-600">No assignments found</p>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">{assignment.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{assignment.description}</p>
                      <div className="flex gap-4 mt-3 text-sm text-gray-500">
                        <span>Class {assignment.classGrade}</span>
                        <span>•</span>
                        <span>{assignment.totalMarks} marks</span>
                        <span>•</span>
                        <span>Due: {new Date(assignment.dueDate).toLocaleString()}</span>
                      </div>
                      
                      {/* Graded Status for Students */}
                      {user.role === 'STUDENT' && assignment.isGraded && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-semibold text-green-800">
                              ✅ Graded - Click "View Details" to see your marks and feedback
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <button
                        onClick={() => viewAssignment(assignment.id)}
                        className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition text-sm"
                      >
                        View Details
                      </button>
                    </div>
                    <div className="ml-4">
                      {user.role === 'STUDENT' && getStatusBadge(assignment)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Assignments;
