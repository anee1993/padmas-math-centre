import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

// Format date to IST timezone
const formatToIST = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

const Submissions = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState(6);
  const [assignments, setAssignments] = useState([]);
  const [submissionsByAssignment, setSubmissionsByAssignment] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedClass]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch assignments for selected class
      const assignmentsRes = await axios.get(`/assignments/class/${selectedClass}`);
      setAssignments(assignmentsRes.data);

      // Fetch submissions for each assignment
      const submissionsData = {};
      for (const assignment of assignmentsRes.data) {
        try {
          const submissionsRes = await axios.get(`/assignments/${assignment.id}/submissions`);
          submissionsData[assignment.id] = submissionsRes.data;
        } catch (error) {
          submissionsData[assignment.id] = [];
        }
      }
      setSubmissionsByAssignment(submissionsData);
    } catch (error) {
      console.error('Failed to fetch submissions', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionCount = (assignmentId) => {
    return submissionsByAssignment[assignmentId]?.length || 0;
  };

  const formatDate = (dateString) => {
    return formatToIST(dateString);
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
            <h1 className="text-2xl font-bold">Student Submissions</h1>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Submissions by Class
          </h2>
          <p className="text-gray-600 mb-6">
            View all student submissions organized by class and assignment
          </p>

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
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-gray-600">Loading submissions...</p>
          ) : assignments.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600">No assignments found for Class {selectedClass}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {assignments.map((assignment) => {
                const submissions = submissionsByAssignment[assignment.id] || [];
                const submissionCount = submissions.length;

                return (
                  <div key={assignment.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Assignment Header */}
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 border-b border-gray-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800">{assignment.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                          <div className="flex gap-4 mt-2 text-sm text-gray-500">
                            <span>Class {assignment.classGrade}</span>
                            <span>•</span>
                            <span>{assignment.totalMarks} marks</span>
                            <span>•</span>
                            <span>Due: {formatDate(assignment.dueDate)}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <span className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-full font-semibold">
                            {submissionCount} {submissionCount === 1 ? 'Submission' : 'Submissions'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Submissions List */}
                    <div className="p-4">
                      {submissions.length === 0 ? (
                        <p className="text-gray-500 text-sm italic">No submissions yet</p>
                      ) : (
                        <div className="space-y-3">
                          {submissions.map((submission) => (
                            <div
                              key={submission.id}
                              className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-gray-800">{submission.studentName}</p>
                                    {submission.isLate && (
                                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                                        Late
                                      </span>
                                    )}
                                    {submission.status === 'GRADED' && (
                                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-semibold">
                                        ✓ Graded
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">{submission.studentEmail}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Submitted: {formatDate(submission.submittedAt)}
                                  </p>
                                  
                                  {/* Show grading info if graded */}
                                  {submission.status === 'GRADED' && (
                                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                                      <p className="text-sm font-semibold text-green-800">
                                        Score: {submission.marksObtained}/{assignment.totalMarks} marks
                                      </p>
                                      {submission.feedback && (
                                        <p className="text-xs text-green-700 mt-1 italic">
                                          Feedback provided
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4 flex flex-col gap-2">
                                  <button
                                    onClick={() => navigate(`/assignments/${assignment.id}`)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm transition whitespace-nowrap"
                                  >
                                    View Details
                                  </button>
                                  {submission.status !== 'GRADED' && (
                                    <span className="text-xs text-orange-600 font-medium text-center">
                                      Needs Grading
                                    </span>
                                  )}
                                </div>
                              </div>

                              {submission.submissionText && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-sm text-gray-700 line-clamp-2">
                                    {submission.submissionText}
                                  </p>
                                </div>
                              )}

                              {submission.attachmentUrl && (
                                <div className="mt-2">
                                  <a
                                    href={submission.attachmentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                    View Attachment
                                  </a>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Submissions;
