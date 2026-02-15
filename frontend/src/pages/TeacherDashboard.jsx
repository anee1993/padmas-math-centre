import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingStudents, setPendingStudents] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClass, setSelectedClass] = useState(6);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingClass, setEditingClass] = useState(null);
  const [meetingLink, setMeetingLink] = useState('');
  const [queries, setQueries] = useState([]);
  const [selectedQueryClass, setSelectedQueryClass] = useState(6);
  const [blockStudentId, setBlockStudentId] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [loadingQueries, setLoadingQueries] = useState(false);
  const [timetables, setTimetables] = useState([]);
  const [showTimetableForm, setShowTimetableForm] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState(null);
  const [timetableForm, setTimetableForm] = useState({
    classGrade: 6,
    dayOfWeek: 'MONDAY',
    startTime: '17:00',
    endTime: '18:00',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pendingRes, enrolledRes, classroomsRes] = await Promise.all([
        axios.get('/admin/pending-registrations'),
        axios.get('/admin/enrolled-students'),
        axios.get('/virtual-classroom/all')
      ]);
      setPendingStudents(pendingRes.data);
      setEnrolledStudents(enrolledRes.data);
      setClassrooms(classroomsRes.data);
    } catch (error) {
      setMessage('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (studentId) => {
    try {
      await axios.put('/admin/approve-registration', { studentId });
      setMessage('Student approved successfully');
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to approve student');
    }
  };

  const handleReject = async (studentId) => {
    try {
      await axios.put('/admin/reject-registration', { 
        studentId,
        reason: 'Rejected by teacher'
      });
      setMessage('Student rejected');
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to reject student');
    }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to remove ${studentName} from the system? This will delete all their data including submissions and cannot be undone.`)) {
      return;
    }
    
    try {
      await axios.delete(`/admin/students/${studentId}`);
      setMessage('Student removed successfully');
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to remove student');
    }
  };

  const getStudentsByClass = (classGrade) => {
    return enrolledStudents.filter(student => student.classGrade === classGrade);
  };

  const getClassCount = (classGrade) => {
    return getStudentsByClass(classGrade).length;
  };

  const joinClassroom = (classGrade) => {
    navigate(`/virtual-classroom/${classGrade}`);
  };

  const startEditingLink = (classroom) => {
    setEditingClass(classroom.classGrade);
    setMeetingLink(classroom.meetingLink || '');
  };

  const cancelEditing = () => {
    setEditingClass(null);
    setMeetingLink('');
  };

  const saveMeetingLink = async (classGrade) => {
    try {
      await axios.put('/virtual-classroom/update-link', {
        classGrade,
        meetingLink
      });
      setMessage('Meeting link updated successfully');
      setEditingClass(null);
      setMeetingLink('');
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update meeting link');
    }
  };

  const fetchQueries = async (classGrade) => {
    setLoadingQueries(true);
    try {
      const response = await axios.get(`/queries/class/${classGrade}`);
      setQueries(response.data);
    } catch (error) {
      setMessage('Failed to fetch queries');
    } finally {
      setLoadingQueries(false);
    }
  };

  const handleDeleteQuery = async (queryId) => {
    if (!window.confirm('Are you sure you want to delete this query? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`/queries/${queryId}`);
      setMessage('Query deleted successfully');
      fetchQueries(selectedQueryClass);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to delete query');
    }
  };

  const handleBlockStudent = async () => {
    if (!blockReason.trim()) {
      setMessage('Please provide a reason for blocking');
      return;
    }

    try {
      await axios.post('/queries/block-student', {
        studentId: blockStudentId,
        reason: blockReason
      });
      setMessage('Student blocked successfully');
      setBlockStudentId(null);
      setBlockReason('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to block student');
    }
  };

  const viewQueryDetail = (queryId) => {
    navigate(`/queries/${queryId}`);
  };

  useEffect(() => {
    if (activeTab === 'queries') {
      fetchQueries(selectedQueryClass);
    } else if (activeTab === 'timetable') {
      fetchTimetables();
    }
  }, [activeTab, selectedQueryClass]);

  const fetchTimetables = async () => {
    try {
      const response = await axios.get('/timetable/all');
      setTimetables(response.data);
    } catch (error) {
      setMessage('Failed to fetch timetables');
    }
  };

  const handleCreateTimetable = async (e) => {
    e.preventDefault();
    try {
      if (editingTimetable) {
        await axios.put(`/timetable/${editingTimetable}`, timetableForm);
        setMessage('Timetable updated successfully');
      } else {
        await axios.post('/timetable', timetableForm);
        setMessage('Timetable entry added successfully');
      }
      setShowTimetableForm(false);
      setEditingTimetable(null);
      setTimetableForm({
        classGrade: 6,
        dayOfWeek: 'MONDAY',
        startTime: '17:00',
        endTime: '18:00',
        notes: ''
      });
      fetchTimetables();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to save timetable');
    }
  };

  const handleEditTimetable = (timetable) => {
    setEditingTimetable(timetable.id);
    setTimetableForm({
      classGrade: timetable.classGrade,
      dayOfWeek: timetable.dayOfWeek,
      startTime: timetable.startTime,
      endTime: timetable.endTime,
      notes: timetable.notes || ''
    });
    setShowTimetableForm(true);
  };

  const handleDeleteTimetable = async (id) => {
    if (!window.confirm('Are you sure you want to delete this timetable entry?')) {
      return;
    }
    try {
      await axios.delete(`/timetable/${id}`);
      setMessage('Timetable entry deleted');
      fetchTimetables();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to delete timetable entry');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-lg md:text-2xl font-bold">Teacher Dashboard</h1>
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
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-6 md:py-8 shadow-lg">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-4xl font-bold mb-2">
                Welcome, {user?.fullName || 'Teacher'}! 👋
              </h2>
              <p className="text-sm md:text-lg opacity-90">
                Ready to inspire young minds today?
              </p>
            </div>
            {/* Stats - Show on mobile as row, desktop as column */}
            <div className="flex md:hidden gap-3 w-full">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 text-center flex-1">
                <p className="text-xl font-bold">{pendingStudents.length}</p>
                <p className="text-xs opacity-90">Pending</p>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 text-center flex-1">
                <p className="text-xl font-bold">{enrolledStudents.length}</p>
                <p className="text-xs opacity-90">Students</p>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 text-center flex-1">
                <p className="text-xl font-bold">5</p>
                <p className="text-xs opacity-90">Classes</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center">
                <p className="text-3xl font-bold">{pendingStudents.length}</p>
                <p className="text-sm opacity-90">Pending</p>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center">
                <p className="text-3xl font-bold">{enrolledStudents.length}</p>
                <p className="text-sm opacity-90">Students</p>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center">
                <p className="text-3xl font-bold">5</p>
                <p className="text-sm opacity-90">Classes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 md:p-6">
        {message && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">
            {message}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex -mb-px min-w-max">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === 'pending'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending
                {pendingStudents.length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingStudents.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('enrolled')}
                className={`px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === 'enrolled'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Students
                <span className="ml-2 text-xs text-gray-500">
                  ({enrolledStudents.length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab('classrooms')}
                className={`px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === 'classrooms'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Classrooms
              </button>
              <button
                onClick={() => setActiveTab('assignments')}
                className={`px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === 'assignments'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Assignments
              </button>
              <button
                onClick={() => setActiveTab('materials')}
                className={`px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === 'materials'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Materials
              </button>
              <button
                onClick={() => setActiveTab('queries')}
                className={`px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === 'queries'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Queries
              </button>
              <button
                onClick={() => setActiveTab('timetable')}
                className={`px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === 'timetable'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Timetable
              </button>
            </nav>
          </div>

          <div className="p-4 md:p-6">
            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : activeTab === 'pending' ? (
              /* Pending Registrations Tab */
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Pending Student Registrations
                </h2>
                {pendingStudents.length === 0 ? (
                  <p className="text-gray-600">No pending registrations</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">DOB</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Gender</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Registered</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {pendingStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{student.fullName}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{student.email}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{student.dateOfBirth}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{student.gender}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">Class {student.classGrade}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(student.registeredAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApprove(student.id)}
                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(student.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition"
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : activeTab === 'classrooms' ? (
              /* Virtual Classrooms Tab */
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Virtual Classrooms - Meeting Links
                </h2>
                <p className="text-gray-600 mb-6">
                  Add Google Meet (or any video conferencing) links for each class. Students will use these links to join your classes.
                </p>

                <div className="grid grid-cols-1 gap-4">
                  {classrooms.map((classroom) => (
                    <div
                      key={classroom.id}
                      className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 border-2 border-indigo-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            Class {classroom.classGrade} - Mathematics
                          </h3>
                          <p className="text-sm text-gray-600">
                            Students enrolled: {getClassCount(classroom.classGrade)}
                          </p>
                        </div>
                        <div className="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
                          {classroom.classGrade}
                        </div>
                      </div>
                      
                      {editingClass === classroom.classGrade ? (
                        <div className="space-y-3">
                          <input
                            type="url"
                            value={meetingLink}
                            onChange={(e) => setMeetingLink(e.target.value)}
                            placeholder="Paste Google Meet link here (e.g., https://meet.google.com/xxx-xxxx-xxx)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveMeetingLink(classroom.classGrade)}
                              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-semibold transition"
                            >
                              Save Link
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {classroom.hasLink ? (
                            <div className="bg-white p-3 rounded border border-gray-200">
                              <p className="text-sm text-gray-600 mb-1">Meeting Link:</p>
                              <a
                                href={classroom.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm break-all"
                              >
                                {classroom.meetingLink}
                              </a>
                            </div>
                          ) : (
                            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                              <p className="text-sm text-yellow-800">
                                No meeting link set. Click "Add/Edit Link" to add one.
                              </p>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditingLink(classroom)}
                              className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold transition"
                            >
                              {classroom.hasLink ? 'Edit Link' : 'Add Link'}
                            </button>
                            {classroom.hasLink && (
                              <a
                                href={classroom.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-semibold transition inline-flex items-center gap-2"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Join Meeting
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>How to use:</strong>
                  </p>
                  <ol className="text-sm text-blue-800 mt-2 ml-4 list-decimal space-y-1">
                    <li>Create a Google Meet link (or use Zoom, Teams, etc.)</li>
                    <li>Click "Add Link" for each class and paste the meeting link</li>
                    <li>Students will see the link on their dashboard and can join directly</li>
                    <li>You can update the link anytime by clicking "Edit Link"</li>
                  </ol>
                </div>
              </div>
            ) : activeTab === 'assignments' ? (
              /* Assignments Tab */
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Assignment Management
                </h2>
                <p className="text-gray-600 mb-6">
                  Create and manage assignments for your students. View submissions and track progress.
                </p>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    onClick={() => navigate('/assignments')}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200 cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Quick Actions</p>
                        <h3 className="text-lg font-bold text-gray-800">Manage Assignments</h3>
                      </div>
                      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">
                      View all assignments, edit details, and manage assignment lifecycle.
                    </p>
                    <div className="mt-3 flex items-center text-blue-600 text-sm font-medium">
                      <span>Click to manage</span>
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  <div 
                    onClick={() => navigate('/submissions')}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200 cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Track Progress</p>
                        <h3 className="text-lg font-bold text-gray-800">View Submissions</h3>
                      </div>
                      <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">
                      Review student submissions organized by class and assignment.
                    </p>
                    <div className="mt-3 flex items-center text-green-600 text-sm font-medium">
                      <span>Click to view</span>
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  <div 
                    onClick={() => navigate('/late-submissions')}
                    className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-6 border-2 border-orange-200 cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Manage Requests</p>
                        <h3 className="text-lg font-bold text-gray-800">Late Submissions</h3>
                      </div>
                      <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">
                      Review and approve student requests for late assignment submissions.
                    </p>
                    <div className="mt-3 flex items-center text-orange-600 text-sm font-medium">
                      <span>Click to view</span>
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  <div 
                    onClick={() => navigate('/assignments/create')}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-200 cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Quick Create</p>
                        <h3 className="text-lg font-bold text-gray-800">New Assignment</h3>
                      </div>
                      <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">
                      Quickly create a new assignment with file attachments and due dates.
                    </p>
                    <div className="mt-3 flex items-center text-purple-600 text-sm font-medium">
                      <span>Click to create</span>
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  <div 
                    onClick={() => navigate('/assignments/generate')}
                    className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-6 border-2 border-orange-200 cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">🤖 AI Powered</p>
                        <h3 className="text-lg font-bold text-gray-800">Generate Assignment</h3>
                      </div>
                      <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">
                      Use AI to generate custom math assignments based on topic and difficulty.
                    </p>
                    <div className="mt-3 flex items-center text-orange-600 text-sm font-medium">
                      <span>Click to generate</span>
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-amber-50 rounded border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <strong>💡 Tip:</strong> Click on any card above for quick access to manage assignments, view submissions, or create new assignments.
                  </p>
                </div>
              </div>
            ) : activeTab === 'materials' ? (
              /* Learning Materials Tab */
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Learning Materials Management
                </h2>
                <p className="text-gray-600 mb-6">
                  Upload study materials, notes, and resources for your students. Materials are organized by class.
                </p>

                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-6 border-2 border-teal-200 cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
                  onClick={() => navigate('/learning-materials')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Manage Learning Materials</h3>
                      <p className="text-gray-600 mb-3">
                        Upload PDF/Word documents, add external links, and organize materials by class
                      </p>
                      <div className="flex items-center text-teal-600 text-sm font-medium">
                        <span>Click to manage materials</span>
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    <svg className="w-16 h-16 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-amber-50 rounded border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <strong>📚 About Learning Materials:</strong>
                  </p>
                  <ul className="text-sm text-amber-800 mt-2 ml-4 list-disc space-y-1">
                    <li>Upload study notes, practice problems, reference materials</li>
                    <li>Supports PDF and Word documents (max 10MB)</li>
                    <li>Can also add links to external resources (Google Drive, YouTube, etc.)</li>
                    <li>Students will see materials for their class only</li>
                  </ul>
                </div>
              </div>
            ) : activeTab === 'enrolled' ? (
              /* Enrolled Students Tab */
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Enrolled Students by Class
                </h2>

                {/* Class Tabs */}
                <div className="flex gap-2 mb-6 flex-wrap">
                  {[6, 7, 8, 9, 10].map((grade) => (
                    <button
                      key={grade}
                      onClick={() => setSelectedClass(grade)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        selectedClass === grade
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Class {grade}
                      <span className="ml-2 text-xs">
                        ({getClassCount(grade)})
                      </span>
                    </button>
                  ))}
                </div>

                {/* Students Table */}
                {getStudentsByClass(selectedClass).length === 0 ? (
                  <p className="text-gray-600">No students enrolled in Class {selectedClass}</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">DOB</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Gender</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Approved On</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {getStudentsByClass(selectedClass).map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">{student.fullName}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{student.email}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{student.dateOfBirth}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{student.gender}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(student.approvedAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <button
                                onClick={() => handleDeleteStudent(student.id, student.fullName)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition"
                                title="Remove student from system"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : activeTab === 'queries' ? (
              /* Queries & Discussions Tab */
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Student Queries & Discussions
                </h2>
                <p className="text-gray-600 mb-6">
                  View and manage student queries. You can reply to queries, delete inappropriate content, and block students if needed.
                </p>

                {/* Class Tabs */}
                <div className="flex gap-2 mb-6 flex-wrap">
                  {[6, 7, 8, 9, 10].map((grade) => (
                    <button
                      key={grade}
                      onClick={() => setSelectedQueryClass(grade)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        selectedQueryClass === grade
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Class {grade}
                    </button>
                  ))}
                </div>

                {/* Queries List */}
                {loadingQueries ? (
                  <div className="flex items-center justify-center py-12">
                    <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-3 text-gray-600">Loading queries...</span>
                  </div>
                ) : queries.length === 0 ? (
                  <p className="text-gray-600">No queries from Class {selectedQueryClass} yet.</p>
                ) : (
                  <div className="space-y-4">
                    {queries.map((query) => (
                      <div
                        key={query.id}
                        className="border rounded-lg p-4 bg-white hover:shadow-md transition"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 
                            onClick={() => viewQueryDetail(query.id)}
                            className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-indigo-600"
                          >
                            {query.title}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {new Date(query.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-2">{query.content}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>👤 {query.studentName}</span>
                            <span>💬 {query.replyCount} {query.replyCount === 1 ? 'reply' : 'replies'}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => viewQueryDetail(query.id)}
                              className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-xs transition"
                            >
                              View & Reply
                            </button>
                            <button
                              onClick={() => {
                                setBlockStudentId(query.studentId);
                                setBlockReason('');
                              }}
                              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs transition"
                            >
                              Block Student
                            </button>
                            <button
                              onClick={() => handleDeleteQuery(query.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Block Student Modal */}
                {blockStudentId && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Block Student</h3>
                      <p className="text-gray-600 mb-4">
                        This will prevent the student from posting new queries. Please provide a reason:
                      </p>
                      <textarea
                        value={blockReason}
                        onChange={(e) => setBlockReason(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4"
                        rows="3"
                        placeholder="Reason for blocking (e.g., inappropriate language, spam)"
                        required
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setBlockStudentId(null);
                            setBlockReason('');
                          }}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleBlockStudent}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition"
                        >
                          Block Student
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : activeTab === 'timetable' ? (
              /* Timetable Tab */
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Class Timetable Management
                </h2>
                <p className="text-gray-600 mb-6">
                  Manage class schedules for all classes. Students will see their class timetable.
                </p>

                <button
                  onClick={() => {
                    setShowTimetableForm(!showTimetableForm);
                    setEditingTimetable(null);
                    setTimetableForm({
                      classGrade: 6,
                      dayOfWeek: 'MONDAY',
                      startTime: '17:00',
                      endTime: '18:00',
                      notes: ''
                    });
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded mb-6 transition"
                >
                  {showTimetableForm ? 'Cancel' : '+ Add Schedule'}
                </button>

                {showTimetableForm && (
                  <form onSubmit={handleCreateTimetable} className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Class</label>
                        <select
                          value={timetableForm.classGrade}
                          onChange={(e) => setTimetableForm({ ...timetableForm, classGrade: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        >
                          {[6, 7, 8, 9, 10].map(grade => (
                            <option key={grade} value={grade}>Class {grade}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Day</label>
                        <select
                          value={timetableForm.dayOfWeek}
                          onChange={(e) => setTimetableForm({ ...timetableForm, dayOfWeek: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        >
                          <option value="MONDAY">Monday</option>
                          <option value="TUESDAY">Tuesday</option>
                          <option value="WEDNESDAY">Wednesday</option>
                          <option value="THURSDAY">Thursday</option>
                          <option value="FRIDAY">Friday</option>
                          <option value="SATURDAY">Saturday</option>
                          <option value="SUNDAY">Sunday</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Start Time</label>
                        <input
                          type="time"
                          value={timetableForm.startTime}
                          onChange={(e) => setTimetableForm({ ...timetableForm, startTime: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">End Time</label>
                        <input
                          type="time"
                          value={timetableForm.endTime}
                          onChange={(e) => setTimetableForm({ ...timetableForm, endTime: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-gray-700 font-medium mb-2">Notes (Optional)</label>
                      <input
                        type="text"
                        value={timetableForm.notes}
                        onChange={(e) => setTimetableForm({ ...timetableForm, notes: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., Algebra, Geometry, etc."
                      />
                    </div>
                    <button
                      type="submit"
                      className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded transition"
                    >
                      {editingTimetable ? 'Update Schedule' : 'Add Schedule'}
                    </button>
                  </form>
                )}

                {/* Timetable List */}
                {timetables.length === 0 ? (
                  <p className="text-gray-600">No timetable entries yet. Add schedules for your classes.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Day</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Time</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Notes</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {timetables.map((entry) => (
                          <tr key={entry.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">Class {entry.classGrade}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{entry.dayOfWeek.charAt(0) + entry.dayOfWeek.slice(1).toLowerCase()}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{entry.startTime} - {entry.endTime}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{entry.notes || '-'}</td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditTimetable(entry)}
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteTimetable(entry.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
