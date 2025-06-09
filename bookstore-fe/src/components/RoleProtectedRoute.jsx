// src/routes/RoleProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RoleProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user, loading } = useAuth();

    // Nếu đang loading thông tin user, chưa quyết định
    if (loading) {
        return <div>Đang xác thực...</div>;
    }

    // Nếu chưa đăng nhập, đá về trang login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Nếu đã đăng nhập, kiểm tra vai trò
    // `allowedRoles` là một mảng, ví dụ: ['admin'] hoặc ['admin', 'staff']
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Nếu vai trò không được phép, đá về trang không có quyền (hoặc trang chủ)
        return <Navigate to="/unauthorized" replace />;
    }

    // Nếu mọi thứ ổn, cho phép render trang
    return children;
};

export default RoleProtectedRoute;