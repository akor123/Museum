import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth必须在AuthProvider内使用');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
          
          // 验证令牌是否有效
          await authService.getProfile();
        } catch (error) {
          // 令牌无效，清除本地存储
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (username, password) => {
    try {
      const response = await authService.login({ username, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || '登录失败'
      };
    }
  }, []);

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || '注册失败'
      };
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const isAdmin = useCallback(() => {
    return user?.role === 'admin';
  }, [user]);

  const isCurator = useCallback(() => {
    return user?.role === 'curator';
  }, [user]);

  const canEditArtifacts = useCallback(() => {
    return isAdmin() || isCurator();
  }, [isAdmin, isCurator]);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isCurator,
    canEditArtifacts
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
