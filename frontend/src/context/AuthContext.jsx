import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import axios from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadUserProfile(session);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        loadUserProfile(session);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (session) => {
    try {
      const token = session.access_token;
      const email = session.user.email;
      const supabaseUserId = session.user.id;
      const role = session.user.user_metadata?.role || 'STUDENT';
      
      // Get user profile from backend (includes approval status)
      const response = await axios.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const profile = response.data;
      
      const userData = {
        email,
        role: profile.role || role, // Use role from backend profile
        token,
        supabaseUserId,
        fullName: profile.fullName,
        approvalStatus: profile.approvalStatus,
        classGrade: profile.classGrade
      };
      
      setUser(userData);
      
      // Navigate based on role from backend
      if (userData.role === 'TEACHER') {
        navigate('/teacher/dashboard');
      } else if (profile.approvalStatus === 'APPROVED') {
        navigate('/student/dashboard');
      } else {
        // Student not approved yet
        navigate('/pending-approval');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // If profile doesn't exist yet, use basic info from Supabase
      const role = session.user.user_metadata?.role || 'STUDENT';
      const userData = {
        email: session.user.email,
        role,
        token: session.access_token,
        supabaseUserId: session.user.id,
        approvalStatus: role === 'TEACHER' ? 'APPROVED' : 'PENDING'
      };
      setUser(userData);
      
      if (role === 'TEACHER') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/pending-approval');
      }
      setUser(userData);
      
      if (userData.role === 'STUDENT') {
        navigate('/pending-approval');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Profile will be loaded by onAuthStateChange
    return data;
  };

  const register = async (email, password, role, additionalData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          ...additionalData
        }
      }
    });

    if (error) throw error;

    // Create profile in backend with camelCase field names
    if (data.user) {
      await axios.post('/auth/create-profile', {
        supabaseUserId: data.user.id,
        email,
        role,
        fullName: additionalData.full_name,
        dateOfBirth: additionalData.date_of_birth,
        gender: additionalData.gender,
        classGrade: additionalData.class_grade
      });
    }

    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/login');
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register,
      logout, 
      resetPassword,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
