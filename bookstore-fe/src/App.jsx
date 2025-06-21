// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Books from './pages/Books';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import StaffDashboardPage from './pages/staff/StaffDashboardPage';
import RoleProtectedRoute from './components/RoleProtectedRoute';

import ReportsPage from './pages/staff/ReportsPage'
import PaymentPage from './pages/staff/PaymentPage'
import ImportPage from './pages/staff/ImportPage'
import InvoicePage from './pages/staff/InvoicePage'
import { AppShell } from '@mantine/core';

function App() {
  const role = localStorage.getItem('role'); // ví dụ: 'admin', 'staff', 'user'
  console.log(role)

  return (
    <div>
      {/* Chỉ hiển thị Navbar nếu KHÔNG phải staff hoặc admin */}
      {/* {role !== 'admin' && role !== 'staff' && <Navbar />} */}
      <Navbar />
      <main style={{ padding: '20px' }}>
        {/* Routes sẽ quyết định component nào được render dựa trên URL */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/books" element={<Books />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

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
          <Route
            path="/staff/reports"
            element={
              <RoleProtectedRoute allowedRoles={['staff']}>
                <ReportsPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/staff/payment"
            element={
              <RoleProtectedRoute allowedRoles={['staff']}>
                <PaymentPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/staff/import"
            element={
              <RoleProtectedRoute allowedRoles={['staff']}>
                <ImportPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/staff/invoice"
            element={
              <RoleProtectedRoute allowedRoles={['staff']}>
                <InvoicePage />
              </RoleProtectedRoute>
            }
          />

          {/* Thêm một route cho trang không tồn tại */}
          <Route path="*" element={<h1>404 - Trang không tìm thấy</h1>} />
        </Routes>
      </main>
    </div>
  );
}



export default App;
