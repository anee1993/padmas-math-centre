import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const Timetable = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const daysOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const profileRes = await axios.get('/student/profile');
      const classGrade = profileRes.data.classGrade;
      
      const timetableRes = await axios.get(`/timetable/class/${classGrade}`);
      setTimetable(timetableRes.data);
    } catch (error) {
      setMessage('Failed to fetch timetable');
    } finally {
      setLoading(false);
    }
  };

  const groupByDay = () => {
    const grouped = {};
    daysOrder.forEach(day => {
      grouped[day] = timetable.filter(entry => entry.dayOfWeek === day);
    });
    return grouped;
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDayName = (day) => {
    return day.charAt(0) + day.slice(1).toLowerCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <nav className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Class Timetable</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded transition"
            >
              Back to Dashboard
            </button>
            <button
              onClick={logout}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        {message && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📅 Weekly Schedule</h2>

          {loading ? (
            <p className="text-gray-600">Loading timetable...</p>
          ) : timetable.length === 0 ? (
            <p className="text-gray-600">No classes scheduled yet. Your teacher will add the schedule soon.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupByDay()).map(([day, entries]) => (
                entries.length > 0 && (
                  <div key={day} className="border rounded-lg p-4 bg-gradient-to-r from-indigo-50 to-blue-50">
                    <h3 className="text-lg font-bold text-indigo-700 mb-3">{getDayName(day)}</h3>
                    <div className="space-y-2">
                      {entries.map((entry) => (
                        <div key={entry.id} className="bg-white rounded-lg p-3 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">🕐</span>
                              <div>
                                <p className="font-semibold text-gray-800">
                                  {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                                </p>
                                {entry.notes && (
                                  <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                                )}
                              </div>
                            </div>
                            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                              Class {entry.classGrade}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timetable;
