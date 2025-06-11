import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/apiService';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Quản lý token trong state để các component có thể lắng nghe sự thay đổi của nó
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUserToken = async () => {
      if (token) {
        try {
          const response = await authAPI.getProfile();
          setUser(response.data.user);
        } catch (error) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    verifyUserToken();
  }, [token]);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token: newToken, user: userData } = response.data;

      console.log(userData)
      console.log(user)
      localStorage.setItem('token', newToken);
      localStorage.setItem('role', user.role)
      setToken(newToken); // Cập nhật token trong state -> useEffect sẽ chạy lại
      setUser(userData); // Cập nhật user ngay lập tức để UI mượt hơn
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Đăng nhập thất bại' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      // const { token, user } = response.data;

      // localStorage.setItem('token', token);
      // setUser(user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Đăng ký thất bại'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null); // Việc này sẽ kích hoạt useEffect để dọn dẹp user state
    setUser(null);
    window.location.reload();
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user, // vẫn giữ !!user thay vì !!token vì user là nguồn tin cậy cuối cùng
    login,
    register,
    logout
  };

  // Chỉ render children khi quá trình loading ban đầu đã hoàn tất
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};