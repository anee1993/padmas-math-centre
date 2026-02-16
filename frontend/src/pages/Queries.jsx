import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

// Format date to IST timezone (date only, no time)
const formatDateIST = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

const Queries = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [newQuery, setNewQuery] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    fetchQueries();
    checkIfBlocked();
  }, []);

  const fetchQueries = async () => {
    try {
      const response = await axios.get('/queries/my-class');
      setQueries(response.data);
    } catch (error) {
      setMessage('Failed to fetch queries');
    } finally {
      setLoading(false);
    }
  };

  const checkIfBlocked = async () => {
    try {
      const response = await axios.get('/queries/is-blocked');
      setIsBlocked(response.data.blocked);
    } catch (error) {
      console.error('Failed to check block status');
    }
  };

  const handleCreateQuery = async (e) => {
    e.preventDefault();
    
    if (isBlocked) {
      setMessage('You are blocked from posting queries');
      return;
    }

    setIsPosting(true);
    try {
      await axios.post('/queries', newQuery);
      setMessage('Query posted successfully');
      setNewQuery({ title: '', content: '' });
      setShowCreateForm(false);
      fetchQueries();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to post query');
    } finally {
      setIsPosting(false);
    }
  };

  const viewQuery = (queryId) => {
    navigate(`/queries/${queryId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <nav className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Queries & Discussions</h1>
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
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}

        {isBlocked && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            ⚠️ You have been blocked from posting queries due to inappropriate behavior.
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Class Queries</h2>
            {!isBlocked && (
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition"
              >
                {showCreateForm ? 'Cancel' : '+ Ask Question'}
              </button>
            )}
          </div>

          {showCreateForm && !isBlocked && (
            <form onSubmit={handleCreateQuery} className="mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Question Title</label>
                <input
                  type="text"
                  value={newQuery.title}
                  onChange={(e) => setNewQuery({ ...newQuery, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Brief title for your question"
                  required
                  maxLength={200}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Question Details</label>
                <textarea
                  value={newQuery.content}
                  onChange={(e) => setNewQuery({ ...newQuery, content: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="5"
                  placeholder="Describe your question in detail..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isPosting}
                className={`px-6 py-2 rounded transition flex items-center gap-2 ${
                  isPosting 
                    ? 'bg-indigo-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } text-white`}
              >
                {isPosting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Posting...
                  </>
                ) : (
                  'Post Question'
                )}
              </button>
            </form>
          )}

          {loading ? (
            <p className="text-gray-600">Loading queries...</p>
          ) : queries.length === 0 ? (
            <p className="text-gray-600">No queries yet. Be the first to ask a question!</p>
          ) : (
            <div className="space-y-4">
              {queries.map((query) => (
                <div
                  key={query.id}
                  onClick={() => viewQuery(query.id)}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{query.title}</h3>
                    <span className="text-xs text-gray-500">
                      {formatDateIST(query.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2 line-clamp-2">{query.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>👤 {query.studentName}</span>
                    <span>💬 {query.replyCount} {query.replyCount === 1 ? 'reply' : 'replies'}</span>
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

export default Queries;
