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
    Center,
    Loader
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

const RegisterPage = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    // States cho form
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }
        setError('');
        setLoading(true);

        try {
            const userData = { name, username, email, password };
            const result = await register(userData);

            if (result.success) {
                navigate('/login');
            } else {
                setError(result.error || 'Đã có lỗi xảy ra.');
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
            {/* Form đăng ký */}
            <Container size={420} my={40} style={{ position: 'relative', zIndex: 2 }}>
                <Paper
                    withBorder
                    shadow="md"
                    p={30}
                    mt={30}
                    radius="md"
                    style={{
                        background: 'rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(2px)',
                        boxShadow: '0 8px 32px 0 rgba(31,38,135,0.07)',
                    }}
                >
                    <Title align="center" style={{ fontWeight: 900, color: '#1a237e' }}>
                        Tạo tài khoản mới
                    </Title>
                    <Text color="dimmed" size="sm" align="center" mt={5}>
                        Đã có tài khoản?{' '}
                        <Link to="/login" style={{ textDecoration: 'none', color: '#1c7ed6' }}>
                            Đăng nhập
                        </Link>
                    </Text>
                    <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
                        {error && (
                            <Alert icon={<IconAlertCircle size="1rem" />} title="Đăng ký thất bại" color="red" mb="md">
                                {error}
                            </Alert>
                        )}

                        <TextInput
                            label="Tên của bạn"
                            placeholder="Nguyễn Văn A"
                            required
                            value={name}
                            onChange={(event) => setName(event.currentTarget.value)}
                            disabled={loading}
                        />
                        <TextInput
                            label="Tên đăng nhập"
                            placeholder="username"
                            required
                            mt="md"
                            value={username}
                            onChange={(event) => setUsername(event.currentTarget.value)}
                            disabled={loading}
                        />
                        <TextInput
                            label="Email"
                            placeholder="you@example.com"
                            required
                            mt="md"
                            value={email}
                            onChange={(event) => setEmail(event.currentTarget.value)}
                            disabled={loading}
                        />
                        <PasswordInput
                            label="Mật khẩu"
                            placeholder="Mật khẩu (ít nhất 6 ký tự)"
                            required
                            mt="md"
                            value={password}
                            onChange={(event) => setPassword(event.currentTarget.value)}
                            disabled={loading}
                        />
                        <PasswordInput
                            label="Xác nhận mật khẩu"
                            placeholder="Nhập lại mật khẩu"
                            required
                            mt="md"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.currentTarget.value)}
                            disabled={loading}
                        />

                        <Button type="submit" fullWidth mt="xl" disabled={loading}>
                            {loading ? <Loader color="white" size="sm" /> : 'Đăng Ký'}
                        </Button>
                    </form>
                </Paper>
            </Container>
        </div>
    );
};

export default RegisterPage;