// src/layouts/StaffLayout.jsx
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { AppShell, Navbar, NavLink as MantineNavLink, Text } from '@mantine/core';
import { IconReceipt, IconFileInvoice, IconCash, IconReport, IconHome2 } from '@tabler/icons-react';

// Danh sách các chức năng của staff
const navLinks = [
    { icon: IconHome2, label: 'Bảng Điều Khiển', to: '/staff/dashboard' },
    { icon: IconReceipt, label: 'Tạo Phiếu Nhập', to: '/staff/import' },
    { icon: IconFileInvoice, label: 'Tạo Hóa Đơn', to: '/staff/invoice' },
    { icon: IconCash, label: 'Lập Phiếu Thu', to: '/staff/payment' },
    { icon: IconReport, label: 'Xem Báo Cáo', to: '/staff/reports' },
];

const StaffLayout = () => {
    return (
        <AppShell
            padding="md"
            navbar={
                <Navbar width={{ base: 250 }} p="xs">
                    <Navbar.Section grow mt="md">
                        {navLinks.map((link) => (
                            <MantineNavLink
                                key={link.label}
                                label={link.label}
                                leftSection={<link.icon size="1rem" stroke={1.5} />}
                                component={NavLink} // Tích hợp với React Router
                                to={link.to}
                                // React Router sẽ tự động thêm class 'active'
                                // Mantine NavLink sẽ tự nhận và style cho nó
                            />
                        ))}
                    </Navbar.Section>
                    <Navbar.Section>
                       <Text p="md" c="dimmed" size="sm">User: staff@example.com</Text>
                    </Navbar.Section>
                </Navbar>
            }
        >
            <AppShell.Main>
                {/* Các trang con của Staff sẽ được render ở đây */}
                <Outlet /> 
            </AppShell.Main>
        </AppShell>
    );
};

export default StaffLayout;