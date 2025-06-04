import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component that wraps your app and provides auth context
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in when the component mounts
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save user data to state and localStorage
      setUser(data.data);
      localStorage.setItem('user', JSON.stringify(data.data));
      
      toast.success('Login successful!');
      return data.data;
    } catch (error) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      toast.success('Registration successful! Please log in.');
      return data;
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (user?.token) {
        // Call logout API to invalidate token
        await fetch('http://localhost:8000/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear user from state and localStorage
      setUser(null);
      localStorage.removeItem('user');
      toast.info('You have been logged out');
    }
  };

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Context value
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;