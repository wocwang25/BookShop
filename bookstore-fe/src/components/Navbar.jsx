// src/components/Navbar.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDisclosure } from '@mantine/hooks';

// Import các component cần thiết từ Mantine
import { Box, Container, Group, Button, Burger, Menu, Avatar, Text } from '@mantine/core';

// Component con cho Logo, không cần thay đổi
const Logo = () => (
    <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
        <img
            src="/images/logo-navy.svg" // Đặt logo của bạn vào public/images/logo.png
            alt="Readify"
            style={{ height: 36, marginRight: 8, objectFit: 'contain' }}
        />
        <Text size="xl" weight={700} style={{ fontFamily: 'Pacifico, cursive' }}>
            Readify
        </Text>
    </Link>
);

// --- Component Navbar chính (PHIÊN BẢN SỬA ĐÚNG) ---
const Navbar = () => {
    const [opened, { toggle }] = useDisclosure(false);
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const role = user?.role;

    const handleLogout = () => {
        logout();
        navigate('/'); // Điều hướng về trang chủ
    };

    const userMenuItems = [
        { label: 'Bảng Điều Khiển', href: `/${role}/dashboard` },
        // { label: 'Sách Yêu Thích', href: '/favorites' },
        // { label: 'Đơn Hàng Của Tôi', href: '/orders' },
    ];

    const navLinks = [
        { label: 'Trang Chủ', href: '/' },
        { label: 'Tất Cả Sách', href: '/books' },
        // { label: 'Về Chúng Tôi', href: '/about' },
    ];

    // Thay thế <Header> cũ bằng <Box component="header">.
    // Đây là một container linh hoạt của Mantine, và nó sẽ render ra thẻ <header> trong HTML
    return (
        <Box
            component="header"
            h={60}
            px="md"
            style={{
                borderBottom: '1px solid #e9ecef',
                backgroundColor: 'rgba(255,255,255,0.7)', // <-- trắng mờ hơn
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                zIndex: 100
            }}
        >
            <Container size="lg" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '100%',
                flexDirection: 'row' // bố trí ngang
            }}>
                {/* Phần bên trái: Logo và các link chính (Desktop) */}
                <Group>
                    <Logo />
                    <Group ml={50} spacing="sm" visibleFrom="sm">
                        {navLinks.map(link => (
                            <Link
                                to={link.href}
                                key={link.label}
                                className="navbar-link"
                                style={{
                                    fontSize: '1.1rem', // tăng kích thước chữ
                                    fontWeight: 600,
                                    color: '#1c1c1c',
                                    textDecoration: 'none',
                                    padding: '6px 14px',
                                    borderRadius: 8,
                                    transition: 'background 0.2s',
                                }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </Group>
                </Group>

                {/* Phần bên phải: Nút bấm hoặc Menu User (Desktop) */}
                <Group visibleFrom="sm">
                    {isAuthenticated ? (
                        <Menu shadow="md" width={200} position="bottom-end">
                            <Menu.Target>
                                <Group spacing="xs" style={{ cursor: 'pointer' }}>
                                    <Avatar src={user?.avatarUrl || '/images/default_image.jpg'} color="blue" radius="xl" />
                                    <Text size="sm" weight={500}>{user?.name || 'User'}</Text>
                                </Group>
                            </Menu.Target>
                            <Menu.Dropdown>
                                {userMenuItems.map(item => (
                                    <Menu.Item key={item.label} component={Link} to={item.href}>{item.label}</Menu.Item>
                                ))}
                                <Menu.Divider />
                                <Menu.Item color="red" onClick={handleLogout}>Đăng Xuất</Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    ) : (
                        <Group>
                            <Button
                                component={Link}
                                to="/login"
                                variant="outline"
                                color="blue"
                                radius="xl"
                                style={{ fontWeight: 600, letterSpacing: 1 }}
                            >
                                Đăng Nhập
                            </Button>
                            <Button
                                component={Link}
                                to="/register"
                                variant="filled"
                                color="blue"
                                radius="xl"
                                style={{ fontWeight: 700, letterSpacing: 1, boxShadow: "0 2px 8px 0 rgba(34,139,230,0.10)" }}
                            >
                                Đăng Ký
                            </Button>
                        </Group>
                    )}
                </Group>

                {/* Burger Menu cho Mobile (sẽ chỉ hiển thị trên màn hình nhỏ) */}
                <Burger opened={opened} onClick={toggle} size="sm" hiddenFrom="sm" />

                {/* TODO: Khi nào có thời gian, thêm Drawer (menu trượt từ bên) cho mobile ở đây */}
            </Container>
        </Box>
    );
};

export default Navbar;