import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
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

const QueryDetail = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { queryId } = useParams();
  const [query, setQuery] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [newReply, setNewReply] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    fetchQueryAndReplies();
  }, [queryId]);

  const fetchQueryAndReplies = async () => {
    try {
      const [queryRes, repliesRes] = await Promise.all([
        axios.get(`/queries/${queryId}`),
        axios.get(`/queries/${queryId}/replies`)
      ]);
      setQuery(queryRes.data);
      setReplies(repliesRes.data);
    } catch (error) {
      setMessage('Failed to fetch query details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    
    if (!newReply.trim()) return;

    setIsReplying(true);
    try {
      await axios.post(`/queries/${queryId}/replies`, { content: newReply });
      setMessage('Reply added successfully');
      setNewReply('');
      fetchQueryAndReplies();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to add reply');
    } finally {
      setIsReplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <p className="text-gray-600">Query not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <nav className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Query Details</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(user.role === 'TEACHER' ? '/teacher/dashboard' : '/queries')}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded transition"
            >
              Back
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

      <div className="container mx-auto p-6 max-w-4xl">
        {message && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}

        {/* Query Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{query.title}</h2>
            <span className="text-sm text-gray-500">
              {formatToIST(query.createdAt)}
            </span>
          </div>
          <p className="text-gray-700 mb-4 whitespace-pre-wrap">{query.content}</p>
          <div className="flex items-center gap-4 text-sm text-gray-600 border-t pt-4">
            <span>👤 Posted by: {query.studentName}</span>
            <span>📚 Class {query.classGrade}</span>
            <span>💬 {replies.length} {replies.length === 1 ? 'reply' : 'replies'}</span>
          </div>
        </div>

        {/* Replies Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Replies ({replies.length})
          </h3>

          {replies.length === 0 ? (
            <p className="text-gray-600 mb-4">No replies yet. Be the first to reply!</p>
          ) : (
            <div className="space-y-4 mb-6">
              {replies.map((reply) => (
                <div
                  key={reply.id}
                  className={`border-l-4 pl-4 py-2 ${
                    reply.userRole === 'TEACHER'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">{reply.userName}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          reply.userRole === 'TEACHER'
                            ? 'bg-purple-200 text-purple-800'
                            : 'bg-blue-200 text-blue-800'
                        }`}
                      >
                        {reply.userRole === 'TEACHER' ? '👩‍🏫 Teacher' : '👨‍🎓 Student'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatToIST(reply.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Add Reply Form */}
          <form onSubmit={handleAddReply} className="border-t pt-4">
            <label className="block text-gray-700 font-medium mb-2">Add Your Reply</label>
            <textarea
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
              rows="4"
              placeholder="Write your reply..."
              required
            />
            <button
              type="submit"
              disabled={isReplying}
              className={`px-6 py-2 rounded transition flex items-center gap-2 ${
                isReplying 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } text-white`}
            >
              {isReplying ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Posting...
                </>
              ) : (
                'Post Reply'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QueryDetail;
