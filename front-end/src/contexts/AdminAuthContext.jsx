import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { apiUrl } from '../components/common/http';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in
    const storedAdmin = localStorage.getItem('admin');
    
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      console.log('Attempting admin login with:', { email: credentials.email });
      
      const response = await fetch(`${apiUrl}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials),
      });
      
      console.log('Response status:', response.status);
      
      // If not JSON response, handle it
      const contentType = response.headers.get('content-type');
      let data;
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Invalid server response format');
      } else {
        data = await response.json();
      }
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Store admin info
      const adminData = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        token: data.token,
      };
      
      console.log('Setting admin data:', adminData);
      setAdmin(adminData); // Make sure this is being called
      localStorage.setItem('admin', JSON.stringify(adminData));
      
      return adminData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('admin');
    toast.info('Logged out successfully');
  };

  const value = {
    admin,
    isAdmin: !!admin,
    isLoading,
    login,
    logout
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);