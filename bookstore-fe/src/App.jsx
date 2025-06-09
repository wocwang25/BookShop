// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import StaffDashboardPage from './pages/staff/StaffDashboardPage';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import { AppShell } from '@mantine/core';

function App() {
  return (
    <div>
      {/* Navbar sẽ luôn hiển thị ở tất cả các trang */}
      <Navbar />

      <main style={{ padding: '20px' }}>
        {/* Routes sẽ quyết định component nào được render dựa trên URL */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route
            path="/admin/dashboard"
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </RoleProtectedRoute>
            }
          />

          {/* Route chỉ cho phép 'staff' truy cập */}
          <Route
            path="/staff/dashboard"
            element={
              <RoleProtectedRoute allowedRoles={['staff']}>
                <StaffDashboardPage />
              </RoleProtectedRoute>
            }
          />

          {/* Một route ví dụ cho cả admin và staff */}
          {/*
      <Route 
        path="/manage/products" 
        element={
          <RoleProtectedRoute allowedRoles={['admin', 'staff']}>
            <ProductManagementPage />
          </RoleProtectedRoute>
        } 
      />
      */}

          {/* Thêm một route cho trang không tồn tại */}
          <Route path="*" element={<h1>404 - Trang không tìm thấy</h1>} />
        </Routes>
      </main>
    </div>
  );
}



export default App;
