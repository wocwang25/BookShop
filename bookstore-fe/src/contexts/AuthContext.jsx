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
          localStorage.removeItem('role');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    verifyUserToken();
  }, [token]);

  // Thêm listener để phát hiện thay đổi localStorage từ bên ngoài (ví dụ: interceptor)
  useEffect(() => {
    const handleStorageChange = () => {
      const currentToken = localStorage.getItem('token');
      if (!currentToken && token) {
        // Token bị xóa từ bên ngoài (ví dụ: bởi interceptor)
        setToken(null);
        setUser(null);
      }
    };

    // Listener cho storage event (chỉ hoạt động cross-tab)
    window.addEventListener('storage', handleStorageChange);
    
    // Polling để phát hiện thay đổi trong cùng tab
    const intervalId = setInterval(() => {
      const currentToken = localStorage.getItem('token');
      if (currentToken !== token) {
        setToken(currentToken);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [token]);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token: newToken, user: userData } = response.data;

      console.log(userData)
      console.log(user)
      localStorage.setItem('token', newToken);
      localStorage.setItem('role', userData.role)
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
    localStorage.removeItem('role');
    setToken(null); // Việc này sẽ kích hoạt useEffect để dọn dẹp user state
    setUser(null);
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