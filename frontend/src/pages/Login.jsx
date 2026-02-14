import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

const mathQuotes = [
  { quote: "Mathematics is the music of reason", author: "James Joseph Sylvester" },
  { quote: "Pure mathematics is, in its way, the poetry of logical ideas", author: "Albert Einstein" },
  { quote: "Mathematics is the language in which God has written the universe", author: "Galileo Galilei" },
  { quote: "In mathematics, you don't understand things. You just get used to them", author: "John von Neumann" },
  { quote: "Mathematics is not about numbers, it's about patterns", author: "Keith Devlin" },
  { quote: "The essence of mathematics is not to make simple things complicated, but to make complicated things simple", author: "Stan Gudder" },
  { quote: "Mathematics knows no races or geographic boundaries; for mathematics, the cultural world is one country", author: "David Hilbert" },
  { quote: "Without mathematics, there's nothing you can do. Everything around you is mathematics", author: "Shakuntala Devi" }
];

const Login = () => {
  const { login } = useAuth();
  const [randomQuote] = useState(() => mathQuotes[Math.floor(Math.random() * mathQuotes.length)]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('/auth/login', formData);
      const { token, email, role, fullName } = response.data;
      console.log('Login response:', { token, email, role, fullName }); // Debug log
      login(token, email, role, fullName);
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Math Symbols */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl text-indigo-400 opacity-70 animate-bounce">+</div>
        <div className="absolute top-20 right-20 text-5xl text-blue-400 opacity-70 animate-pulse">−</div>
        <div className="absolute bottom-20 left-20 text-7xl text-purple-400 opacity-70 animate-bounce">×</div>
        <div className="absolute bottom-32 right-32 text-6xl text-indigo-400 opacity-70 animate-pulse">÷</div>
        <div className="absolute top-1/3 left-1/4 text-5xl text-blue-400 opacity-70 animate-bounce">=</div>
        <div className="absolute top-2/3 right-1/4 text-6xl text-purple-400 opacity-70 animate-pulse">√</div>
        <div className="absolute top-1/2 left-10 text-4xl text-indigo-400 opacity-70 animate-bounce">π</div>
        <div className="absolute bottom-10 right-10 text-5xl text-blue-400 opacity-70 animate-pulse">∑</div>
      </div>

      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md relative z-10">
        {/* Logo/Title Section */}
        <div className="text-center mb-6">
          <div className="flex justify-center items-center gap-2 mb-2">
            <span className="text-4xl text-indigo-600">📐</span>
            <h1 className="text-3xl font-bold text-indigo-600">Padma's Math Centre</h1>
            <span className="text-4xl text-indigo-600">📊</span>
          </div>
          <p className="text-gray-600 text-sm italic">"{randomQuote.quote}" - {randomQuote.author}</p>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Login
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <div className="text-right mt-1">
              <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700">
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200 font-medium"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
