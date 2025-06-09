// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // File CSS chính, Tailwind directives nên ở đây
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css'; // << RẤT QUAN TRỌNG: Import file CSS này
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Bọc TOÀN BỘ ứng dụng trong BrowserRouter */}
    <BrowserRouter>
      {/* Bọc TOÀN BỘ BrowserRouter trong MantineProvider */}
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          // (Tùy chọn) Bạn có thể định nghĩa theme chung ở đây
          fontFamily: 'Montserrat, sans-serif',
          headings: { fontFamily: 'Lora, serif' },
        }}
      >
        {/* AuthProvider bọc App để cung cấp thông tin đăng nhập */}
        <AuthProvider>
          <App />
        </AuthProvider>
      </MantineProvider>
    </BrowserRouter>
  </React.StrictMode>
);