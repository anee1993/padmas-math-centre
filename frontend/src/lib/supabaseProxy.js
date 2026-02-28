import axios from '../api/axios';

/**
 * Supabase Proxy Client
 * Routes all Supabase auth requests through the backend proxy
 * to bypass ISP blocks in India
 */

class SupabaseProxyClient {
  constructor() {
    this.session = null;
    this.listeners = [];
  }

  // Get current session from localStorage
  async getSession() {
    const sessionData = localStorage.getItem('supabase_session');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        // Check if token is expired
        if (session.expires_at && new Date(session.expires_at * 1000) > new Date()) {
          this.session = session;
          return { data: { session }, error: null };
        } else {
          // Try to refresh token
          if (session.refresh_token) {
            return await this.refreshSession(session.refresh_token);
          }
        }
      } catch (e) {
        console.error('Error parsing session:', e);
      }
    }
    return { data: { session: null }, error: null };
  }

  // Sign in with email and password
  async signInWithPassword({ email, password }) {
    try {
      const response = await axios.post('/supabase-proxy/auth/signin', {
        email,
        password
      });

      const session = this._createSession(response.data);
      this._saveSession(session);
      this._notifyListeners('SIGNED_IN', session);

      return { data: { session, user: session.user }, error: null };
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      return { data: null, error: { message: errorMessage } };
    }
  }

  // Sign up with email and password
  async signUp({ email, password, options }) {
    try {
      const response = await axios.post('/supabase-proxy/auth/signup', {
        email,
        password,
        options
      });

      const session = this._createSession(response.data);
      if (session) {
        this._saveSession(session);
        this._notifyListeners('SIGNED_IN', session);
      }

      return { data: { session, user: session?.user || response.data.user }, error: null };
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      return { data: null, error: { message: errorMessage } };
    }
  }

  // Sign out
  async signOut() {
    try {
      const sessionData = await this.getSession();
      if (sessionData.data.session) {
        await axios.post('/supabase-proxy/auth/signout', {}, {
          headers: {
            Authorization: `Bearer ${sessionData.data.session.access_token}`
          }
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      this._clearSession();
      this._notifyListeners('SIGNED_OUT', null);
    }
    return { error: null };
  }

  // Reset password for email
  async resetPasswordForEmail(email, options) {
    try {
      await axios.post('/supabase-proxy/auth/reset-password', {
        email,
        redirectTo: options?.redirectTo
      });
      return { data: {}, error: null };
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      return { data: null, error: { message: errorMessage } };
    }
  }

  // Refresh session
  async refreshSession(refreshToken) {
    try {
      const response = await axios.post('/supabase-proxy/auth/refresh', {
        refresh_token: refreshToken
      });

      const session = this._createSession(response.data);
      this._saveSession(session);
      this._notifyListeners('TOKEN_REFRESHED', session);

      return { data: { session, user: session.user }, error: null };
    } catch (error) {
      this._clearSession();
      const errorMessage = error.response?.data?.error || error.message;
      return { data: null, error: { message: errorMessage } };
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback) {
    this.listeners.push(callback);

    // Return unsubscribe function
    const unsubscribe = () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };

    return { data: { subscription: { unsubscribe } } };
  }

  // Helper: Create session object from response
  _createSession(data) {
    if (!data.access_token) {
      return null;
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      expires_at: data.expires_at || Math.floor(Date.now() / 1000) + data.expires_in,
      token_type: data.token_type || 'bearer',
      user: data.user
    };
  }

  // Helper: Save session to localStorage
  _saveSession(session) {
    if (session) {
      localStorage.setItem('supabase_session', JSON.stringify(session));
      this.session = session;
    }
  }

  // Helper: Clear session from localStorage
  _clearSession() {
    localStorage.removeItem('supabase_session');
    this.session = null;
  }

  // Helper: Notify all listeners
  _notifyListeners(event, session) {
    this.listeners.forEach(callback => {
      callback(event, session);
    });
  }
}

// Create singleton instance
const supabaseProxy = new SupabaseProxyClient();

// Export auth object that mimics Supabase client structure
export const supabase = {
  auth: {
    getSession: () => supabaseProxy.getSession(),
    signInWithPassword: (credentials) => supabaseProxy.signInWithPassword(credentials),
    signUp: (credentials) => supabaseProxy.signUp(credentials),
    signOut: () => supabaseProxy.signOut(),
    resetPasswordForEmail: (email, options) => supabaseProxy.resetPasswordForEmail(email, options),
    onAuthStateChange: (callback) => supabaseProxy.onAuthStateChange(callback)
  }
};
