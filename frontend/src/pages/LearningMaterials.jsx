import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

const LearningMaterials = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classGrade: 6,
    fileUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [uploadForClass, setUploadForClass] = useState(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await axios.get('/learning-materials');
      setMaterials(response.data);
    } catch (error) {
      setMessage('Failed to fetch learning materials');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setMessage('Please select a PDF or Word document');
        e.target.value = '';
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setMessage('File size must be less than 10MB');
        e.target.value = '';
        return;
      }
      
      setSelectedFile(file);
      setMessage('');
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) return null;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('/learning-materials/upload-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      let fileUrl = formData.fileUrl;
      let fileName = '';
      let fileType = '';

      if (selectedFile) {
        setMessage('Uploading file...');
        const uploadResponse = await uploadFile();
        fileUrl = uploadResponse.url;
        fileName = uploadResponse.filename;
        fileType = uploadResponse.fileType;
      } else if (!formData.fileUrl) {
        setMessage('Please upload a file or provide a URL');
        return;
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        classGrade: parseInt(formData.classGrade),
        fileUrl: fileUrl,
        fileName: fileName || 'External Link',
        fileType: fileType || 'LINK'
      };

      await axios.post('/learning-materials', payload);
      setMessage('Learning material uploaded successfully!');
      setShowUploadForm(false);
      setUploadForClass(null);
      setFormData({ title: '', description: '', classGrade: 6, fileUrl: '' });
      setSelectedFile(null);
      fetchMaterials();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.message || 'Failed to upload learning material');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;

    try {
      await axios.delete(`/learning-materials/${id}`);
      setMessage('Material deleted successfully');
      fetchMaterials();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to delete material');
    }
  };

  const filteredMaterials = selectedClass === 'all' 
    ? materials 
    : materials.filter(m => m.classGrade === parseInt(selectedClass));

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/teacher/dashboard?tab=materials')}
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
          <div className={`mb-4 p-3 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        {!showUploadForm ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedClass === 'all' ? 'All Learning Materials' : `Class ${selectedClass} Learning Materials`}
              </h2>
              <button
                onClick={() => {
                  if (selectedClass !== 'all') {
                    setUploadForClass(parseInt(selectedClass));
                    setFormData({ ...formData, classGrade: parseInt(selectedClass) });
                  }
                  setShowUploadForm(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {selectedClass === 'all' ? 'Upload New Material' : `Upload for Class ${selectedClass}`}
              </button>
            </div>

            {/* Class Filter */}
            <div className="flex gap-2 mb-6 flex-wrap">
              <button
                onClick={() => setSelectedClass('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedClass === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Classes
              </button>
              {[6, 7, 8, 9, 10].map((grade) => (
                <button
                  key={grade}
                  onClick={() => setSelectedClass(grade.toString())}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedClass === grade.toString()
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Class {grade}
                </button>
              ))}
            </div>

            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : filteredMaterials.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600">No learning materials uploaded yet</p>
                <button
                  onClick={() => {
                    if (selectedClass !== 'all') {
                      setUploadForClass(parseInt(selectedClass));
                      setFormData({ ...formData, classGrade: parseInt(selectedClass) });
                    }
                    setShowUploadForm(true);
                  }}
                  className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Upload your first material
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMaterials.map((material) => (
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
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{material.description}</p>
                    
                    <div className="text-xs text-gray-500 mb-3">
                      <p>Uploaded by: {material.uploadedBy}</p>
                      <p>{new Date(material.uploadedAt).toLocaleDateString()}</p>
                      <p className="font-medium">{material.fileName}</p>
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={material.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-center text-sm font-medium transition"
                      >
                        View/Download
                      </a>
                      <button
                        onClick={() => handleDelete(material.id)}
                        className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded text-sm font-medium transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {uploadForClass ? `Upload Learning Material for Class ${uploadForClass}` : 'Upload Learning Material'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {!uploadForClass && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class *
                  </label>
                  <select
                    name="classGrade"
                    value={formData.classGrade}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {[6, 7, 8, 9, 10].map((grade) => (
                      <option key={grade} value={grade}>
                        Class {grade}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {uploadForClass && (
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <p className="text-sm text-indigo-800">
                    <strong>Uploading for:</strong> Class {uploadForClass}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  External Link (Optional)
                </label>
                <input
                  type="url"
                  name="fileUrl"
                  value={formData.fileUrl}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={selectedFile !== null}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add a link to Google Drive, Dropbox, or any file sharing service
                </p>
              </div>

              <div className="relative">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mb-1 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF or Word document (Max 10MB)</p>
                      {selectedFile && (
                        <p className="mt-2 text-sm text-green-600 font-medium">
                          ✓ {selectedFile.name}
                        </p>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      disabled={formData.fileUrl !== ''}
                    />
                  </label>
                </div>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Upload a file OR provide a URL above (not both)
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload Material'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadForm(false);
                    setUploadForClass(null);
                    setFormData({ title: '', description: '', classGrade: 6, fileUrl: '' });
                    setSelectedFile(null);
                    setMessage('');
                  }}
                  disabled={uploading}
                  className="px-6 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition font-medium disabled:bg-gray-200 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningMaterials;
