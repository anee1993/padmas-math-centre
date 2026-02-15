import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

const LateSubmissionRequests = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('PENDING'); // PENDING, ALL
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null);
  const [responseData, setResponseData] = useState({
    status: 'APPROVED',
    teacherResponse: ''
  });

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const endpoint = filter === 'PENDING' ? '/late-submissions/pending' : '/late-submissions/all';
      const response = await axios.get(endpoint);
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch late submission requests', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId) => {
    try {
      await axios.post('/late-submissions/respond', {
        requestId,
        status: responseData.status,
        teacherResponse: responseData.teacherResponse
      });
      
      alert(`Request ${responseData.status.toLowerCase()} successfully!`);
      setResponding(null);
      setResponseData({ status: 'APPROVED', teacherResponse: '' });
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to respond to request');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/teacher/dashboard?tab=assignments')}
              className="text-white hover:text-gray-200"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold">Late Submission Requests</h1>
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
              Student Late Submission Requests
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('PENDING')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'PENDING'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('ALL')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'ALL'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Requests
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-gray-600">Loading requests...</p>
          ) : requests.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600">
                {filter === 'PENDING' ? 'No pending requests' : 'No requests found'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {request.studentName}
                        </h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-sm text-gray-600">{request.studentEmail}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3 mb-3">
                    <p className="text-sm font-medium text-blue-900 mb-1">Assignment:</p>
                    <p className="text-sm text-blue-800">{request.assignmentTitle}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-sm font-medium text-gray-900 mb-1">Reason for Late Submission:</p>
                    <p className="text-sm text-gray-700">{request.reason}</p>
                  </div>

                  <div className="text-xs text-gray-500 mb-3">
                    Requested: {formatDate(request.requestedAt)}
                    {request.respondedAt && (
                      <> • Responded: {formatDate(request.respondedAt)}</>
                    )}
                  </div>

                  {request.teacherResponse && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium text-green-900 mb-1">Your Response:</p>
                      <p className="text-sm text-green-800">{request.teacherResponse}</p>
                    </div>
                  )}

                  {request.status === 'PENDING' && (
                    <>
                      {responding === request.id ? (
                        <div className="bg-gray-50 rounded-lg p-4 mt-3">
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Decision
                              </label>
                              <div className="flex gap-3">
                                <button
                                  onClick={() => setResponseData({ ...responseData, status: 'APPROVED' })}
                                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                                    responseData.status === 'APPROVED'
                                      ? 'bg-green-600 text-white'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => setResponseData({ ...responseData, status: 'REJECTED' })}
                                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                                    responseData.status === 'REJECTED'
                                      ? 'bg-red-600 text-white'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  Reject
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Response Message (Optional)
                              </label>
                              <textarea
                                value={responseData.teacherResponse}
                                onChange={(e) => setResponseData({ ...responseData, teacherResponse: e.target.value })}
                                placeholder="Add a message for the student..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                rows="3"
                              />
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleRespond(request.id)}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
                              >
                                Submit Response
                              </button>
                              <button
                                onClick={() => {
                                  setResponding(null);
                                  setResponseData({ status: 'APPROVED', teacherResponse: '' });
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setResponding(request.id)}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
                        >
                          Respond to Request
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LateSubmissionRequests;
