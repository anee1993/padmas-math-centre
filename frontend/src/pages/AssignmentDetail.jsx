import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

// Format date to IST timezone
const formatToIST = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const formatted = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
  console.log('formatToIST:', dateString, '→', formatted);
  return formatted;
};

const AssignmentDetail = () => {
  const { user, logout } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    submissionText: '',
    attachmentUrl: ''
  });
  const [message, setMessage] = useState('');
  const [lateSubmissionRequest, setLateSubmissionRequest] = useState(null);
  const [showLateRequestForm, setShowLateRequestForm] = useState(false);
  const [lateRequestReason, setLateRequestReason] = useState('');
  const [requestingLate, setRequestingLate] = useState(false);

  useEffect(() => {
    console.log('🔍 AssignmentDetail Component Loaded - Version: IST-FIX-v3');
    console.log('🔍 formatToIST function exists:', typeof formatToIST === 'function');
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const assignmentRes = await axios.get(`/assignments/${id}`);
      console.log('📅 Raw assignment data:', assignmentRes.data);
      console.log('📅 Due date from API:', assignmentRes.data.dueDate);
      setAssignment(assignmentRes.data);

      if (user.role === 'STUDENT') {
        try {
          const submissionRes = await axios.get(`/assignments/${id}/my-submission`);
          setSubmission(submissionRes.data);
        } catch (error) {
          // No submission yet
          setSubmission(null);
        }
        
        // Check for late submission request
        try {
          const lateRequestRes = await axios.get(`/late-submissions/assignment/${id}/my-request`);
          setLateSubmissionRequest(lateRequestRes.data);
        } catch (error) {
          // No late request
          setLateSubmissionRequest(null);
        }
      } else {
        const submissionsRes = await axios.get(`/assignments/${id}/submissions`);
        setSubmissions(submissionsRes.data);
      }
    } catch (error) {
      setMessage('Failed to load assignment');
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
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setMessage('Please select a PDF or Word document');
        e.target.value = '';
        return;
      }
      
      // Validate file size (10MB)
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
    const uploadFormData = new FormData();
    uploadFormData.append('file', selectedFile);
    uploadFormData.append('folder', 'submissions');

    try {
      const response = await axios.post('/assignments/upload-file', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.url;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that at least one content field is provided
    if (!formData.submissionText.trim() && !formData.attachmentUrl.trim() && !selectedFile) {
      setMessage('Please provide either submission text, an attachment URL, or upload a file');
      return;
    }
    
    setSubmitting(true);
    setMessage('');

    try {
      // Upload file if selected
      let fileUrl = formData.attachmentUrl;
      if (selectedFile) {
        setMessage('Uploading file...');
        fileUrl = await uploadFile();
      }

      await axios.post('/assignments/submit', {
        assignmentId: parseInt(id),
        submissionText: formData.submissionText,
        attachmentUrl: fileUrl
      });
      setMessage('Assignment submitted successfully!');
      fetchData();
    } catch (error) {
      setMessage(error.message || error.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;

    try {
      await axios.delete(`/assignments/${id}`);
      navigate('/assignments');
    } catch (error) {
      setMessage('Failed to delete assignment');
    }
  };

  const handleRequestLateSubmission = async () => {
    if (!lateRequestReason.trim() || lateRequestReason.length < 10) {
      setMessage('Please provide a reason (at least 10 characters)');
      return;
    }

    setRequestingLate(true);
    setMessage('');

    try {
      const response = await axios.post('/late-submissions/request', {
        assignmentId: parseInt(id),
        reason: lateRequestReason
      });
      console.log('Late submission request response:', response.data);
      setMessage('Late submission request sent successfully! Your teacher will review it.');
      setShowLateRequestForm(false);
      setLateRequestReason('');
      fetchData(); // Refresh to get the new request
    } catch (error) {
      console.error('Late submission request error:', error);
      console.error('Error response:', error.response);
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.message || 
                      'Failed to send request. Please try again.';
      setMessage(errorMsg);
    } finally {
      setRequestingLate(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const isOverdue = new Date() > new Date(assignment.dueDate);
  const canSubmit = user.role === 'STUDENT' && !submission && !isOverdue;
  const canRequestLate = user.role === 'STUDENT' && !submission && isOverdue && !lateSubmissionRequest;
  const hasApprovedLateRequest = lateSubmissionRequest?.status === 'APPROVED';

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
            <h1 className="text-2xl font-bold">Assignment Details</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{user?.email}</span>
            <button onClick={logout} className="bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded transition">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6 max-w-4xl">
        {/* Debug Test Button - Remove after testing */}
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
          <p className="text-sm font-semibold text-yellow-800 mb-2">🔧 Debug Mode Active</p>
          <button
            onClick={() => {
              const testDate = '2025-02-18T17:45:00.000Z';
              const formatted = formatToIST(testDate);
              alert(`Test Date: ${testDate}\nFormatted: ${formatted}\n\nCheck console for more details.`);
              console.log('🧪 Manual Test:', testDate, '→', formatted);
            }}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
          >
            Test IST Formatting
          </button>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        {/* Assignment Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">{assignment.title}</h2>
              <div className="flex gap-4 mt-2 text-sm text-gray-600">
                <span>Class {assignment.classGrade}</span>
                <span>•</span>
                <span>{assignment.totalMarks} marks</span>
                <span>•</span>
                <span className={isOverdue ? 'text-red-600 font-semibold' : ''}>
                  Due: {formatToIST(assignment.dueDate)}
                </span>
              </div>
            </div>
            {user.role === 'TEACHER' && (
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
              >
                Delete
              </button>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-700 mb-2">Description:</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{assignment.description}</p>
          </div>

          {assignment.attachmentUrl && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold text-gray-700 mb-2">Attachment:</h3>
              <a
                href={assignment.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {assignment.attachmentUrl}
              </a>
            </div>
          )}
        </div>

        {/* Student Submission Form */}
        {user.role === 'STUDENT' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Your Submission</h3>

            {submission ? (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <p className="text-green-800 font-semibold mb-2">✓ Submitted</p>
                <p className="text-sm text-gray-600 mb-2">
                  Submitted on: {formatToIST(submission.submittedAt)}
                </p>
                {submission.isLate && (
                  <p className="text-sm text-red-600 mb-2">⚠ Late Submission</p>
                )}
                
                {/* Grade Display */}
                {submission.status === 'GRADED' ? (
                  <div className="mt-3 p-3 bg-white border border-green-300 rounded">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Your Grade:</p>
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold text-indigo-600">
                        {submission.marksObtained}/{assignment.totalMarks}
                      </div>
                      <div className="text-xl text-gray-600">
                        ({((submission.marksObtained / assignment.totalMarks) * 100).toFixed(1)}%)
                      </div>
                    </div>
                    {submission.feedback && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm font-semibold text-gray-700">Teacher's Feedback:</p>
                        <p className="text-sm text-gray-600 mt-1">{submission.feedback}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded">
                    <p className="text-sm text-yellow-800 font-semibold">
                      📝 Being Evaluated
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Your teacher is reviewing your submission. Grades will be available soon.
                    </p>
                  </div>
                )}
                
                {submission.submissionText && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-gray-700">Your Answer:</p>
                    <p className="text-gray-600 whitespace-pre-wrap">{submission.submissionText}</p>
                  </div>
                )}
                {submission.attachmentUrl && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-gray-700">Attachment:</p>
                    <a
                      href={submission.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {submission.attachmentUrl}
                    </a>
                  </div>
                )}
              </div>
            ) : isOverdue && !hasApprovedLateRequest ? (
              <div>
                {/* Late Submission Request Status */}
                {lateSubmissionRequest ? (
                  <div className={`border rounded p-4 ${
                    lateSubmissionRequest.status === 'PENDING' ? 'bg-yellow-50 border-yellow-200' :
                    lateSubmissionRequest.status === 'REJECTED' ? 'bg-red-50 border-red-200' :
                    'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <p className={`font-semibold mb-2 ${
                          lateSubmissionRequest.status === 'PENDING' ? 'text-yellow-800' :
                          lateSubmissionRequest.status === 'REJECTED' ? 'text-red-800' :
                          'text-gray-800'
                        }`}>
                          {lateSubmissionRequest.status === 'PENDING' && '⏳ Late Submission Request Pending'}
                          {lateSubmissionRequest.status === 'REJECTED' && '❌ Late Submission Request Rejected'}
                        </p>
                        <p className="text-sm text-gray-700 mb-2">
                          <span className="font-medium">Your reason:</span> {lateSubmissionRequest.reason}
                        </p>
                        <p className="text-xs text-gray-600">
                          Requested: {formatToIST(lateSubmissionRequest.requestedAt)}
                        </p>
                        {lateSubmissionRequest.respondedAt && (
                          <p className="text-xs text-gray-600">
                            Responded: {formatToIST(lateSubmissionRequest.respondedAt)}
                          </p>
                        )}
                        {lateSubmissionRequest.teacherResponse && (
                          <div className="mt-3 p-2 bg-white rounded border">
                            <p className="text-sm font-medium text-gray-700">Teacher's Response:</p>
                            <p className="text-sm text-gray-600 mt-1">{lateSubmissionRequest.teacherResponse}</p>
                          </div>
                        )}
                        {lateSubmissionRequest.status === 'PENDING' && (
                          <p className="text-sm text-yellow-700 mt-3">
                            Your teacher will review your request soon. You'll be able to submit once approved.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded p-4">
                    <div className="flex items-start gap-3 mb-4">
                      <svg className="w-6 h-6 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-red-800 font-semibold">This assignment is overdue</p>
                        <p className="text-sm text-red-700 mt-1">
                          The due date has passed. You need teacher approval to submit late.
                        </p>
                      </div>
                    </div>
                    
                    {!showLateRequestForm ? (
                      <button
                        onClick={() => setShowLateRequestForm(true)}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg transition font-medium flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Request Late Submission Permission
                      </button>
                    ) : (
                      <div className="bg-white rounded-lg p-4 border border-orange-200">
                        <h4 className="font-semibold text-gray-800 mb-3">Request Late Submission</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Reason for Late Submission (minimum 10 characters)
                            </label>
                            <textarea
                              value={lateRequestReason}
                              onChange={(e) => setLateRequestReason(e.target.value)}
                              rows="4"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="Explain why you need to submit late (e.g., illness, family emergency, technical issues)..."
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {lateRequestReason.length}/500 characters
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleRequestLateSubmission}
                              disabled={requestingLate || lateRequestReason.length < 10}
                              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              {requestingLate ? 'Sending...' : 'Send Request'}
                            </button>
                            <button
                              onClick={() => {
                                setShowLateRequestForm(false);
                                setLateRequestReason('');
                                setMessage('');
                              }}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {hasApprovedLateRequest && (
                  <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                    <p className="text-green-800 text-sm font-semibold flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Late submission approved! You can now submit your assignment.
                    </p>
                    {lateSubmissionRequest.teacherResponse && (
                      <p className="text-sm text-green-700 mt-2">
                        <span className="font-medium">Teacher's note:</span> {lateSubmissionRequest.teacherResponse}
                      </p>
                    )}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Answer
                  </label>
                  <textarea
                    name="submissionText"
                    value={formData.submissionText}
                    onChange={handleChange}
                    rows="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Type your answer here..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attachment URL (Optional)
                  </label>
                  <input
                    type="url"
                    name="attachmentUrl"
                    value={formData.attachmentUrl}
                    onChange={handleChange}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={selectedFile !== null}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Add a link to your work (Google Drive, Dropbox, etc.)
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
                        disabled={formData.attachmentUrl !== ''}
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

                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : submitting ? 'Submitting...' : 'Submit Assignment'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Teacher View - Submissions */}
        {user.role === 'TEACHER' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Submissions ({submissions.length})
            </h3>

            {submissions.length === 0 ? (
              <p className="text-gray-600">No submissions yet</p>
            ) : (
              <div className="space-y-4">
                {submissions.map((sub) => (
                  <SubmissionCard 
                    key={sub.id} 
                    submission={sub} 
                    assignment={assignment}
                    onGradeUpdate={fetchData}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Submission Card Component with Grading
const SubmissionCard = ({ submission, assignment, onGradeUpdate }) => {
  const [isGrading, setIsGrading] = useState(false);
  const [gradeData, setGradeData] = useState({
    marksObtained: submission.marksObtained || '',
    feedback: submission.feedback || ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleGradeSubmit = async () => {
    if (gradeData.marksObtained === '' || gradeData.marksObtained < 0) {
      setMessage('Please enter valid marks');
      return;
    }

    if (parseInt(gradeData.marksObtained) > assignment.totalMarks) {
      setMessage(`Marks cannot exceed ${assignment.totalMarks}`);
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      await axios.post('/assignments/grade', {
        submissionId: submission.id,
        marksObtained: parseInt(gradeData.marksObtained),
        feedback: gradeData.feedback
      });
      setMessage('Grade saved successfully!');
      setIsGrading(false);
      setTimeout(() => {
        setMessage('');
        onGradeUpdate();
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to save grade');
    } finally {
      setSaving(false);
    }
  };

  const isGraded = submission.status === 'GRADED';

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-gray-800">{submission.studentName}</p>
          <p className="text-sm text-gray-600">{submission.studentEmail}</p>
          <p className="text-xs text-gray-500 mt-1">
            Submitted: {formatToIST(submission.submittedAt)}
          </p>
        </div>
        <div className="text-right">
          {submission.isLate && (
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded mb-1 inline-block">
              Late
            </span>
          )}
          {isGraded && (
            <div className="mt-1">
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                Graded
              </span>
            </div>
          )}
        </div>
      </div>

      {submission.submissionText && (
        <div className="mt-3 p-3 bg-gray-50 rounded">
          <p className="text-sm font-semibold text-gray-700 mb-1">Answer:</p>
          <p className="text-gray-600 text-sm whitespace-pre-wrap">{submission.submissionText}</p>
        </div>
      )}

      {submission.attachmentUrl && (
        <div className="mt-2">
          <a
            href={submission.attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            View Attachment
          </a>
        </div>
      )}

      {/* Grading Section */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        {message && (
          <div className={`mb-3 p-2 rounded text-sm ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        {isGraded && !isGrading ? (
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Grade: <span className="text-indigo-600 text-lg">{submission.marksObtained}/{assignment.totalMarks}</span>
              </p>
              {submission.feedback && (
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold">Feedback:</span> {submission.feedback}
                </p>
              )}
            </div>
            <button
              onClick={() => setIsGrading(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm transition"
            >
              Edit Grade
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marks (out of {assignment.totalMarks})
                </label>
                <input
                  type="number"
                  min="0"
                  max={assignment.totalMarks}
                  value={gradeData.marksObtained}
                  onChange={(e) => setGradeData({ ...gradeData, marksObtained: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Percentage
                </label>
                <input
                  type="text"
                  value={gradeData.marksObtained ? `${((gradeData.marksObtained / assignment.totalMarks) * 100).toFixed(1)}%` : '-'}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feedback (Optional)
              </label>
              <textarea
                value={gradeData.feedback}
                onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Add feedback for the student..."
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleGradeSubmit}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : isGraded ? 'Update Grade' : 'Save Grade'}
              </button>
              {isGrading && (
                <button
                  onClick={() => {
                    setIsGrading(false);
                    setGradeData({
                      marksObtained: submission.marksObtained || '',
                      feedback: submission.feedback || ''
                    });
                    setMessage('');
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded text-sm transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentDetail;
