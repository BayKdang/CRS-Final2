import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiUrl } from '../components/common/http';
import { toast } from 'react-toastify';

const UserAuthContext = createContext();

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on page load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedAuth = localStorage.getItem('userAuth');
        if (storedAuth) {
          const userData = JSON.parse(storedAuth);
          
          // Validate token by making a request to the backend
          const response = await fetch(`${apiUrl}/user/profile`, {
            headers: {
              'Authorization': `Bearer ${userData.token}`
            }
          });
          
          if (response.ok) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Token invalid or expired
            localStorage.removeItem('userAuth');
          }
        }
      } catch (error) {
        console.error('Error restoring user auth:', error);
        localStorage.removeItem('userAuth');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Authentication failed');
      }
      
      // Store user info based on the API response
      const userData = {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        token: result.token
      };
      
      // Update state and localStorage
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('userAuth', JSON.stringify(userData));
      
      toast.success('Login successful!');
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${apiUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }
      
      // Store user info after successful registration
      const authData = {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        token: result.token
      };
      
      // Update state and localStorage
      setUser(authData);
      setIsAuthenticated(true);
      localStorage.setItem('userAuth', JSON.stringify(authData));
      
      toast.success('Registration successful!');
      return authData;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (user?.token) {
        await fetch(`${apiUrl}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('userAuth');
      toast.info('You have been logged out');
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout
  };

  return <UserAuthContext.Provider value={value}>{children}</UserAuthContext.Provider>;
};

export const useUserAuth = () => useContext(UserAuthContext);