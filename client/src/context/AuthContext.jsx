import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        // Verificar se token ainda é válido
        authService.getProfile().catch(() => {
          logout();
        });
      } catch (err) {
        console.error('Erro ao carregar usuário:', err);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const result = await authService.login(email, password);
      if (result.success) {
        setUser(result.data);
        return { success: true };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
      return { success: false, message: err.response?.data?.message || 'Erro ao fazer login' };
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const result = await authService.register(userData);
      if (result.success) {
        setUser(result.data);
        return { success: true };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao registrar');
      return { success: false, message: err.response?.data?.message || 'Erro ao registrar' };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUserProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isProfessional: user?.role === 'professional',
    isClient: user?.role === 'client'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};