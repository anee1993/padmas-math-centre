import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const Register = () => {
  const navigate = useNavigate();
  const [randomQuote] = useState(() => mathQuotes[Math.floor(Math.random() * mathQuotes.length)]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    dateOfBirth: '',
    gender: 'MALE',
    classGrade: 6,
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post('/auth/register', formData);
      setMessage(response.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          setErrors(error.response.data);
        } else {
          setMessage(error.response.data.message || 'Registration failed');
        }
      }
    } finally {
      setLoading(false);
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
          Student Registration
        </h2>
        
        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
          </div>

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
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
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
            <p className="text-xs text-gray-500 mt-1">
              Min 8 chars, 1 uppercase, 1 lowercase, 1 number
            </p>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class (Grade)
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Registering...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
