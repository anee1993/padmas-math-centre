import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Math quotes for decoration
  const mathQuotes = [
    "Mathematics is the music of reason. - James Joseph Sylvester",
    "Pure mathematics is, in its way, the poetry of logical ideas. - Albert Einstein",
    "Mathematics is the most powerful creation of the human spirit. - Stefan Banach"
  ];
  const randomQuote = mathQuotes[Math.floor(Math.random() * mathQuotes.length)];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await resetPassword(email);
      setMessage('Password reset email sent! Check your inbox for the reset link.');
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* Animated Math Symbols Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl text-indigo-400 opacity-70 animate-bounce">∑</div>
        <div className="absolute top-20 right-20 text-5xl text-purple-400 opacity-70 animate-pulse">π</div>
        <div className="absolute bottom-20 left-20 text-7xl text-blue-400 opacity-70 animate-bounce">∫</div>
        <div className="absolute bottom-10 right-10 text-6xl text-pink-400 opacity-70 animate-pulse">√</div>
        <div className="absolute top-1/2 left-1/4 text-5xl text-indigo-400 opacity-70 animate-bounce">∞</div>
        <div className="absolute top-1/3 right-1/3 text-6xl text-purple-400 opacity-70 animate-pulse">θ</div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Padma's Math Centre
            </h1>
            <h2 className="text-xl font-semibold text-indigo-600 mb-4">
              Reset Password
            </h2>
            <p className="text-sm text-gray-600 italic">"{randomQuote}"</p>
          </div>

          {message && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Enter Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your registered email"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                We'll send a password reset link to this email
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
