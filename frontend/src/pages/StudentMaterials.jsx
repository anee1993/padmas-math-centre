import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

const StudentMaterials = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const profileResponse = await axios.get('/student/profile');
      setStudentProfile(profileResponse.data);
      
      if (profileResponse.data.classGrade) {
        const materialsResponse = await axios.get(`/learning-materials/class/${profileResponse.data.classGrade}`);
        setMaterials(materialsResponse.data);
      }
    } catch (error) {
      setMessage('Failed to fetch learning materials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="text-white hover:text-gray-200"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold">Learning Materials</h1>
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
        {message && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {message}
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Learning Materials - Class {studentProfile?.classGrade}
          </h2>
          <p className="text-gray-600 mt-1">
            Download study materials and resources shared by your teacher
          </p>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : materials.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600">No learning materials available yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Your teacher hasn't uploaded any materials for your class yet. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.map((material) => (
              <div key={material.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{material.title}</h3>
                    <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                      Class {material.classGrade}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {material.fileType === 'PDF' && (
                      <span className="text-red-500 text-2xl">📄</span>
                    )}
                    {(material.fileType === 'DOC' || material.fileType === 'DOCX') && (
                      <span className="text-blue-500 text-2xl">📝</span>
                    )}
                    {material.fileType === 'LINK' && (
                      <span className="text-green-500 text-2xl">🔗</span>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{material.description}</p>
                
                <div className="text-xs text-gray-500 mb-3">
                  <p>Uploaded by: {material.uploadedBy}</p>
                  <p>{new Date(material.uploadedAt).toLocaleDateString()}</p>
                  <p className="font-medium mt-1">{material.fileName}</p>
                </div>

                <a
                  href={material.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded text-center text-sm font-medium transition"
                >
                  View/Download
                </a>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Click "View/Download" to access the learning materials. PDF files will open in your browser, and you can download them for offline study.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentMaterials;
