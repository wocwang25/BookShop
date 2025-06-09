import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
    Container,
    Title,
    Paper,
    TextInput,
    PasswordInput,
    Button,
    Text,
    Alert,
    Loader
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    console.log(identifier, password)

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Gọi hàm login, bây giờ nó sẽ trả về cả `user`
            const result = await login({ identifier, password });

            if (result.success) {
                // --- ĐÂY LÀ PHẦN LOGIC ĐIỀU HƯỚNG ---
                // Kiểm tra vai trò của người dùng vừa đăng nhập
                const userRole = result.user.role;

                if (userRole === 'admin') {
                    // Nếu là admin, chuyển đến trang quản trị của admin
                    console.log('Admin logged in. Redirecting to /admin/dashboard');
                    navigate('/admin/dashboard');
                } else if (userRole === 'staff') {
                    // Nếu là staff, chuyển đến trang của nhân viên
                    console.log('Staff logged in. Redirecting to /staff/dashboard');
                    navigate('/staff/dashboard');
                } else {
                    // Trường hợp dự phòng (ví dụ: người dùng customer đi lạc vào đây)
                    console.log('User with other role logged in. Redirecting to homepage.');
                    navigate('/');
                }
                // ------------------------------------

            } else {
                setError(result.error || 'Đăng nhập thất bại.');
            }
        } catch (err) {
            setError('Lỗi kết nối đến máy chủ.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                width: '100vw',
                backgroundImage: 'url("/images/737386.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
            }}
        >
            {/* Overlay trắng mờ */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(6px)',
                    zIndex: 1,
                }}
            />
            {/* Form đăng nhập */}
            <Container size={520} my={40} style={{ position: 'relative', zIndex: 2 }}>
                <Paper
                    withBorder
                    shadow="md"
                    p={40}
                    mt={30}
                    radius="md"
                    style={{
                        background: 'rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(2px)',
                        boxShadow: '0 8px 32px 0 rgba(31,38,135,0.07)',
                    }}
                >
                    <Title align="center" style={{ fontWeight: 900, color: '#1a237e' }}>
                        Đăng nhập
                    </Title>
                    <Text color="dimmed" size="sm" align="center" mt={5}>
                        Chưa có tài khoản?{' '}
                        <Link to="/register" style={{ textDecoration: 'none', color: '#1c7ed6' }}>
                            Đăng ký
                        </Link>
                    </Text>
                    <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
                        {error && (
                            <Alert icon={<IconAlertCircle size="1rem" />} title="Đăng nhập thất bại" color="red" mb="md">
                                {error}
                            </Alert>
                        )}

                        <TextInput
                            label="Email/Username"
                            placeholder="Email/Username"
                            required
                            value={identifier}
                            onChange={(event) => setIdentifier(event.currentTarget.value)}
                            disabled={loading}
                        />
                        <PasswordInput
                            label="Mật khẩu"
                            placeholder="Mật khẩu"
                            required
                            mt="md"
                            value={password}
                            onChange={(event) => setPassword(event.currentTarget.value)}
                            disabled={loading}
                        />

                        <Button type="submit" fullWidth mt="xl" disabled={loading}>
                            {loading ? <Loader color="white" size="sm" /> : 'Đăng Nhập'}
                        </Button>
                    </form>
                </Paper>
            </Container>
        </div>
    );
};

export default LoginPage;