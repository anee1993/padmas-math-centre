import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import JitsiMeeting from '../components/JitsiMeeting';
import axios from '../api/axios';

const VirtualClassroom = () => {
  const { classGrade } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClassroom();
  }, [classGrade]);

  useEffect(() => {
    // If teacher, notify backend when joining
    if (user.role === 'TEACHER' && classroom) {
      notifyTeacherJoined();
    }

    // Cleanup when leaving
    return () => {
      if (user.role === 'TEACHER' && classroom) {
        notifyTeacherLeft();
      }
    };
  }, [classroom]);

  const fetchClassroom = async () => {
    try {
      const response = await axios.get(`/virtual-classroom/my-classroom/${classGrade}`);
      setClassroom(response.data);
    } catch (error) {
      setError('Failed to load virtual classroom');
    } finally {
      setLoading(false);
    }
  };

  const notifyTeacherJoined = async () => {
    try {
      await axios.post(`/virtual-classroom/teacher-joined/${classGrade}`);
      console.log('Teacher presence recorded');
    } catch (error) {
      console.error('Failed to record teacher presence', error);
    }
  };

  const notifyTeacherLeft = async () => {
    try {
      await axios.post(`/virtual-classroom/teacher-left/${classGrade}`);
      console.log('Teacher left recorded');
    } catch (error) {
      console.error('Failed to record teacher leaving', error);
    }
  };

  const handleClose = () => {
    if (user.role === 'TEACHER') {
      navigate('/teacher/dashboard?tab=classrooms');
    } else {
      navigate('/student/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading virtual classroom...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button
            onClick={handleClose}
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isModerator = user.role === 'TEACHER';
  const displayName = user.email.split('@')[0];

  return (
    <div className="h-screen w-screen bg-gray-900">
      <div className="h-full w-full">
        <JitsiMeeting
          roomName={classroom.roomId}
          displayName={displayName}
          isModerator={isModerator}
          onClose={handleClose}
        />
      </div>
    </div>
  );
};

export default VirtualClassroom;
