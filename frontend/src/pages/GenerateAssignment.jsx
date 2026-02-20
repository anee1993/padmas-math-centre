import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

// Convert datetime-local input to IST ISO string
const convertLocalDateTimeToISTISO = (datetimeLocalValue) => {
  if (!datetimeLocalValue) return '';
  const localDate = new Date(datetimeLocalValue);
  const year = localDate.getFullYear();
  const month = localDate.getMonth();
  const date = localDate.getDate();
  const hours = localDate.getHours();
  const minutes = localDate.getMinutes();
  const istDateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+05:30`;
  return new Date(istDateString).toISOString();
};

const GenerateAssignment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postFormData, setPostFormData] = useState({
    title: '',
    dueDate: '',
    totalMarks: 100
  });
  const [formData, setFormData] = useState({
    classGrade: 6,
    topic: '',
    oneMarkQuestions: 0,
    twoMarkQuestions: 0,
    threeMarkQuestions: 0,
    fiveMarkQuestions: 0,
    complexity: 'MEDIUM'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Questions') || name === 'classGrade' 
        ? (value === '' ? 0 : parseInt(value)) 
        : value
    }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    // Validate at least one question type is selected
    const totalQuestions = formData.oneMarkQuestions + formData.twoMarkQuestions + 
                          formData.threeMarkQuestions + formData.fiveMarkQuestions;
    
    if (totalQuestions === 0) {
      alert('Please select at least one question type');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post('/assignments/generate', formData);
      setGeneratedContent(response.data.content);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to generate assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${formData.topic.replace(/\s+/g, '_')}_Class${formData.classGrade}_Assignment.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    alert('Assignment copied to clipboard!');
  };

  const handlePostToClass = () => {
    // Pre-fill the title with topic
    setPostFormData(prev => ({
      ...prev,
      title: formData.topic || 'AI Generated Assignment'
    }));
    setShowPostModal(true);
  };

  const handlePostFormChange = (e) => {
    const { name, value } = e.target;
    setPostFormData(prev => ({
      ...prev,
      [name]: name === 'totalMarks' ? parseInt(value) : value
    }));
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    setPosting(true);
    
    try {
      // Convert datetime-local value from IST to ISO format
      const dueDateISO = convertLocalDateTimeToISTISO(postFormData.dueDate);
      
      const assignmentData = {
        title: postFormData.title,
        description: generatedContent,
        classGrade: formData.classGrade,
        dueDate: dueDateISO,
        totalMarks: postFormData.totalMarks,
        attachmentUrl: null
      };

      await axios.post('/assignments', assignmentData);
      alert('Assignment posted successfully to Class ' + formData.classGrade + '!');
      setShowPostModal(false);
      
      // Optionally navigate to assignments page
      setTimeout(() => {
        navigate('/assignments');
      }, 1000);
      
    } catch (error) {
      console.error('Error posting assignment:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to post assignment. Please try again.';
      alert(errorMessage);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      {/* Math symbols background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-5">
        <div className="absolute top-10 left-10 text-6xl text-purple-600">∑</div>
        <div className="absolute top-20 right-20 text-5xl text-pink-600">π</div>
        <div className="absolute bottom-20 left-20 text-7xl text-blue-600">∫</div>
        <div className="absolute bottom-10 right-10 text-6xl text-indigo-600">√</div>
        <div className="absolute top-1/2 left-1/4 text-5xl text-purple-600">∞</div>
        <div className="absolute top-1/3 right-1/3 text-6xl text-pink-600">θ</div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-purple-600 hover:text-purple-700 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-800">🤖 AI Assignment Generator</h1>
          <p className="text-gray-600 mt-2">Generate custom math assignments using AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Assignment Configuration</h2>
            
            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Class Grade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Grade
                </label>
                <select
                  name="classGrade"
                  value={formData.classGrade}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  {[6, 7, 8, 9, 10].map(grade => (
                    <option key={grade} value={grade}>Class {grade}</option>
                  ))}
                </select>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic
                </label>
                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  placeholder="e.g., Algebra, Geometry, Trigonometry"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Complexity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complexity Level
                </label>
                <select
                  name="complexity"
                  value={formData.complexity}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>

              {/* Question Distribution */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Question Distribution</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">1-Mark Questions</label>
                    <input
                      type="number"
                      name="oneMarkQuestions"
                      value={formData.oneMarkQuestions}
                      onChange={handleChange}
                      min="0"
                      max="20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">2-Mark Questions</label>
                    <input
                      type="number"
                      name="twoMarkQuestions"
                      value={formData.twoMarkQuestions}
                      onChange={handleChange}
                      min="0"
                      max="20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">3-Mark Questions</label>
                    <input
                      type="number"
                      name="threeMarkQuestions"
                      value={formData.threeMarkQuestions}
                      onChange={handleChange}
                      min="0"
                      max="20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">5-Mark Questions</label>
                    <input
                      type="number"
                      name="fiveMarkQuestions"
                      value={formData.fiveMarkQuestions}
                      onChange={handleChange}
                      min="0"
                      max="20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Assignment
                  </>
                )}
              </button>
            </form>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> The AI will generate questions appropriate for the selected class level and complexity. You can edit the generated content before using it.
              </p>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Generated Assignment</h2>
              {generatedContent && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-3 py-1 rounded-lg transition-colors text-sm flex items-center ${
                      isEditing 
                        ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {isEditing ? 'Preview' : 'Edit'}
                  </button>
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                </div>
              )}
            </div>

            {generatedContent ? (
              <>
                {isEditing ? (
                  <div className="mb-4">
                    <textarea
                      value={generatedContent}
                      onChange={(e) => setGeneratedContent(e.target.value)}
                      className="w-full h-[500px] p-4 border-2 border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm text-gray-800 resize-none"
                      placeholder="Edit your assignment content here..."
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Tip: You can edit the generated content before posting to class
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 min-h-[400px] max-h-[500px] overflow-y-auto mb-4">
                    <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
                      {generatedContent}
                    </pre>
                  </div>
                )}
                
                {/* Post to Class Button */}
                <button
                  onClick={handlePostToClass}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Post Assignment to Class {formData.classGrade}
                </button>
              </>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-300 min-h-[500px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium">No assignment generated yet</p>
                  <p className="text-sm mt-2">Fill in the form and click "Generate Assignment"</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post to Class Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Post Assignment to Class {formData.classGrade}</h3>
            
            <form onSubmit={handleSubmitPost} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={postFormData.title}
                  onChange={handlePostFormChange}
                  placeholder="e.g., Algebra Assignment"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="dueDate"
                  value={postFormData.dueDate}
                  onChange={handlePostFormChange}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Set the exact date and time when the assignment is due
                </p>
              </div>

              {/* Total Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Marks
                </label>
                <input
                  type="number"
                  name="totalMarks"
                  value={postFormData.totalMarks}
                  onChange={handlePostFormChange}
                  min="1"
                  max="200"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Info */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  The generated assignment content will be posted as the assignment description. Students in Class {formData.classGrade} will be able to view and submit this assignment.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={posting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={posting}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {posting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Posting...
                    </>
                  ) : (
                    'Post Assignment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateAssignment;
